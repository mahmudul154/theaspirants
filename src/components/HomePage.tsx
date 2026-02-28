import { categories, examSets, leaderboard } from "../data/examData";


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
    <div className="pt-8 bg-gray-50 min-h-screen">
    {/* Premium Clean Dashboard Hero - Color Matched with Image */}
<section className="relative min-h-[90vh]  items-center bg-[#F9FAFB] overflow-hidden pt-20">
  
  {/* Abstract Background Elements with Theme Green */}
  <div className="absolute inset-0 z-0">
    {/* ইমেজের মতো বড় গ্রিন গ্লো */}
    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#22C55E]/10 rounded-full blur-[120px]"></div>
    <div className="absolute bottom-[0%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]"></div>
    
    {/* Subtle Grid Pattern for Dashboard Feel */}
    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#22C55E 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
  </div>

  <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col lg:flex-row items-center gap-16">
    
    {/* Left Content: Focus on Typography and Actions */}
    <div className="flex-1 text-center lg:text-left">
      <div className="inline-flex items-center gap-2 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#166534] text-[10px] font-black  tracking-[0.3em] px-4 py-2 rounded-full mb-4 backdrop-blur-sm">
        <span className
        Edtech="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span>
Edtech
      </div>
      
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-5 tracking-tighter">
        Crack Any<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-[#10B981]">
          Exams.
        </span>
      </h1>
      
      <p className="text-gray-500 text-lg mb-10 max-w-xl leading-relaxed font-medium">
        Practice with real exam questions and compete with thousands of aspirants across Bangladesh.
      </p>
      
      <div className=" flex-col sm:flex-row gap-5 justify-center lg:justify-start">
        <button
          onClick={() => setCurrentPage("exams")}
          className="group px-2 py-3 bg-[#22C55E] text-white font-black rounded-xl text-s tracking-widest hover:bg-[#16a34a] shadow-[0_20px_40px_-10px_rgba(34,197,94,0.3)] transition-all duration-300   justify-center gap-3 active:scale-95"
        >
          🚀 Start Practicing Free
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
        
       {/*} <button
          onClick={() => setCurrentPage("about")}
          className="px-2 py-3 bg-white border-2 border-gray-100 text-gray-700 font-black rounded-2xl text-xs uppercase tracking-widest hover: hover:text-[#22C55E] transition-all shadow-sm"
        >
          
        </button> */}
      </div>
    </div>

    {/* Right Visual: Professional Glass Dashboard Card */}
    <div className="flex-1 relative w-full max-w-[540px] group">
      {/* Dynamic Background Glow matched to image */}
      <div className="absolute inset-0 bg-[#22C55E]/20 blur-[80px] rounded-[3rem] group-hover:bg-[#22C55E]/30 transition-all duration-700 opacity-50"></div>
      
      <div className="relative bg-white border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] p-8 overflow-hidden">
        
        {/* Mockup Header - Dashboard Style */}
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#22C55E]/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
              🔥
            </div>
            <div>
              <p className="text-gray-900 font-black text-xl tracking-tight">Live Battle Arena</p>
              <p className="text-[#22C55E] text-[10px] font-black  tracking-widest mt-1">Active</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <div className="w-3 h-3 bg-red-500 rounded-full animate-ping mb-1"></div>
             <span className="text-[8px] font-black text-red-600 uppercase">Live Now</span>
          </div>
        </div>

        {/* Highlight Progress - Match Image Green */}
        <div className="mb-10 p-6 bg-[#F0FDF4] rounded-[2rem] border border-[#DCFCE7]">
          <div className="flex justify-between text-[10px] font-black text-[#166534] uppercase tracking-widest mb-4">
            <span>Platform Status</span>
            <span className="flex items-center gap-1">Verified <span className="text-[#22C55E]">●</span></span>
          </div>
          <div className="w-full bg-white rounded-full h-4 p-1 shadow-inner">
            <div className="bg-[#22C55E] h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(34,197,94,0.4)]" style={{ width: "100%" }}></div>
          </div>
        </div>

        {/* Stats Grid - Light Dashboard Style */}
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-6 text-center hover:bg-white hover:shadow-xl hover:border-[#22C55E]/20 transition-all group/stat">
            <p className="text-gray-900 font-black text-3xl tracking-tighter mb-1 group-hover/stat:text-[#22C55E] transition-colors">5000+</p>
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Questions</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-6 text-center shadow-xl group/stat">
            <p className="text-[#22C55E] font-black text-3xl tracking-tighter mb-1 group-hover/stat:scale-110 transition-transform">200+</p>
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Active Users</p>
          </div>
        </div>

        {/* Interactive Floating Badge */}
        <div className="absolute -bottom-4 -left-4 bg-white shadow-2xl rounded-2xl p-4 border border-gray-100 flex items-center gap-3 rotate-[-4deg] ">
           <div className="text-2xl">🏆</div>
           <div>
             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Top Scorer Today</p>
             <p className="text-[10px] font-bold text-gray-900">Ariful Islam • 98%</p>
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





     {/* Modern Compact Categories */}
<section className="py-12 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section Header */}
    <div className="flex items-center gap-3 mb-10 border-l-4 border-green-500 pl-4">
      <div>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase"></h2>
        <p className="text-xs text-gray-400 font-medium"></p>
      </div>
    </div>
    
    {/* Compact Grid */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCurrentPage("exams")}
          className="group relative flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-green-100 hover:bg-white hover:shadow-xl hover:shadow-green-500/5 hover:-translate-y-1.5 transition-all duration-300"
        >
          {/* Subtle Background Glow on Hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity"></div>

          {/* Icon Box with Dynamic Color Fallback */}
          <div 
            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-4 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110`}
            style={{ 
              background: cat.color?.startsWith('from-') 
                ? undefined // Tailwind class handle
                : `linear-gradient(135deg, ${cat.c1 || '#10b981'}, ${cat.c2 || '#059669'})`,
              color: 'white'
            }}
          >
            {/* If Tailwind classes are used in cat.color, apply them here */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.color || ''}`}></div>
            <span className="relative z-10">{cat.icon}</span>
          </div>
          
          {/* Label */}
          <span className="relative z-10 text-xs font-black text-gray-600 group-hover:text-green-600 uppercase tracking-widest transition-colors">
            {cat.label}
          </span>

          {/* Bottom Active Indicator */}
          <div className="absolute bottom-3 w-1 h-1 bg-green-500 rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
        </button>
      ))}
    </div>
  </div>
