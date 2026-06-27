import { useState } from "react";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  setSelectedExam: (examId: string) => void;
  user: any; // Supabase user object
}

export function Navbar({ currentPage, setCurrentPage, setSelectedExam, user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { id: "home", label: "হোম" },
    { id: "exams", label: "পরীক্ষা" },
    { id: "leaderboard", label: "লিডারবোর্ড" },
  
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur bg-white/95 shadow-sm"
        style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => setCurrentPage("home")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img src="/logo.png" alt="" className="w-6 h-7 object-contain" />
            <span className="text-xl font-extrabold text-green-800 tracking-tight">Aspirants</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentPage(link.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === link.id
                    ? "bg-green-50 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {link.label}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage("mixed-setup")}
              className="ml-2 px-4 py-2 rounded-lg text-sm font-bold text-orange-600 hover:bg-orange-50 transition-all flex items-center gap-1.5 group"
            >
              <span className="group-hover:animate-bounce">🛠</span> কাস্টম কুইজ
            </button>
          </div>
          
          {/* CTA Buttons & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button
                onClick={() => setCurrentPage("profile")}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-full transition-all border border-green-100"
              >
                <img 
                  src={user.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=" + (user.email || "U")} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                />
                <span className="text-sm font-bold text-green-800 pr-2"></span>
              </button>
            ) : (
              <>
                <button onClick={() => setCurrentPage("login")} className="px-4 py-2 text-sm font-semibold text-green-700 border border-green-600 rounded-lg hover:bg-green-50 transition">লগইন</button>
                <button onClick={() => setCurrentPage("signup")} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow transition">সাইন আপ</button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden p-2 text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
             <div className="space-y-1.5">
               <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
               <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? "opacity-0" : ""}`}></span>
               <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
             </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100 flex flex-col gap-1">
            {navLinks.map((link) => (
              <button key={link.id} onClick={() => { setCurrentPage(link.id); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                {link.label}
              </button>
            ))}
            
            <div className="mt-2 px-2">
              {user ? (
                <button onClick={() => { setCurrentPage("profile"); setMenuOpen(false); }} className="w-full flex items-center gap-3 py-2 px-3 bg-green-50 rounded-lg">
                  <img src={user.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=" + (user.email || "U")} className="w-8 h-8 rounded-full" />
                  <span className="font-bold text-green-800"></span>
                </button>
              ) : (
                <div className="flex gap-2">
                    <button onClick={() => { setCurrentPage("login"); setMenuOpen(false); }} className="flex-1 py-2 text-sm font-semibold text-green-700 border border-green-600 rounded-lg">লগইন</button>
                    <button onClick={() => { setCurrentPage("signup"); setMenuOpen(false); }} className="flex-1 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg">সাইন আপ</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}