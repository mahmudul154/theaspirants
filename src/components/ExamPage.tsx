import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase"; 
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import remarkGfm from 'remark-gfm'; //



interface ExamPageProps {
  examId: any; // অবজেক্ট সাপোর্ট করার জন্য any রাখা হয়েছে
  setCurrentPage: (page: string) => void;
}



const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) return null;

  const processedContent = content
    .replace(/\\n/g, '\n') // ডাটাবেস থেকে আসা \n কে আসল নিউলাইনে রূপান্তর
    .replace(/\\\\/g, '\\');

  return (
    <div className="prose prose-sm max-w-none prose-table:border-collapse prose-th:border prose-td:border">
      <ReactMarkdown 
        remarkPlugins={[remarkMath, remarkGfm]} // remarkGfm অবশ্যই দিবেন
        rehypePlugins={[rehypeKatex]}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};


 
export function ExamPage({ examId, setCurrentPage }: ExamPageProps) {
  // --- States ---
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"intro" | "exam" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  // --- Logic Functions ---
  const finishExam = useCallback(() => {
    setPhase("result");
    window.scrollTo(0, 0);
  }, []);

 useEffect(() => {
    // হেল্পার ফাংশন: টপিক অনুযায়ী প্রশ্নগুলো ভাগ করে রাউন্ড-রবিন স্টাইলে সাজানো
    const organizeQuestionsRoundRobin = (allData: any[], maxLimit?: number) => {
      // ১. টপিক অনুযায়ী গ্রুপ করা
      const grouped: Record<string, any[]> = {};
      allData.forEach(q => {
        const topicName = q.topic || "Others"; // যদি topic না থাকে
        if (!grouped[topicName]) grouped[topicName] = [];
        grouped[topicName].push(q);
      });

      // ২. প্রতিটি গ্রুপের প্রশ্নগুলো নিজেদের মধ্যে শাফল করা
      Object.keys(grouped).forEach(key => {
        grouped[key].sort(() => Math.random() - 0.5);
      });

      const selected: any[] = [];
      const topics = Object.keys(grouped);
      // টপিকগুলোও শাফল করা যাতে সবসময় একই টপিক দিয়ে এক্সাম শুরু না হয়
      topics.sort(() => Math.random() - 0.5);

      const limitCount = maxLimit ? Math.min(maxLimit, allData.length) : allData.length;

      // ৩. রাউন্ড-রবিন লুপ: প্রতিটি টপিক থেকে ১টি করে প্রশ্ন নেওয়া
      while (selected.length < limitCount) {
        let addedInThisRound = false;
        for (let i = 0; i < topics.length; i++) {
          if (selected.length >= limitCount) break;
          
          const currentTopic = topics[i];
          if (grouped[currentTopic].length > 0) {
            selected.push(grouped[currentTopic].shift()); // প্রথম প্রশ্নটি তুলে নেওয়া
            addedInThisRound = true;
          }
        }
        // যদি কোনো টপিকেই আর প্রশ্ন বাকি না থাকে, তাহলে লুপ ভেঙে যাবে
        if (!addedInThisRound) break;
      }

      // ৪. ফাইনালি নির্বাচিত প্রশ্নগুলোর অপশন শাফল করে রিটার্ন করা
      return selected.map(q => ({
        ...q,
        options: q.options ? [...q.options].sort(() => Math.random() - 0.5) : []
      }));
    };

    async function fetchQuestions() {
      if (!examId) return;
      setLoading(true);
      
      try {
        let query = supabase.from("mcq_questions_job").select("*");
        const isMixed = typeof examId === 'object' && examId !== null && examId.type === 'mixed';
        
        if (isMixed) {
          const { category, subjects, topics, limit, time } = examId;
          const dbTag = category;

          if (topics && (topics as string[]).length > 0) {
            query = query.in("topic", topics);
          } else if (subjects && (subjects as string[]).length > 0) {
            query = query.in("subject", subjects);
          }

          query = query.eq("exam_tag", dbTag);

          const { data, error } = await query;
          if (error) throw error;

          if (data && data.length > 0) {
            // নতুন লজিক কল করা হলো
            const processedQuestions = organizeQuestionsRoundRobin(data, limit || 25);
            setQuestions(processedQuestions);
            if (time) setTimeLeft(time);
          }
        } 
        else {
          // নরমাল এক্সাম লজিক
          const { data, error } = await supabase
            .from("mcq_questions_job")
            .select("*")
            .eq("exam_tag", String(examId).toLowerCase());
          
          if (error) throw error;

          if (data && data.length > 0) {
            // নরমাল এক্সামেও নতুন লজিক (লিমিট ছাড়া)
            const processedQuestions = organizeQuestionsRoundRobin(data, data.length);
            setQuestions(processedQuestions);
            setTimeLeft(data.length * 40);
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [examId]);

  // ২. টাইমার লজিক
  useEffect(() => {
    if (phase !== "exam") return;
    if (timeLeft <= 0) { finishExam(); return; }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft, finishExam]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnswer = (optText: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ]: optText }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ)) next.delete(currentQ);
      else next.add(currentQ);
      return next;
    });
  };

// --- আপনার কোডের calculateResult ফাংশনটি পুরোটা নিচেরটা দিয়ে বদলে দিন ---
const calculateResult = () => {
  let correct = 0;
  let wrong = 0;
  // নতুন অবজেক্ট: টপিক/সাব-টপিক ভিত্তিক এনালাইসিসের জন্য
  let analysis: Record<string, { correct: number, total: number }> = {};

  questions.forEach((q, i) => {
    // লজিক: যদি sub_topic থাকে তবে সেটি নাম হবে, নতুবা topic নাম হবে। দুটোর একটাও না থাকলে "অন্যান্য"
    const displayName =  q.topic || "অন্যান্য";
    
    if (!analysis[displayName]) {
      analysis[displayName] = { correct: 0, total: 0 };
    }
    analysis[displayName].total += 1;

    if (answers[i] !== undefined) {
      if (answers[i] === q.answer) {
        correct += 1;
        analysis[displayName].correct += 1; // ঐ নির্দিষ্ট টপিকে মার্ক যোগ হবে
      } else {
        wrong += 1;
      }
    }
  });

  const rawScore = correct - (wrong * 0.5);
  const finalScore = Math.max(0, rawScore);

  return { 
    correct, 
    wrong, 
    totalScore: finalScore,
    subTopicAnalysis: analysis, // এটি নতুন যোগ হলো
    percentage: questions.length > 0 ? Math.round((finalScore / questions.length) * 100) : 0
  };
};

// এরপর নিচের লাইনে subTopicAnalysis ডিস্ট্রাকচার করে নিন
const { correct, wrong, totalScore, percentage, subTopicAnalysis } = calculateResult();

  // এরর এড়াতে টাইটেল টেক্সট ফরম্যাট করা
  const displayTitle = typeof examId === 'object' ? (examId.category || "Mixed") : String(examId);

  // কাস্টম লোডিং স্ক্রিন
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
      <p className="text-emerald-600 font-bold animate-pulse"></p>
    </div>
  );

