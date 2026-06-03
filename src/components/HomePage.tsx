import { categories, examSets, leaderboard } from "../data/examData";
import { supabase } from "../lib/supabase"; // 'supabaseClient' এর বদলে শুধু 'supabase' লিখুন
import { useNavigate } from 'react-router-dom';




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
    
    <div className="pt-8 bg-gray-50 min-h-screen"
        style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
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
     
      
      <h1 className="text-4xl md:text-6xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-5 ">
         চাকরির পরীক্ষায় <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-[#10B981]">
       নিশ্চিত  সাফল্য
        </span>
      </h1>
      
      <p className="text-gray-500 text-sm mb-10 max-w-xl leading-relaxed font-medium">
  ১.৫ লাখ+ প্রশ্নের বিশাল ডাটাবেজ থেকে দিন আনলিমিটেড কাস্টম কুইজ। বিসিএস ও ব্যাংকের সেরা প্রস্তুতিতে হাজারো পরীক্ষার্থীর মাঝে এগিয়ে থাকুন।

      </p>
      
      <div className=" flex-col sm:flex-row gap-5 justify-center lg:justify-start">
        <button
          onClick={() => setCurrentPage("mixed-setup")}
          className="group px-2 py-3 bg-[#22C55E] text-white font-black rounded-xl text-s t hover:bg-[#16a34a] shadow-[0_20px_40px_-10px_rgba(34,197,94,0.3)] transition-all duration-300   justify-center gap-3 active:scale-95"
        >
          অনুশীলন করুন
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
              <p className="text-gray-900 font-black text-xl tracking-tight">লাইভ পরীক্ষা</p>
              <p className="text-[#22C55E] text-[10px] font-black  tracking-widest mt-1">Active</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <div className="w-3 h-3 bg-red-500 rounded-full animate-ping mb-1"></div>
             <span className="text-[8px] font-black text-red-600 uppercase">লাইভ</span>
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
            <p className="text-gray-900 font-black text-3xl tracking-tighter mb-1 group-hover/stat:text-[#22C55E] transition-colors">১.৫ লাখ+</p>
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Questions</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-6 text-center shadow-xl group/stat">
            <p className="text-[#22C55E] font-black text-3xl tracking-tighter mb-1 group-hover/stat:scale-110 transition-transform">২ লাখ+</p>
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Active Users</p>
          </div>
        </div>

        {/* Interactive Floating Badge */}
        <div className="absolute -bottom-4 -left-4 bg-white shadow-2xl rounded-2xl p-4 border border-gray-100 flex items-center gap-3 rotate-[-4deg] ">
           <div className="text-2xl">🏆</div>
           <div>
             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">আজকের সেরা স্কোরার</p>
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





     {/*-------------------------------------------------------------------------- Modern Compact Categories ------------------------------------------------------------------*/}
   {/*<section className="py-12 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  
    <div className="flex items-center gap-3 mb-10 border-l-4 border-green-500 pl-4">
      <div>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase"></h2>
        <p className="text-xs text-gray-400 font-medium"></p>
      </div>
    </div>
    
    
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCurrentPage("exams")}
          className="group relative flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-green-100 hover:bg-white hover:shadow-xl hover:shadow-green-500/5 hover:-translate-y-1.5 transition-all duration-300"
        >
        
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity"></div>

        
          <div 
            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-4 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110`}
            style={{ 
              background: cat.color?.startsWith('from-') 
                ? undefined // Tailwind class handle
                : `linear-gradient(135deg, ${cat.c1 || '#10b981'}, ${cat.c2 || '#059669'})`,
              color: 'white'
            }}
          >
          
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.color || ''}`}></div>
            <span className="relative z-10">{cat.icon}</span>
          </div>
          
        
          <span className="relative z-10 text-xs font-black text-gray-600 group-hover:text-green-600 uppercase tracking-widest transition-colors">
            {cat.label}
          </span>

          
          <div className="absolute bottom-3 w-1 h-1 bg-green-500 rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
        </button>
      ))}
    </div>
  </div>
</section>  */}










 {/* ------------------------------------------------------------------------Unique Live Battle Arena Section with Functionality ----------------------------------------------*/}
<section className="py-20 bg-white"
    style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex flex-col ml-6 md:flex-row md:items-end justify-between mb-12 gap-4">
      <div>
        <span className="text-red-600 font-black text-[10px] uppercase  bg-red-50 px-3 py-1 rounded-full border border-red-100 mb-3 inline-block animate-pulse">লাইভ এরিনা</span>
        <h2 className="text-xl font-black text-green-800">চলমান<span className=""> পরীক্ষা</span></h2>
      </div>
      <button 
        onClick={() => setCurrentPage("exams")} 
        className="h-12 px-6 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all active:scale-95 shadow-xl shadow-gray-200"
      >
       সম্পূর্ণ দেখুন → 
      </button>
    </div>

    <div className="flex flex-col lg:flex-row gap-6">
      {/* 1. Feature Highlight Card - Today's Live Exam */}
      <div 
        onClick={() => examSets[0] && handleStartExam(examSets[0].category)} 
        className="lg:w-2/5 p-1 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-[3rem] shadow-2xl shadow-green-200 group cursor-pointer active:scale-[0.98] transition-all"
      >
        <div className="bg-gray-950 h-full w-full rounded-[2.8rem] p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500">🎯</div>
            <h3 className="text-3xl font-black text-white leading-tight">আজকের লাইভ <br/>পরীক্ষা</h3>
            <p className="text-gray-400 text-sm mt-4 max-w-[200px] leading-relaxed">প্রতিদিন অংশ নিন একদম সাম্প্রতিক মডেল টেস্টে।</p>
          </div>
          
          <div className="relative z-10 w-full py-4 bg-green-500 text-white text-center font-black rounded-2xl text-xs uppercase tracking-widest group-hover:bg-white group-hover:text-green-600 transition-all mt-10">
            {examSets[0] ? `Start ${examSets[0].category.toUpperCase()}` : "Loading..."}
          </div>
          
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* 2. Side Mini Cards */}
      <div className="lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Optional Chaining ব্যবহার করা হয়েছে যাতে ডাটা না থাকলে Blank না আসে */}
        {(examSets || []).slice(0, 4).map((exam) => (
          <div 
            key={exam.id} 
            onClick={() => handleStartExam(exam.category)} 
            className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col justify-between hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer active:scale-95"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl group-hover:rotate-6 transition-transform">
                {exam.icon}
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                <span className="text-[10px] font-black text-green-600 italic"></span>
              </div>
            </div>

            <h4 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-green-600 transition-colors">
              {exam.title}
            </h4>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50">
              <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase">
                <span>📝 {exam.questions} প্রশ্ন</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>⏱️ {exam.duration} মিনিট</span>
              </div>
              
              <span className="text-[10px] font-black text-green-500 opacity- group-hover:opacity-100 transition-opacity">
                  🚀 অনুশীলন করুন →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>






{/* ------------------------------------------------------------------------Custom Quiz Section - Compact Green Bento----------------------------------------------------- */}


<section className="mt-8 px-6"> {/* ml-6 সরিয়ে px-6 দেওয়া হয়েছে ব্যালেন্স ঠিক করতে */}
  <div className="flex items-center justify-between mb-4">
     <button 
      onClick={(e) => {
        e.stopPropagation();
        setCurrentPage("mixed-setup");
      }}
              className="px-4 py-2 rounded-lg text-lg font-bold text-orange-600 bg-orange-50 transition-all flex items-center gap-1.5 group"
            >
              <span className="group-hover:animate-bounce">🛠</span>
             কাস্টম কুইজ
            </button>
    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full">
     জনপ্রিয় ফিচার
    </span>
  </div>

  {/* গ্রিড কন্টেইনার */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-auto md:h-[300px]">
    
{/* Large Card: Mixed Subject Exam */}
<div 
  onClick={() => {
    console.log("Click working!"); // চেক করার জন্য
    setCurrentPage("mixed-setup");
  }}
  className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-green-600 to-emerald-800 rounded-[1.5rem] p-6 text-white relative overflow-hidden group cursor-pointer shadow-lg"
>
  <div className="relative z-10 h-full flex flex-col justify-between">
    <div>
      <div className="bg-white/20 w-fit px-2 py-1 rounded-lg text-[10px] mb-2 font-bold backdrop-blur-md">
        RECOMMENDED
      </div>
      <h3 className="text-2xl font-black mb-1 leading-tight">বিষয়ভিত্তিক ম্যারাথন <br/> </h3>
      <p className="text-green-50 text-[12px] mb-4 max-w-[200px] opacity-90">
     একাধিক বিষয় নিয়ে তৈরি করুন আপনার নিজের পরীক্ষা।
      </p>
    </div>
    <button 
      onClick={(e) => {
        e.stopPropagation();
        setCurrentPage("mixed-setup");
      }}
      className="bg-white text-green-700 font-bold text-sm py-2 px-5 rounded-xl w-fit group-hover:scale-105 transition-transform shadow-md"
    >
     🛠 তৈরি করুন
    </button>
  </div>

  
  {/* Background Icon */}
  <div className="absolute right-[-15px] bottom-[-15px] opacity-10 group-hover:rotate-12 transition-transform">
    <svg width="140" height="140" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  </div>
</div>

    {/* Small Card 1: Quick Practice */}
    <div className="bg-white border-2 border-gray-50 rounded-[1.5rem] p-4 hover:border-green-500 transition-all cursor-pointer group shadow-sm flex flex-col justify-center">
      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <span className="text-xl">⚡</span>
      </div>
      <h4 className="text-md font-bold text-gray-800 leading-none">ঝটপট প্রস্তুতি</h4>
      <p className="text-gray-400 text-[10px] mt-1 ">১০ মিনিটের দ্রুত প্রস্তুতি।</p>
    </div>

    {/* Small Card 2: Weak Topics */}
    <div className="bg-white border-2 border-gray-50 rounded-[1.5rem] p-4 hover:border-emerald-500 transition-all cursor-pointer group shadow-sm flex flex-col justify-center">
      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <span className="text-xl">🎯</span>
      </div>
      <h4 className="text-md font-bold text-gray-800 leading-none">Weak Points</h4>
      <p className="text-gray-400 text-[10px] mt-1 ">ভুলগুলো পর্যালোচনা করুন।</p>
    </div>

  </div>
</section>










{/* Subject Selection Grid */}
<section className="py-12 bg-gray-50/50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
      <h2 className="text-xl font-bold text-gray-800 tracking-tighter ">বিষয়সমূহ</h2>
      
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
         🚀 অনুশীলন করুন →
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
              <h2 className="text-xl font-bold text-gray-900  ">🏆সেরা চাকরিপ্রার্থী</h2>
              <p className="text-gray-500 mt-1"></p>
            </div>
            <button onClick={() => setCurrentPage("leaderboard")} className="text-green-600 font-semibold text-sm hover:text-green-700">  সম্পূর্ণ দেখুন →</button>
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
                  <p className="text-xs text-gray-400">{user.exams} পরীক্ষা সম্পন্ন করেছে</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-green-600 text-lg">{user.score}%</p>
                  <p className="text-xs text-gray-400">গড় নম্বর</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

<section className="py-24 bg-[#FAFAFA] overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div className="mb-16">
        {/* উপরের হেডিং (যদি থাকে) */}
        <h2 className="text-3xl font-black text-green-800 tracking-tighter"></h2>
    </div>

    {/* Main Green Panel */}
    <div className="w-full bg-gradient-to-br from-green-600 to-emerald-800 rounded-[3.5rem] text-white relative shadow-2xl shadow-green-200">
  
      {/* Background Glow/Decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-10 py-12 md:py-0 md:pl-16 min-h-[400px]">
        
        {/* Left Side: Text Content */}
        <div className="text-center md:text-left flex-1 md:py-16">
          <h2 className="text-3xl md:text-[2.75rem] font-black mb-6 leading-[1.3]">
            নিজেকে যাচাই করার<br/> জন্য আপনি কি প্রস্তুত?
          </h2>
          <p className="text-green-100 mb-10 text-base md:text-lg max-w-md font-medium leading-relaxed">
            <span className="text-yellow-400 font-black">২ লাখেরও </span> বেশি পরীক্ষার্থীর বিশ্বস্ত এই প্ল্যাটফর্মে আজই যুক্ত হোন আপনার বিজয়ের যাত্রায়।
          </p>
          <button
            // onClick={() => setCurrentPage("signup")} // আপনার প্রয়োজন অনুযায়ী আনকমেন্ট করুন
            className="px-8 py-4 bg-yellow-400 text-green-900 font-black rounded-2xl text-base hover:bg-white hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 mx-auto md:mx-0 w-full md:w-auto"
          >
            🎓 বিনামূল্যে এখনই যুক্ত হোন ➝
          </button>
        </div>
        
        {/* Right Side: Boy Image & Floating Elements */}
        <div className="relative hidden md:flex flex-1 justify-end items-end w-full h-full pt-6 pr-10">
          
          {/* Floating Stars 
          <div className="absolute top-1/4 left-10 animate-pulse">
            <span className="text-white text-2xl">✦</span>
          </div>
          <div className="absolute bottom-1/3 right-1/4 animate-bounce delay-75">
            <span className="text-yellow-400 text-xl">✦</span>
          </div>*/}

          {/* Boy Image */}
          {/* নিচের src তে আপনার ট্রান্সপারেন্ট ছবির লিংক দেবেন */}
          <img 
            src="/poster2.png" 
            alt="Student with mobile" 
            className="w-[85%] max-w-[380px] object-contain drop-shadow-2xl translate-y-2 relative z-20"
          />
        </div>
        
      </div>
    </div>

  </div>
</section>




      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 md:grid-cols-4 gap-8 mb-8">
             <button
            onClick={() => setCurrentPage("home")}
            className="flex items-center gap-2 cursor-pointer mb-28"
          >
            <img src="/logo.png" alt="" className="w-5 h-7 object-contain " />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-extrabold text-gray-400 tracking-tight">
                Aspirants
              </span>
            </div>
          </button>
            {[
              { title: "", links: ["বিসিএস", "ব্যাংক"] },
             
              { title: "", links: ["আমাদের সম্পর্কে", "ব্লগ", "প্রাইভেসি পলিসি", "যোগাযোগ"] },
             { 
    title: "", 
    links: [
      // Facebook SVG
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
      
      // YouTube SVG
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>,
      
      // LinkedIn SVG
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
      
      // Telegram SVG
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    ] 
  },

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
