// The selector uses learner-friendly topic names while older question records
// retain the historical topic labels. Expand those names at query time so a
// selected topic never leads to an empty quiz.
//
// This table lives in its own module (imported and re-exported by `data.js`) so
// Node-side scripts can validate topic resolution without pulling in the JSON
// catalogues that only the bundler resolves.
export const DB_TOPIC_ALIASES = {
  'বিশ্ব সভ্যতা': ['বিশ্ব সভ্যতা', 'প্রাচীন সভ্যতা', 'বিশ্ব ইতিহাস', 'ইতিহাস'],
  'Tense & Subject-Verb Agreement': ['Tense', 'Subject-Verb Agreement'],
  'Right Form of Verb': ['Right Form of Verb', 'Verb and Right form of verb'],
  'Voice': ['Voice Change', 'Voice, Narration and One Word'],
  'Parts of Speech': ['Parts of Speech', 'Noun identification / Parts of Speech'],
  'শব্দ এবং শব্দের প্রকারভেদ': ['শব্দ গঠন / শব্দার্থ', 'শব্দতত্ত্ব', 'শব্দ'],
  'কারক বিভক্তি': ['কারক ও বিভক্তি', 'কারক'],
  'বাক্য শুদ্ধি / ভাষার প্রয়োগ অপপ্রয়োগ': ['বাক্য শুদ্ধিকরণ', 'ভাষার প্রয়োগ অপপ্রয়োগ', 'অপপ্রয়োগ'],
  'গড় ও বয়স': ['গড়', 'বয়স ভিত্তিক'],
  'গতি ও দূরত্ব': ['গতিবেগ', 'Speed, Distance & Time', 'Boat & Stream'],
  'অনুপাত ও মিশ্রণ': ['অনুপাত ও সমানুপাত', 'মিশ্রণ', 'Ratio and Proportion', 'Ratio & Proportion'],
  'শতকরা': ['শতকরা', 'Percentage'],
  // The 1969 uprising reaches the routine in four spellings: the picker name
  // below, a variant with থ্‌য swapped, one that keeps the য় (উ + ত্থান) and a
  // hyphenated form. NFC cannot bridge them because the consonant order itself
  // differs, so every spelling is listed explicitly.
  '৬৯ এর গণঅভ্যুথ্যান': ['৬৯ এর গণঅভ্যথ্যান', '৬৯-এর গণঅভ্যুত্থান', '৬৯ এর গণঅভ্যুত্থান'],
  'স্নায়ু যুদ্ধ': ['স্নায়ুযুদ্ধ'],
  'যুক্তরাষ্ট্র-কিউবা সম্পর্ক ও ক্ষেপণাস্ত্র সংকট': ['যুক্তরাষ্ট্র–কিউবা সম্পর্ক ও ক্ষেপণাস্ত্র সংকট']
}