</section>







 {/* Unique Live Battle Arena Section with Functionality */}
<section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
      <div>
        <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] bg-red-50 px-3 py-1 rounded-full border border-red-100 mb-3 inline-block animate-pulse">Live Arena</span>
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Current <span className="italic">Challenges</span></h2>
      </div>
      <button onClick={() => setCurrentPage("exams")} className="h-12 px-6 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all active:scale-95 shadow-xl shadow-gray-200">
        View Full Arena →
      </button>
    </div>

    <div className="flex flex-col lg:flex-row gap-6">
      {/* 1. Feature Highlight Card - বড় কার্ডটি এখন ফাংশনাল */}
      <div 
        onClick={() => handleStartExam(examSets[0]?.id)} // প্রথম এক্সাম শুরু করবে
        className="lg:w-2/5 p-1 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-[3rem] shadow-2xl shadow-green-200 group cursor-pointer active:scale-[0.98] transition-all"
      >
        <div className="bg-gray-950 h-full w-full rounded-[2.8rem] p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500">🎯</div>
            <h3 className="text-3xl font-black text-white leading-tight">Today's Live <br/>Exam</h3>
            <p className="text-gray-400 text-sm mt-4 max-w-[200px] leading-relaxed">Give up to date model test everyday.</p>
          </div>
          
          <div className="relative z-10 w-full py-4 bg-green-500 text-white text-center font-black rounded-2xl text-xs uppercase tracking-widest group-hover:bg-white group-hover:text-green-600 transition-all mt-10">
            Start
          </div>
          
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* 2. Side Mini Cards - প্রতিটি কার্ড এখন ক্লিক করলে এক্সাম স্টার্ট হবে */}
      <div className="lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {examSets.slice(0, 4).map((exam) => (
          <div 
            key={exam.id} 
            onClick={() => handleStartExam(exam.id)} // এখানে ক্লিক অ্যাকশন যোগ করা হয়েছে
            className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col justify-between hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer active:scale-95"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl group-hover:rotate-6 transition-transform">
                {exam.icon}
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                <span className="text-[10px] font-black text-green-600 italic">Active</span>
              </div>
            </div>

            <h4 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-green-600 transition-colors">
              {exam.title}
            </h4>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50">
              <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase">
                <span>📝 {exam.questions} Q</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>⏱️ {exam.duration}m</span>
              </div>
              
              {/* ছোট একটি ইন্ডিকেটর বাটন */}
              <span className="text-[10px] font-black text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                START →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>


