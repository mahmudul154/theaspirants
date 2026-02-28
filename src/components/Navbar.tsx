import { useState } from "react";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: any; // ✅ user state
}

export function Navbar({ currentPage, setCurrentPage, user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "exams", label: "Exams" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "about", label: "About" },
  ];

  return (
    <nav className=" fixed top-0 left-0 right-0 z-50  backdrop-blur  bg-white/95 border-b border-gray-100/0 shadow-sm ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => setCurrentPage("home")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img src="/logo.png" alt="" className="w-7 h-7 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-extrabold text-gray-700 tracking-tight">
                Aspirants
              </span>
              <span className="text-[10px] text-green-600 font-semibold tracking-wider uppercase">
              </span>
            </div>
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
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button
                onClick={() => setCurrentPage("profile")}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
              >
                Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => setCurrentPage("login")}
                  className="px-4 py-2 text-sm font-semibold text-green-700 border border-green-600 rounded-lg hover:bg-green-50 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => setCurrentPage("signup")}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 shadow transition"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="space-y-1.5">
              <span
                className={`block w-6 h-0.5 bg-gray-700 transition-all ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-gray-700 transition-all ${
                  menuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-gray-700 transition-all ${
                  menuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              ></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100 flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentPage(link.id);
                  setMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                  currentPage === link.id
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="flex gap-2 mt-2 px-2">
              {user ? (
                <button
                  onClick={() => {
                    setCurrentPage("profile");
                    setMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow"
                >
                  Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setCurrentPage("login");
                      setMenuOpen(false);
                    }}
                    className="flex-1 py-2 text-sm font-semibold text-green-700 border border-green-600 rounded-lg hover:bg-green-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("signup");
                      setMenuOpen(false);
                    }}
                    className="flex-1 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
