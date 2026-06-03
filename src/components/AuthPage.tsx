import { useState } from "react";
import { supabase } from "../lib/supabase";

interface AuthPageProps {
  mode: "login" | "signup";
  setCurrentPage: (p: string) => void;
}

export function AuthPage({ mode, setCurrentPage }: AuthPageProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    target: "bcs",
  });

  const isLogin = mode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (!error) setCurrentPage("home");
      else alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            phone: form.phone,
            target_exam: form.target,
          },
        },
      });

      if (!error) setCurrentPage("home");
      else alert(error.message);
    }
  };

  // ✅ GOOGLE LOGIN FUNCTION
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br mt-8 from-green-50 via-white to-emerald-50 flex items-center justify-center p-4 font-sans"
        style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex3">
            <span className="text-white font-extrabold text-2xl"></span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {isLogin ? "স্বাগতম, আবার দেখা হয়ে ভালো লাগলো!" : "অ্যাসপিরেন্টস-এ যোগ দিন"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLogin
              ? "আপনার পরীক্ষার প্রস্তুতি চালিয়ে যেতে লগইন করুন"
              : "আজই আপনার সরকারি চাকরির প্রস্তুতি শুরু করুন — সম্পূর্ণ ফ্রিতে"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  পূর্ণ নাম
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ইমেইল অ্যাড্রেস
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                পাসওয়ার্ড
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-md hover:opacity-95 transition"
            >
              {isLogin ? "লগইন করুন →" : "ফ্রি অ্যাকাউন্ট তৈরি করুন 🎓"}
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3 font-semibold">
                অথবা
              </div>
            </div>

            {/* ✅ GOOGLE LOGIN BUTTON */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              গুগল দিয়ে চালিয়ে যান
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