{/* Subject Selection Grid */}
<section className="py-12 bg-gray-50/50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
      <h2 className="text-xl font-bold text-gray-800 tracking-tighter ">Subjects</h2>
      
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[
        { id: "eng", label: "English", icon: "📒", c1: "#6366f1", c2: "#4f46e5" },
        { id: "bng", label: "Bangla", icon: "📓", c1: "#ef4444", c2: "#dc2626" },
        { id: "math", label: "Mathematics", icon: "📐", c1: "#f59e0b", c2: "#d97706" },
        { id: "sci", label: "Science", icon: "🧪", c1: "#10b981", c2: "#059669" },
        { id: "ict", label: "ICT", icon: "💻", c1: "#06b6d4", c2: "#0891b2" }
      ].map((sub) => (
        <button
          key={sub.id}
          onClick={() => {
            // আপনার ফিল্টার লজিক এখানে হবে
            setCurrentPage("exams");
          }}
          className="group relative flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left overflow-hidden"
        >
          {/* Background Decorative Shape */}
          <div 
            className="absolute -right-2 -bottom-2 w-12 h-12 opacity-10 group-hover:scale-150 transition-transform duration-500"
            style={{ backgroundColor: sub.c1, borderRadius: '50%' }}
          ></div>

          {/* Icon Box */}
          <div 
            className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-xl shadow-inner text-white"
            style={{ background: `linear-gradient(135deg, ${sub.c1}, ${sub.c2})` }}
          >
            {sub.icon}
          </div>

          {/* Subject Name */}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
              {sub.label}
            </span>
            <span className="text-[10px] text-gray-400 font-medium  tracking-tighter">
              Practice Now
            </span>
          </div>
        </button>
      ))}
    </div>
  </div>
</section>


      {/* Leaderboard Preview */}
      <section className="py-14 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tighter ">🏆 Top Aspirants</h2>
              <p className="text-gray-500 mt-1"></p>
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

{/* Unique Bento-Style Features Section with Integrated CTA */}
<section className="py-24 bg-[#FAFAFA] overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div className="mb-16">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Why <span className="italic">Aspirants?</span></h2>
    </div>

    {/* Bento Grid Layout */}
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      
      {/* --- CTA BANNER CARD (Integrated Uniquely) --- */}
      <div className="md:col-span-6 lg:col-span-4 p-12 bg-gradient-to-br from-green-600 to-emerald-800 rounded-[3.5rem] text-white relative overflow-hidden group shadow-2xl shadow-green-200 order-last lg:order-first">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">Ready to <br/>test your skills?</h2>
            <p className="text-green-100 mb-8 text-base md:text-lg max-w-md font-medium">
              Join <span className="text-yellow-400 font-black">200+ aspirants</span> who trust us for their victory.
            </p>
            <button
              onClick={() => setCurrentPage("signup")}
              className="px-8 py-4 bg-yellow-400 text-green-900 font-black rounded-2xl text-base hover:bg-white hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center gap-2 mx-auto md:mx-0"
            >
              🎓 Register Now – Free
            </button>
          </div>
          
          {/* Visual Element for CTA */}
          <div className="relative hidden md:block">
            <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm ">
              <span className="text-7xl">🏆</span>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white text-green-600 p-4 rounded-3xl shadow-xl font-black text-xl rotate-12">
              #200+ USERS
            </div>
          </div>
        </div>
      </div>

      {/* --- Other Feature Cards --- */}
       {/* Questions (Small Highlight Card) */}
      <div className="md:col-span-3 lg:col-span-2 p-8 bg-green-50 rounded-[3rem] flex flex-col justify-between border border-green-300 hover:bg-green-100/50 transition-colors">
        <h3 className="text-xl font-black text-green-800">5000+ <br />Verified Questions</h3>
        <div className="flex items-end justify-between">
           <p className="text-green-600/60 text-[10px] font-black tracking-tighter">HSC • BCS • BANK</p>
           <div className="text-4xl opacity-30">💡</div>
        </div>
      </div>
      
     {/* Analytics (Small White Card) */}
      <div className="md:col-span-3 lg:col-span-2 p-8 bg-gray-900 border border-gray-100 rounded-[3rem] shadow-sm hover:shadow-xl transition-all group">
        <div className="w-12 h-12 bg-blue-50 text-white- rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🕓</div>
        <h3 className="text-lg font-extrabold text-white">Timed Mock Test</h3>
        <p className="text-gray-500 text-[11px] leading-relaxed"></p>
      </div>


      {/* Analytics (Small White Card) */}
      <div className="md:col-span-3 lg:col-span-2 p-8 bg-white border border-gray-100 rounded-[3rem] shadow-sm hover:shadow-xl transition-all group">
        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">📈</div>
        <h3 className="text-lg font-extrabold text-gray-800">Smart Analytics</h3>
        <p className="text-gray-500 text-[11px]  leading-relaxed">Detailed subject-wise breakdown of your performance.</p>
      </div>

     

      {/* Mobile Ready (Long Card) */}
      <div className="md:col-span-3 lg:col-span-2 p-8 bg-white border border-gray-100 rounded-[3rem] flex items-center gap-5 shadow-sm hover:shadow-xl transition-all">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl">📱</div>
        <div>
          <h3 className="font-bold text-gray-800 leading-none">Mobile Ready</h3>
          <p className="text-gray-400 text-[11px] mt-1">Practice on any device.</p>
        </div>
      </div>

    </div>
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
            <img src="/logo.png" alt="" className="w-25 h-25 object-contain" /> 
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
