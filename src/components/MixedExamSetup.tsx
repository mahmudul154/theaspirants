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
        "Bangla": ["উপসর্গ প্রত্যয়", "ণত্ব ও ষত্ব বিধান", "পদাশ্রিত নির্দেশক", "বচন", "বাচ্য", "ক্রিয়ার কাল", "বিরামচিহ্ন", "সন্ধি", "ধ্বনি ও বর্ণ", "ধ্বনির পরিবর্তন", "বর্ণ", "বাক্য", "উক্তি", "সমোচ্চারিত ও ভিন্নার্থক শব্দ", "পুরুষ ও স্ত্রীবাচক শব্দ", "কারক", "দ্বিরুক্তি শব্দ/শব্দদ্বিত্ব", "শব্দ", "সংখ্যাবাচক শব্দ", "ধাতু", "পুরুষ", "ভাষার ইতিহাস ও ব্যাকরণ", "ভাষা ও ব্যাকরণ", "ভাষার প্রয়োগ অপপ্রয়োগ", "তৎপুরুষ সমাস", "কর্মধারয় সমাস", "দ্বিগু সমাস", "বহুব্রীহি সমাস", "আধুনিক যুগ", "বাগধারা ও প্রবাদ প্রবচন", "বাংলা নাটক", "এক কথায় প্রকাশ", "রবীন্দ্রনাথ ঠাকুর", "সমসাময়িক বাংলাদেশের সাহিত্য", "মাধ্যমিক সাহিত্য", "কাজী নজরুল ইসলাম", "মীর মশাররফ হোসেন", "শরৎচন্দ্র চট্টোপাধ্যায়", "দীনবন্ধু মিত্র", "ফররুখ আহমদ", "ঈশ্বরচন্দ্র বিদ্যাসাগর", "বাংলা সাহিত্যের অভিধা ও মতবাদ", "ছন্দ প্রকরণ", "উচ্চমাধ্যমিক সাহিত্য", "প্রকৃতি ও প্রত্যয়", "ফোর্ট উইলিয়াম কলেজ", "বাংলা সাহিত্য ও বিভিন্ন সংগঠন", "বিদেশি সাহিত্য ও অনুবাদ", "কায়কোবাদ", "বিপরীত শব্দ", "বিখ্যাত শিশুতোষগ্রন্থ", "প্রশাসনিক", "প্রাচীন ও মধ্যযুগ", "পত্র-পত্রিকা", "বিখ্যাত আত্মজীবনী", "বাংলা গান", "বিবিধ", "মুক্তিযুদ্ধ ভিত্তিক সাহিত্য", "প্রাচীন যুগ (চর্যাপদ)", "বঙ্কিমচন্দ্র চট্টোপাধ্যায়", "বিখ্যাত উক্তি", "জসীমউদ্দীন", "বেগম রোকেয়া", "বৈষ্ণব পদাবলি", "মঙ্গল কাব্য", "বাগধারা", "শ্রীচৈতন্যদেব ও জীবনী সাহিত্য", "মাইকেল মধুসূদন দত্ত", "মধ্যযুগ", "শ্রীকৃষ্ণকীর্তন", "রাজা রামমোহন রায়", "ভাষা আন্দোলন ও বাংলা সাহিত্য", "বিখ্যাত ভ্রমণ কাহিনী", "বাংলা ভাষা ও লিপি", "ডাক ও খনার বচন", "বিজ্ঞান ও প্রযুক্তি", "বাণিজ্য ও অর্থনীতি", "বাণিজ্য", "সাহিত্যিকদের ছদ্মনাম ও উপাধি", "সাধারণ", "বেগম রোকেয়া সাখাওয়াত হোসেন", "পত্রিকা", "পদবি", "দাপ্তরিক", "চরিত্র", "শিক্ষা ও সাহিত্য", "শিল্প ও সাহিত্য", "আইনি", "আইন ও বিচার", "ব্যাংকিং ও অর্থনীতি", "আইন ও আদালত", "সাধারণ ও প্রযুক্তি", "BCS-50(Bangla)", "BCS-49(Bangla)", "BCS-48(Bangla)", "BCS-47(Bangla)", "BCS-46(Bangla)", "BCS-45(Bangla)", "BCS-44(Bangla)", "BCS-43(Bangla)", "BCS-42(Bangla)", "BCS-41(Bangla)", "BCS-40(Bangla)", "BCS-39(Bangla)", "BCS-38(Bangla)", "BCS-37(Bangla)", "BCS-36(Bangla)", "BCS-35(Bangla)", "BCS-34(Bangla)", "BCS-33(Bangla)", "BCS-32(Bangla)", "BCS-31(Bangla)", "BCS-30(Bangla)", "BCS-29(Bangla)", "BCS-28(Bangla)", "BCS-27(Bangla)", "BCS-26(Bangla)", "BCS-25(Bangla)", "BCS-24(Bangla)", "BCS-23(Bangla)", "BCS-22(Bangla)", "BCS-21(Bangla)", "BCS-20(Bangla)", "BCS-19(Bangla)", "BCS-18(Bangla)", "BCS-17(Bangla)", "BCS-16(Bangla)", "BCS-15(Bangla)", "BCS-14(Bangla)", "BCS-13(Bangla)", "BCS-12(Bangla)", "BCS-11(Bangla)", "BCS-10(Bangla)"], 
        "বাংলাদেশ বিষয়াবলী": ["BCS-50(বাংলাদেশ বিষয়াবলী)","সংবিধান","বিখ্যাত ব্যক্তি","উপজাতি ও নৃ-গোষ্ঠী","বাংলাদেশের অর্থনীতি","পরিবহন ও যোগাযোগ","বাংলাদেশের সম্পদ"],
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
  
  return ["English", "Bangla","বাংলাদেশ বিষয়াবলী", "International Affairs", "ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা", "Computer", "Science", "Math", "মানসিক দক্ষতা", ];
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