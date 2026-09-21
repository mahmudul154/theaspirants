/* ============================================================
   চলমান সরকারি নিয়োগ বিজ্ঞপ্তি — বাংলাদেশ
   ------------------------------------------------------------
   Every timestamp is stored as an ISO-8601 instant pinned to
   Bangladesh time (+06:00) so the countdown is identical on a
   phone in Dhaka and a laptop anywhere else.

   ⚠ This list is a hand-maintained snapshot. Deadlines pass, so
   `circularStatus()` must always be computed at render time —
   never trust a stored status. Update CIRCULAR_DATA_UPDATED and
   the entries below whenever new circulars are verified.

   Sources are third-party job portals that mirror the official
   notices; `circularUrl` points at the notice that was read, and
   the UI tells users to confirm dates on the official site before
   applying. When a deadline was ambiguous in the source (e.g.
   "রাত ১২টা"), the EARLIER reading is stored so nobody misses it.
   ============================================================ */

// Date this snapshot was verified. Shown in the UI so staleness is visible.
export const CIRCULAR_DATA_UPDATED = '2026-09-21'

// Fallback when a circular's own Teletalk subdomain was not confirmed.
export const TELETALK_MAIN_PORTAL = 'https://jobs.teletalk.com.bd/'

export const JOB_CIRCULARS = [
  {
    id: 'dte-workshop-assistant',
    org: 'কারিগরি শিক্ষা অধিদপ্তর',
    orgShort: 'DTE',
    category: 'অধিদপ্তর',
    icon: 'school',
    vacancy: 5,
    posts: 'ওয়ার্কশপ অ্যাসিস্ট্যান্ট',
    summary: '০৫ পদে ওয়ার্কশপ অ্যাসিস্ট্যান্ট নিয়োগ, টেলিটক চার্জসহ ফি ৫৬ টাকা।',
    applyStart: '2026-09-01T10:00:00+06:00',
    applyDeadline: '2026-09-21T16:00:00+06:00',
    applyUrl: 'https://dter.teletalk.com.bd/',
    circularUrl: 'https://bdgovtjob.net/directorate-of-technical-education-dte-job-circular/',
    fee: '৫৬ টাকা (টেলিটক চার্জসহ)',
    ageLimit: 'বিজ্ঞপ্তি অনুযায়ী',
    qualification: 'সংশ্লিষ্ট ট্রেডে কারিগরি যোগ্যতা',
    highlights: [
      { label: 'পদ সংখ্যা', value: '০৫টি' },
      { label: 'আবেদন শুরু', value: '০১ সেপ্টেম্বর ২০২৬, সকাল ১০:০০টা' },
      { label: 'আবেদন শেষ', value: '২১ সেপ্টেম্বর ২০২৬, বিকাল ৪:০০টা' },
      { label: 'আবেদন ফি', value: '৫৬ টাকা (টেলিটক চার্জসহ)' }
    ]
  },
  {
    id: 'bangladesh-bank',
    org: 'বাংলাদেশ ব্যাংক',
    orgShort: 'BB',
    category: 'ব্যাংক',
    icon: 'bank',
    vacancy: 233,
    posts: '২১টি ক্যাটাগরির পদ',
    summary: '২৩৩ পদে নিয়োগ; পদভেদে আবেদনের শেষ সময় ২৭ সেপ্টেম্বর থেকে ১৮ অক্টোবর পর্যন্ত।',
    applyStart: '2026-08-17T00:00:00+06:00',
    // Earliest still-open post deadline is stored so no applicant misses a
    // category; the per-post deadlines are listed in `highlights`.
    applyDeadline: '2026-09-27T23:59:00+06:00',
    applyUrl: 'https://erecruitment.bb.org.bd/',
    circularUrl: 'https://bdgovtjob.net/bangladesh-bank-job-circular/',
    fee: 'পদভেদে ভিন্ন',
    ageLimit: 'পদভেদে ভিন্ন',
    qualification: 'স্নাতক / স্নাতকোত্তর (পদভেদে)',
    note: 'এই নিয়োগের আবেদন টেলিটকে নয়, বাংলাদেশ ব্যাংকের নিজস্ব ই-রিক্রুটমেন্ট পোর্টালে হয়। পদভেদে শেষ সময় ভিন্ন — বিজ্ঞপ্তিতে মিলিয়ে নিন।',
    highlights: [
      { label: 'মোট পদ', value: '২৩৩টি (২১ ক্যাটাগরি)' },
      { label: 'বিজ্ঞপ্তি প্রকাশ', value: '১৭ ও ১৯ আগস্ট, ২০ আগস্ট, ১৩ ও ১৬ সেপ্টেম্বর ২০২৬' },
      { label: 'পদভেদে শেষ সময়', value: '২৭ সেপ্টেম্বর, ১১ অক্টোবর ও ১৮ অক্টোবর ২০২৬, রাত ১১:৫৯' },
      { label: 'আবেদন পোর্টাল', value: 'erecruitment.bb.org.bd' }
    ]
  },
  {
    id: 'dc-bogura',
    org: 'জেলা প্রশাসকের কার্যালয়, বগুড়া',
    orgShort: 'বগুড়া',
    category: 'জেলা প্রশাসক',
    icon: 'building',
    vacancy: null,
    posts: 'বিভিন্ন পদ',
    summary: 'বগুড়া জেলা প্রশাসকের কার্যালয়ে অনলাইনে আবেদন চলছে।',
    applyStart: '2026-09-01T10:00:00+06:00',
    applyDeadline: '2026-09-28T16:00:00+06:00',
    applyUrl: 'https://dcbogura.teletalk.com.bd/',
    circularUrl: 'https://bdgovtjob.net/dc-office-job-circular/',
    fee: 'পদভেদে ৫৬/১১২ টাকা',
    ageLimit: 'সাধারণত ১৮–৩২ বছর',
    qualification: 'পদভেদে এসএসসি থেকে স্নাতক',
    highlights: [
      { label: 'আবেদন শেষ', value: '২৮ সেপ্টেম্বর ২০২৬, বিকাল ৪:০০টা' },
      { label: 'আবেদন পদ্ধতি', value: 'অনলাইন (টেলিটক)' },
      { label: 'পোর্টাল', value: 'dcbogura.teletalk.com.bd' }
    ]
  },
  {
    id: 'bfidc',
    org: 'বাংলাদেশ বনশিল্প উন্নয়ন কর্পোরেশন',
    orgShort: 'BFIDC',
    category: 'কর্পোরেশন',
    icon: 'layers',
    vacancy: 112,
    posts: '১১২ পদ',
    summary: '১১২ পদে নিয়োগ; এইচএসসি, স্নাতক বা স্নাতকোত্তর পাস প্রার্থীরা আবেদন করতে পারবেন।',
    applyStart: '2026-09-09T10:00:00+06:00',
    applyDeadline: '2026-09-29T16:00:00+06:00',
    applyUrl: 'https://bfidc.teletalk.com.bd/',
    circularUrl: 'https://bdgovt.info/bfidc-job-circular/',
    fee: 'পদভেদে ৫৬/১১২ টাকা',
    ageLimit: 'বিজ্ঞপ্তি অনুযায়ী',
    qualification: 'এইচএসসি / স্নাতক / স্নাতকোত্তর',
    highlights: [
      { label: 'মোট পদ', value: '১১২টি' },
      { label: 'বিজ্ঞপ্তি প্রকাশ', value: '০৩ সেপ্টেম্বর ২০২৬' },
      { label: 'আবেদন শুরু', value: '০৯ সেপ্টেম্বর ২০২৬, সকাল ১০:০০টা' },
      { label: 'আবেদন শেষ', value: '২৯ সেপ্টেম্বর ২০২৬, বিকাল ৪:০০টা' },
      { label: 'কর্মস্থল', value: 'সদর দপ্তর, ঢাকা' }
    ]
  },
  {
    id: 'dc-habiganj',
    org: 'জেলা প্রশাসকের কার্যালয়, হবিগঞ্জ',
    orgShort: 'হবিগঞ্জ',
    category: 'জেলা প্রশাসক',
    icon: 'building',
    vacancy: null,
    posts: 'বিভিন্ন পদ',
    summary: 'হবিগঞ্জ জেলা প্রশাসকের কার্যালয়ে অনলাইনে আবেদন চলছে।',
    applyStart: '2026-09-01T10:00:00+06:00',
    applyDeadline: '2026-09-30T16:00:00+06:00',
    // Exact subdomain was not confirmed in the source notice — send the user
    // to the main Teletalk portal rather than a guessed URL.
    applyUrl: TELETALK_MAIN_PORTAL,
    circularUrl: 'https://bdgovtjob.net/dc-office-job-circular/',
    fee: 'পদভেদে ৫৬/১১২ টাকা',
    ageLimit: 'সাধারণত ১৮–৩২ বছর',
    qualification: 'পদভেদে এসএসসি থেকে স্নাতক',
    note: 'সঠিক আবেদন পোর্টালটি বিজ্ঞপ্তিতে যাচাই করে নিন — টেলিটকের মূল পোর্টাল থেকেও সব নিয়োগ খোঁজা যায়।',
    highlights: [
      { label: 'আবেদন শুরু', value: '০১ সেপ্টেম্বর ২০২৬, সকাল ১০:০০টা' },
      { label: 'আবেদন শেষ', value: '৩০ সেপ্টেম্বর ২০২৬, বিকাল ৪:০০টা' },
      { label: 'আবেদন পদ্ধতি', value: 'অনলাইন (টেলিটক)' }
    ]
  },
  {
    id: 'dc-brahmanbaria',
    org: 'জেলা প্রশাসকের কার্যালয়, ব্রাহ্মণবাড়িয়া',
    orgShort: 'ব্রাহ্মণবাড়িয়া',
    category: 'জেলা প্রশাসক',
    icon: 'building',
    vacancy: null,
    posts: 'বিভিন্ন পদ',
    summary: 'ব্রাহ্মণবাড়িয়া জেলা প্রশাসকের কার্যালয়ে অনলাইনে আবেদন চলছে।',
    applyStart: '2026-09-01T10:00:00+06:00',
    applyDeadline: '2026-09-30T17:00:00+06:00',
    applyUrl: 'https://dcbb.teletalk.com.bd/',
    circularUrl: 'https://bdgovtjob.net/dc-office-job-circular/',
    fee: 'পদভেদে ৫৬/১১২ টাকা',
    ageLimit: 'সাধারণত ১৮–৩২ বছর',
    qualification: 'পদভেদে এসএসসি থেকে স্নাতক',
    highlights: [
      { label: 'আবেদন শেষ', value: '৩০ সেপ্টেম্বর ২০২৬, বিকাল ৫:০০টা' },
      { label: 'আবেদন পদ্ধতি', value: 'অনলাইন (টেলিটক)' },
      { label: 'পোর্টাল', value: 'dcbb.teletalk.com.bd' }
    ]
  },
  {
    id: 'teletalk-bangladesh-ltd',
    org: 'টেলিটক বাংলাদেশ লিমিটেড',
    orgShort: 'TBL',
    category: 'সরকারি প্রতিষ্ঠান',
    icon: 'news',
    vacancy: null,
    posts: 'অতিরিক্ত মহাব্যবস্থাপক, সহকারী ব্যবস্থাপক',
    summary: 'সর্বোচ্চ বেতন স্কেল ৯৬,২৫০–১,৩৭,০৫০ টাকা; আবেদন ফি ২০০ টাকা।',
    applyStart: '2026-09-15T10:00:00+06:00',
    applyDeadline: '2026-10-01T17:00:00+06:00',
    applyUrl: TELETALK_MAIN_PORTAL,
    circularUrl: 'https://www.govtjobscircular.net/teletalk-bangladesh-limited-tbl-gov-bd-job-circular-2026/',
    fee: '২০০ টাকা (সার্ভিস চার্জসহ ২০৬ টাকা)',
    ageLimit: 'পদভেদে সর্বোচ্চ ৩২/৪৮/৫০ বছর',
    qualification: 'সংশ্লিষ্ট বিষয়ে স্নাতকোত্তর; অতিরিক্ত মহাব্যবস্থাপক পদে ১২ বছরের অভিজ্ঞতা',
    highlights: [
      { label: 'আবেদন শুরু', value: '১৫ সেপ্টেম্বর ২০২৬, সকাল ১০:০০টা' },
      { label: 'আবেদন শেষ', value: '০১ অক্টোবর ২০২৬, বিকাল ৫:০০টা' },
      { label: 'আবেদন ফি', value: '২০০ টাকা, সার্ভিস চার্জসহ ২০৬ টাকা' },
      { label: 'বেতন স্কেল', value: 'সর্বোচ্চ ৯৬,২৫০–১,৩৭,০৫০ টাকা' },
      { label: 'ফি পরিশোধ', value: 'টেলিটক প্রি-পেইড থেকে 16222 নম্বরে SMS — User ID পাওয়ার ৭২ ঘণ্টার মধ্যে' }
    ]
  },
  {
    id: 'dls',
    org: 'প্রাণিসম্পদ অধিদপ্তর',
    orgShort: 'DLS',
    category: 'অধিদপ্তর',
    icon: 'layers',
    vacancy: 538,
    posts: 'সিমেন ক্যারিয়ার ও অফিস সহায়ক',
    summary: '৫৩৮ পদে বিশাল নিয়োগ — ৩২ সিমেন ক্যারিয়ার ও ৫০৬ অফিস সহায়ক, যোগ্যতা এসএসসি বা সমমান।',
    applyStart: '2026-09-15T10:00:00+06:00',
    // Source printed "৬ অক্টোবর রাত ১২টা", which is ambiguous between the
    // start and end of that day. The earlier instant is stored on purpose.
    applyDeadline: '2026-10-06T00:00:00+06:00',
    applyUrl: 'https://dls.teletalk.com.bd/',
    circularUrl: 'https://teletalkjob.com/dls-job-circular-2026/',
    fee: '৫৬ টাকা (সার্ভিস চার্জসহ)',
    ageLimit: '০১ সেপ্টেম্বর ২০২৬ তারিখে ১৮–৩২ বছর',
    qualification: 'এসএসসি বা সমমান',
    note: 'উৎসে শেষ সময় "৬ অক্টোবর রাত ১২টা" লেখা ছিল, যা অস্পষ্ট। তাই আগের মুহূর্তটি ধরা হয়েছে — আবেদনের আগে অফিসিয়াল বিজ্ঞপ্তিতে সময় মিলিয়ে নিন।',
    highlights: [
      { label: 'মোট পদ', value: '৫৩৮টি (৩২ সিমেন ক্যারিয়ার + ৫০৬ অফিস সহায়ক)' },
      { label: 'আবেদন শুরু', value: '১৫ সেপ্টেম্বর ২০২৬, সকাল ১০:০০টা' },
      { label: 'আবেদন শেষ', value: '০৬ অক্টোবর ২০২৬, রাত ১২:০০টা (যাচাই করুন)' },
      { label: 'আবেদন ফি', value: '৫৬ টাকা — সাবমিটের ৭২ ঘণ্টার মধ্যে টেলিটক প্রি-পেইড থেকে' },
      { label: 'বয়সসীমা', value: '০১ সেপ্টেম্বর ২০২৬ তারিখে ১৮–৩২ বছর; এফিডেভিট গ্রহণযোগ্য নয়' }
    ]
  },
  {
    id: 'dc-khagrachhari',
    org: 'জেলা প্রশাসকের কার্যালয়, খাগড়াছড়ি',
    orgShort: 'খাগড়াছড়ি',
    category: 'জেলা প্রশাসক',
    icon: 'building',
    vacancy: null,
    posts: 'বিভিন্ন পদ',
    summary: 'খাগড়াছড়ি জেলা প্রশাসকের কার্যালয়ে অনলাইনে আবেদন চলছে।',
    applyStart: '2026-09-01T10:00:00+06:00',
    applyDeadline: '2026-10-07T16:00:00+06:00',
    applyUrl: 'https://dckc.teletalk.com.bd/',
    circularUrl: 'https://bdgovtjob.net/dc-office-job-circular/',
    fee: 'পদভেদে ৫৬/১১২ টাকা',
    ageLimit: 'সাধারণত ১৮–৩২ বছর',
    qualification: 'পদভেদে এসএসসি থেকে স্নাতক',
    highlights: [
      { label: 'আবেদন শেষ', value: '০৭ অক্টোবর ২০২৬, বিকাল ৪:০০টা' },
      { label: 'আবেদন পদ্ধতি', value: 'অনলাইন (টেলিটক)' },
      { label: 'পোর্টাল', value: 'dckc.teletalk.com.bd' }
    ]
  },
  {
    id: 'mod-dcd',
    org: 'প্রতিরক্ষা মন্ত্রণালয়',
    orgShort: 'MOD',
    category: 'মন্ত্রণালয়',
    icon: 'exam',
    vacancy: 8,
    posts: '০৮ পদ',
    summary: '০৮ পদে নিয়োগ; বয়সসীমা ১৮–৩২ বছর, আবেদন টেলিটক পোর্টালে।',
    applyStart: '2026-09-13T10:00:00+06:00',
    applyDeadline: '2026-10-08T17:00:00+06:00',
    applyUrl: 'https://dcd.teletalk.com.bd/',
    circularUrl: 'https://bdgovtjob.net/mod-job-circular/',
    fee: 'পদভেদে ৫৬/১১২ টাকা',
    ageLimit: '০৮ অক্টোবর ২০২৬ তারিখে ১৮–৩২ বছর (মুক্তিযোদ্ধা ও প্রতিবন্ধী প্রার্থীদের জন্য সরকারি বিধি প্রযোজ্য)',
    qualification: 'পদভেদে স্নাতক / স্নাতকোত্তর',
    highlights: [
      { label: 'মোট পদ', value: '০৮টি' },
      { label: 'আবেদন শুরু', value: '১৩ সেপ্টেম্বর ২০২৬, সকাল ১০:০০টা' },
      { label: 'আবেদন শেষ', value: '০৮ অক্টোবর ২০২৬, বিকাল ৫:০০টা' },
      { label: 'বয়সসীমা', value: '০৮ অক্টোবর ২০২৬ তারিখে ১৮–৩২ বছর' },
      { label: 'অফিসিয়াল সাইট', value: 'www.mod.gov.bd / www.dcd.gov.bd' }
    ]
  },
  {
    id: 'dc-naogaon',
    org: 'জেলা প্রশাসকের কার্যালয়, নওগাঁ',
    orgShort: 'নওগাঁ',
    category: 'জেলা প্রশাসক',
    icon: 'building',
    vacancy: null,
    posts: 'বিভিন্ন পদ',
    summary: 'নওগাঁ জেলা প্রশাসকের কার্যালয়ে অনলাইনে আবেদন চলছে।',
    applyStart: '2026-09-01T10:00:00+06:00',
    applyDeadline: '2026-10-11T16:00:00+06:00',
    applyUrl: 'https://dcnaogaon.teletalk.com.bd/',
    circularUrl: 'https://bdgovtjob.net/dc-office-job-circular/',
    fee: 'পদভেদে ৫৬/১১২ টাকা',
    ageLimit: 'সাধারণত ১৮–৩২ বছর',
    qualification: 'পদভেদে এসএসসি থেকে স্নাতক',
    highlights: [
      { label: 'আবেদন শেষ', value: '১১ অক্টোবর ২০২৬, বিকাল ৪:০০টা' },
      { label: 'আবেদন পদ্ধতি', value: 'অনলাইন (টেলিটক)' },
      { label: 'পোর্টাল', value: 'dcnaogaon.teletalk.com.bd' }
    ]
  },
  {
    id: 'dc-magura',
    org: 'জেলা প্রশাসকের কার্যালয়, মাগুরা',
    orgShort: 'মাগুরা',
    category: 'জেলা প্রশাসক',
    icon: 'building',
    vacancy: null,
    posts: 'বিভিন্ন পদ',
    summary: 'মাগুরা জেলা প্রশাসকের কার্যালয়ে অনলাইনে আবেদন চলছে।',
    applyStart: '2026-09-15T10:00:00+06:00',
    applyDeadline: '2026-10-14T17:00:00+06:00',
    applyUrl: TELETALK_MAIN_PORTAL,
    circularUrl: 'https://bdgovtjob.net/dc-office-job-circular/',
    fee: 'পদভেদে ৫৬/১১২ টাকা',
    ageLimit: 'সাধারণত ১৮–৩২ বছর',
    qualification: 'পদভেদে এসএসসি থেকে স্নাতক',
    note: 'সঠিক আবেদন পোর্টালটি বিজ্ঞপ্তিতে যাচাই করে নিন।',
    highlights: [
      { label: 'আবেদন শুরু', value: '১৫ সেপ্টেম্বর ২০২৬, সকাল ১০:০০টা' },
      { label: 'আবেদন শেষ', value: '১৪ অক্টোবর ২০২৬, বিকাল ৫:০০টা' },
      { label: 'আবেদন পদ্ধতি', value: 'অনলাইন (টেলিটক)' }
    ]
  },
  {
    id: 'police-masp-madaripur',
    org: 'পুলিশ সুপারের কার্যালয়, মাদারীপুর',
    orgShort: 'পুলিশ',
    category: 'পুলিশ',
    icon: 'lock',
    vacancy: null,
    posts: 'বিভিন্ন পদ',
    summary: 'বাংলাদেশ পুলিশের মাদারীপুর ইউনিটে অনলাইনে আবেদন চলছে।',
    applyStart: '2026-09-15T10:00:00+06:00',
    applyDeadline: '2026-10-14T23:59:00+06:00',
    applyUrl: 'https://policemasp.teletalk.com.bd/',
    circularUrl: 'https://bdgovtjob.net/bangladesh-police-job-circular/',
    fee: 'পদভেদে ভিন্ন',
    ageLimit: 'বিজ্ঞপ্তি অনুযায়ী',
    qualification: 'পদভেদে নির্ধারিত',
    highlights: [
      { label: 'বিজ্ঞপ্তির সোর্স', value: 'দৈনিক দিনকাল, ০৪ সেপ্টেম্বর ২০২৬' },
      { label: 'আবেদন শুরু', value: '১৫ সেপ্টেম্বর ২০২৬, সকাল ১০:০০টা' },
      { label: 'আবেদন শেষ', value: '১৪ অক্টোবর ২০২৬, রাত ১১:৫৯' },
      { label: 'পোর্টাল', value: 'policemasp.teletalk.com.bd' }
    ]
  },
  {
    id: 'dc-khulna',
    org: 'জেলা প্রশাসকের কার্যালয়, খুলনা',
    orgShort: 'খুলনা',
    category: 'জেলা প্রশাসক',
    icon: 'building',
    vacancy: null,
    posts: 'বিভিন্ন পদ',
    summary: 'খুলনা জেলা প্রশাসকের কার্যালয়ে আবেদন ২২ সেপ্টেম্বর থেকে শুরু।',
    applyStart: '2026-09-22T10:00:00+06:00',
    applyDeadline: '2026-10-15T17:00:00+06:00',
    applyUrl: TELETALK_MAIN_PORTAL,
    circularUrl: 'https://bdgovtjob.net/dc-office-job-circular/',
    fee: 'পদভেদে ৫৬/১১২ টাকা',
    ageLimit: 'সাধারণত ১৮–৩২ বছর',
    qualification: 'পদভেদে এসএসসি থেকে স্নাতক',
    note: 'সঠিক আবেদন পোর্টালটি বিজ্ঞপ্তিতে যাচাই করে নিন।',
    highlights: [
      { label: 'আবেদন শুরু', value: '২২ সেপ্টেম্বর ২০২৬, সকাল ১০:০০টা' },
      { label: 'আবেদন শেষ', value: '১৫ অক্টোবর ২০২৬, বিকাল ৫:০০টা' },
      { label: 'আবেদন পদ্ধতি', value: 'অনলাইন (টেলিটক)' }
    ]
  }
]

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

