export interface TranslationDict {
  // Common / Brand
  initializingPlatform: string;
  signIn: string;
  signingIn: string;
  signOut: string;
  languageLabel: string;
  languageSearchPlaceholder: string;
  noLanguagesFound: string;
  // Navigation & Roles
  navFeatures: string;
  navPricing: string;
  navCustomer: string;
  navBarber: string;
  navOwnerSettings: string;
  mobileCustomer: string;
  mobileBarber: string;
  mobileOwner: string;
  roleOwnerHint: string;
  roleBarberHint: string;
  roleCustomerHint: string;
  // Themes
  themeLabel: string;
  themeLabelCompact: string;
  themeGold: string;
  themeEmerald: string;
  themeBlue: string;
  themeBurgundy: string;
  themeDark: string;
  // AuthGate
  chooseAccountType: string;
  accountCustomerTitle: string;
  accountCustomerDesc: string;
  accountBarberTitle: string;
  accountBarberDesc: string;
  continueWithGoogleCustomer: string;
  continueWithGoogleBarber: string;
  heroCardTitle: string;
  heroCardMeta: string;
  featAutoCallTitle: string;
  featAutoCallDesc: string;
  featDeferTitle: string;
  featDeferDesc: string;
  featIdentityTitle: string;
  featIdentityDesc: string;
  featPricingPrefix: string;
  // Footer
  designedBy: string;
  ownerSupport: string;
  // Customer Portal
  custChooseBarber: string;
  custSubtitleFilter: string;
  custSubtitleNoFilter: string;
  custSearchPlaceholder: string;
  custMyProfile: string;
  custCountrySelected: string;
  custAllCountries: string;
  custStateLabel: string;
  custSelectCountryFirst: string;
  custAllRegionsInCountry: string;
  custAllStates: string;
  custShowAll: string;
  custNoBarbersTitle: string;
  custNoBarbersDescFiltered: string;
  custNoBarbersDescEmpty: string;
  custPeopleAhead: string;
  custEstWait: string;
  custMinUnit: string;
  custWaitingRemaining: string;
  custServicesLabel: string;
  custShopOpen: string;
  custShopClosed: string;
  custBookSeat: string;
  custAlreadyBooked: string;
  custHasActiveTicket: string;
  custWhatsApp: string;
  custFileComplaint: string;
  custTicketNumber: string;
  custPeopleBeforeYou: string;
  custApproxWait: string;
  custDirectMessages: string;
  custWhatsAppShop: string;
  custYou: string;
  custReplyPlaceholder: string;
  custReplyBtn: string;
  custConfirmArrival: string;
  custDeferTurnBtn: string;
  custNoOneBehind: string;
  custEnableNotifs: string;
  custCancelBooking: string;
  custBarberCallingBanner: string;
  custBarberCallingNoDefer: string;
  custDeferredCount: string;
  custMyComplaints: string;
  custComplaintsHint: string;
  custEditProfileTitle: string;
  custEditProfileSub: string;
  custFullName: string;
  custPhoneLabel: string;
  custSaveProfile: string;
  custSaving: string;
  custNewBooking: string;
  custConfirmBooking: string;
  custBookingBusy: string;
  custChooseService: string;
  custComplaintModalTitle: string;
  custComplaintModalSub: string;
  custComplaintQuickPick: string;
  custComplaintType: string;
  custComplaintDetails: string;
  custSendComplaint: string;
  custSendingComplaint: string;
  // Barber Dashboard
  barberCreateTitle: string;
  barberEditTitle: string;
  barberProfileHint: string;
  barberBackToQueue: string;
  barberAvatarLabel: string;
  barberUploadAvatar: string;
  barberUploading: string;
  barberPresetAvatar: string;
  barberShopNameLabel: string;
  barberNameLabel: string;
  barberCountryLabel: string;
  barberStateLabel: string;
  barberCustomStateOpt: string;
  barberStatePlaceholder: string;
  barberListBtn: string;
  barberLocationLabel: string;
  barberSocialsTitle: string;
  barberSocialsDesc: string;
  barberWaCodeLabel: string;
  barberPhoneLabel: string;
  barberAvgMinutesLabel: string;
  barberMinutesSuffix: string;
  barberStatusOpenBtn: string;
  barberStatusClosedBtn: string;
  barberServicesOffered: string;
  barberSaveShopBtn: string;
  barberUrgentComplaintTitle: string;
  barberUrgentComplaintDesc: string;
  barberMarkReviewed: string;
  barberMarkResolved: string;
  barberPauseBookings: string;
  barberOpenBookings: string;
  barberEditProfileBtn: string;
  barberPayElectronicBtn: string;
  barberSubscriptionLabel: string;
  barberSubPendingTitle: string;
  barberSubSuspendedTitle: string;
  barberMetricWaiting: string;
  barberMetricCurrent: string;
  barberMetricTotalWait: string;
  barberMetricCompleted: string;
  barberChairTitle: string;
  barberChairKicker: string;
  barberNoCustomers: string;
  barberNoCustomersDesc: string;
  barberOnlineVoiceBtn: string;
  barberWhatsAppCallMsg: string;
  barberQuickMsgLabel: string;
  barberCustomMsgPlaceholder: string;
  barberSendBtn: string;
  barberSeatedBtn: string;
  barberRecallBtn: string;
  barberNoShowBtn: string;
  barberSimCall: string;
  barberContinueWork: string;
  barberContinueNext: string;
  barberContinueFinish: string;
  barberContinueEmpty: string;
  barberAutoCallCheckbox: string;
  barberQueueTitle: string;
  barberQueueDesc: string;
  barberTabWaiting: string;
  barberTabHistory: string;
  barberEmptyWaiting: string;
  barberEmptyHistory: string;
  barberOrderLabel: string;
  barberMsgComeBtn: string;
  barberComplaintsArchive: string;
  barberTotalComplaints: string;
  barberRegPausedTitle: string;
  barberRegPausedDesc: string;
  // Electronic Payments (Barber + Owner)
  payModalKicker: string;
  payModalTitle: string;
  payModalSubtitle: string;
  payRegionAlgeria: string;
  payRegionInternational: string;
  payAmountDue: string;
  paySelectMethod: string;
  payCardNumberLabel: string;
  payCardHolderLabel: string;
  payExpiryLabel: string;
  payCvvLabel: string;
  payDetectedCard: string;
  payPciNotice: string;
  payTransferInstructions: string;
  payCopyAccount: string;
  payCopied: string;
  payReferenceLabel: string;
  payReferencePlaceholder: string;
  payExternalGatewayLabel: string;
  payOpenChargily: string;
  payOpenStripe: string;
  payOpenPaypal: string;
  paySubmitCardBtn: string;
  paySubmitTransferBtn: string;
  paySubmitting: string;
  paySuccessInstant: string;
  paySuccessReview: string;
  payHistoryTitle: string;
  payHistoryEmpty: string;
  payStatusPaid: string;
  payStatusPending: string;
  payStatusRejected: string;
  payErrCardNumber: string;
  payErrExpiry: string;
  payErrCvv: string;
  payErrHolder: string;
  payErrReference: string;
  // Incoming & Active Calls
  callVoiceIncoming: string;
  callAutoAlert: string;
  callYourTurnAt: string;
  callTicketHash: string;
  callBarberMsg: string;
  callAnswerOnline: string;
  callConnecting: string;
  callDeclineVoice: string;
  callMuteAndStay: string;
  callConnectedStatus: string;
  callRingingStatus: string;
  callEndedStatus: string;
  callMicMuted: string;
  callMuteMic: string;
  callEndBtn: string;
  // Owner Admin Panel
  adminHeaderTitle: string;
  adminHeaderDesc: string;
  adminStatShops: string;
  adminStatActive: string;
  adminStatPending: string;
  adminTabIdentity: string;
  adminTabFeatures: string;
  adminTabPricing: string;
  adminDefaultLangLabel: string;
  adminDefaultThemeLabel: string;
  adminSaveIdentity: string;
  adminSaveFeatures: string;
  adminSavePricing: string;
  adminPricingTitle: string;
  adminFreeMode: string;
  adminPaidMode: string;
  adminPaymentMethodsTitle: string;
  adminAutoApproveLabel: string;
  adminAutoApproveDesc: string;
  adminIncomingPaymentsTitle: string;
  adminNoPayments: string;
  adminApprovePayment: string;
  adminRejectPayment: string;
  adminShopsManageTitle: string;
  adminComplaintsTitle: string;
  // Statuses & Services
  statusWaiting: string;
  statusCalled: string;
  statusInChair: string;
  statusCompleted: string;
  statusCancelled: string;
  svcHaircut: string;
  svcProtein: string;
  svcBlowdry: string;
  svcAll: string;
  cycleMonthly: string;
  cycleYearly: string;
  cyclePerBooking: string;
  subActive: string;
  subPending: string;
  subSuspended: string;
  cmpOpen: string;
  cmpReviewed: string;
  cmpResolved: string;
  // App Download & PWA Install
  downloadAppBtn: string;
  downloadModalTitle: string;
  downloadModalSubtitle: string;
  downloadAndroidTitle: string;
  downloadAndroidDesc: string;
  downloadIosTitle: string;
  downloadIosDesc: string;
  downloadDesktopTitle: string;
  downloadDesktopDesc: string;
  downloadInstallNowBtn: string;
  downloadOpenDirectBtn: string;
  downloadCopyLinkBtn: string;
  downloadAlreadyInstalled: string;
  downloadIosStep1: string;
  downloadIosStep2: string;
  downloadIosStep3: string;
  downloadAndroidStep1: string;
  downloadAndroidStep2: string;
  downloadDesktopStep1: string;
  downloadDesktopStep2: string;
  downloadOfflineBadge: string;
  closeBtn: string;
  // Website & Embed Support
  downloadWebTitle: string;
  downloadWebDesc: string;
  downloadWebOpenBtn: string;
  downloadEmbedCodeLabel: string;
  downloadCopyEmbedBtn: string;
  downloadWebStep1: string;
  downloadWebStep2: string;
  barberEmbedBtn: string;
  barberEmbedTitle: string;
  barberEmbedSubtitle: string;
  barberDirectLinkLabel: string;
  barberWidgetLinkLabel: string;
  custShowAllShops: string;
  custDirectShopFilterNote: string;
}

