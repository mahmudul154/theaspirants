import { categories, examSets, stats, leaderboard } from "../data/examData";

interface HomePageProps {
  setCurrentPage: (page: string) => void;
  setSelectedExam: (id: number) => void;
}

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

export function HomePage({ setCurrentPage, setSelectedExam }: HomePageProps) {
  const handleStartExam = (id: number) => {
    setSelectedExam(id);
    setCurrentPage("exam");
  };

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-700 via-emerald-700 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-80 h-80 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5 backdrop-blur">
              Competitive Exam Preparaion Platform
            </div>
            <h1 className="text-4xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
              Crack Government <br />
              <span className="text-yellow-300">Competitive Exams .</span>
            </h1>
            <p className="text-green-100 text-lg mb-6 max-w-xl">
              Practice with real exam questions, track your progress, and compete with thousands of aspirants across Bangladesh.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => setCurrentPage("exams")}
                className="px-4 py-3.5 bg-yellow-400 text-green-900 font-bold rounded-xl hover:bg-yellow-300 shadow-lg transition text-base"
              >
                🚀 Start Practicing Free
              </button>
              <button
                onClick={() => setCurrentPage("about")}
                className="px-4 py-3.5 bg-white/15 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/25 transition text-base backdrop-blur"
              >
                Learn More
              </button>
            </div>
          </div>
          {/* Hero Visual */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-92 h-92">
              <div className="absolute inset-0 bg-white/10 rounded-3xl border border-white/20 backdrop-blur flex flex-col justify-center items-center gap-4 p-6">
                <div className="text-5xl">📝</div>
                <div className="text-center">
                  <p className="text-white font-bold text-xl">Live Exam</p>
                  <p className="text-green-200 text-sm">HSC- Admission- BCS</p>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "100%" }}></div>
                </div>
                <p className="text-white text-sm font-semibold"></p>
                <div className="grid grid-cols-2 gap-3 w-full mt-2">
                  <div className="bg-white/15 rounded-xl p-3 text-center">
                    <p className="text-yellow-300 font-bold text-xl">5000+</p>
                    <p className="text-green-200 text-xs">Questions</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 text-center">
                    <p className="text-yellow-300 font-bold text-xl">200+</p>
                    <p className="text-green-200 text-xs">Users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
       {/*<section className="py-10 bg-white ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl mb-1">{s.icon}</div>
                <p className="text-2xl font-extrabold text-gray-700">{s.value}</p>
                <p className="text-sm text-gray-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Categories */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-700 mb-2">Exam Categories</h2>
            <p className="text-gray-500 text-base">Choose your target exam and start practicing today</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCurrentPage("exams")}
                className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-green-700 transition-colors">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Exams */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-700">Live Exam</h2>
              <p className="text-gray-500 mt-1">Most attempted by aspirants this week</p>
            </div>
            <button onClick={() => setCurrentPage("exams")} className="text-green-600 font-semibold text-sm hover:text-green-700 flex items-center gap-1">
              View All <span>→</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {examSets.slice(0, 8).map((exam) => {
              const cat = categories.find((c) => c.id === exam.category);
              return (
                <div
                  key={exam.id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col overflow-hidden"
                >
                  <div className={`h-2 bg-gradient-to-r ${cat?.color}`}></div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xl">{cat?.icon}</span>
                      <div className="flex items-center gap-1">
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
                    </div>
                    <h3 className="font-bold text-gray-700 text-sm mb-3 leading-snug">{exam.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span>📋 {exam.questions} Q</span>
                      <span>⏱️ {exam.duration} min</span>
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${difficultyColor[exam.difficulty]}`}>{exam.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <span>👥 {exam.attempts.toLocaleString()} attempts</span>
                      <span>⭐ {exam.rating}</span>
                    </div>
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
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-14 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">🏆 Top Aspirants</h2>
              <p className="text-gray-500 mt-1">This month's leaders</p>
            </div>
            <button onClick={() => setCurrentPage("leaderboard")} className="text-green-600 font-semibold text-sm hover:text-green-700">View All →</button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {leaderboard.map((user, i) => (
              <div
                key={user.rank}
                className={`flex items-center gap-4 px-6 py-4 ${i !== leaderboard.length - 1 ? "border-b border-gray-50" : ""} ${i < 3 ? "bg-gradient-to-r from-yellow-50 to-white" : ""}`}
              >
                <span className="text-2xl w-8">{user.badge}</span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.exams} exams completed</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-green-600 text-lg">{user.score}%</p>
                  <p className="text-xs text-gray-400">avg score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Why Aspirants?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Everything you need to prepare for Bangladesh government exams</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📚", title: "5000+ Questions", desc: "Curated from previous HSC, BCS, Bank, NTRCA and other govt exams." },
              { icon: "⏱️", title: "Timed Mock Tests", desc: "Simulate real exam conditions with countdown timer and auto-submit." },
              { icon: "📊", title: "Detailed Analytics", desc: "Track your progress with subject-wise performance breakdown." },
              { icon: "💡", title: "Smart Explanations", desc: "Every question comes with detailed explanation and reference." },
              { icon: "🏆", title: "Live Leaderboard", desc: "Compete with thousands of aspirants and rank yourself nationally." },
              { icon: "📱", title: "Mobile Friendly", desc: "Practice anytime, anywhere from your phone or tablet." },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/40 transition">
                <div className="text-3xl flex-shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to test yourself throug unlimited questions??</h2>
          <p className="text-green-100 mb-8 text-lg">Join 200+ aspirants who trust Aspirants for their exam preparation.</p>
          <button
            onClick={() => setCurrentPage("signup")}
            className="px-10 py-4 bg-yellow-400 text-green-900 font-extrabold rounded-2xl text-lg hover:bg-yellow-300 shadow-xl transition"
          >
            🎓 Register Now – It's Free!
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <button
            onClick={() => setCurrentPage("home")}
            className="flex items-center gap-2 cursor-pointer"
          >
           {/* <img src="/logo.png" alt="" className="w-30 h-30 object-contain" /> */}
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-extrabold text-white tracking-tight">
                
              </span>
              <span className="text-[10px] text-green-600 font-semibold tracking-wider uppercase">
              </span>
            </div>
          </button>
            {[
              { title: "Exams", links: ["HSC","BCS", "Bank Jobs", "NTRCA", "Primary", "Defense"] },
              { title: "Resources", links: ["Question Bank", "Previous Papers", "Study Notes", "Live Tests"] },
              { title: "Company", links: ["About Us", "Blog", "Privacy Policy", "Contact"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-sm hover:text-green-400 transition">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-600">
           
          </div>
        </div>
      </footer>
    </div>
  );
}