const bnDigits = value => String(value).replace(/\d/g, digit => '০১২৩৪৫৬৭৮৯'[digit])
const padBn = value => bnDigits(String(value).padStart(2, '0'))

/**
 * Live status of a circular. Always computed from the current instant —
 * a stored status would go stale the moment a deadline passed.
 * @returns {'upcoming'|'open'|'closed'}
 */
export function circularStatus(circular, now = Date.now()) {
  const start = Date.parse(circular.applyStart)
  const deadline = Date.parse(circular.applyDeadline)
  if (!Number.isNaN(start) && now < start) return 'upcoming'
  if (!Number.isNaN(deadline) && now >= deadline) return 'closed'
  return 'open'
}

/** How close an open circular is to its deadline, for badge styling. */
export function circularUrgency(circular, now = Date.now()) {
  if (circularStatus(circular, now) !== 'open') return null
  const remaining = Date.parse(circular.applyDeadline) - now
  if (remaining <= DAY_MS) return 'today'
  if (remaining <= 3 * DAY_MS) return 'urgent'
  if (remaining <= 7 * DAY_MS) return 'soon'
  return 'normal'
}

/**
 * "৯ দিন ০৪:২১:০৭" style countdown, clamped at zero so a passed deadline
 * never renders a negative number.
 */
