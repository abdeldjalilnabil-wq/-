# Security Specification & Dirty Dozen Audit — Dorak Barbershop Queue

## 1. Data Invariants
1. **Owner-Only User Profiles (`/users/{userId}`)**: No user can read, list, or mutate another user's private profile (`uid === request.auth.uid` enforced). Users may only edit their own `displayName`, `phone`, `accountMode`, `barberId`, personal `themeColor`, and `preferredLanguage`.
2. **Barber Shop Ownership (`/barbers/{barberId}`)**: Only the verified owner (`barberId === request.auth.uid`) can create or edit shop details (`shopName`, `barberName`, `location`, `countryCode`, `countryName`, `stateName`, `avatarUrl`, `isOpen`, `services`, `whatsappCountryCode`, `barberPhone`, `facebookUrl`, `tiktokUrl`, `instagramUrl`). New barber creation respects global `platform/settings.allowNewBarberRegistration`. Customers can only increment/decrement queue counters via narrowly bounded field allowlists.
3. **Strict PII Isolation (`/barbers/{barberId}/queue/{ticketId}`)**: Customer phone numbers (`customerPhone`) and names (`customerName`) are strictly readable ONLY by the booking customer (`customerUid === request.auth.uid`) and the assigned barber (`barberUid === request.auth.uid`). Other customers read only PII-free `/barbers/{barberId}/slots/{ticketId}`.
4. **Atomic Ticket + Slot Creation**: Every `queue/{ticketId}` creation requires `existsAfter(.../slots/{ticketId})` and vice versa, plus verified existence of the parent `barbers/{barberId}` with `isOpen == true`.
5. **Terminal State Lock**: Tickets in `'completed'` or `'cancelled'` state cannot be reopened or mutated.
6. **Verified Auth + Server Timestamps**: All writes require `request.auth != null && request.auth.token.email_verified == true` and enforce `request.time` on `createdAt`/`updatedAt`.
7. **Participant-Only In-App Messages (`/barbers/{barberId}/queue/{ticketId}/messages/{messageId}`)**: Messages belong to a valid non-terminal `queue/{ticketId}` ticket and can only be read or created by the ticket's `barberUid` or `customerUid`, with immutable sender identity.
8. **Participant-Only WebRTC Voice Calls (`/barbers/{barberId}/calls/{callId}` + ICE subcollections)**: SDP offers/answers and ICE candidates can only be read, created, or updated by the assigned `barberUid` or `customerUid`, preventing eavesdropping or call hijacking by third parties.
9. **Customer Complaints Isolation (`/barbers/{barberId}/complaints/{complaintId}`)**: Complaints can only be created by a verified customer when global `allowComplaints` is active, targeting an existing barber, and read strictly by the filing `customerUid`, the target `barberUid`, or the platform admin. Only the target `barberUid` or admin may update `status` (`reviewed` / `resolved`).
10. **Owner-Only Global App Controls (`/platform/settings`)**: Only verified `isAdmin()` can modify global app texts, feature flags, pricing, payment receiving accounts, service labels, default language, and default theme. Customers and barbers are strictly denied write access.
11. **Subscription Electronic Payments & Anti-Bypass (`/barbers/{barberId}/payments/{paymentId}`)**: No raw PAN or CVV is ever permitted or stored (max 4 digits in `cardLast4`). Barbers may only create payments for their own shop (`barberUid === request.auth.uid`), readable strictly by that barber or `isAdmin()`. Barbers cannot activate a `'suspended'` shop nor transition `subscriptionStatus` to `'active'` without an atomic `existsAfter` / `getAfter` match to a valid `'paid'` payment for the full configured `platform/settings.usagePrice` (when `autoApproveCardPayments == true`). Only `isAdmin()` can review/approve/reject `'pending_review'` receipts.

## 2. Dirty Dozen Adversarial Payloads (All Must Be Denied)
1. **Unauthenticated Write**: Create `/barbers/user1` with `auth == null` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: Create `/barbers/user1/queue/t1` with `email_verified: false` -> `PERMISSION_DENIED`.
3. **Barber Impersonation**: User A creates `/barbers/userB` with `ownerUid: "userB"` -> `PERMISSION_DENIED`.
4. **Shadow Field Injection**: Update `/barbers/userA` with extra ghost key `isVerified: true` -> `PERMISSION_DENIED`.
5. **PII Cross-Read**: Customer B calls `get` or `list` on `/barbers/barberA/queue` where `customerUid == customerA` -> `PERMISSION_DENIED`.
6. **Customer Hijacking Barber Shop Metadata**: Customer B updates `/barbers/barberA` modifying `shopName` or `location` -> `PERMISSION_DENIED`.
7. **ID Poisoning**: Create `/barbers/barberA/queue/..invalid..1500chars` -> `PERMISSION_DENIED`.
8. **Orphaned Ticket**: Create `/barbers/nonExistentBarber/queue/t1` -> `PERMISSION_DENIED`.
9. **Closed Shop Booking**: Create `/barbers/barberA/queue/t1` when `barberA.isOpen == false` -> `PERMISSION_DENIED`.
10. **Complaint Forgery / Cross-Read**: Customer B reads `/barbers/barberA/complaints/c1` filed by Customer A, or creates a complaint impersonating Customer A -> `PERMISSION_DENIED`.
11. **Free Subscription Self-Activation Bypass**: Barber updates `/barbers/barberA` setting `subscriptionStatus: 'active'` without a matching atomic `paid` payment >= `usagePrice` (or while suspended) -> `PERMISSION_DENIED`.
12. **Payment Receipt Forgery / Full Card Data Leak**: Barber creates `/barbers/barberA/payments/p1` with `cardLast4` > 4 chars or attempts to mark another barber's payment `'verified'` -> `PERMISSION_DENIED`.
