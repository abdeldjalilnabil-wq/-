import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { BarberShop, QueueTicket, VoiceCall, VoiceCallStatus } from '../types';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 8,
};

export interface ActiveVoiceSession {
  callId: string;
  toggleMute: () => boolean;
  endCall: () => Promise<void>;
  cleanupLocalOnly: () => void;
}

async function acquireMicrophone(): Promise<MediaStream> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    throw new Error('متصفحك الحالي لا يدعم المكالمات الصوتية عبر الإنترنت.');
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
  } catch (err) {
    if (err instanceof DOMException) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('يرجى السماح بصلاحية الميكروفون في المتصفح لإجراء المكالمة الصوتية عبر الإنترنت.');
      }
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('لم يتم العثور على ميكروفون متصل بهذا الجهاز لإجراء المكالمة الصوتية.');
      }
    }
    throw new Error('تعذر تشغيل الميكروفون للمكالمة الصوتية عبر الإنترنت.');
  }
}

function attachRemoteTrackHandler(
  pc: RTCPeerConnection,
  onRemoteStream: (stream: MediaStream) => void
): void {
  const remoteStream = new MediaStream();
  pc.ontrack = (event) => {
    event.streams.forEach((stream) => {
      stream.getTracks().forEach((track) => {
        if (!remoteStream.getTracks().some((t) => t.id === track.id)) {
          remoteStream.addTrack(track);
        }
      });
    });
    if (event.track && !remoteStream.getTracks().some((t) => t.id === event.track.id)) {
      remoteStream.addTrack(event.track);
    }
    onRemoteStream(remoteStream);
  };
}