// --- ----------------------------------------------------------------------Intro View ---
  if (phase === "intro") {
    return (
      <div 
        className="pt-16 min-h-screen bg-slate-50 flex items-center justify-center p-4"
        style={{ fontFamily: "'Anek Bangla', sans-serif" }}
      >
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-green-100/50 max-w-md w-full p-6 text-center border border-green-50 relative overflow-hidden">
          
     

         

          <h1 className="text-sm font-black text-green-600 justify- mb-1"> নিয়মাবলী : </h1>
          <p className="text-gray-500 text-xs font-medium mb-6"></p>
          
          {/* Stats Grid - 3 items in one row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            
            <div className="bg-slate-50 border border-slate-100/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white transition-all hover:shadow-md hover:-translate-y-1">
              <div className="text-xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">❓</div>
              <div className="text-center">
                <p className="text-lg font-black text-gray-800 leading-none mb-1">{questions.length}</p>
                <p className="text-[10px] font-bold text-gray-500">মোট প্রশ্ন</p>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-100/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white transition-all hover:shadow-md hover:-translate-y-1">
              <div className="text-xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">⏱️</div>
              <div className="text-center">
                <p className="text-lg font-black text-gray-800 leading-none mb-1">{Math.floor(timeLeft / 60)}</p>
                <p className="text-[10px] font-bold text-gray-500">মিনিট</p>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-100/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white transition-all hover:shadow-md hover:-translate-y-1">
              <div className="text-xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">📊</div>
              <div className="text-center">
                <p className="text-lg font-black text-gray-800 leading-none mb-1">{questions.length}</p>
                <p className="text-[10px] font-bold text-gray-500">পূর্ণমান</p>
              </div>
            </div>

          </div>

          {/* Instructions - Unique & Minimal */}
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs font-black text-red-600 mb-3 flex items-center gap-1.5">
              <span className="animate-pulse">📌</span> নিয়মাবলী:
            </p>
            <ul className="text-[11px] font-medium text-gray-600 space-y-2 list-none">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-[1px]">✔️</span> 
                <span>প্রতিটি সঠিক উত্তরে <b>১ নম্বর</b> যোগ হবে।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-[1px]">❌</span> 
                <span>প্রতিটি ভুল উত্তরে <b>০.৫ নম্বর</b> কাটা যাবে।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-[1px]">🚩</span> 
                <span>রিভিউ করার জন্য প্রশ্ন <b>ফ্ল্যাগ</b> করে রাখতে পারবেন।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-[1px]">⏱️</span> 
                <span>বাটনে ক্লিক করার সাথে সাথেই <b>সময় গণনা</b> শুরু হবে।</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={() => setCurrentPage("home")} 
              className="w-1/3 py-3.5 rounded-xl border-2 border-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
            >
              ফিরে যান
            </button>
            <button 
              onClick={() => setPhase("exam")} 
              className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-black hover:shadow-lg hover:shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span className="group-hover:animate-bounce">🚀</span> পরীক্ষা শুরু
            </button>
          </div>
          
        </div>
      </div>
    );
  }