export const AR_DICT: TranslationDict = {
  initializingPlatform: 'جاري تهيئة المنصة...',
  signIn: 'تسجيل الدخول',
  signingIn: 'جاري الدخول...',
  signOut: 'تسجيل الخروج',
  languageLabel: 'اللغة',
  languageSearchPlaceholder: 'ابحث عن أي لغة في العالم...',
  noLanguagesFound: 'لم يتم العثور على لغة مطابقة.',

  navFeatures: 'المميزات',
  navPricing: 'الاستخدام والاشتراك',
  navCustomer: 'حساب الزبون',
  navBarber: 'حساب العامل / المحل',
  navOwnerSettings: 'إعدادات صاحب التطبيق',
  mobileCustomer: 'الزبون',
  mobileBarber: 'العامل / المحل',
  mobileOwner: 'إعدادات المالك',
  roleOwnerHint: 'صلاحية صاحب التطبيق: تحكم كامل في إعدادات التطبيق ومميزاته',
  roleBarberHint: 'صلاحية العامل: إدارة ملف محلك، الدفع الإلكتروني، ولون التطبيق ولغته',
  roleCustomerHint: 'صلاحية الزبون: إدارة ملفك الشخصي ولون التطبيق ولغته فقط',

  themeLabel: 'تغيير لون التطبيق:',
  themeLabelCompact: 'اللون:',
  themeGold: 'ذهبي كلاسيكي',
  themeEmerald: 'أخضر زمردي',
  themeBlue: 'أزرق ملكي',
  themeBurgundy: 'عنابي فاخر',
  themeDark: 'ليلي داكن',

  chooseAccountType: 'اختر نوع حسابك للبدء:',
  accountCustomerTitle: 'حساب زبون',
  accountCustomerDesc: 'احجز مقعدك وتابع دورك',
  accountBarberTitle: 'حساب عامل / حلاق',
  accountBarberDesc: 'أنشئ محلك وأدر الطابور',
  continueWithGoogleCustomer: 'المتابعة بحساب Google كزبون',
  continueWithGoogleBarber: 'المتابعة بحساب Google كعامل / حلاق',
  heroCardTitle: 'تجربة منظمة من الحجز حتى الجلوس على الكرسي',
  heroCardMeta: 'اسم البراند · موقع المحل · عدد المنتظرين · اتصال وتنبيه فوري',
  featAutoCallTitle: 'اتصال وتنبيه تلقائي بالزر',
  featAutoCallDesc:
    'عندما يضغط الحلاق «تابع العمل»، يرن جهاز الزبون فوراً مع إمكانية الاتصال أونلاين أو عبر واتساب.',
  featDeferTitle: 'مرونة «قم بتقديم زبون قبلي»',
  featDeferDesc:
    'إذا تعذر على الزبون الالتحاق في موعده، يضغط زر التقديم ليتقدم الزبون التالي دون إلغاء حجزه.',
  featIdentityTitle: 'هوية المحل وموقعه',
  featIdentityDesc:
    'يضع كل عامل اسم البراند وصورته ومكان عمله، وتظهر للزبون خيارات الحلاقة والبروتين وتجفيف الشعر.',
  featPricingPrefix: 'اشتراك الصالونات:',

  designedBy: 'تصميم وتطوير:',
  ownerSupport: 'إدارة وهاتف صاحب التطبيق:',

  custChooseBarber: 'اختر حلاقك واحجز مقعدك',
  custSubtitleFilter: 'حدّد البلد والولاية التي تريد الحلاقة فيها وشاهد عدد المنتظرين مباشرة.',
  custSubtitleNoFilter: 'استعرض الصالونات المتاحة وشاهد عدد المنتظرين ومكان عمل كل حلاق مباشرة.',
  custSearchPlaceholder: 'ابحث باسم المحل أو الحلاق أو الحي...',
  custMyProfile: 'ملفي الشخصي',
  custCountrySelected: 'البلد المختار',
  custAllCountries: 'جميع البلدان',
  custStateLabel: 'الولاية / المحافظة',
  custSelectCountryFirst: 'اختر البلد أولاً لعرض الولايات',
  custAllRegionsInCountry: 'جميع مناطق هذا البلد',
  custAllStates: 'جميع الولايات والمناطق',
  custShowAll: 'إظهار الكل',
  custNoBarbersTitle: 'لا توجد صالونات مطابقة حالياً',
  custNoBarbersDescFiltered: 'جرب اختيار بلد أو ولاية أخرى أو عرض جميع البلدان.',
  custNoBarbersDescEmpty: 'لم يقم أي حلاق بنشر حسابه بعد — يمكنك إنشاء حساب حلاق من القائمة العلوية.',
  custPeopleAhead: 'الأشخاص المتبقية',
  custEstWait: 'الانتظار المتوقع',
  custMinUnit: 'د',
  custWaitingRemaining: 'أشخاص',
  custServicesLabel: 'الخدمات:',
  custShopOpen: 'مفتوح ويستقبل الحجوزات',
  custShopClosed: 'مغلق مؤقتاً',
  custBookSeat: 'احجز مقعدك الآن',
  custAlreadyBooked: 'تذكرتك نشطة هنا',
  custHasActiveTicket: 'لديك حجز نشط حالياً',
  custWhatsApp: 'واتساب',
  custFileComplaint: 'تقديم شكوى',
  custTicketNumber: 'تذكرتك رقم',
  custPeopleBeforeYou: 'الأشخاص قبلك الآن',
  custApproxWait: 'الانتظار التقريبي',
  custDirectMessages: 'رسائل الحلاق المباشرة أونلاين',
  custWhatsAppShop: 'تواصل واتساب مع المحل',
  custYou: 'أنت:',
  custReplyPlaceholder: 'أرسل رداً سريعاً للحلاق...',
  custReplyBtn: 'رد',
  custConfirmArrival: 'أنا قادم الآن — تأكيد الحضور',
  custDeferTurnBtn: 'قم بتقديم زبون قبلي',
  custNoOneBehind: 'لا يوجد زبون بعدك لتقديمه الآن',
  custEnableNotifs: 'تفعيل تنبيهات الاتصال الأونلاين',
  custCancelBooking: 'إلغاء الحجز',
  custBarberCallingBanner:
    'الحلاق يطلب حضورك الآن! يمكنك الرد على الاتصال أو تأكيد الحضور أو الضغط على «قم بتقديم زبون قبلي».',
  custBarberCallingNoDefer:
    'الحلاق يطلب حضورك الآن! يمكنك الرد على الاتصال أو تأكيد الحضور.',
  custDeferredCount: 'تم التأجيل',
  custMyComplaints: 'شكاويي وبلاغاتي المرسلة',
  custComplaintsHint: 'يصل البلاغ فوراً إلى حساب العامل وإدارة المنصة لمتابعته.',
  custEditProfileTitle: 'تعديل الملف الشخصي',
  custEditProfileSub:
    'يمكنك تعديل اسمك ورقم هاتفك الخاصين بك وتغيير لون التطبيق ولغته من الشريط العلوي.',
  custFullName: 'اسمك الكامل',
  custPhoneLabel: 'رقم هاتفك / واتساب',
  custSaveProfile: 'حفظ بياناتي الشخصية',
  custSaving: 'جاري الحفظ...',
  custNewBooking: 'حجز مقعد جديد',
  custConfirmBooking: 'تأكيد حجز المقعد الآن',
  custBookingBusy: 'جاري تأكيد الحجز...',
  custChooseService: 'اختر الخدمة المطلوبة',
  custComplaintModalTitle: 'تقديم شكوى عن العامل',
  custComplaintModalSub: 'سيصل البلاغ مباشرة إلى العامل عند الإرسال.',
  custComplaintQuickPick: 'اختر نوع الشكوى بسرعة أو اكتب نوعها يدوياً:',
  custComplaintType: 'نوع الشكوى',
  custComplaintDetails: 'تفاصيل الشكوى',
  custSendComplaint: 'إرسال الشكوى وإبلاغ العامل',
  custSendingComplaint: 'جاري إرسال الشكوى...',

  barberCreateTitle: 'إنشاء حساب العامل والمحل',
  barberEditTitle: 'ملفي الشخصي وبيانات المحل',
  barberProfileHint:
    'يمكنك هنا تعديل ملفك الشخصي ومحلّك وموقعك وروابطك فقط، بالإضافة لتغيير لون التطبيق ولغته.',
  barberBackToQueue: 'العودة للطابور',
  barberAvatarLabel: 'الصورة الشخصية أو شعار البراند',
  barberUploadAvatar: 'رفع صورة من جهازك',
  barberUploading: 'جاري الرفع...',
  barberPresetAvatar: 'أو اختر صورة جاهزة:',
  barberShopNameLabel: 'اسم البراند أو اسم المحل',
  barberNameLabel: 'اسم العامل / الحلاق',
  barberCountryLabel: 'البلد الذي تعمل فيه',
  barberStateLabel: 'الولاية / المحافظة',
  barberCustomStateOpt: 'ولاية / منطقة أخرى (كتابة يدوية)',
  barberStatePlaceholder: 'اكتب اسم الولاية أو المدينة...',
  barberListBtn: 'القائمة',
  barberLocationLabel: 'مكان عمل العامل (العنوان والحي الدقيق)',
  barberSocialsTitle: 'حساباتك الشخصية (فيسبوك · تيك توك · إنستغرام)',
  barberSocialsDesc: 'أدخل اسم الحساب أو الرابط الكامل ليظهر للزبائن في واجهة الحجز (اختياري).',
  barberWaCodeLabel: 'رمز الدولة الافتراضي للواتساب',
  barberPhoneLabel: 'رقم واتساب / هاتف المحل (اختياري)',
  barberAvgMinutesLabel: 'متوسط مدة الزبون (بالدقائق)',
  barberMinutesSuffix: 'دقيقة',
  barberStatusOpenBtn: 'حالة المحل: مفتوح لاستقبال الزبائن',
  barberStatusClosedBtn: 'حالة المحل: مغلق مؤقتاً',
  barberServicesOffered: 'الخدمات المتاحة لزبائنك',
  barberSaveShopBtn: 'حفظ بيانات المحل ونشره للزبائن',
  barberUrgentComplaintTitle: 'بلاغ عاجل: تم تقديم شكوى عنك',
  barberUrgentComplaintDesc: 'يرجى مراجعة الشكاوى المرسلة من الزبائن ومعالجتها لتحسين جودة الخدمة.',
  barberMarkReviewed: 'تم الاطلاع',
  barberMarkResolved: 'تمت المعالجة',
  barberPauseBookings: 'إيقاف الحجز مؤقتاً',
  barberOpenBookings: 'فتح الحجز للزبائن',
  barberEditProfileBtn: 'تعديل ملفي والمحل',
  barberPayElectronicBtn: 'الدفع الإلكتروني للاشتراك',
  barberSubscriptionLabel: 'الاشتراك:',
  barberSubPendingTitle: 'حساب المحل بانتظار التفعيل — ادفع إلكترونياً الآن للتفعيل',
  barberSubSuspendedTitle: 'حساب المحل موقوف مؤقتاً من إدارة المنصة',
  barberMetricWaiting: 'المنتظرون في الطابور',
  barberMetricCurrent: 'رقم الدور الحالي',
  barberMetricTotalWait: 'وقت الانتظار الكلي',
  barberMetricCompleted: 'منجزات الجلسة',
  barberChairTitle: 'لوحة استدعاء الزبون',
  barberChairKicker: 'استدعاء وإدارة الكرسي',
  barberNoCustomers: 'لا يوجد زبائن حالياً',
  barberNoCustomersDesc: 'سيظهر الزبون هنا فور حجزه لتتمكن من استدعائه والتواصل معه مباشرة.',
  barberOnlineVoiceBtn: 'مكالمة صوتية أونلاين',
  barberWhatsAppCallMsg: 'واتساب (رسالة ومكالمة)',
  barberQuickMsgLabel: 'إرسال رسالة فورية داخل التطبيق:',
  barberCustomMsgPlaceholder: 'أو اكتب رسالة خاصة للزبون...',
  barberSendBtn: 'إرسال',
  barberSeatedBtn: 'جلس على الكرسي',
  barberRecallBtn: 'إعادة رنين',
  barberNoShowBtn: 'لم يحضر',
  barberSimCall: 'اتصال هاتفي عادي (SIM)',
  barberContinueWork: 'تابع العمل',
  barberContinueNext: 'تابع العمل — استدعاء',
  barberContinueFinish: 'تابع العمل — إنهاء الزبون الحالي',
  barberContinueEmpty: 'تابع العمل — لا يوجد زبائن',
  barberAutoCallCheckbox: 'بدء مكالمة صوتية أونلاين (بالمايكروفون) تلقائياً عند «تابع العمل»',
  barberQueueTitle: 'قائمة الانتظار والحجوزات',
  barberQueueDesc: 'إدارة الزبائن المنتظرين وسجل المواعيد المكتملة.',
  barberTabWaiting: 'في الانتظار',
  barberTabHistory: 'السجل',
  barberEmptyWaiting: 'لا يوجد زبائن في قائمة الانتظار حالياً',
  barberEmptyHistory: 'لا توجد حجوزات مكتملة أو ملغاة بعد.',
  barberOrderLabel: 'الترتيب:',
  barberMsgComeBtn: 'رسالة: التقرب للمحل',
  barberComplaintsArchive: 'سجل البلاغات والشكاوى الواردة عن المحل',
  barberTotalComplaints: 'إجمالي البلاغات:',
  barberRegPausedTitle: 'تسجيل المحلات الجديدة متوقف حالياً من قِبل الإدارة',
  barberRegPausedDesc: 'أوقف صاحب التطبيق فتح حسابات حلاقين جدد مؤقتاً.',

  payModalKicker: 'بوابة الدفع الإلكتروني متعددة الوسائل',
  payModalTitle: 'دفع اشتراك المحل إلكترونياً',
  payModalSubtitle:
    'يدعم جميع البطاقات والوسائل داخل الجزائر (الذهبية، CIB، بريدي موب) وخارج الجزائر (Visa، Mastercard، Amex، UnionPay، PayPal، Wise/Paysera، Apple Pay، Google Pay).',
  payRegionAlgeria: 'داخل الجزائر (DZD / محلي)',
  payRegionInternational: 'خارج الجزائر / عالمي (كل البطاقات)',
  payAmountDue: 'المبلغ المطلوب للاشتراك',
  paySelectMethod: 'اختر وسيلة الدفع أو نوع البطاقة:',
  payCardNumberLabel: 'رقم البطاقة (16 رقم — التعرف التلقائي على الشبكة)',
  payCardHolderLabel: 'الاسم المطبوع على البطاقة',
  payExpiryLabel: 'تاريخ الانتهاء (MM/YY)',
  payCvvLabel: 'رمز الأمان (CVV/CVC)',
  payDetectedCard: 'البطاقة المكتشفة:',
  payPciNotice:
    'حماية مشددة: يتم التحقق من البطاقة محلياً ولا يتم تخزين رقم البطاقة الكامل أو CVV في قاعدة البيانات نهائياً (تُحفظ آخر 4 أرقام والمرجع فقط).',
  payTransferInstructions: 'معلومات الحساب المستلم للتحويل:',
  payCopyAccount: 'نسخ',
  payCopied: 'تم النسخ',
  payReferenceLabel: 'رقم مرجع العملية / وصل التحويل',
  payReferencePlaceholder: 'مثال: TRX-882419 أو رقم التحويل',
  payExternalGatewayLabel: 'روابط بوابات الدفع المعتمدة من صاحب التطبيق:',
  payOpenChargily: 'الدفع عبر بوابة Chargily Pay',
  payOpenStripe: 'الدفع عبر بوابة Stripe / البطاقة الدولية',
  payOpenPaypal: 'فتح رابط الدفع PayPal',
  paySubmitCardBtn: 'تأكيد ودفع الاشتراك بالبطاقة الآن',
  paySubmitTransferBtn: 'إرسال وصل الدفع الإلكتروني',
  paySubmitting: 'جاري معالجة الدفع...',
  paySuccessInstant: 'تم تأكيد الدفع الإلكتروني وتفعيل اشتراك المحل بنجاح!',
  paySuccessReview: 'تم تسجيل وصل الدفع وإرساله لصاحب التطبيق للمراجعة والتفعيل.',
  payHistoryTitle: 'سجل المدفوعات الإلكترونية للاشتراك',
  payHistoryEmpty: 'لا توجد مدفوعات إلكترونية مسجلة بعد.',
  payStatusPaid: 'مدفوع ومؤكد',
  payStatusPending: 'قيد المراجعة',
  payStatusRejected: 'مرفوض',
  payErrCardNumber: 'يرجى إدخال رقم بطاقة صحيح (الذهبية أو CIB أو Visa/Mastercard وغيرها).',
  payErrExpiry: 'يرجى إدخال تاريخ انتهاء صالح بصيغة MM/YY غير منتهي الصلاحية.',
  payErrCvv: 'يرجى إدخال رمز CVV صحيح (3 أو 4 أرقام).',
  payErrHolder: 'يرجى إدخال اسم صاحب البطاقة أو المرسل.',
  payErrReference: 'يرجى إدخال رقم العملية أو مرجع التحويل.',

  callVoiceIncoming: 'مكالمة صوتية واردة عبر الإنترنت',
  callAutoAlert: 'استدعاء وتنبيه تلقائي من الحلاق',
  callYourTurnAt: 'حان دورك الآن في',
  callTicketHash: 'تذكرتك رقم',
  callBarberMsg: 'رسالة من الحلاق:',
  callAnswerOnline: 'رد على المكالمة أونلاين',
  callConnecting: 'جاري التوصيل...',
  callDeclineVoice: 'رفض الصوت',
  callMuteAndStay: 'إسكات الرنين والبقاء في الانتظار',
  callConnectedStatus: 'متصل عبر الإنترنت',
  callRingingStatus: 'جاري الرنين عبر الإنترنت...',
  callEndedStatus: 'تم إنهاء المكالمة',
  callMicMuted: 'الميكروفون مكتوم',
  callMuteMic: 'كتم الميكروفون',
  callEndBtn: 'إنهاء المكالمة',

  adminHeaderTitle: 'إعدادات صاحب التطبيق — التحكم الكامل',
  adminHeaderDesc:
    'تحكم خاص بك وحدك: عدّل أي نص، أدر اللغات، فعّل أو أوقف أي ميزة في التطبيق، واضبط الأسعار والمدفوعات الإلكترونية.',
  adminStatShops: 'الصالونات',
  adminStatActive: 'المفعلة',
  adminStatPending: 'بانتظار التفعيل',
  adminTabIdentity: 'النصوص، اللغة والمظهر',
  adminTabFeatures: 'التحكم بمميزات التطبيق',
  adminTabPricing: 'الأسعار، الدفع الإلكتروني والشكاوى',
  adminDefaultLangLabel: 'اللغة الافتراضية للتطبيق (للزوار الجدد)',
  adminDefaultThemeLabel: 'اللون الافتراضي للتطبيق (عند فتح الزوار الجدد للتطبيق)',
  adminSaveIdentity: 'حفظ الهوية والنصوص وتعميمها',
  adminSaveFeatures: 'حفظ وتطبيق جميع إعدادات المميزات',
  adminSavePricing: 'حفظ إعدادات الأسعار والدفع الإلكتروني',
  adminPricingTitle: 'التحكم في سعر استعمال التطبيق',
  adminFreeMode: 'استعمال مجاني',
  adminPaidMode: 'تفعيل التسعير المدفوع',
  adminPaymentMethodsTitle: 'إعدادات استقبال الدفع الإلكتروني (داخل وخارج الجزائر)',
  adminAutoApproveLabel: 'التفعيل التلقائي عند الدفع بالبطاقات الإلكترونية',
  adminAutoApproveDesc:
    'عند تفعيله يتفعل اشتراك الحلاق تلقائياً فور الدفع بالبطاقة الذهبية أو CIB أو Visa/Mastercard.',
  adminIncomingPaymentsTitle: 'المدفوعات الإلكترونية الواردة من الحلاقين',
  adminNoPayments: 'لا توجد مدفوعات إلكترونية واردة حتى الآن.',
  adminApprovePayment: 'تأكيد وتفعيل المحل',
  adminRejectPayment: 'رفض',
  adminShopsManageTitle: 'إدارة اشتراكات المحلات والحلاقين',
  adminComplaintsTitle: 'مراقبة شكاوى وبلاغات الزبائن',

  statusWaiting: 'في الانتظار',
  statusCalled: 'جاري الاستدعاء الآن',
  statusInChair: 'على الكرسي الآن',
  statusCompleted: 'مكتمل',
  statusCancelled: 'ملغي',
  svcHaircut: 'حلاقة',
  svcProtein: 'وضع بروتين',
  svcBlowdry: 'تجفيف شعر',
  svcAll: 'كلهم (الباقة الشاملة)',
  cycleMonthly: 'شهرياً',
  cycleYearly: 'سنوياً',
  cyclePerBooking: 'لكل حجز',
  subActive: 'مفعّل',
  subPending: 'بانتظار التفعيل',
  subSuspended: 'موقوف مؤقتاً',
  cmpOpen: 'بلاغ جديد',
  cmpReviewed: 'تم الاطلاع',
  cmpResolved: 'تمت المعالجة',
  downloadAppBtn: 'تحميل التطبيق',
  downloadModalTitle: 'تحميل التطبيق على جهازك',
  downloadModalSubtitle: 'اختر نظام جهازك لتثبيت التطبيق فوراً على أندرويد أو آيفون (iOS) أو الحاسوب:',
  downloadAndroidTitle: 'أندرويد (Android)',
  downloadAndroidDesc: 'تثبيت فوري كتطبيق على هواتف أندرويد أو عبر رابط APK / المتجر',
  downloadIosTitle: 'آيفون وآيباد (iOS)',
  downloadIosDesc: 'إضافة مباشرة إلى الشاشة الرئيسية عبر متصفح Safari',
  downloadDesktopTitle: 'الحاسوب (Windows / Mac)',
  downloadDesktopDesc: 'تشغيل التطبيق في نافذة مستقلة على الكمبيوتر واللابتوب',
  downloadInstallNowBtn: 'تثبيت التطبيق الآن بضغطة واحدة',
  downloadOpenDirectBtn: 'فتح رابط التحميل المباشر',
  downloadCopyLinkBtn: 'نسخ رابط التطبيق',
  downloadAlreadyInstalled: 'التطبيق مثبّت ويعمل الآن كتطبيق مستقل على هذا الجهاز!',
  downloadIosStep1: '1. افتح هذا الرابط عبر متصفح Safari على الآيفون أو الآيباد.',
  downloadIosStep2: '2. اضغط على زر المشاركة (Share) في شريط المتصفح.',
  downloadIosStep3: '3. اختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen) ثم اضغط «إضافة».',
  downloadAndroidStep1: '1. اضغط على زر القائمة (⋮) في متصفح Chrome أعلى الشاشة.',
  downloadAndroidStep2: '2. اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية» للتشغيل كتطبيق.',
  downloadDesktopStep1: '1. اضغط على أيقونة التثبيت الموجودة في شريط العنوان بمتصفح Chrome أو Edge.',
  downloadDesktopStep2: '2. أو افتح قائمة المتصفح واختر «تثبيت التطبيق» لتشغيله على سطح المكتب.',
  downloadOfflineBadge: 'وضع عدم الاتصال — البيانات المحفوظة متاحة مؤقتاً',
  closeBtn: 'إغلاق',
  downloadWebTitle: 'مواقع الويب (Web / Embed)',
  downloadWebDesc: 'استخدام مباشر عبر المتصفح أو تضمين التطبيق داخل أي موقع ويب سايت',
  downloadWebOpenBtn: 'فتح التطبيق في نافذة ويب جديدة',
  downloadEmbedCodeLabel: 'كود التضمين لأي موقع ويب (WordPress / HTML / Wix / Shopify):',
  downloadCopyEmbedBtn: 'نسخ كود التضمين',
  downloadWebStep1: '1. يعمل التطبيق مباشرة على جميع متصفحات الويب (Chrome, Safari, Firefox, Edge) بدون تثبيت.',
  downloadWebStep2: '2. انسخ كود HTML أدناه والصقه في أي صفحة بموقعك ليتمكن الزوار من الحجز من داخل موقعك.',
  barberEmbedBtn: 'تضمين في موقع ويب',
  barberEmbedTitle: 'استخدام وتضمين حجز المحل في مواقع الويب',
  barberEmbedSubtitle: 'شارك رابط الحجز المباشر لمحلك أو ضمّن طابور محلك داخل أي موقع ويب عبر الكود التالي:',
  barberDirectLinkLabel: 'الرابط المباشر لمحلك على الويب:',
  barberWidgetLinkLabel: 'رابط التضمين المدمج (Widget URL):',
  custShowAllShops: 'عرض جميع المحلات',
  custDirectShopFilterNote: 'يتم عرض المحل المحدد عبر رابط الموقع المباشر',
};

