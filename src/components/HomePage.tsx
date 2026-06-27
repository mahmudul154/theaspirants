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
    
    <div className="pt-8 bg-gray-50 min-h-screen -mt-6"
        style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
    {/* Premium Clean Dashboard Hero - Color Matched with Image */}
<section className="relative min-h-[85vh] flex items-center bg-white overflow-hidden py-">
  {/* ব্যাকগ্রাউন্ড ডেকোরেশন */}
  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-50 rounded-full blur-[120px] -mr-20 -mt-20"></div>

  <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
    
    {/* Left Side: Modern Text Content */}
    <div className="flex-1 space-y-8 text-center mt-8 lg:text-left">
     
      
      <h1 className="text-4xl md:text-5xl font-black text-gray-800 leading-[1.05]">
       চাকরির পরীক্ষায়  <br/>
        <span className="text-green-600"> নিশ্চিত  সাফল্য</span>
      </h1>
      
      <p className="text-gray-600 text-sm max-w-lg mx-auto lg:mx-0 leading-relaxed">
        বিসিএস ও ব্যাংক জবের হাজারো প্রশ্নের সমাধানে তৈরি করুন নিজের কাস্টম কুইজ। বিশ্লেষণ করুন আপনার দুর্বলতা এবং এগিয়ে থাকুন প্রতিযোগিতায়।
      </p>

      <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
        <button 
          onClick={() => setCurrentPage("mixed-setup")}
          className="px-3 py-3 bg-green-700 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-95 "
        >
          অনুশীলন করুন →
        </button>
      </div>
    </div>

    {/* Right Side: Unique Image/Visual Container */}
    <div className="flex-2 w-full relative">
      <div className="relative aspect-[4/3] w-full mt- rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
        {/* এখানে আপনার ইমেজটি বসান */}
        <img 
          src="/poster1.png" 
          alt="Learning" 
          className="w-full h-full object-cover"
        />
        
        {/* ইমেজের ওপর একটি গ্লাস কার্ড বা ওভারলে */}
        <div className="absolute bottom-2 left-6 right-6 p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase">মোট প্রশ্ন</p>
            <p className="text-xl font-black text-gray-900">১,৫০,০০০+</p>
          </div>
          <div className="h-10 w-px bg-gray-300"></div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase">সফল শিক্ষার্থী</p>
            <p className="text-xl font-black text-green-600">১০,০০০+</p>
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



