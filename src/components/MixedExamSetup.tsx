import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; 

interface MixedExamSetupProps {
  setCurrentPage: (page: string) => void;
  setSelectedExam: (examData: any) => void;
}

export function MixedExamSetup({ setCurrentPage, setSelectedExam }: MixedExamSetupProps) {
  const [step, setStep] = useState(1); 
  const [tempCategory, setTempCategory] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  
  const [qCount, setQCount] = useState(25);
  const [examTime, setExamTime] = useState(20);

  useEffect(() => {
    if (step === 3) {
      // টপিক ম্যাপিং: HSC এবং অন্যান্য ক্যাটাগরির জন্য
      const topicMap: { [key: string]: string[] } = {
        // HSC Specific Topics
       //power topic
       "Microcontroller":["Arduino Basics","Digital read","Digital write","Arduino+port language","Timers/Counters","Interrupts"],
        
        // General/Job Topics
        "English": ["BCS-50(English)","Proverb","Idioms & Phrases","Spelling","Voice,Narration and One Word"], 
        "Bangla": ["উপসর্গ প্রত্যয়", "ণত্ব ও ষত্ব বিধান", "পদাশ্রিত নির্দেশক", "বচন", "বাচ্য", "ক্রিয়ার কাল", "বিরামচিহ্ন", "সন্ধি", "ধ্বনি ও বর্ণ", "ধ্বনির পরিবর্তন", "বর্ণ", "বাক্য", "উক্তি", "সমোচ্চারিত ও ভিন্নার্থক শব্দ", "পুরুষ ও স্ত্রীবাচক শব্দ", "কারক", "দ্বিরুক্তি শব্দ/শব্দদ্বিত্ব", "শব্দ", "সংখ্যাবাচক শব্দ", "ধাতু", "পুরুষ", "ভাষার ইতিহাস ও ব্যাকরণ", "ভাষা ও ব্যাকরণ", "ভাষার প্রয়োগ অপপ্রয়োগ", "তৎপুরুষ সমাস", "কর্মধারয় সমাস", "দ্বিগু সমাস", "বহুব্রীহি সমাস", "আধুনিক যুগ", "বাগধারা ও প্রবাদ প্রবচন", "বাংলা নাটক", "এক কথায় প্রকাশ", "রবীন্দ্রনাথ ঠাকুর", "সমসাময়িক বাংলাদেশের সাহিত্য", "মাধ্যমিক সাহিত্য", "কাজী নজরুল ইসলাম", "মীর মশাররফ হোসেন", "শরৎচন্দ্র চট্টোপাধ্যায়", "দীনবন্ধু মিত্র", "ফররুখ আহমদ", "ঈশ্বরচন্দ্র বিদ্যাসাগর", "বাংলা সাহিত্যের অভিধা ও মতবাদ", "ছন্দ প্রকরণ", "উচ্চমাধ্যমিক সাহিত্য", "প্রকৃতি ও প্রত্যয়", "ফোর্ট উইলিয়াম কলেজ", "বাংলা সাহিত্য ও বিভিন্ন সংগঠন", "বিদেশি সাহিত্য ও অনুবাদ", "কায়কোবাদ", "বিপরীত শব্দ", "বিখ্যাত শিশুতোষগ্রন্থ", "প্রশাসনিক", "প্রাচীন ও মধ্যযুগ", "পত্র-পত্রিকা", "বিখ্যাত আত্মজীবনী", "বাংলা গান","মুক্তিযুদ্ধ ভিত্তিক সাহিত্য", "প্রাচীন যুগ (চর্যাপদ)","বঙ্কিমচন্দ্র চট্টোপাধ্যায়", "বিখ্যাত উক্তি", "জসীমউদ্দীন", "বেগম রোকেয়া", "বৈষ্ণব পদাবলি", "মঙ্গল কাব্য", "বাগধারা", "শ্রীচৈতন্যদেব ও জীবনী সাহিত্য", "মাইকেল মধুসূদন দত্ত", "মধ্যযুগ", "শ্রীকৃষ্ণকীর্তন", "রাজা রামমোহন রায়", "ভাষা আন্দোলন ও বাংলা সাহিত্য", "বিখ্যাত ভ্রমণ কাহিনী", "বাংলা ভাষা ও লিপি", "ডাক ও খনার বচন","সাহিত্যিকদের ছদ্মনাম ও উপাধি", "বেগম রোকেয়া সাখাওয়াত হোসেন", "পত্রিকা"],   
"বাংলাদেশ বিষয়াবলী": [
  // ১. বাংলাদেশের জাতীয় বিষয়াবলি
  "জাতীয় বিষয়াবলি (বিবিধ)", "ব্রিটিশ আমল ও ইংরেজ শাসন", "সুলতানী ও মুসলিম শাসন", 
  "প্রাচীন জনপদ ও নাম", "মুঘল আমল", "ভাষা ও স্বাধিকার আন্দোলন", 
  "ফরায়েজী ও স্বদেশী আন্দোলন", "নবাবী আমল", "ইতিহাসে বাংলার রাজধানী", 
  "বাঙালি জাতির উদ্ভব", "প্রাচীন বাংলার রাজনৈতিক ইতিহাস", "মুক্তিযুদ্ধের খেতাব ও বীরশ্রেষ্ঠ", 
  "৬ দফা ও গণঅভ্যুত্থান", "বঙ্গবন্ধু ও তাঁর শাসনকাল", "প্রাচীন আমলের শিল্পকলা ও স্থাপনা", 
  "মুক্তিযুদ্ধের সেক্টর ও অপারেশন", "আইয়ুব খানের শাসন", "আগরতলা মামলা", 
  "মুক্তিযুদ্ধ ও বিজয়", "পলাশির যুদ্ধ", "মুক্তিযুদ্ধের সেক্টর ও কমান্ড", 
  "ফকির সন্ন্যাসী আন্দোলন", "ইতিহাস ও ঐতিহ্য", "মুক্তিযুদ্ধের স্মারক ও ভাস্কর্য", 
  "মৌর্য যুগ", "স্বাধীন বাংলা বেতার কেন্দ্র", "নীল বিদ্রোহ", "মুজিবনগর সরকার", 
  "যুদ্ধ পরবর্তী শাসন আমল", "মুক্তিযুদ্ধ ভিত্তিক চলচ্চিত্র",

  // ২. বাংলাদেশের কৃষিজ সম্পদ
  "কৃষি: ফসল ও ব্যবস্থাপনা", "কৃষিজ সম্পদ", "প্রাণিসম্পদ", "বনজ সম্পদ", 
  "মৎস্য ও জলজ সম্পদ", "কৃষি আদমশুমারি", "ফসল উৎপাদন", "কৃষি ও বন", 
  "কৃষি ও ফসল ব্যবস্থাপনা", "কৃষিজ সম্পদ (অন্যান্য)",

  // ৩. বাংলাদেশের জনসংখ্যা ও উপজাতি
  "সাঁওতাল ও ওঁরাও", "চাকমা ও গারো", "জনসংখ্যার মৌলিক ধারনা", 
  "জনসংখ্যা ও জনতাত্ত্বিক সূচক", "জনশুমারি ২০২২ ও আদমশুমারি ইতিহাস", 
  "জনসংখ্যা ও উপজাতি (অন্যান্য)",

  // ৪. বাংলাদেশের অর্থনীতি
  "জাতীয় অর্থনীতি ও বাজেট", "উন্নয়ন পরিকল্পনা ও জিডিপি", "জাতীয় আয় ও রাজস্ব", 
  "বাংলাদেশের অর্থনৈতিক ব্যবস্থা", "বাংলাদেশের অর্থনীতি (অন্যান্য)",

  // ৫. বাংলাদেশের শিল্প ও বাণিজ্য
  "ব্যাংকিং ও আর্থিক প্রতিষ্ঠান", "শিল্প সম্পদ", "বীমা ব্যবস্থা", 
  "বাংলাদেশের পোশাক শিল্প", "জাহাজ নির্মাণ শিল্প", "বাংলাদেশের শিল্পসমূহ", 
  "বৈদেশিক বাণিজ্য", "আমদানি রপ্তানি", "শিল্প ও বাণিজ্য", 
  "রপ্তানি প্রক্রিয়াকরণ এলাকা", "মুদ্রা", "বাংলাদেশের কাগজ শিল্প", 
  "বাংলাদেশের ওষুধ শিল্প", "বাংলাদেশের সার শিল্প", "চিনি শিল্প",

  // ৬. বাংলাদেশের সংবিধান ও সরকার
  "সংবিধানের মৌলিক বিষয়", "বাংলাদেশ সংবিধান", "সংবিধান (অন্যান্য)", 
  "আইনসভা ও বিচারবিভাগ", "সংবিধানের ইতিহাস ও কাঠামো", "সংবিধান সংশোধনী", 
  "সপ্তম ভাগ-নির্বাচন", "নবম ভাগ-বাংলাদেশের কর্মবিভাগ", "গণপরিষদ", 
  "বর্তমান মন্ত্রিসভা", "পার্লামেন্টারি শব্দকোষ", "পাকিস্তানের গণপরিষদ", 
  "বঙ্গীয় মন্ত্রিসভা", "আইন বিভাগ", "একাদশ ভাগ-বিবিধ", 
  "তফসিল, শপথ ও জরুরি অবস্থা", "তৃতীয় ভাগ-মৌলিক অধিকার",

  // ৭. বাংলাদেশের রাজনৈতিক ব্যবস্থা
  "বাংলাদেশের রাজনৈতিক দলসমূহ", "রাজনৈতিক ব্যবস্থা (অন্যান্য)", 
  "রাজনৈতিক দলসমুহের নিবন্ধন আইন-২০২০",

  // ৮. বাংলাদেশের সরকার ব্যবস্থা
  "প্রশাসনিক কাঠামো ও ইউনিট", "সরকার ও প্রশাসনিক ব্যবস্থা", "বাংলাদেশ সিভিল সার্ভিস", 
  "সিটি কর্পোরেশন", "স্থানীয় সরকার", "পৌরসভা", "প্রশাসন",

  // ৯. জাতীয় অর্জন, ব্যক্তিত্ব ও প্রতিষ্ঠান
  "সংসৃতি", "পরমাণু শক্তি কমিশন", "উল্লেখযোগ্য ব্যক্তিত্ব", 
  "শিল্প, সংস্কৃতি ও স্থপতি", "কম্পিউটার সিস্টেম ও হার্ডওয়্যার", "টেলযোগাযোগ", 
  "বাউল শিল্পী", "ইউজিসি", "বাংলা একাডেমি", "লোকসংগীত", 
  "আইসিটি ও বিশ্বগ্রাম", "বাংলাদেশের গণমাধ্যম", "জাতীয় অর্জন ও ব্যক্তিত্ব (অন্যান্য)", 
  "নেটওয়ার্কিং ও ইন্টারনেট", "সাংস্কৃতিক কর্মকাণ্ড", "জাতীয় স্মারক ও ভাস্কর্য", 
  "সফটওয়্যার, লজিক ও ডেটাবেজ",

  // ১০. যাতায়াত ও যোগাযোগ
  "নৌ-যোগাযোগ ও বন্দর", "বিমান যোগাযোগ", "রেল যোগাযোগ", 
  "সড়ক যোগাযোগ ও সেতু", "উপগ্রহ ভূ-কেন্দ্র", "ডাক ও টেলিযোগাযোগ",

  // অন্যান্য (অতিরিক্ত টপিকসমূহ)
  "খনিজ ও শক্তি সম্পদ", "সড়ক যোগাযোগ", "উন্নয়ন পরিকল্পনা", "বাংলা সাহিত্য ও সাহিত্যিক", 
  "যুক্তফ্রন্ট সরকার", "সশস্ত্র বাহিনী", "মহাত্মা গান্ধী", "বাংলার মুসলিম শাসন", 
  "ধর্ম", "বাংলায় মুঘল শাসনামল", "সমাজব্যবস্থা", "দ্বিতীয় ভাগ-রাষ্ট্র পরিচালনার মূলনীতি", 
  "সাহিত্য", "গুপ্ত যুগ", "বাংলাদেশ পরিকল্পনা কমিশন", "উপমহাদেশে ভ্রমণকারী", 
  "স্কুল ও কলেজ", "বিশ্ব জনমত", "শিল্প মন্ত্রণালয়", "ডাকসু", "অষ্টম ভাগ-মহা হিসাব-নিরীক্ষক ও নিয়ন্ত্রক", 
  "মাধ্যমিক ও উচ্চ শিক্ষা", "বাংলাদেশের খেলাধুলা", "সশস্ত্র বিপ্লবী আন্দোলন", 
  "ভারত শাসন আইন ১৯৩৫", "উপজাতি বিষয়ক প্রতিষ্ঠান", "স্বাধীনতার ঘোষণা", "দ্বিজাতি তত্ত্ব", 
  "বাংলাদেশের অর্থনৈতিক অঞ্চল", "সাক্ষরতা আন্দোলন", "১৯৭০ সালের নির্বাচন", "বৃহত্তর জেলা", 
  "বিনিয়োগ উন্নয়ন কর্তৃপক্ষ", "প্রাচীন বাংলার শিল্পকলা", "নাথান কমিশন", "বাংলাদেশের পাটশিল্প", 
  "তিলক", "তিতুমীর", "আন্তর্জাতিক সদস্যপদ", "শিক্ষা বোর্ড", "সাধারণ তথ্য", 
  "সড়ক পথ", "আন্তর্জাতিক স্বীকৃতি", "ফসল উৎপাদন", "১৯৭২-১৯৭৫ শাসন আমল", 
  "আইসিটি ও বিশ্বগ্রাম", "পর্যটন শিল্প", "সেক্টর ও কমান্ড ব্যবস্থা", "প্রাচীন জনপদ", 
  "ইতিহাসে ঢাকা", "স্বাধিকার আন্দোলন", "১৯৭৫-১৯৯০ শাসন আমল", "সাম্প্রতিক", 
  "আন্তর্জাতিক প্রেক্ষাপট", "উৎসব", "ভৌগোলিক অবস্থান", "রাজনৈতিক পদ", "ক্রীড়া", 
  "বাংলাদেশের সকল সংসদ নির্বাচন", "উপাধি", "বাংলাদেশের প্রথম"
], 







"International": ["প্রণালী", "সংস্থা"],
        "ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা":["বজ্রপাত", "বন্যা", "উপকূলীয় জেলা", "ঝড়ের নামকরণ", "শিলার শ্রেণীবিভাগ", "মহাকাশ ও মহাবিশ্ব", "মরুভূমি", "বাংলাদেশের ভূপ্রকৃতি", "পৃথিবীর গতি", "নদীর বিভিন্ন গতি ও অবস্থা", "দুর্যোগ ব্যবস্থাপনা", "ছিটমহল", "বাংলাদেশের ঝর্না", "বাংলাদেশের অবস্থান ও আয়তন", "বাংলাদেশে আঘাত হানা সাইক্লোন", "টারসিয়ারি যুগের পাহাড়", "সুনামি", "বায়ুমণ্ডলের স্তরের রাসায়নিক গঠন", "পৃথিবীর আকার আকৃতি", "সৌরজগৎ", "মহাসাগর", "পর্বতের শ্রেণীবিভাগ", "বাংলাদেশের বনজ সম্পদ", "উপসাগর", "আন্তর্জাতিক তারিখ রেখা", "বাংলাদেশের জলবায়ু", "বাংলাদেশের উপত্যকা", "সাগর", "বাংলাদেশের দ্বীপ", "ঘূর্ণিঝড় সংকেত ও নদীবন্দরের সতর্ক সংকেত", "বৃষ্টিপাত", "ঘূর্ণিঝড়", "জোয়ার ভাটা", "সমভূমি", "অন্তরীপ", "আগ্নেয়গিরি", "গ্রীন হাউজ প্রভাব", "জলবায়ু অঞ্চল", "হ্রদ", "অভিবাসন", "বায়ু দূষণের প্রভাব", "চত্বর ভুমি", "মানচিত্র পঠন ও ব্যাবহার", "ভু পৃষ্টের পরিবর্তন প্রক্রিয়া", "বাংলাদেশের চর", "বাংলাদেশের জলপ্রপাত", "ভু অভ্যন্তরের গঠন", "বারিমন্ডল", "ঘূর্ণিঝড় ও জলোচ্ছ্বাস", "সুন্দরবন", "পৃথিবীর প্রধান নদ নদী", "বায়ুমণ্ডল", "বায়ুমণ্ডলের স্তর", "জলপ্রপাত", "আবহাওয়া ও জলবায়ুর উপাদান", "বাংলাদেশের পাহাড়", "কালবৈশাখী ঝড়", "মেঘবিজ্ঞান", "দুর্যোগ", "সমুদ্র স্রোত", "বিশ্ব উষ্ণায়ন ও জলবায়ু পরিবর্তন", "কালবৈশাখী ঝর", "দুর্যোগ", "দুর্যোগ এর প্রকার", "জলবায়ুর নিয়ামক", "জলবায়ু পরিবরতনে বাংলাদেশের ঝুকি", "কালবৈশাখী", "উপকূলীয় সবুজ বেষ্টনী", "উপকূলীয় অঞ্চলে সংঘটিত ঘূর্ণিঝড়", "বন্যার প্রভাব", "বন্যার শ্রেনী", "বৈশ্বিক উষ্ণায়নের প্রভাব", "ভূমিকম্প", "সমুদ্রের ভূমিরূপ", "জলবায়ু ঝুকি মোকাবিলায় সরকারের পদক্ষেপ", "জলবায়ু পরিবর্তন মোকাবিলায় আন্তর্জাতিক পদক্ষেপ ও সংস্থা",   "BCS-50(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-49(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-47(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-44(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-43(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-35(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-34(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-32(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-31(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-19(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-18(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-17(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-16(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-15(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-14(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-13(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-12(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)", "BCS-10(ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা)"  ],
        "Computer": ["কম্পিউটার সিস্টেম ও হার্ডওয়্যার", "সফটওয়্যার, লজিক ও ডেটাবেজ", "আধুনিক প্রযুক্তি", "নেটওয়ার্কিং ও ইন্টারনেট", "সিস্টেম ও সাইবার নিরাপত্তা", "আইসিটি ও বিশ্বগ্রাম", "অপারেটিং সিস্টেম", "নিত্য প্রয়োজনীয় কম্পিউটিং প্রযুক্তি", "তথ্য প্রযুক্তি বড় প্রতিষ্ঠান ও তাদের সেবা তথ্যসমূহ", "হার্ডওয়্যার", "তথ্য প্রযুক্তি বড় প্রতিষ্ঠান", "আর্টিফিশিয়াল ইন্টেলিজেন্স", "সোশ্যাল মিডিয়া", "নেটওয়ার্কিং", "বায়োমেট্রিক্স", "জেনেটিক ইঞ্জিনিয়ারিং", "সফটওয়্যার টেস্টিং", "কম্পিউটার নেটওয়ার্ক", "সেলুলার ডাটা নেটওয়ার্ক", "সফটওয়্যার", "ক্লায়েন্ট সার্ভার ম্যানেজমেন্ট", "ট্রান্সমিশন মিডিয়া", "নেটওয়ার্কিং ডিভাইস", "বায়োইনফরমেটিক্স", "ওয়েব", "সফটওয়্যার কোয়ালিটি", "সফটওয়্যার প্রকারভেদ", "ওয়্যারলেস নেটওয়ার্ক", "ম্যালওয়্যার", "মিডিয়া", "আইনি বিষয়", "সফটওয়্যার ম্যানেজমেন্ট", "নেটওয়ার্ক প্রকারভেদ", "মাল্টিমিডিয়া", "বায়ো-টেকনোলজি", "DBMS সফটওয়্যার", "পাওয়ার ইউনিট", "নেটওয়ার্কিং কমান্ড", "ল্যাঙ্গুয়েজ", "ক্রায়োসার্জারি", "নেটওয়ার্ক টপোলজি", "সফটওয়্যার ইঞ্জিনিয়ারিং", "পাসওয়ার্ড", "নেটওয়ার্কিং বেসিক", "রিকোয়ারমেন্ট","BCS-50(Computer)", "BCS-49(Computer)", "BCS-48(Computer)", "BCS-47(Computer)", "BCS-46(Computer)", "BCS-45(Computer)", "BCS-44(Computer)", "BCS-43(Computer)", "BCS-42(Computer)", "BCS-41(Computer)", "BCS-40(Computer)", "BCS-39(Computer)", "BCS-38(Computer)", "BCS-37(Computer)", "BCS-36(Computer)", "BCS-35(Computer)", "BCS-34(Computer)", "BCS-33(Computer)", "BCS-32(Computer)", "BCS-31(Computer)", "BCS-30(Computer)", "BCS-29(Computer)", "BCS-28(Computer)", "BCS-27(Computer)", "BCS-26(Computer)", "BCS-25(Computer)", "BCS-24(Computer)", "BCS-23(Computer)", "BCS-22(Computer)", "BCS-21(Computer)", "BCS-20(Computer)", "BCS-19(Computer)", "BCS-18(Computer)", "BCS-17(Computer)", "BCS-16(Computer)", "BCS-15(Computer)", "BCS-14(Computer)", "BCS-13(Computer)", "BCS-12(Computer)", "BCS-11(Computer)", "BCS-10(Computer)"],
        "Science": ["ভৌত বিজ্ঞান", "জীববিজ্ঞান"],
       
        "মানসিক দক্ষতা":["গাণিতিক যুক্তি","যৌক্তিক বিশ্লেষণ","স্থানাঙ্ক সম্পর্ক","কোডিং ও ডিকোডিং","সংখ্যাগত ক্ষমতা","সমস্যা সমাধান","বানান ও ভাষা"]
      };

      let combinedTopics: string[] = [];
      selectedSubjects.forEach(sub => {
        if (topicMap[sub]) {
          combinedTopics = [...combinedTopics, ...topicMap[sub]];
        }
      });

      setAvailableTopics(combinedTopics);
    }
  }, [step, selectedSubjects]);

  const toggleSelection = (item: string, state: string[], setState: any) => {
    setState(state.includes(item) ? state.filter(i => i !== item) : [...state, item]);
  };

  const handleStartExam = () => {
    setSelectedExam({
      type: 'mixed',
      category: tempCategory,
      subjects: selectedSubjects,
      topics: selectedTopics,
      limit: qCount,
      time: examTime * 60
    });
    setCurrentPage("exam");
  };

  // ক্যাটাগরি অনুযায়ী সাবজেক্ট লিস্ট নির্ধারণ
  const getAvailableSubjects = () => {
  const category = tempCategory ? tempCategory.trim().toLowerCase() : "";
  
  if (category === "power") {
    return ["Microcontroller"];
  }
  
  return ["English", "Bangla", "বাংলাদেশ বিষয়াবলী", "International Affairs", "ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা", "Computer", "Science", "Math", "মানসিক দক্ষতা", ];
};
  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-20 px-4 pb-10 font-sans">
      <div className="max-w-md mx-auto">
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${step >= i ? "w-8 bg-green-500" : "w-4 bg-gray-200"}`} />
          ))}
        </div>

        {/* Step 1: Category */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-2xl font-black text-gray-800 mb-6 tracking-tight">Select <span className="text-green-600">Goal</span></h2>
            <div className="grid grid-cols-2 gap-3">
              {["bcs", "power", "admission", "bank"].map(id => (
                <button key={id} onClick={() => {setTempCategory(id); setStep(2)}} className="bg-white border border-gray-100 p-6 rounded-3xl font-bold uppercase text-xs tracking-widest text-gray-600 hover:border-green-400 hover:text-green-600 transition-all shadow-sm active:scale-95">
                  {id}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 & 3: Selection */}
        {(step === 2 || step === 3) && (
          <div className="animate-in slide-in-from-right-4">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                Choose <span className="text-green-600">{step === 2 ? "Subjects" : "Topics"}</span>
              </h2>
              <button onClick={() => {setStep(step - 1); if(step===2) setSelectedSubjects([])}} className="text-[10px] font-black  text-gray-400 hover:text-green-600 transition-colors">← Back</button>
            </div>
            
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
              {(step === 2 ? getAvailableSubjects() : availableTopics).map(item => {
                const isSelected = step === 2 ? selectedSubjects.includes(item) : selectedTopics.includes(item);
                return (
                  <label key={item} className={`flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] ${isSelected ? "bg-green-50/50 border-green-500/30" : "bg-white border-gray-100"}`}>
                    <span className={`text-xs font-bold tracking-wide ${isSelected ? "text-green-700" : "text-gray-500"}`}>{item}</span>
                    <input type="checkbox" className="hidden" onChange={() => step === 2 ? toggleSelection(item, selectedSubjects, setSelectedSubjects) : toggleSelection(item, selectedTopics, setSelectedTopics)} />
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? "bg-green-600 border-green-600" : "border-gray-200"}`}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>}
                    </div>
                  </label>
                );
              })}
              {step === 3 && availableTopics.length === 0 && (
                <div className="text-center p-10 text-gray-400 text-xs font-bold uppercase">No topics available.</div>
              )}
            </div>
            
            <button 
              onClick={() => setStep(step + 1)} 
              disabled={(step === 2 && selectedSubjects.length === 0)}
              className="w-full mt-6 py-4 bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-100 disabled:bg-gray-200 disabled:shadow-none transition-all  text-xs tracking-widest"
            >
              Continue
            </button>
          </div>
        )}




        {/* Step 4: Limits */}
        {step === 4 && (
          <div className="animate-in slide-in-from-right-4">
             <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Set <span className="text-green-600">Limits</span></h2>
              <button onClick={() => setStep(3)} className="text-[10px] font-black uppercase text-gray-400">← Back</button>
            </div>
            <div className="space-y-10 bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between font-black  text-[10px] text-gray-400">
                  <span>Questions</span>
                  <span className="text-green-600">{qCount}</span>
                </div>
                <input type="range" min="5" max="1000" step="5" value={qCount} onChange={(e) => setQCount(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-green-600" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between font-black text-[10px] text-gray-400">
                  <span>Time (Min)</span>
                  <span className="text-green-600">{examTime}</span>
                </div>
                <input type="range" min="5" max="1000" step="5" value={examTime} onChange={(e) => setExamTime(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-green-600" />
              </div>
            </div>
            <button onClick={handleStartExam} className="w-full mt-10 py-5 bg-green-600 text-white font-black rounded-[2rem] shadow-xl  text-xs tracking-[0.2em]  transition-all">
              🚀 Start 
            </button>
          </div>
        )}
      </div>
    </div>
  );
}