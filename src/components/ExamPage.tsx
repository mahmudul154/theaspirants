import { useState, useEffect, useCallback } from "react";
import { examSets, sampleQuestions } from "../data/examData";

interface ExamPageProps {
  examId: number;
  setCurrentPage: (page: string) => void;
}

export function ExamPage({ examId, setCurrentPage }: ExamPageProps) {
  const exam = examSets.find((e) => e.id === examId) || examSets[0];
  const questions = sampleQuestions;

  const [phase, setPhase] = useState<"intro" | "exam" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [showExplanation, setShowExplanation] = useState(false);

  const finishExam = useCallback(() => {
    setPhase("result");
  }, []);

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

  const handleAnswer = (optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [currentQ]: optIdx }));
    setShowExplanation(false);
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ)) next.delete(currentQ);
      else next.add(currentQ);
      return next;
    });
  };

  const score = questions.reduce((acc, q, i) => {
    return acc + (answers[i] === q.correct ? 1 : 0);
  }, 0);

  const percentage = Math.round((score / questions.length) * 100);

  if (phase === "intro") {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{exam.title}</h1>
          <p className="text-gray-500 mb-6">Read the instructions before starting</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: "Questions", value: questions.length, icon: "❓" },
              { label: "Duration", value: `${exam.duration} min`, icon: "⏱️" },
              { label: "Total Marks", value: questions.length, icon: "📊" },
              { label: "Difficulty", value: exam.difficulty, icon: "⚡" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-2xl p-4">
                <div className="text-xl mb-1">{item.icon}</div>
                <p className="text-xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
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
            <button
              onClick={() => setCurrentPage("exams")}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={() => setPhase("exam")}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:from-green-600 hover:to-emerald-700 shadow transition"
            >
              🚀 Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Score Card */}
          <div className={`rounded-3xl p-8 text-center text-white mb-6 shadow-xl ${
            percentage >= 70 ? "bg-gradient-to-br from-green-500 to-emerald-600"
            : percentage >= 50 ? "bg-gradient-to-br from-yellow-500 to-orange-500"
            : "bg-gradient-to-br from-red-500 to-rose-600"
          }`}>
            <div className="text-6xl mb-3">{percentage >= 70 ? "🏆" : percentage >= 50 ? "👍" : "📖"}</div>
            <h2 className="text-3xl font-extrabold mb-1">
              {percentage >= 70 ? "Excellent!" : percentage >= 50 ? "Good Job!" : "Keep Practicing!"}
            </h2>
            <p className="text-white/80 mb-6">Your exam has been submitted successfully</p>
            <div className="text-7xl font-extrabold mb-2">{percentage}%</div>
            <p className="text-white/80 text-lg">Score: {score} / {questions.length}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-extrabold text-green-600">{score}</p>
              <p className="text-xs text-gray-500 font-medium">Correct</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-extrabold text-red-500">{questions.length - score - (Object.keys(answers).length - Object.keys(answers).length)}</p>
              <p className="text-xs text-gray-500 font-medium">Wrong</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-extrabold text-gray-400">{questions.length - Object.keys(answers).length}</p>
              <p className="text-xs text-gray-500 font-medium">Skipped</p>
            </div>
          </div>

          {/* Answer Review */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">📋 Answer Review</h3>
            <div className="space-y-4">
              {questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correct;
                const isSkipped = userAnswer === undefined;
                return (
                  <div key={q.id} className={`p-4 rounded-xl border ${isSkipped ? "border-gray-200 bg-gray-50" : isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{isSkipped ? "⬜" : isCorrect ? "✅" : "❌"}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 mb-2">{i + 1}. {q.question}</p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Correct: </span>
                          <span className="text-green-700 font-semibold">{q.options[q.correct]}</span>
                          {!isSkipped && !isCorrect && (
                            <span className="ml-2 text-red-600">| Your answer: {q.options[userAnswer]}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 italic">💡 {q.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setPhase("intro"); setAnswers({}); setCurrentQ(0); setTimeLeft(exam.duration * 60); setFlagged(new Set()); }}
              className="flex-1 py-3 rounded-xl border-2 border-green-500 text-green-700 font-bold hover:bg-green-50 transition"
            >
              🔁 Retry Exam
            </button>
            <button
              onClick={() => setCurrentPage("exams")}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow hover:from-green-600 transition"
            >
              Browse Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const timerDanger = timeLeft < 60;
  const timerWarning = timeLeft < 300 && timeLeft >= 60;

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Exam Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-1 hidden sm:block">
            <p className="text-xs text-gray-500 font-medium truncate">{exam.title}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${timerDanger ? "bg-red-100 text-red-600 animate-pulse" : timerWarning ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-600 font-semibold">
            {currentQ + 1} / {questions.length}
          </div>
          <button
            onClick={finishExam}
            className="px-4 py-2 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
          >
            Submit
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        {/* Question Area */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Q{currentQ + 1}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{q.subject}</span>
              </div>
              <button
                onClick={toggleFlag}
                className={`text-xl transition ${flagged.has(currentQ) ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
                title="Flag for review"
              >
                🚩
              </button>
            </div>
            <p className="text-gray-900 font-semibold text-base md:text-lg mb-6 leading-relaxed">{q.question}</p>

            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const selected = answers[currentQ] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium text-sm md:text-base ${
                      selected
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-gray-200 hover:border-green-300 hover:bg-green-50/50 text-gray-700"
                    }`}
                  >
                    <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold mr-3 ${selected ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {answers[currentQ] !== undefined && (
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                💡 {showExplanation ? "Hide" : "Show"} Explanation
              </button>
            )}

            {showExplanation && (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                <p className="font-semibold mb-1">Explanation:</p>
                <p>{q.explanation}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => { setCurrentQ((q) => Math.max(0, q - 1)); setShowExplanation(false); }}
              disabled={currentQ === 0}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:border-green-400 hover:text-green-700 disabled:opacity-40 transition"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500">{Object.keys(answers).length} answered</span>
            {currentQ === questions.length - 1 ? (
              <button
                onClick={finishExam}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow hover:from-green-600 transition"
              >
                Submit Exam ✅
              </button>
            ) : (
              <button
                onClick={() => { setCurrentQ((q) => Math.min(questions.length - 1, q + 1)); setShowExplanation(false); }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow hover:from-green-600 transition"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Question Palette */}
        <div className="lg:w-60 xl:w-72">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-36">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Question Palette</h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((_, i) => {
                const answered = answers[i] !== undefined;
                const isFlagged = flagged.has(i);
                const isCurrent = i === currentQ;
                return (
                  <button
                    key={i}
                    onClick={() => { setCurrentQ(i); setShowExplanation(false); }}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border-2 ${
                      isCurrent ? "border-green-500 bg-green-500 text-white scale-110 shadow"
                      : isFlagged ? "border-yellow-400 bg-yellow-100 text-yellow-700"
                      : answered ? "border-green-400 bg-green-100 text-green-700"
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="space-y-1.5 text-xs font-medium text-gray-600">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400"></div> Answered</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-400"></div> Flagged</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-50 border-2 border-gray-200"></div> Not Visited</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