// --- --------------------------------------------------------------------------------Result View ---
  if (phase === "result") {
    const skippedCount = questions.length - Object.keys(answers).length;

    return (
      <div 
        className="pt-10 min-h-screen bg-[#F8F9FA] pb-12"
        style={{ fontFamily: "'Anek Bangla', sans-serif" }}
      >
        <div className="max-w-4xl mx-auto px-4">
          
          {/* ---------------- Unique Dashboard Header (Glassmorphism) ---------------- */}
          <div className={`relative rounded-[2.5rem] p-6 md:p-8 mb-8 shadow-xl overflow-hidden flex flex-col md:flex-row items-center gap-8 ${
              percentage >= 70 ? "bg-gradient-to-br from-green-600 via-emerald-600 to-green-800 shadow-green-200/50"
              : percentage >= 50 ? "bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 shadow-orange-200/50"
              : "bg-gradient-to-br from-rose-500 via-red-500 to-red-700 shadow-rose-200/50"
          }`}>
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none"></div>

            {/* Left Column: Verdict & Score */}
            <div className="relative z-10 flex-1 text-center md:text-left w-full md:border-r border-white/20 md:pr-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold mb-4 shadow-sm border border-white/10">
                {percentage >= 70 ? "🏆 অসাধারণ ফলাফল!" : percentage >= 50 ? "👍 খুব ভালো চেষ্টা!" : "📖 আরও অনুশীলন প্রয়োজন!"}
              </div>
              <div className="text-white/80 text-sm font-medium mb-1">আপনার মোট স্কোর</div>
              <div className="text-6xl md:text-7xl font-black text-white mb-3 drop-shadow-md">{percentage}%</div>
              <p className="text-green-50 text-sm bg-black/10 inline-block px-4 py-2 rounded-xl backdrop-blur-sm border border-black/5">
                <span className="font-bold text-white">{questions.length}</span> টি প্রশ্নের মধ্যে <span className="font-bold text-white">{totalScore}</span> নম্বর পেয়েছেন
              </p>
            </div>

            {/* Right Column: Unified Stats Grid (Glassmorphism) */}
            <div className="relative z-10 w-full md:w-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center shadow-inner">
                <div className="text-3xl font-black text-white mb-1">{correct}</div>
                <div className="text-xs font-bold text-green-100">সঠিক উত্তর</div>
              </div>
              <div className="bg-rose-500/20 backdrop-blur-md border border-rose-400/30 rounded-2xl p-4 text-center shadow-inner">
                <div className="text-3xl font-black text-white mb-1">{wrong}</div>
                <div className="text-xs font-bold text-rose-100">ভুল উত্তর</div>
              </div>
              <div className="bg-black/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center col-span-2 sm:col-span-1 shadow-inner">
                <div className="text-3xl font-black text-white mb-1">{skippedCount}</div>
                <div className="text-xs font-bold text-slate-200">উত্তর দেননি</div>
              </div>
            </div>

          </div>

          {/* ---------------- Subject-wise Performance ---------------- */}
          {subTopicAnalysis && Object.keys(subTopicAnalysis).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-8">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-green-600 bg-green-50 p-1.5 rounded-lg">🎯</span> বিষয়ভিত্তিক পারফরম্যান্স
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(subTopicAnalysis).map(([name, stat]: any) => {
                  const per = Math.round((stat.correct / stat.total) * 100);
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-semibold text-slate-700 truncate mr-2">{name}</span>
                        <span className="font-bold text-slate-800">{stat.correct}/{stat.total}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${per < 50 ? 'bg-rose-400' : per < 80 ? 'bg-amber-400' : 'bg-green-500'}`} 
                          style={{ width: `${per}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}






          {/* ---------------- Questions Review Section ---------------- */}
          <div className="space-y-4">
            {questions.map((q, i) => {
              const userAnswer = answers[i];
              const isCorrect = userAnswer === q.answer;
              const isSkipped = userAnswer === undefined;
              
              const optionLetters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];

              return (
                <div key={q.id || i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
                  
                  {/* Status Badge */}
                  <div className="mb-4">
                    {isSkipped ? (
                      <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1.5">
                        <span className="text-slate-400">—</span> উত্তর দেননি
                      </span>
                    ) : isCorrect ? (
                      <span className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1.5 border border-green-100">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> সঠিক
                      </span>
                    ) : (
                      <span className="text-xs bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1.5 border border-rose-100">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg> ভুল
                      </span>
                    )}
                  </div>

                {/* Question Text */}
<div className="text-base font-bold text-slate-700 mb-5 flex items-start gap-2">
  <span className="text-slate-400">{i + 1}.</span> 
  {/* Added specific markdown spacing classes here */}
  <div className="flex-1 leading-relaxed [&>p]:mb-3 last:[&>p]:mb-0 [&_table]:w-full [&_td]:p-2 [&_th]:p-2 [&_th]:text-left [&_table]:mb-3">
    <MarkdownRenderer content={q.question} />
  </div>
</div>
                  
                  {/* Options Layout */}
                  {q.options && q.options.length > 0 ? (
                    <div className="space-y-3 mb-5 md:ml-6">
                      {q.options.map((opt, idx) => {
                        const isThisCorrect = opt === q.answer;
                        const isThisSelected = opt === userAnswer;
                        
                        let optionBoxClass = "border-slate-200 bg-white text-slate-700 hover:border-slate-300";
                        let circleClass = "bg-slate-50 border-slate-200 text-slate-500";
                        
                        if (isThisCorrect) {
                          optionBoxClass = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500 shadow-sm";
                          circleClass = "bg-green-600 border-green-600 text-white";
                        } else if (isThisSelected && !isCorrect) {
                          optionBoxClass = "border-rose-400 bg-rose-50 text-rose-800 shadow-sm";
                          circleClass = "bg-rose-500 border-rose-500 text-white";
                        }

                        return (
                          <div key={idx} className={`text-sm p-3.5 rounded-xl border flex items-center gap-3 transition-all ${optionBoxClass}`}>
                            <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold border shrink-0 ${circleClass}`}>
                              {isThisCorrect && isThisSelected ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                              ) : isThisSelected && !isCorrect ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                              ) : (
                                optionLetters[idx] || (idx + 1)
                              )}
                            </div>
                            
                            <span className={`flex-1 font-medium leading-relaxed ${isThisCorrect ? "font-bold" : ""}`}>
                              <MarkdownRenderer content={opt} />
                            </span>
                            
                            {isThisCorrect && (
                              <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-sm bg-green-50 p-4 rounded-xl border border-green-200 mb-5 md:ml-6">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-green-700 shrink-0 w-20">সঠিক উত্তর:</span>
                        <span className="text-green-700 font-bold flex-1 leading-relaxed"><MarkdownRenderer content={q.answer} /></span>
                      </div>
                      {!isSkipped && !isCorrect && (
                        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-green-200/60">
                          <span className="font-bold text-slate-500 shrink-0 w-20">আপনার উত্তর:</span>
                          <span className="text-rose-500 font-bold flex-1 leading-relaxed"><MarkdownRenderer content={userAnswer} /></span>
                        </div>
                      )}
                    </div>
                  )}

                 {/* Explanation Box */}
{q.explanation && (
  <div className="mt-3 md:ml-6 bg-slate-50 p-4 md:p-6 rounded-xl border-l-4 border-green-600 text-sm shadow-sm">
    
    <div className="font-black text-green-700 mb-3 flex items-center gap-1.5 border-b border-green-200/60 pb-2.5">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      ব্যাখ্যা:
    </div> 
    
    {/* ✨ ম্যাজিক ক্লাস: মার্কডাউনের ভেতরের সব এলিমেন্টকে সুন্দর স্পেসিং এবং বর্ডার দেওয়ার জন্য */}
    <div className="leading-[1.8] text-[14px] md:text-[15px] text-slate-700 
      [&>p]:mb-4 last:[&>p]:mb-0 
      [&_table]:w-full [&_table]:mb-5 [&_table]:border-collapse [&_table]:bg-white [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:shadow-sm
      [&_th]:text-left [&_th]:p-3 [&_th]:border-b-2 [&_th]:border-green-200 [&_th]:bg-green-50 [&_th]:font-bold [&_th]:text-green-800
      [&_td]:p-3 [&_td]:border-b [&_td]:border-slate-100 [&_td]:align-top
      [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_li]:mb-1.5
      [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
      [&_strong]:text-slate-900 [&_strong]:font-black
      [&_h1]:font-black [&_h1]:text-lg [&_h1]:mb-3 [&_h1]:mt-5
      [&_h2]:font-bold [&_h2]:text-base [&_h2]:mb-2 [&_h2]:mt-4
      [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-3"
    >
      <MarkdownRenderer content={q.explanation} />
    </div>
    
  </div>
)}

                </div>
              );
            })}
          </div>
        
          {/* Bottom Button */}
          <div className="mt-8">
            <button 
              onClick={() => setCurrentPage("mixed-setup")} 
              className="w-full py-4 rounded-xl bg-green-600 text-white text-base font-black hover:bg-green-700 transition-all duration-300 shadow-lg shadow-green-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              আরও পরীক্ষা দিন
            </button>
          </div>

        </div>
      </div>
    );
  }








const timerDanger = timeLeft < 60;
  // বাংলা অপশন লেটার
  const optionLetters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];

  return (
    <div 
      className="pt-16 min-h-screen bg-[#F8F9FA] flex flex-col pb-12"
      style={{ fontFamily: "'Anek Bangla', sans-serif" }}
    >
      {/* ---------------- ফিক্সড হেডার: প্রগ্রেস এবং টাইমার ---------------- */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3 md:gap-4">
          
          {/* Topic Title */}
          <div className="flex-1 hidden sm:block font-black text-slate-700 truncate text-base">
            <span className="text-green-600 mr-1.5"></span>
          </div>
          
          {/* Timer */}
          <div className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-bold text-sm md:text-base border transition-colors ${
            timerDanger ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse" : "bg-green-50 text-green-700 border-green-100"
          }`}>
            ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          
          {/* Answered Count */}
          <div className="text-xs md:text-sm text-slate-600 font-bold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-green-600">{Object.keys(answers).length}</span> / {questions.length} <span className="hidden sm:inline">উত্তর দিয়েছেন</span>
          </div>
          
          {/* Submit Button (Header) */}
          <button 
            onClick={finishExam} 
            className="px-4 md:px-6 py-2 text-xs md:text-sm font-black bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition shadow-sm shadow-rose-200 active:scale-95"
          >
            জমা দিন
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 bg-slate-100 w-full">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 rounded-r-full" 
            style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* ---------------- মেইন কন্টেন্ট: প্রশ্ন তালিকা ---------------- */}
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="space-y-5">
          {questions.map((q: any, i: number) => {
            const hasAnswered = answers[i] !== undefined;

            return (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6 transition-all hover:shadow-md">
                
                {/* Question Top Bar (Q Number & Flag) */}
                <div className="flex items-center justify-between mb-5">
                  <span className="bg-green-50 border border-green-100 text-green-700 text-xs font-black px-3 py-1.5 rounded-lg">
                    প্রশ্ন {i + 1}
                  </span>
                  <button 
                    onClick={() => {
                      setFlagged((prev: Set<number>) => {
                        const next = new Set(prev);
                        next.has(i) ? next.delete(i) : next.add(i);
                        return next;
                      });
                    }} 
                    className={`text-xl transition-all p-1.5 rounded-lg hover:bg-slate-50 ${
                      flagged.has(i) ? "text-amber-500 scale-110" : "text-slate-300 hover:text-amber-400 grayscale hover:grayscale-0"
                    }`}
                    title="রিভিউয়ের জন্য মার্ক করুন"
                  >
                    🚩
                  </button>
                </div>

                {/* Question Text */}
                <div className="text-base ml-2 font-bold text-slate-700 mb-5 leading-relaxed">
                  <MarkdownRenderer content={q?.question} />
                </div>

                {/* Options List */}
                <div className="space-y-3 md:ml-2">
                  {q?.options?.map((opt: string, optIdx: number) => {
                    const isCorrect = opt === q.answer; // supabase e column name = answer
                    const isSelected = answers[i] === opt;

                    // ডিফল্ট স্টাইল
                    let optionBoxClass = "border-slate-200 bg-white text-slate-700 hover:border-green-300 hover:bg-green-50/30";
                    let circleClass = "bg-slate-50 border-slate-200 text-slate-500";
                    let iconRender: React.ReactNode = optionLetters[optIdx] || (optIdx + 1);

                    // উত্তর দেওয়ার পরের স্টাইল লজিক
                    if (hasAnswered) {
                      if (isSelected && isCorrect) {
                        optionBoxClass = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500 shadow-sm";
                        circleClass = "bg-green-600 border-green-600 text-white";
                        iconRender = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>;
                      } else if (isSelected && !isCorrect) {
                        optionBoxClass = "border-rose-400 bg-rose-50 text-rose-800 shadow-sm";
                        circleClass = "bg-rose-500 border-rose-500 text-white";
                        iconRender = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>;
                      } else if (isCorrect) {
                        optionBoxClass = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500 shadow-sm";
                        circleClass = "bg-green-600 border-green-600 text-white";
                        iconRender = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>;
                      } else {
                        // উত্তর দেওয়ার পর বাকি ভুল অপশনগুলো ফেড (Fade) হয়ে যাবে
                        optionBoxClass = "border-slate-100 bg-white text-slate-400 opacity-60";
                        circleClass = "bg-slate-50 border-slate-100 text-slate-400";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => setAnswers((prev) => ({ ...prev, [i]: opt }))} 
                        disabled={false} // disabled পরে লাগানো হলে delay হবে, এখন instant
                        className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition-all ${optionBoxClass}`}
                      >
                        {/* Option Circle (Letter or Icon) */}
                        <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold border shrink-0 transition-colors ${circleClass}`}>
                          {iconRender}
                        </div>

                        {/* Option Text */}
                        <div className={`flex-1 font-medium leading-relaxed ${hasAnswered && isCorrect ? "font-bold" : ""}`}>
                          <MarkdownRenderer content={opt} />
                        </div>
                        
                        {/* Right side checkmark for correct answer (Shows after answering) */}
                        {hasAnswered && isCorrect && (
                          <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        )}
                      </button>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>

        {/* ---------------- ফাইনাল সাবমিট বাটন (Bottom) ---------------- */}
        <div className="mt-6 mb-16">
          <button 
            onClick={finishExam} 
            className="w-full py-4 bg-green-600 text-white font-black rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-all duration-300 active:scale-[0.98] text-base flex items-center justify-center gap-2 group"
          >
            পরীক্ষা শেষ করুন
            <span className="text-xl group-hover:translate-x-1 transition-transform"></span>
          </button>
        </div>
      </div>
    </div>
  );



}