<section className="py-20 bg-emerald-50/50" style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
  <div className="max-w-7xl mx-auto px-6">
    {/* হেডার সেকশন */}
    <div className="flex items-center justify-between mb-12 gap-4">
      <div>
        <span className="text-green-700 font-black text-[10px] uppercase bg-green-100 px-3 py-1 rounded-full border border-green-200 mb-3 inline-block">লাইভ এরিনা</span>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900">চলমান <span className="text-green-600">পরীক্ষা</span></h2>
      </div>
      
      {/* রাইট এরো বাটন (স্ক্রল করার জন্য) */}
      <button 
        onClick={() => {
          const container = document.getElementById('exam-slider');
          if (container) container.scrollLeft += 300;
        }}
        className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-md hover:bg-green-600 hover:text-white transition-all text-green-600 border border-green-100 flex-shrink-0"
      >
         →
      </button>
    </div>

    {/* স্লাইড বা স্ক্রলযোগ্য কার্ড (স্ক্রলবার হিডেন) */}
    <div 
      id="exam-slider" 
      className="flex overflow-x-auto pb-8 gap-4 snap-x -mx-6 px-6 lg:mx-0 lg:px-0 scroll-smooth scrollbar-hide"
      style={{
        scrollbarWidth: 'none', // Firefox এর জন্য
        msOverflowStyle: 'none'  // IE/Edge এর জন্য
      }}
    >
      {/* স্ক্রলবার হাইড করার CSS (Webkit এর জন্য) */}
      <style >{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {[
        { tag: "BCS", sub: "বাংলা সাহিত্য", top: "মধ্যযুগ", q: "৫০", min: "২৫", color: "text-blue-700 bg-blue-50 border-blue-200" },
        { tag: "BANK", sub: "গাণিতিক যুক্তি", top: "শতকরা", q: "৪০", min: "২০", color: "text-purple-700 bg-purple-50 border-purple-200" },
        { tag: "BCS", sub: "বাংলাদেশ বিষয়াবলী", top: "মুক্তিযুদ্ধ", q: "৬০", min: "৩০", color: "text-orange-700 bg-orange-50 border-orange-200" },
        { tag: "GEN", sub: "সাধারণ বিজ্ঞান", top: "পদার্থবিজ্ঞান", q: "৩০", min: "১৫", color: "text-rose-700 bg-rose-50 border-rose-200" }
      ].map((exam, index) => (
        <div 
          key={index} 
          className="min-w-[240px] md:min-w-[280px] snap-center p-5 bg-white border border-gray-100 rounded-3xl hover:border-green-300 hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase border ${exam.color}`}>
              {exam.tag}
            </span>
            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> লাইভ
            </span>
          </div>

          <h4 className="text-sm font-black text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
            {exam.sub}
          </h4>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-4">
            {exam.top}
          </p>

          <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-[9px] font-black text-gray-500 uppercase">
             <span>{exam.q} টি প্রশ্ন</span>
             <span>{exam.min} মিনিট</span>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>











{/* ------------------------------------------------------------------------ Custom Quiz Section - 3 Unique Bento Features ----------------------------------------------------- */}
<section className="mt-12 px-6">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-black text-gray-900">আপনার টুলস</h2>
    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest">
      স্মার্ট লার্নিং
    </span>
  </div>

  {/* 3-Column Bento Grid */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto">
    
    {/* Feature 1: Custom Quiz */}
    <div 
      onClick={() => setCurrentPage("mixed-setup")}
      className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-[2rem] p-6 text-white relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-green-500/20 transition-all"
    >
      <div className="relative z-10">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mb-4 backdrop-blur-md">🛠</div>
        <h3 className="text-xl font-black mb-1">কাস্টম কুইজ</h3>
        <p className="text-green-50 text-[11px] opacity-80 mb-4">আপনার পছন্দমতো বিষয় নির্বাচন করে পরীক্ষা তৈরি করুন।</p>
        <span className="text-[10px] font-bold underline decoration-white/30 underline-offset-4">শুরু করুন →</span>
      </div>
    </div>

    {/* Feature 2: Weakness Analysis */}
    <div 
      onClick={() => setCurrentPage("analysis")}
      className="bg-white border border-gray-100 rounded-[2rem] p-6 relative overflow-hidden group cursor-pointer hover:border-emerald-500 hover:shadow-xl transition-all"
    >
      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
      <h3 className="text-xl font-black text-gray-900 mb-1">ভুল পর্যালোচনা</h3>
      <p className="text-gray-400 text-[11px] mb-4">আপনার দুর্বল দিকগুলো খুঁজে বের করুন এবং উন্নতি করুন।</p>
      <span className="text-[10px] font-bold text-emerald-600 underline underline-offset-4">বিশ্লেষণ করুন →</span>
    </div>

    {/* Feature 3: Daily Challenge */}
    <div 
      onClick={() => setCurrentPage("daily-challenge")}
      className="bg-gray-900 rounded-[2rem] p-6 text-white relative overflow-hidden group cursor-pointer hover:bg-black transition-all"
    >
      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:rotate-12 transition-transform">🔥</div>
      <h3 className="text-xl font-black mb-1">ডেইলি চ্যালেঞ্জ</h3>
      <p className="text-gray-400 text-[11px] mb-4">প্রতিদিনের নতুন নতুন চ্যালেঞ্জ নিয়ে নিজেকে যাচাই করুন।</p>
      <span className="text-[10px] font-bold text-white/50 underline underline-offset-4">অংশ নিন →</span>
    </div>

  </div>
</section>








{/* ------------------------------------------------------------------------ Subject Selection Grid ----------------------------------------------------- */}
<section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex items-center gap-3 mb-10">
      <div className="w-1.5 h-8 bg-green-600 rounded-full"></div>
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">বিষয়সমূহ</h2>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[
        { id: "eng", label: "English", icon: "📒", color: "bg-indigo-50 text-indigo-600" },
        { id: "bng", label: "Bangla", icon: "📓", color: "bg-red-50 text-red-600" },
        { id: "math", label: "Mathematics", icon: "📐", color: "bg-amber-50 text-amber-600" },
        { id: "sci", label: "Science", icon: "🧪", color: "bg-emerald-50 text-emerald-600" },
        { id: "ict", label: "ICT", icon: "💻", color: "bg-cyan-50 text-cyan-600" }
      ].map((sub) => (
        <button
          key={sub.id}
          onClick={() => setCurrentPage("exams")}
          className="group relative flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:border-green-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center"
        >
          {/* Icon Box */}
          <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110 ${sub.color}`}>
            {sub.icon}
          </div>

          {/* Subject Name */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-black text-gray-900 group-hover:text-green-600 transition-colors">
              {sub.label}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600">
              অনুশীলন →
            </span>
          </div>
        </button>
      ))}
    </div>
  </div>
</section>







   {/* ------------------------------------------------------------------------ Leaderboard Section ----------------------------------------------------- */}
<section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-8 bg-green-600 rounded-full"></div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">সেরা চাকরিপ্রার্থী</h2>
      </div>
      <button onClick={() => setCurrentPage("leaderboard")} className="text-green-600 font-black text-xs uppercase tracking-widest hover:text-green-700 transition-all">সম্পূর্ণ দেখুন →</button>
    </div>

    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      {leaderboard.map((user, i) => (
        <div
          key={user.rank}
          className={`flex items-center gap-4 px-8 py-5 transition-colors ${i !== leaderboard.length - 1 ? "border-b border-gray-50" : ""} ${i < 3 ? "bg-green-50/30" : "hover:bg-gray-50"}`}
        >
          <span className="text-xl w-8 font-black text-gray-400">{user.badge}</span>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-green-200">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-black text-gray-900 text-sm">{user.name}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.exams} পরীক্ষা সম্পন্ন</p>
          </div>
          <div className="text-right">
            <p className="font-black text-green-600 text-lg">{user.score}%</p>
            <p className="text-[10px] text-gray-400 font-black uppercase">গড় নম্বর</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* ------------------------------------------------------------------------ Call to Action Section ----------------------------------------------------- */}
<section className="py-20 bg-[#FAFAFA] px-6">
  <div className="max-w-7xl mx-auto">
    <div className="w-full bg-gradient-to-br from-green-600 to-emerald-800 rounded-[3rem] text-white relative shadow-2xl shadow-green-200 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-10 py-16 md:px-20 gap-10">
        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
            নিজেকে যাচাই করার<br/> জন্য আপনি কি প্রস্তুত?
          </h2>
          <p className="text-green-100 mb-10 text-base md:text-lg max-w-md font-bold leading-relaxed opacity-90">
            <span className="text-yellow-400">২ লাখেরও </span> বেশি পরীক্ষার্থীর বিশ্বস্ত এই প্ল্যাটফর্মে আজই যুক্ত হোন আপনার বিজয়ের যাত্রায়।
          </p>
          <button
            onClick={() => setCurrentPage("signup")}
            className="px-10 py-4 bg-yellow-400 text-emerald-900 font-black rounded-2xl text-base hover:bg-white hover:scale-105 transition-all shadow-xl active:scale-95 mx-auto md:mx-0 w-full md:w-auto"
          >
            🎓 বিনামূল্যে এখনই যুক্ত হোন ➝
          </button>
        </div>
        
        <div className="hidden md:block w-[300px]">
        {/*  <img src="/poster3" alt="Student" className="w-full object-contain drop-shadow-2xl" /> */}
        </div>
      </div>
    </div>
  </div>
</section>

{/* ------------------------------------------------------------------------ Footer ----------------------------------------------------- */}
<footer className="bg-gray-950 text-gray-400 py-16">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
      <div className="col-span-2 md:col-span-1">
        <button onClick={() => setCurrentPage("home")} className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-black text-white">Aspirants</span>
        </button>
      </div>
      
      <div>
        <h4 className="text-white font-black text-sm uppercase mb-6 tracking-widest">পরীক্ষা</h4>
        <ul className="space-y-4 text-sm font-bold">
          <li><a href="#" className="hover:text-green-400 transition">বিসিএস</a></li>
          <li><a href="#" className="hover:text-green-400 transition">ব্যাংক</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-black text-sm uppercase mb-6 tracking-widest">কোম্পানি</h4>
        <ul className="space-y-4 text-sm font-bold">
          <li><a href="#" className="hover:text-green-400 transition">আমাদের সম্পর্কে</a></li>
          <li><a href="#" className="hover:text-green-400 transition">প্রাইভেসি পলিসি</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-black text-sm uppercase mb-6 tracking-widest">সোশ্যাল</h4>
        <div className="flex gap-4 text-white">
          <a href="#" className="hover:text-green-400 transition"><svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
          <a href="#" className="hover:text-green-400 transition"><svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
        </div>
      </div>
    </div>
    
    <div className="border-t border-gray-900 pt-8 text-center text-xs font-bold text-gray-600">
      © {new Date().getFullYear()} Aspirants. All rights reserved.
    </div>
  </div>
</footer>
    </div>
  );
}
