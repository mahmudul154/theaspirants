import { useState } from "react";
import { categories, examSets } from "../data/examData";

interface ExamsPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedExam: (id: number) => void;
}

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

export function ExamsPage({ setCurrentPage, setSelectedExam }: ExamsPageProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");

  const filtered = examSets.filter((e) => {
    const catMatch = activeCategory === "all" || e.category === activeCategory;
    const searchMatch = e.title.toLowerCase().includes(search.toLowerCase());
    const diffMatch = difficulty === "all" || e.difficulty === difficulty;
    return catMatch && searchMatch && diffMatch;
  });

  const handleStartExam = (id: number) => {
    setSelectedExam(id);
    setCurrentPage("exam");
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-700 to-emerald-700 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold text-white mb-2">📋 Exam Sets</h1>
          <p className="text-green-100 mb-6">Browse and practice from our comprehensive exam library</p>
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              <input
                type="text"
                placeholder="Search exam sets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-xl text-gray-900 text-sm shadow focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-4 py-3 bg-white rounded-xl text-sm text-gray-700 shadow focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="all">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeCategory === "all" ? "bg-green-600 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-green-300"}`}
          >
            All Exams
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${activeCategory === cat.id ? "bg-green-600 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-green-300"}`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-gray-500 text-sm mb-5">Showing <span className="font-bold text-gray-800">{filtered.length}</span> exam sets</p>

        {/* Exam Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-gray-500 font-medium">No exams found for your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((exam) => {
              const cat = categories.find((c) => c.id === exam.category);
              return (
                <div
                  key={exam.id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col overflow-hidden"
                >
                  <div className={`h-2 bg-gradient-to-r ${cat?.color}`}></div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{cat?.icon}</span>
                      {exam.tag && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          exam.tag === "Popular" ? "bg-green-100 text-green-700" :
                          exam.tag === "Trending" ? "bg-orange-100 text-orange-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {exam.tag}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-3 leading-snug">{exam.title}</h3>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-gray-800">{exam.questions}</p>
                        <p className="text-xs text-gray-400">Questions</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-gray-800">{exam.duration}</p>
                        <p className="text-xs text-gray-400">Minutes</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${difficultyColor[exam.difficulty]}`}>
                        {exam.difficulty}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <span>⭐</span>
                        <span className="font-semibold text-gray-700">{exam.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-4">👥 {exam.attempts.toLocaleString()} attempts</p>

                    <button
                      onClick={() => handleStartExam(exam.id)}
                      className="mt-auto w-20 justify-right py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-500 hover:to-emerald-700 transition shadow"
                    >
                      Start→
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