export function formatCircularCountdown(target, now = Date.now()) {
  const remaining = Math.max(0, Date.parse(target) - now)
  const days = Math.floor(remaining / DAY_MS)
  const hours = Math.floor((remaining % DAY_MS) / HOUR_MS)
  const minutes = Math.floor((remaining % HOUR_MS) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return `${days ? `${bnDigits(days)} দিন ` : ''}${padBn(hours)}:${padBn(minutes)}:${padBn(seconds)}`
}

/** Whole days left to apply — what the card headline shows. */
export function circularDaysLeft(circular, now = Date.now()) {
  const remaining = Math.max(0, Date.parse(circular.applyDeadline) - now)
  return Math.ceil(remaining / DAY_MS)
}

export function formatCircularDate(isoTimestamp) {
  return new Intl.DateTimeFormat('bn-BD', {
    timeZone: 'Asia/Dhaka', day: 'numeric', month: 'short', year: 'numeric'
  }).format(new Date(isoTimestamp))
}

export function formatCircularTime(isoTimestamp) {
  return new Intl.DateTimeFormat('bn-BD', {
    timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit', hour12: true
  }).format(new Date(isoTimestamp))
}

export function formatCircularDateTime(isoTimestamp) {
  return `${formatCircularDate(isoTimestamp)}, ${formatCircularTime(isoTimestamp)}`
}

export const CIRCULAR_STATUS_LABEL = {
  upcoming: 'আবেদন শুরু হয়নি',
  open: 'আবেদন চলছে',
  closed: 'আবেদন শেষ'
}

/**
 * Order that keeps the most actionable circular first: open ones by nearest
 * deadline, then upcoming by start, then closed (newest deadline first).
 */
export function sortJobCirculars(circulars, now = Date.now()) {
  const rank = { open: 0, upcoming: 1, closed: 2 }
  return [...circulars].sort((first, second) => {
    const firstStatus = circularStatus(first, now)
    const secondStatus = circularStatus(second, now)
    if (rank[firstStatus] !== rank[secondStatus]) return rank[firstStatus] - rank[secondStatus]
    if (firstStatus === 'upcoming') return Date.parse(first.applyStart) - Date.parse(second.applyStart)
    return Date.parse(first.applyDeadline) - Date.parse(second.applyDeadline)
  })
}

export function filterJobCirculars(circulars, statusFilter, now = Date.now()) {
  if (statusFilter === 'all') return sortJobCirculars(circulars, now)
  return sortJobCirculars(circulars.filter(item => circularStatus(item, now) === statusFilter), now)
}

/** Counts for the filter pills. */
export function jobCircularCounts(circulars, now = Date.now()) {
  const counts = { all: circulars.length, open: 0, upcoming: 0, closed: 0 }
  for (const circular of circulars) counts[circularStatus(circular, now)]++
  return counts
}