export const EN_DICT: TranslationDict = {
  initializingPlatform: 'Initializing platform...',
  signIn: 'Sign In',
  signingIn: 'Signing in...',
  signOut: 'Sign Out',
  languageLabel: 'Language',
  languageSearchPlaceholder: 'Search any world language...',
  noLanguagesFound: 'No matching language found.',

  navFeatures: 'Features',
  navPricing: 'Plans & Access',
  navCustomer: 'Customer Portal',
  navBarber: 'Barber / Shop Account',
  navOwnerSettings: 'Owner Settings',
  mobileCustomer: 'Customer',
  mobileBarber: 'Barber / Shop',
  mobileOwner: 'Owner',
  roleOwnerHint: 'App Owner: Full control over all settings, features & payments',
  roleBarberHint: 'Barber Role: Manage your shop profile, online payments, theme & language',
  roleCustomerHint: 'Customer Role: Manage your personal profile, theme color & language',

  themeLabel: 'App Theme:',
  themeLabelCompact: 'Theme:',
  themeGold: 'Classic Gold',
  themeEmerald: 'Emerald Green',
  themeBlue: 'Royal Blue',
  themeBurgundy: 'Luxury Burgundy',
  themeDark: 'Midnight Dark',

  chooseAccountType: 'Choose your account type to start:',
  accountCustomerTitle: 'Customer Account',
  accountCustomerDesc: 'Book your seat and track your turn',
  accountBarberTitle: 'Barber / Shop Account',
  accountBarberDesc: 'Create your shop and manage the live queue',
  continueWithGoogleCustomer: 'Continue with Google as Customer',
  continueWithGoogleBarber: 'Continue with Google as Barber',
  heroCardTitle: 'Organized experience from booking to chair',
  heroCardMeta: 'Shop Brand · Exact Location · People Ahead · Instant Call & Alert',
  featAutoCallTitle: 'One-Tap Automatic Call & Alert',
  featAutoCallDesc:
    'When the barber taps "Continue Work", the customer device rings instantly with WebRTC voice call or WhatsApp.',
  featDeferTitle: 'Flexible "Let Next Customer Go First"',
  featDeferDesc:
    'If a customer cannot arrive in time, they tap defer to let the next customer go ahead without losing their booking.',
  featIdentityTitle: 'Shop Identity & Services',
  featIdentityDesc:
    'Every barber adds their brand name, avatar, country/region, and haircut, protein, blow-dry, or full package options.',
  featPricingPrefix: 'Salon Subscription:',

  designedBy: 'Designed & Built by:',
  ownerSupport: 'Owner & Support Phone:',

  custChooseBarber: 'Choose Your Barber & Book a Seat',
  custSubtitleFilter: 'Select your country and state/province and watch live wait counts.',
  custSubtitleNoFilter: 'Browse available barbershops and live wait counts in real time.',
  custSearchPlaceholder: 'Search shop, barber, or neighborhood...',
  custMyProfile: 'My Profile',
  custCountrySelected: 'Selected Country',
  custAllCountries: 'All Countries',
  custStateLabel: 'State / Wilaya / Province',
  custSelectCountryFirst: 'Select a country first to view states',
  custAllRegionsInCountry: 'All regions in this country',
  custAllStates: 'All States / Provinces',
  custShowAll: 'Show All',
  custNoBarbersTitle: 'No matching barbershops found',
  custNoBarbersDescFiltered: 'Try selecting another country/state or clearing filters.',
  custNoBarbersDescEmpty: 'No barbershops published yet — switch to Barber account to create one.',
  custPeopleAhead: 'People Waiting',
  custEstWait: 'Est. Wait',
  custMinUnit: 'min',
  custWaitingRemaining: 'people',
  custServicesLabel: 'Services:',
  custShopOpen: 'Open & Accepting Bookings',
  custShopClosed: 'Temporarily Closed',
  custBookSeat: 'Book Your Seat Now',
  custAlreadyBooked: 'Active Ticket Here',
  custHasActiveTicket: 'You Have an Active Booking',
  custWhatsApp: 'WhatsApp',
  custFileComplaint: 'Report / Complaint',
  custTicketNumber: 'Your Ticket',
  custPeopleBeforeYou: 'People Ahead of You',
  custApproxWait: 'Approx. Wait Time',
  custDirectMessages: 'Live Direct Messages from Barber',
  custWhatsAppShop: 'Message Shop on WhatsApp',
  custYou: 'You:',
  custReplyPlaceholder: 'Send a quick reply to barber...',
  custReplyBtn: 'Send',
  custConfirmArrival: 'I Am Coming Now — Confirm Arrival',
  custDeferTurnBtn: 'Let Someone Ahead Go Before Me',
  custNoOneBehind: 'No one behind you right now',
  custEnableNotifs: 'Enable Online Call Notifications',
  custCancelBooking: 'Cancel Booking',
  custBarberCallingBanner:
    'Your barber is calling you now! Answer the call, confirm arrival, or defer one turn.',
  custBarberCallingNoDefer: 'Your barber is calling you now! Answer the call or confirm arrival.',
  custDeferredCount: 'Deferred',
  custMyComplaints: 'My Submitted Complaints',
  custComplaintsHint: 'Reports reach the barber and app owner immediately.',
  custEditProfileTitle: 'Edit Personal Profile',
  custEditProfileSub:
    'You can update your name, phone number, app theme color, and language.',
  custFullName: 'Full Name',
  custPhoneLabel: 'Phone / WhatsApp Number',
  custSaveProfile: 'Save Personal Profile',
  custSaving: 'Saving...',
  custNewBooking: 'Book a New Seat',
  custConfirmBooking: 'Confirm Seat Booking',
  custBookingBusy: 'Booking...',
  custChooseService: 'Select Required Service',
  custComplaintModalTitle: 'Submit a Complaint',
  custComplaintModalSub: 'Your report notifies the barber immediately upon submission.',
  custComplaintQuickPick: 'Pick a complaint category or type your own:',
  custComplaintType: 'Complaint Type',
  custComplaintDetails: 'Complaint Details',
  custSendComplaint: 'Submit Complaint & Notify Barber',
  custSendingComplaint: 'Submitting...',

  barberCreateTitle: 'Create Barber / Shop Account',
  barberEditTitle: 'My Profile & Shop Details',
  barberProfileHint:
    'Update your personal shop profile, location, social links, theme color, and language.',
  barberBackToQueue: 'Back to Queue',
  barberAvatarLabel: 'Profile Photo or Brand Logo',
  barberUploadAvatar: 'Upload Photo',
  barberUploading: 'Uploading...',
  barberPresetAvatar: 'Or choose a preset:',
  barberShopNameLabel: 'Brand or Shop Name',
  barberNameLabel: 'Barber / Stylist Name',
  barberCountryLabel: 'Operating Country',
  barberStateLabel: 'State / Wilaya / Province',
  barberCustomStateOpt: 'Other region (type manually)',
  barberStatePlaceholder: 'Enter state or city name...',
  barberListBtn: 'List',
  barberLocationLabel: 'Exact Shop Address & Neighborhood',
  barberSocialsTitle: 'Social Accounts (Facebook · TikTok · Instagram)',
  barberSocialsDesc: 'Add your username or full link for customers to view (optional).',
  barberWaCodeLabel: 'Default WhatsApp Country Code',
  barberPhoneLabel: 'Shop Phone / WhatsApp (Optional)',
  barberAvgMinutesLabel: 'Average Minutes Per Customer',
  barberMinutesSuffix: 'min',
  barberStatusOpenBtn: 'Shop Status: Open for Bookings',
  barberStatusClosedBtn: 'Shop Status: Temporarily Closed',
  barberServicesOffered: 'Services Available for Customers',
  barberSaveShopBtn: 'Save Shop Profile & Publish',
  barberUrgentComplaintTitle: 'Urgent Alert: A Complaint Was Filed',
  barberUrgentComplaintDesc: 'Please review customer complaints and mark them resolved.',
  barberMarkReviewed: 'Mark Reviewed',
  barberMarkResolved: 'Mark Resolved',
  barberPauseBookings: 'Pause Bookings',
  barberOpenBookings: 'Open for Bookings',
  barberEditProfileBtn: 'Edit Profile & Shop',
  barberPayElectronicBtn: 'Pay Subscription Online',
  barberSubscriptionLabel: 'Subscription:',
  barberSubPendingTitle: 'Shop Pending Activation — Pay Electronically Now to Activate',
  barberSubSuspendedTitle: 'Shop Temporarily Suspended by Platform Owner',
  barberMetricWaiting: 'Waiting in Queue',
  barberMetricCurrent: 'Now Serving',
  barberMetricTotalWait: 'Total Wait Time',
  barberMetricCompleted: 'Completed Today',
  barberChairTitle: 'Customer Call & Chair Control',
  barberChairKicker: 'Chair & Calling Command',
  barberNoCustomers: 'No Customers Right Now',
  barberNoCustomersDesc: 'Booked customers appear here immediately so you can call or message them.',
  barberOnlineVoiceBtn: 'Online Voice Call',
  barberWhatsAppCallMsg: 'WhatsApp (Message & Call)',
  barberQuickMsgLabel: 'Send Instant In-App Message:',
  barberCustomMsgPlaceholder: 'Or write a custom message...',
  barberSendBtn: 'Send',
  barberSeatedBtn: 'In Chair',
  barberRecallBtn: 'Ring Again',
  barberNoShowBtn: 'No Show',
  barberSimCall: 'Regular Phone Call (SIM)',
  barberContinueWork: 'Continue Work',
  barberContinueNext: 'Continue Work — Call',
  barberContinueFinish: 'Continue Work — Finish Current',
  barberContinueEmpty: 'Continue Work — Queue Empty',
  barberAutoCallCheckbox: 'Auto-start online voice call (microphone) on "Continue Work"',
  barberQueueTitle: 'Live Waiting Queue & History',
  barberQueueDesc: 'Manage waiting customers and completed/cancelled tickets.',
  barberTabWaiting: 'Waiting',
  barberTabHistory: 'History',
  barberEmptyWaiting: 'No customers currently waiting in the queue',
  barberEmptyHistory: 'No completed or cancelled bookings yet.',
  barberOrderLabel: 'Order:',
  barberMsgComeBtn: 'Message: Come Closer',
  barberComplaintsArchive: 'Shop Complaints Archive',
  barberTotalComplaints: 'Total Reports:',
  barberRegPausedTitle: 'New Shop Registration Currently Paused by Admin',
  barberRegPausedDesc: 'The app owner paused new barber shop registrations temporarily.',

  payModalKicker: 'Global & Local Electronic Payment Gateway',
  payModalTitle: 'Pay Shop Subscription Electronically',
  payModalSubtitle:
    'Supports Algerian methods (Edahabia, CIB, BaridiMob/CCP) & international cards/wallets (Visa, Mastercard, Amex, UnionPay, Discover, JCB, Mir, PayPal, Wise/Paysera, Apple Pay, Google Pay).',
  payRegionAlgeria: 'Algeria (Edahabia · CIB · BaridiMob)',
  payRegionInternational: 'International (All Global Cards & Wallets)',
  payAmountDue: 'Subscription Amount Due',
  paySelectMethod: 'Choose Payment Method / Card Brand:',
  payCardNumberLabel: 'Card Number (Auto-detects network)',
  payCardHolderLabel: 'Cardholder / Payer Name',
  payExpiryLabel: 'Expiry (MM/YY)',
  payCvvLabel: 'Security Code (CVV/CVC)',
  payDetectedCard: 'Detected Card:',
  payPciNotice:
    'Security Notice: Card numbers are validated locally in your browser and never stored in full. Only card brand, last 4 digits, and transaction reference are recorded.',
  payTransferInstructions: 'Receiving Account Details:',
  payCopyAccount: 'Copy',
  payCopied: 'Copied',
  payReferenceLabel: 'Transaction Reference / Receipt Code',
  payReferencePlaceholder: 'e.g. TRX-882419 or Transfer ID',
  payExternalGatewayLabel: 'Configured Gateway Checkout Links:',
  payOpenChargily: 'Pay via Chargily Pay',
  payOpenStripe: 'Pay via Stripe / Card Checkout',
  payOpenPaypal: 'Open PayPal Checkout',
  paySubmitCardBtn: 'Confirm & Pay Subscription by Card',
  paySubmitTransferBtn: 'Submit Electronic Transfer Receipt',
  paySubmitting: 'Processing Payment...',
  paySuccessInstant: 'Electronic payment confirmed! Your shop subscription is now active.',
  paySuccessReview: 'Payment receipt submitted and sent to the app owner for verification.',
  payHistoryTitle: 'Electronic Subscription Payment History',
  payHistoryEmpty: 'No electronic payments recorded yet.',
  payStatusPaid: 'Paid & Confirmed',
  payStatusPending: 'Pending Review',
  payStatusRejected: 'Rejected',
  payErrCardNumber: 'Please enter a valid card number (Edahabia, CIB, Visa, Mastercard, etc.).',
  payErrExpiry: 'Please enter a valid non-expired MM/YY date.',
  payErrCvv: 'Please enter a valid 3 or 4 digit CVV/CVC.',
  payErrHolder: 'Please enter the cardholder or payer name.',
  payErrReference: 'Please enter the transaction reference or receipt ID.',

  callVoiceIncoming: 'Incoming Online Voice Call',
  callAutoAlert: 'Automatic Turn Alert from Barber',
  callYourTurnAt: 'It Is Your Turn at',
  callTicketHash: 'Ticket',
  callBarberMsg: 'Message from barber:',
  callAnswerOnline: 'Answer Online Call',
  callConnecting: 'Connecting...',
  callDeclineVoice: 'Decline Audio',
  callMuteAndStay: 'Silence Ring & Stay in Queue',
  callConnectedStatus: 'Connected Online',
  callRingingStatus: 'Ringing Online...',
  callEndedStatus: 'Call Ended',
  callMicMuted: 'Mic Muted',
  callMuteMic: 'Mute Mic',
  callEndBtn: 'End Call',

  adminHeaderTitle: 'App Owner Settings — Full Platform Control',
  adminHeaderDesc:
    'Exclusive owner controls: edit branding/texts, set default language & theme, toggle any app feature, and manage pricing & electronic payment gateways.',
  adminStatShops: 'Shops',
  adminStatActive: 'Active',
  adminStatPending: 'Pending',
  adminTabIdentity: 'Branding, Language & Theme',
  adminTabFeatures: 'Feature Controls',
  adminTabPricing: 'Pricing, E-Payments & Complaints',
  adminDefaultLangLabel: 'Default App Language (for new visitors)',
  adminDefaultThemeLabel: 'Default App Theme Color',
  adminSaveIdentity: 'Save Identity & Texts',
  adminSaveFeatures: 'Save Feature Controls',
  adminSavePricing: 'Save Pricing & E-Payment Settings',
  adminPricingTitle: 'App Usage Pricing Control',
  adminFreeMode: 'Free Usage',
  adminPaidMode: 'Paid Subscription Mode',
  adminPaymentMethodsTitle: 'Electronic Payment Receiving Accounts (Algeria & Global)',
  adminAutoApproveLabel: 'Auto-activate subscription on valid card payment',
  adminAutoApproveDesc:
    'Automatically activates the shop when paying with Edahabia, CIB, Visa, Mastercard, or other supported cards.',
  adminIncomingPaymentsTitle: 'Incoming Barber Electronic Payments',
  adminNoPayments: 'No electronic payments submitted yet.',
  adminApprovePayment: 'Approve & Activate Shop',
  adminRejectPayment: 'Reject',
  adminShopsManageTitle: 'Barbershops Subscription Management',
  adminComplaintsTitle: 'Platform Complaints Monitor',

  statusWaiting: 'Waiting',
  statusCalled: 'Calling Now',
  statusInChair: 'In Chair',
  statusCompleted: 'Completed',
  statusCancelled: 'Cancelled',
  svcHaircut: 'Haircut',
  svcProtein: 'Protein Treatment',
  svcBlowdry: 'Blow-Dry',
  svcAll: 'All Services (Full Package)',
  cycleMonthly: 'Monthly',
  cycleYearly: 'Yearly',
  cyclePerBooking: 'Per Booking',
  subActive: 'Active',
  subPending: 'Pending Activation',
  subSuspended: 'Suspended',
  cmpOpen: 'New Report',
  cmpReviewed: 'Reviewed',
  cmpResolved: 'Resolved',
  downloadAppBtn: 'Download App',
  downloadModalTitle: 'Download App for Your Device',
  downloadModalSubtitle: 'Select your device platform to install or download on Android, iOS, or Desktop:',
  downloadAndroidTitle: 'Android',
  downloadAndroidDesc: 'One-tap app installation for Android phones & tablets',
  downloadIosTitle: 'iPhone & iPad (iOS)',
  downloadIosDesc: 'Install directly to Home Screen via Safari',
  downloadDesktopTitle: 'Desktop (Windows / Mac / Linux)',
  downloadDesktopDesc: 'Run as a standalone native-style desktop application',
  downloadInstallNowBtn: 'Install App Now (One Tap)',
  downloadOpenDirectBtn: 'Open Direct Download Link',
  downloadCopyLinkBtn: 'Copy App Link',
  downloadAlreadyInstalled: 'App is already installed & running in standalone mode!',
  downloadIosStep1: '1. Open this link in Safari on your iPhone or iPad.',
  downloadIosStep2: '2. Tap the Share button in the Safari toolbar.',
  downloadIosStep3: '3. Scroll down, tap "Add to Home Screen", then tap Add.',
  downloadAndroidStep1: '1. Tap the browser menu (⋮) in the top corner of Chrome.',
  downloadAndroidStep2: '2. Tap "Install App" or "Add to Home screen".',
  downloadDesktopStep1: '1. Click the Install icon inside your Chrome or Edge address bar.',
  downloadDesktopStep2: '2. Or open the browser menu and click "Install App".',
  downloadOfflineBadge: 'Offline Mode — Cached view active',
  closeBtn: 'Close',
  downloadWebTitle: 'Websites & Browser',
  downloadWebDesc: 'Use directly in any web browser or embed inside any external website',
  downloadWebOpenBtn: 'Open Web App in New Tab',
  downloadEmbedCodeLabel: 'HTML Embed Code for Any Website (WordPress / Wix / Shopify / HTML):',
  downloadCopyEmbedBtn: 'Copy Embed Code',
  downloadWebStep1: '1. Runs directly on all web browsers (Chrome, Safari, Firefox, Edge) with zero setup.',
  downloadWebStep2: '2. Copy the HTML code below and paste it into any website page for instant customer booking.',
  barberEmbedBtn: 'Website Embed',
  barberEmbedTitle: 'Use & Embed Your Shop on Websites',
  barberEmbedSubtitle: 'Share your shop direct web link or embed this live queue widget inside any website:',
  barberDirectLinkLabel: 'Direct Shop Web Link:',
  barberWidgetLinkLabel: 'Compact Embed Widget URL:',
  custShowAllShops: 'Show All Shops',
  custDirectShopFilterNote: 'Showing the shop linked from this website URL',
};