export async function startOutgoingVoiceCall(params: {
  barber: BarberShop;
  ticket: QueueTicket;
  onRemoteStream: (stream: MediaStream) => void;
  onStatusChange: (status: VoiceCallStatus) => void;
  onCallDocCreated: (callDoc: VoiceCall) => void;
}): Promise<ActiveVoiceSession> {
  const { barber, ticket, onRemoteStream, onStatusChange, onCallDocCreated } = params;
  const localStream = await acquireMicrophone();

  const callId = `call_${ticket.id}_${Date.now()}`;
  const callPath = `barbers/${barber.id}/calls/${callId}`;
  const callRef = doc(db, 'barbers', barber.id, 'calls', callId);
  const callerCandidatesRef = collection(callRef, 'callerCandidates');
  const calleeCandidatesRef = collection(callRef, 'calleeCandidates');

  const pc = new RTCPeerConnection(RTC_CONFIG);
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  attachRemoteTrackHandler(pc, onRemoteStream);

  let isCleanedUp = false;
  let remoteDescSet = false;
  const pendingIceCandidates: RTCIceCandidateInit[] = [];
  const addedCandidateIds = new Set<string>();
  let unsubCallDoc: (() => void) | null = null;
  let unsubCalleeIce: (() => void) | null = null;
  let latestStatus: VoiceCallStatus = 'ringing';

  const cleanupLocalOnly = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    unsubCallDoc?.();
    unsubCalleeIce?.();
    localStream.getTracks().forEach((t) => t.stop());
    if (pc.signalingState !== 'closed') {
      pc.close();
    }
  };

  pc.onicecandidate = (event) => {
    if (!event.candidate || isCleanedUp) return;
    const json = event.candidate.toJSON();
    if (!json.candidate) return;
    void addDoc(callerCandidatesRef, {
      barberUid: barber.ownerUid,
      customerUid: ticket.customerUid,
      senderUid: barber.ownerUid,
      candidate: json.candidate.slice(0, 2000),
      sdpMid: (json.sdpMid ?? '').slice(0, 100),
      sdpMLineIndex: typeof json.sdpMLineIndex === 'number' ? Math.max(0, json.sdpMLineIndex) : 0,
      createdAt: serverTimestamp(),
    }).catch((err) => {
      console.warn('ICE caller write skipped:', err);
    });
  };

  try {
    const offer = await pc.createOffer({ offerToReceiveAudio: true });
    await pc.setLocalDescription(offer);

    const callPayload: Omit<VoiceCall, 'createdAt' | 'updatedAt'> = {
      id: callId,
      barberId: barber.id,
      barberUid: barber.ownerUid,
      customerUid: ticket.customerUid,
      ticketId: ticket.id,
      shopName: barber.shopName.slice(0, 80),
      customerName: ticket.customerName.slice(0, 60),
      status: 'ringing',
      offerSdp: (offer.sdp || '').slice(0, 15000),
    };

    await setDoc(callRef, {
      ...callPayload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    onCallDocCreated(callPayload);

    unsubCallDoc = onSnapshot(
      callRef,
      async (snap) => {
        if (!snap.exists() || isCleanedUp) return;
        const data = snap.data() as VoiceCall;
        latestStatus = data.status;
        onStatusChange(data.status);

        if (data.answerSdp && !remoteDescSet && pc.signalingState !== 'closed') {
          remoteDescSet = true;
          try {
            await pc.setRemoteDescription(
              new RTCSessionDescription({ type: 'answer', sdp: data.answerSdp })
            );
            for (const c of pendingIceCandidates) {
              await pc.addIceCandidate(new RTCIceCandidate(c));
            }
            pendingIceCandidates.length = 0;
          } catch (err) {
            console.warn('Error setting answer SDP:', err);
          }
        }

        if (data.status === 'ended' || data.status === 'declined' || data.status === 'missed') {
          cleanupLocalOnly();
        }
      },
      (error) => {
        console.warn('Call doc snapshot warning:', error.message);
      }
    );

    const calleeIceQ = query(
      calleeCandidatesRef,
      where('barberUid', '==', barber.ownerUid)
    );
    unsubCalleeIce = onSnapshot(
      calleeIceQ,
      async (snap) => {
        if (isCleanedUp || pc.signalingState === 'closed') return;
        for (const change of snap.docChanges()) {
          if (change.type === 'added' && !addedCandidateIds.has(change.doc.id)) {
            addedCandidateIds.add(change.doc.id);
            const raw = change.doc.data();
            const candidateInit: RTCIceCandidateInit = {
              candidate: raw.candidate,
              sdpMid: raw.sdpMid,
              sdpMLineIndex: raw.sdpMLineIndex,
            };
            if (remoteDescSet) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
              } catch {
                // Ignore late ICE candidates
              }
            } else {
              pendingIceCandidates.push(candidateInit);
            }
          }
        }
      },
      (error) => {
        console.warn('Callee ICE snapshot warning:', error.message);
      }
    );
  } catch (error) {
    cleanupLocalOnly();
    handleFirestoreError(error, OperationType.WRITE, callPath);
  }

  return {
    callId,
    toggleMute: () => {
      let nextMuted = false;
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        nextMuted = !track.enabled;
      });
      return nextMuted;
    },
    endCall: async () => {
      cleanupLocalOnly();
      if (
        latestStatus !== 'ended' &&
        latestStatus !== 'declined' &&
        latestStatus !== 'missed'
      ) {
        try {
          await updateDoc(callRef, {
            status: 'ended',
            endedByUid: barber.ownerUid,
            updatedAt: serverTimestamp(),
          });
        } catch {
          // Call may already have closed
        }
      }
    },
    cleanupLocalOnly,
  };
}

