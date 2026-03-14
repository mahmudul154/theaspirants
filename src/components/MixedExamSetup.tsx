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
        "Physics": [ "Vector", "Thermodynamics", "Static Electricity"],
        "Chemistry 2nd Paper": [ "Organic Chemistry", "Quantitative Chemistry"],
        "Math": ["Calculus", "Matrix", "Trigonometry"],
        "Zoology": ["বর্জ্য ও নিষ্কাশন","সমন্বয় ও নিয়ন্ত্রণ","জিনতত্ত্ব ও বিবর্তন"],
        
        // General/Job Topics
        "English": ["Proverb","Idioms & Phrases","Spelling","Voice,Narration and One Word"], 
        "Bangla": ["সমাস", "কারক", "সন্ধি"], 
        "ICT": ["Networking", "HTML", "Digital Device", "Programming"],
        "Science": ["ভৌত বিজ্ঞান", "জীববিজ্ঞান"],
        "Bangladesh": ["ইতিহাস", "সংবিধান"],
        "International": ["প্রণালী", "সংস্থা"]
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
    if (tempCategory === "hsc") {
      return ["English 1st Paper","English 2nd Paper",  "Bangla 1st Paper","Bangla 2nd Paper", "ICT", "Physics 1st Paper","Physics 2nd Paper", "Chemistry 1st Paper", "Chemistry 2nd Paper", "Botani", "Zoology", "Math 1st Paper" ,"Math 1st Paper"];
    }
    return ["English", "Bangla", "ICT", "Science", "Math", "Analytical", "Bangladesh", "International"];
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
              {["bcs", "hsc", "admission", "bank"].map(id => (
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
                <input type="range" min="10" max="200" step="5" value={qCount} onChange={(e) => setQCount(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-green-600" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between font-black text-[10px] text-gray-400">
                  <span>Time (Min)</span>
                  <span className="text-green-600">{examTime}</span>
                </div>
                <input type="range" min="5" max="120" step="5" value={examTime} onChange={(e) => setExamTime(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-green-600" />
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