export const FR_DICT: TranslationDict = {
  ...EN_DICT,
  initializingPlatform: 'Initialisation de la plateforme...',
  signIn: 'Connexion',
  signingIn: 'Connexion en cours...',
  signOut: 'Déconnexion',
  languageLabel: 'Langue',
  languageSearchPlaceholder: 'Rechercher une langue...',
  noLanguagesFound: 'Aucune langue trouvée.',

  navFeatures: 'Fonctionnalités',
  navPricing: 'Tarifs & Accès',
  navCustomer: 'Espace Client',
  navBarber: 'Espace Barbier / Salon',
  navOwnerSettings: 'Paramètres Propriétaire',
  mobileCustomer: 'Client',
  mobileBarber: 'Barbier',
  mobileOwner: 'Propriétaire',
  roleOwnerHint: 'Propriétaire : contrôle complet des paramètres, langues, paiements et fonctions',
  roleBarberHint: 'Barbier : gérez votre salon, paiements électroniques, thème et langue uniquement',
  roleCustomerHint: 'Client : gérez votre profil personnel, thème et langue uniquement',

  themeLabel: 'Couleur de l’app :',
  themeLabelCompact: 'Thème :',
  themeGold: 'Or Classique',
  themeEmerald: 'Vert Émeraude',
  themeBlue: 'Bleu Royal',
  themeBurgundy: 'Bordeaux Luxe',
  themeDark: 'Mode Sombre',

  chooseAccountType: 'Choisissez votre type de compte :',
  accountCustomerTitle: 'Compte Client',
  accountCustomerDesc: 'Réservez votre place et suivez votre tour',
  accountBarberTitle: 'Compte Barbier / Salon',
  accountBarberDesc: 'Créez votre salon et gérez la file',
  continueWithGoogleCustomer: 'Continuer avec Google (Client)',
  continueWithGoogleBarber: 'Continuer avec Google (Barbier)',
  heroCardTitle: 'Une expérience fluide de la réservation jusqu’au fauteuil',
  heroCardMeta: 'Nom du salon · Localisation · File en direct · Appel & Alerte instantanés',
  featAutoCallTitle: 'Appel et alerte automatique en un clic',
  featAutoCallDesc:
    'Quand le barbier appuie sur « Continuer », le client reçoit un appel vocal en ligne ou WhatsApp.',
  featDeferTitle: 'Option « Faire passer un client avant moi »',
  featDeferDesc:
    'Si vous ne pouvez pas arriver à temps, laissez passer le client suivant sans annuler votre place.',
  featIdentityTitle: 'Identité du salon & services',
  featIdentityDesc:
    'Chaque barbier ajoute son enseigne, pays/wilaya, réseaux sociaux et options coupe, protéine, brushing.',
  featPricingPrefix: 'Abonnement Salon :',

  designedBy: 'Conçu et développé par :',
  ownerSupport: 'Propriétaire & Support :',

  custChooseBarber: 'Choisissez votre barbier et réservez',
  custSubtitleFilter: 'Sélectionnez votre pays et wilaya/région pour voir les files en direct.',
  custSubtitleNoFilter: 'Parcourez les salons disponibles et suivez les files en temps réel.',
  custSearchPlaceholder: 'Rechercher un salon, barbier ou quartier...',
  custMyProfile: 'Mon Profil',
  custCountrySelected: 'Pays sélectionné',
  custAllCountries: 'Tous les pays',
  custStateLabel: 'Wilaya / État / Région',
  custSelectCountryFirst: 'Choisissez d’abord un pays',
  custAllRegionsInCountry: 'Toutes les régions de ce pays',
  custAllStates: 'Toutes les wilayas/régions',
  custShowAll: 'Tout afficher',
  custNoBarbersTitle: 'Aucun salon correspondant',
  custNoBarbersDescFiltered: 'Essayez un autre pays ou wilaya.',
  custNoBarbersDescEmpty: 'Aucun salon publié pour le moment.',
  custPeopleAhead: 'Clients en attente',
  custEstWait: 'Attente estimée',
  custMinUnit: 'min',
  custWaitingRemaining: 'personnes',
  custServicesLabel: 'Services :',
  custShopOpen: 'Ouvert aux réservations',
  custShopClosed: 'Fermé temporairement',
  custBookSeat: 'Réserver ma place',
  custAlreadyBooked: 'Votre ticket actif ici',
  custHasActiveTicket: 'Vous avez déjà une réservation active',
  custWhatsApp: 'WhatsApp',
  custFileComplaint: 'Signaler / Plainte',
  custTicketNumber: 'Votre ticket',
  custPeopleBeforeYou: 'Personnes avant vous',
  custApproxWait: 'Attente approximative',
  custDirectMessages: 'Messages directs du barbier',
  custWhatsAppShop: 'Contacter sur WhatsApp',
  custYou: 'Vous :',
  custReplyPlaceholder: 'Envoyer une réponse rapide...',
  custReplyBtn: 'Envoyer',
  custConfirmArrival: 'J’arrive maintenant — Confirmer',
  custDeferTurnBtn: 'Faire passer le client suivant avant moi',
  custNoOneBehind: 'Aucun client derrière vous actuellement',
  custEnableNotifs: 'Activer les notifications d’appel en ligne',
  custCancelBooking: 'Annuler la réservation',
  custBarberCallingBanner:
    'Votre barbier vous appelle ! Répondez, confirmez votre arrivée ou passez votre tour.',
  custBarberCallingNoDefer: 'Votre barbier vous appelle ! Répondez ou confirmez votre arrivée.',
  custDeferredCount: 'Reporté',
  custMyComplaints: 'Mes plaintes envoyées',
  custComplaintsHint: 'Les signalements arrivent immédiatement au barbier et à l’administration.',
  custEditProfileTitle: 'Modifier mon profil personnel',
  custEditProfileSub: 'Modifiez votre nom, téléphone, thème et langue.',
  custFullName: 'Nom complet',
  custPhoneLabel: 'Numéro de téléphone / WhatsApp',
  custSaveProfile: 'Enregistrer',
  custSaving: 'Enregistrement...',
  custNewBooking: 'Nouvelle réservation',
  custConfirmBooking: 'Confirmer la réservation',
  custBookingBusy: 'Réservation...',
  custChooseService: 'Choisir le service',
  custComplaintModalTitle: 'Déposer une plainte',
  custComplaintModalSub: 'Le barbier recevra l’alerte immédiatement.',
  custComplaintQuickPick: 'Choisissez un motif ou rédigez-le :',
  custComplaintType: 'Type de plainte',
  custComplaintDetails: 'Détails',
  custSendComplaint: 'Envoyer la plainte',
  custSendingComplaint: 'Envoi...',

  barberCreateTitle: 'Créer votre compte Barbier / Salon',
  barberEditTitle: 'Mon Profil & Paramètres du Salon',
  barberProfileHint: 'Gérez votre salon, adresse, réseaux sociaux, couleur et langue.',
  barberBackToQueue: 'Retour à la file',
  barberAvatarLabel: 'Photo de profil ou Logo',
  barberUploadAvatar: 'Importer une image',
  barberUploading: 'Téléchargement...',
  barberPresetAvatar: 'Ou choisir un modèle :',
  barberShopNameLabel: 'Nom du salon / Marque',
  barberNameLabel: 'Nom du barbier',
  barberCountryLabel: 'Pays',
  barberStateLabel: 'Wilaya / Région',
  barberCustomStateOpt: 'Autre région (saisie manuelle)',
  barberStatePlaceholder: 'Saisir le nom de la wilaya ou ville...',
  barberListBtn: 'Liste',
  barberLocationLabel: 'Adresse précise du salon',
  barberSocialsTitle: 'Réseaux sociaux (Facebook · TikTok · Instagram)',
  barberSocialsDesc: 'Ajoutez vos liens pour les clients (optionnel).',
  barberWaCodeLabel: 'Indicatif WhatsApp',
  barberPhoneLabel: 'Téléphone / WhatsApp du salon',
  barberAvgMinutesLabel: 'Durée moyenne par client',
  barberMinutesSuffix: 'min',
  barberStatusOpenBtn: 'Statut : Salon Ouvert',
  barberStatusClosedBtn: 'Statut : Fermé temporairement',
  barberServicesOffered: 'Services proposés aux clients',
  barberSaveShopBtn: 'Enregistrer et publier le salon',
  barberUrgentComplaintTitle: 'Alerte urgente : Nouvelle plainte reçue',
  barberUrgentComplaintDesc: 'Veuillez consulter et traiter les signalements.',
  barberMarkReviewed: 'Marquer lu',
  barberMarkResolved: 'Résolu',
  barberPauseBookings: 'Fermer temporairement',
  barberOpenBookings: 'Ouvrir les réservations',
  barberEditProfileBtn: 'Modifier le salon',
  barberPayElectronicBtn: 'Paiement électronique',
  barberSubscriptionLabel: 'Abonnement :',
  barberSubPendingTitle: 'Compte en attente — Payez en ligne pour activer',
  barberSubSuspendedTitle: 'Salon suspendu temporairement',
  barberMetricWaiting: 'En attente',
  barberMetricCurrent: 'N° en cours',
  barberMetricTotalWait: 'Attente totale',
  barberMetricCompleted: 'Terminés',
  barberChairTitle: 'Appel & Gestion du Fauteuil',
  barberChairKicker: 'Commandes du fauteuil',
  barberNoCustomers: 'Aucun client actuellement',
  barberNoCustomersDesc: 'Les réservations apparaîtront ici en temps réel.',
  barberOnlineVoiceBtn: 'Appel vocal en ligne',
  barberWhatsAppCallMsg: 'WhatsApp (Message/Appel)',
  barberQuickMsgLabel: 'Message instantané :',
  barberCustomMsgPlaceholder: 'Ou écrivez un message...',
  barberSendBtn: 'Envoyer',
  barberSeatedBtn: 'Sur le fauteuil',
  barberRecallBtn: 'Rappeler',
  barberNoShowBtn: 'Absent',
  barberSimCall: 'Appel téléphonique classique',
  barberContinueWork: 'Continuer le travail',
  barberContinueNext: 'Continuer — Appeler',
  barberContinueFinish: 'Continuer — Terminer',
  barberContinueEmpty: 'Continuer — File vide',
  barberAutoCallCheckbox: 'Lancer l’appel vocal en ligne automatiquement',
  barberQueueTitle: 'File d’attente & Historique',
  barberQueueDesc: 'Gérez les clients en attente et l’historique.',
  barberTabWaiting: 'En attente',
  barberTabHistory: 'Historique',
  barberEmptyWaiting: 'Aucun client en attente',
  barberEmptyHistory: 'Aucun historique pour le moment.',
  barberOrderLabel: 'Ordre :',
  barberMsgComeBtn: 'Message : Approchez du salon',
  barberComplaintsArchive: 'Journal des plaintes du salon',
  barberTotalComplaints: 'Total :',
  barberRegPausedTitle: 'Nouvelles inscriptions suspendues par l’administration',
  barberRegPausedDesc: 'Le propriétaire a temporairement suspendu les inscriptions.',

  payModalKicker: 'Paiement Électronique Algérie & International',
  payModalTitle: 'Régler l’abonnement en ligne',
  payModalSubtitle:
    'Accepte Edahabia, CIB, BaridiMob/CCP ainsi que Visa, Mastercard, Amex, UnionPay, Discover, JCB, Mir, PayPal, Wise/Paysera, Apple Pay, Google Pay.',
  payRegionAlgeria: 'Algérie (Edahabia · CIB · BaridiMob)',
  payRegionInternational: 'International (Toutes cartes & wallets)',
  payAmountDue: 'Montant de l’abonnement',
  paySelectMethod: 'Choisissez le moyen de paiement :',
  payCardNumberLabel: 'Numéro de carte',
  payCardHolderLabel: 'Nom du titulaire',
  payExpiryLabel: 'Expiration (MM/AA)',
  payCvvLabel: 'Code CVV/CVC',
  payDetectedCard: 'Carte détectée :',
  payPciNotice:
    'Sécurité : le numéro complet et le CVV ne sont jamais enregistrés dans la base de données.',
  payTransferInstructions: 'Coordonnées de virement :',
  payCopyAccount: 'Copier',
  payCopied: 'Copié',
  payReferenceLabel: 'Référence de transaction / Reçu',
  payReferencePlaceholder: 'Ex: TRX-882419',
  payExternalGatewayLabel: 'Liens de paiement externes :',
  payOpenChargily: 'Payer via Chargily Pay',
  payOpenStripe: 'Payer via Stripe / Carte',
  payOpenPaypal: 'Ouvrir PayPal',
  paySubmitCardBtn: 'Confirmer le paiement par carte',
  paySubmitTransferBtn: 'Envoyer le justificatif de paiement',
  paySubmitting: 'Traitement...',
  paySuccessInstant: 'Paiement confirmé ! Votre abonnement est désormais actif.',
  paySuccessReview: 'Reçu envoyé au propriétaire pour vérification.',
  payHistoryTitle: 'Historique des paiements électroniques',
  payHistoryEmpty: 'Aucun paiement enregistré.',
  payStatusPaid: 'Payé & Confirmé',
  payStatusPending: 'En vérification',
  payStatusRejected: 'Refusé',
  payErrCardNumber: 'Numéro de carte invalide.',
  payErrExpiry: 'Date d’expiration invalide (MM/AA).',
  payErrCvv: 'Code CVV invalide.',
  payErrHolder: 'Veuillez saisir le nom du titulaire.',
  payErrReference: 'Veuillez saisir la référence de transaction.',

  callVoiceIncoming: 'Appel vocal en ligne entrant',
  callAutoAlert: 'Alerte automatique de votre barbier',
  callYourTurnAt: 'C’est votre tour chez',
  callTicketHash: 'Ticket',
  callBarberMsg: 'Message du barbier :',
  callAnswerOnline: 'Répondre en ligne',
  callConnecting: 'Connexion...',
  callDeclineVoice: 'Refuser audio',
  callMuteAndStay: 'Couper la sonnerie et patienter',
  callConnectedStatus: 'Connecté en ligne',
  callRingingStatus: 'Appel en cours...',
  callEndedStatus: 'Appel terminé',
  callMicMuted: 'Micro coupé',
  callMuteMic: 'Couper micro',
  callEndBtn: 'Raccrocher',

  adminHeaderTitle: 'Paramètres Propriétaire — Contrôle Total',
  adminHeaderDesc:
    'Gérez le nom, les textes, la langue par défaut, les fonctionnalités, les tarifs et les paiements électroniques.',
  adminStatShops: 'Salons',
  adminStatActive: 'Actifs',
  adminStatPending: 'En attente',
  adminTabIdentity: 'Identité, Langue & Thème',
  adminTabFeatures: 'Fonctionnalités',
  adminTabPricing: 'Tarifs, E-Paiements & Plaintes',
  adminDefaultLangLabel: 'Langue par défaut de l’application',
  adminDefaultThemeLabel: 'Thème par défaut',
  adminSaveIdentity: 'Enregistrer l’identité',
  adminSaveFeatures: 'Enregistrer les fonctionnalités',
  adminSavePricing: 'Enregistrer tarifs & paiements',
  adminPricingTitle: 'Tarification de l’application',
  adminFreeMode: 'Gratuit',
  adminPaidMode: 'Abonnement Payant',
  adminPaymentMethodsTitle: 'Comptes de réception (Algérie & International)',
  adminAutoApproveLabel: 'Activation automatique après paiement par carte',
  adminAutoApproveDesc:
    'Active automatiquement le salon lors d’un paiement valide par carte (Edahabia, CIB, Visa, Mastercard...).',
  adminIncomingPaymentsTitle: 'Paiements électroniques reçus',
  adminNoPayments: 'Aucun paiement reçu.',
  adminApprovePayment: 'Valider et Activer',
  adminRejectPayment: 'Refuser',
  adminShopsManageTitle: 'Gestion des abonnements salons',
  adminComplaintsTitle: 'Suivi global des plaintes',

  statusWaiting: 'En attente',
  statusCalled: 'Appelé',
  statusInChair: 'Au fauteuil',
  statusCompleted: 'Terminé',
  statusCancelled: 'Annulé',
  svcHaircut: 'Coupe de cheveux',
  svcProtein: 'Soin Protéine',
  svcBlowdry: 'Brushing / Séchage',
  svcAll: 'Pack Complet',
  cycleMonthly: 'Mensuel',
  cycleYearly: 'Annuel',
  cyclePerBooking: 'Par réservation',
  subActive: 'Actif',
  subPending: 'En attente',
  subSuspended: 'Suspendu',
  cmpOpen: 'Nouvelle',
  cmpReviewed: 'Consultée',
  cmpResolved: 'Résolue',
  downloadAppBtn: 'Télécharger l’app',
  downloadModalTitle: 'Télécharger l’application',
  downloadModalSubtitle: 'Choisissez votre appareil pour installer sur Android, iOS ou Ordinateur :',
  downloadAndroidTitle: 'Android',
  downloadAndroidDesc: 'Installation directe sur smartphones et tablettes Android',
  downloadIosTitle: 'iPhone & iPad (iOS)',
  downloadIosDesc: 'Ajouter à l’écran d’accueil via Safari',
  downloadDesktopTitle: 'Ordinateur (Windows / Mac / Linux)',
  downloadDesktopDesc: 'Installer comme application de bureau indépendante',
  downloadInstallNowBtn: 'Installer l’application maintenant',
  downloadOpenDirectBtn: 'Ouvrir le lien de téléchargement',
  downloadCopyLinkBtn: 'Copier le lien',
  downloadAlreadyInstalled: 'L’application est déjà installée sur cet appareil !',
  downloadIosStep1: '1. Ouvrez ce lien dans Safari sur votre iPhone ou iPad.',
  downloadIosStep2: '2. Appuyez sur le bouton Partager dans la barre Safari.',
  downloadIosStep3: '3. Appuyez sur « Sur l’écran d’accueil » puis Ajouter.',
  downloadAndroidStep1: '1. Appuyez sur le menu (⋮) en haut de Chrome.',
  downloadAndroidStep2: '2. Sélectionnez « Installer l’application ».',
  downloadDesktopStep1: '1. Cliquez sur l’icône d’installation dans la barre d’adresse Chrome/Edge.',
  downloadDesktopStep2: '2. Ou ouvrez le menu du navigateur et cliquez sur « Installer l’application ».',
  downloadOfflineBadge: 'Hors ligne — Données en cache actives',
  closeBtn: 'Fermer',
  downloadWebTitle: 'Sites Web & Navigateur',
  downloadWebDesc: 'Utiliser sur tout navigateur web ou intégrer dans n’importe quel site web',
  downloadWebOpenBtn: 'Ouvrir dans un nouvel onglet',
  downloadEmbedCodeLabel: 'Code d’intégration HTML pour votre site (WordPress / Wix / Shopify) :',
  downloadCopyEmbedBtn: 'Copier le code HTML',
  downloadWebStep1: '1. Fonctionne sur tous les navigateurs web (Chrome, Safari, Firefox, Edge) sans installation.',
  downloadWebStep2: '2. Collez le code ci-dessous sur n’importe quelle page web pour permettre la réservation directe.',
  barberEmbedBtn: 'Intégrer au site web',
  barberEmbedTitle: 'Utiliser et intégrer ce salon sur un site web',
  barberEmbedSubtitle: 'Partagez le lien direct de votre salon ou intégrez la file en direct sur votre site :',
  barberDirectLinkLabel: 'Lien web direct du salon :',
  barberWidgetLinkLabel: 'URL du widget intégré :',
  custShowAllShops: 'Afficher tous les salons',
  custDirectShopFilterNote: 'Affichage du salon lié depuis cette page web',
};