export async function answerIncomingVoiceCall(params: {
  call: VoiceCall;
  customerUid: string;
  onRemoteStream: (stream: MediaStream) => void;
  onStatusChange: (status: VoiceCallStatus) => void;
}): Promise<ActiveVoiceSession> {
  const { call, customerUid, onRemoteStream, onStatusChange } = params;
  const localStream = await acquireMicrophone();

  const callPath = `barbers/${call.barberId}/calls/${call.id}`;
  const callRef = doc(db, 'barbers', call.barberId, 'calls', call.id);
  const callerCandidatesRef = collection(callRef, 'callerCandidates');
  const calleeCandidatesRef = collection(callRef, 'calleeCandidates');

  const pc = new RTCPeerConnection(RTC_CONFIG);
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  attachRemoteTrackHandler(pc, onRemoteStream);

  let isCleanedUp = false;
  let remoteDescSet = false;
  const addedCandidateIds = new Set<string>();
  let unsubCallDoc: (() => void) | null = null;
  let unsubCallerIce: (() => void) | null = null;
  let latestStatus: VoiceCallStatus = call.status;

  const cleanupLocalOnly = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    unsubCallDoc?.();
    unsubCallerIce?.();
    localStream.getTracks().forEach((t) => t.stop());
    if (pc.signalingState !== 'closed') {
      pc.close();
    }
  };

  pc.onicecandidate = (event) => {
    if (!event.candidate || isCleanedUp) return;
    const json = event.candidate.toJSON();
    if (!json.candidate) return;
    void addDoc(calleeCandidatesRef, {
      barberUid: call.barberUid,
      customerUid,
      senderUid: customerUid,
      candidate: json.candidate.slice(0, 2000),
      sdpMid: (json.sdpMid ?? '').slice(0, 100),
      sdpMLineIndex: typeof json.sdpMLineIndex === 'number' ? Math.max(0, json.sdpMLineIndex) : 0,
      createdAt: serverTimestamp(),
    }).catch((err) => {
      console.warn('ICE callee write skipped:', err);
    });
  };

  try {
    await pc.setRemoteDescription(
      new RTCSessionDescription({ type: 'offer', sdp: call.offerSdp })
    );
    remoteDescSet = true;

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await updateDoc(callRef, {
      status: 'connected',
      answerSdp: (answer.sdp || '').slice(0, 15000),
      updatedAt: serverTimestamp(),
    });
    latestStatus = 'connected';
    onStatusChange('connected');

    const callerIceQ = query(
      callerCandidatesRef,
      where('customerUid', '==', customerUid)
    );
    unsubCallerIce = onSnapshot(
      callerIceQ,
      async (snap) => {
        if (isCleanedUp || !remoteDescSet || pc.signalingState === 'closed') return;
        for (const change of snap.docChanges()) {
          if (change.type === 'added' && !addedCandidateIds.has(change.doc.id)) {
            addedCandidateIds.add(change.doc.id);
            const raw = change.doc.data();
            try {
              await pc.addIceCandidate(
                new RTCIceCandidate({
                  candidate: raw.candidate,
                  sdpMid: raw.sdpMid,
                  sdpMLineIndex: raw.sdpMLineIndex,
                })
              );
            } catch {
              // Ignore late ICE candidates
            }
          }
        }
      },
      (error) => {
        console.warn('Caller ICE snapshot warning:', error.message);
      }
    );

    unsubCallDoc = onSnapshot(
      callRef,
      (snap) => {
        if (!snap.exists() || isCleanedUp) return;
        const data = snap.data() as VoiceCall;
        latestStatus = data.status;
        onStatusChange(data.status);
        if (data.status === 'ended' || data.status === 'declined' || data.status === 'missed') {
          cleanupLocalOnly();
        }
      },
      (error) => {
        console.warn('Answer call snapshot warning:', error.message);
      }
    );
  } catch (error) {
    cleanupLocalOnly();
    handleFirestoreError(error, OperationType.UPDATE, callPath);
  }

  return {
    callId: call.id,
    toggleMute: () => {
      let nextMuted = false;
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        nextMuted = !track.enabled;
      });
      return nextMuted;
    },
    endCall: async () => {
      cleanupLocalOnly();
      if (
        latestStatus !== 'ended' &&
        latestStatus !== 'declined' &&
        latestStatus !== 'missed'
      ) {
        try {
          await updateDoc(callRef, {
            status: 'ended',
            endedByUid: customerUid,
            updatedAt: serverTimestamp(),
          });
        } catch {
          // Call may already have closed
        }
      }
    },
    cleanupLocalOnly,
  };
}

export async function declineIncomingVoiceCall(call: VoiceCall, customerUid: string): Promise<void> {
  const path = `barbers/${call.barberId}/calls/${call.id}`;
  try {
    await updateDoc(doc(db, 'barbers', call.barberId, 'calls', call.id), {
      status: 'declined',
      endedByUid: customerUid,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
