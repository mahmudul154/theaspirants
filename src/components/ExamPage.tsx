import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase"; 
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ExamPageProps {
  examId: any; // অবজেক্ট সাপোর্ট করার জন্য any রাখা হয়েছে
  setCurrentPage: (page: string) => void;
}

const MarkdownRenderer = ({ content }: { content: string }) => (
  <ReactMarkdown 
    remarkPlugins={[remarkMath]} 
    rehypePlugins={[rehypeKatex]}
  >
    {content || ""}
  </ReactMarkdown>
);

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
    async function fetchQuestions() {
      if (!examId) return;
      setLoading(true);
      
      try {
        let query = supabase.from("mcq_questions_job").select("*");

        // ১. টাইপ চেকিং এবং ডাটা এক্সট্রাকশন
        const isMixed = typeof examId === 'object' && examId !== null && examId.type === 'mixed';
        
        if (isMixed) {
          const { category, subjects, topics, limit, time } = examId;
          const dbTag = category ;

          // কন্ডিশনাল ফিল্টারিং (টাইপ কাস্টিং সহ)
          if (topics && (topics as string[]).length > 0) {
            query = query.in("topic", topics);
          } else if (subjects && (subjects as string[]).length > 0) {
            query = query.in("subject", subjects);
          }

          query = query.eq("exam_tag", dbTag);

          const { data, error } = await query;
          if (error) throw error;

          if (data && data.length > 0) {
            const shuffled = [...data].sort(() => Math.random() - 0.5);
            setQuestions(shuffled.slice(0, limit || 25));
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
          if (data) {
            setQuestions(data);
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
    const displayName = q.sub_topic || q.topic || "অন্যান্য";
    
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
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h1 className="text-xl font-extrabold text-gray-900 mb-2 uppercase">{displayTitle} Exam</h1>
          <p className="text-gray-500 mb-6">Read the instructions before starting</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xl mb-1">❓</div>
              <p className="text-xl font-bold text-gray-900">{questions.length}</p>
              <p className="text-xs text-gray-500">Questions</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xl mb-1">⏱️</div>
              <p className="text-xl font-bold text-gray-900">{Math.floor(timeLeft / 60)} min</p>
              <p className="text-xs text-gray-500">Duration</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xl mb-1">📊</div>
              <p className="text-xl font-bold text-gray-900">{questions.length}</p>
              <p className="text-xs text-gray-500">Total Marks</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xl mb-1">⚡</div>
              <p className="text-xl font-bold text-gray-900">Standard</p>
              <p className="text-xs text-gray-500">Difficulty</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm font-bold text-amber-800 mb-2">📌 Instructions:</p>
            <ul className="text-sm text-amber-700 space-y-1 list-disc pl-4">
              <li>Each correct answer = +1 mark</li>
              <li>Wrong answer = -0.5 mark (negative marking)</li>
              <li>You can flag questions to revisit later</li>
              <li>Timer starts immediately after clicking Start</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setCurrentPage("home")} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition">Back</button>
            <button onClick={() => setPhase("exam")} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:from-green-600 hover:to-emerald-700 shadow transition">🚀 Start</button>
          </div>
        </div>
      </div>
    );
  }







  // --- --------------------------------------------------------------------------------Result View ---
  if (phase === "result") {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className={`rounded-3xl p-8 text-center text-white mb-6 shadow-xl ${
            percentage >= 70 ? "bg-gradient-to-br from-green-500 to-emerald-600"
            : percentage >= 50 ? "bg-gradient-to-br from-yellow-500 to-orange-500"
            : "bg-gradient-to-br from-red-500 to-rose-600"
          }`}>
            <div className="text-6xl mb-3">{percentage >= 70 ? "🏆" : percentage >= 50 ? "👍" : "📖"}</div>
            <h2 className="text-3xl font-extrabold mb-1">{percentage >= 70 ? "Excellent!" : percentage >= 50 ? "Good Job!" : "Keep Practicing!"}</h2>
            <div className="text-7xl font-extrabold mb-2">{percentage}%</div>
            <p className="text-white/80 text-lg">Score: {totalScore} / {questions.length}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-extrabold text-green-600">{correct}</p>
              <p className="text-xs text-gray-500 font-medium">Correct</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-extrabold text-red-500">{wrong}</p>
              <p className="text-xs text-gray-500 font-medium">Wrong</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-extrabold text-gray-400">{questions.length - Object.keys(answers).length}</p>
              <p className="text-xs text-gray-500 font-medium">Skipped</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">📋 Answer Review</h3>
            <div className="space-y-4">
              {questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.answer;
                const isSkipped = userAnswer === undefined;
                return (
                  <div key={q.id} className={`p-4 rounded-xl border ${isSkipped ? "border-gray-200 bg-gray-50" : isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{isSkipped ? "⬜" : isCorrect ? "✅" : "❌"}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900 mb-2">{i + 1}. <MarkdownRenderer content={q.question} /></div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Correct: </span>
                          <span className="text-green-700 font-semibold inline-block"><MarkdownRenderer content={q.answer} /></span>
                          {!isSkipped && !isCorrect && (
                            <div className="mt-1 text-red-600">| Your answer: <MarkdownRenderer content={userAnswer} /></div>
                          )}
                        </div>
                        {q.explanation && (
                          <div className="text-xs text-gray-500 mt-2 italic border-t pt-2 border-gray-100">
                            💡 <strong>Explanation:</strong> <MarkdownRenderer content={q.explanation} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* --- Result View এর গ্রিড বক্সগুলোর ঠিক নিচে এই ব্লকটি বসান --- */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
  <h3 className="font-bold text-gray-900 text-lg mb-4 text-left">🎯 বিষয়ভিত্তিক পারফরম্যান্স</h3>
  <div className="space-y-4 text-left">
    {Object.entries(subTopicAnalysis || {}).map(([name, stat]: any) => {
      const per = Math.round((stat.correct / stat.total) * 100);
      return (
        <div key={name}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-gray-700">{name}</span>
            <span className="text-gray-500 font-bold">{stat.correct}/{stat.total}</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${
                per < 50 ? 'bg-red-500' : 
                per < 80 ? 'bg-amber-400' : 
                'bg-emerald-500'
              }`} 
              style={{ width: `${per}%` }}
            />
          </div>
        </div>
      );
    })}
  </div>
</div>
          <button onClick={() => setCurrentPage("home")} className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow hover:from-green-600 transition">Browse Exams</button>
        </div>
      </div>
    );
  }










  // --- --------------------------------------------------------------------Exam View ---
  const q = questions[currentQ];
  const timerDanger = timeLeft < 60;

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-1 hidden sm:block font-bold text-gray-600 uppercase">{displayTitle}</div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${timerDanger ? "bg-red-100 text-red-600 animate-pulse" : "bg-green-100 text-green-700"}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-600 font-semibold">{currentQ + 1} / {questions.length}</div>
          <button onClick={finishExam} className="px-4 py-2 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 transition">Submit</button>
        </div>
        <div className="h-1.5 bg-gray-100">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Q{currentQ + 1}</span>
              <button onClick={toggleFlag} className={`text-xl transition ${flagged.has(currentQ) ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}>🚩</button>
            </div>
            <div className="text-gray-900 font-semibold text-base md:text-lg mb-6 leading-relaxed">
              <MarkdownRenderer content={q?.question} />
            </div>
            <div className="space-y-3">
              {q?.options?.map((opt: string, i: number) => (
                <button key={i} onClick={() => handleAnswer(opt)} className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium text-sm md:text-base flex items-start ${answers[currentQ] === opt ? "border-green-500 bg-green-50 text-green-800" : "border-gray-200 hover:border-green-300 hover:bg-green-50/50 text-gray-700"}`}>
                  <span className={`flex-shrink-0 inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold mr-3 mt-0.5 ${answers[currentQ] === opt ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"}`}>{String.fromCharCode(65 + i)}</span>
                  <div className="flex-1 overflow-hidden"><MarkdownRenderer content={opt} /></div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button onClick={() => setCurrentQ((q) => Math.max(0, q - 1))} disabled={currentQ === 0} className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:border-green-400 hover:text-green-700 disabled:opacity-40 transition">← Previous</button>
            <span className="text-sm text-gray-500">{Object.keys(answers).length} answered</span>
            <button onClick={() => currentQ === questions.length - 1 ? finishExam() : setCurrentQ(q => q + 1)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow hover:from-green-600 transition">
              {currentQ === questions.length - 1 ? "Submit →" : "Next →"}
            </button>
          </div>
        </div>

        <div className="lg:w-60 xl:w-72">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-36">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Question Palette</h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQ(i)} className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border-2 ${currentQ === i ? "border-green-500 bg-green-500 text-white scale-110 shadow" : flagged.has(i) ? "border-yellow-400 bg-yellow-100 text-yellow-700" : answers[i] ? "border-green-400 bg-green-100 text-green-700" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-400"}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ); 
}