import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/HomePage";
import { ExamPage } from "./components/ExamPage";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { AboutPage } from "./components/AboutPage";
import { AuthPage } from "./components/AuthPage";
import { MixedExamSetup } from "./components/MixedExamSetup";
import { ProfilePage } from "./components/ProfilePage"; // ProfilePage ইম্পোর্ট করুন
import { supabase } from "./lib/supabase"; // Supabase ক্লায়েন্ট ইম্পোর্ট করুন

export function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedExam, setSelectedExam] = useState<any>("hsc2");
  const [user, setUser] = useState<any>(null); // ইউজার স্টেট

  // ইউজারের সেশন চেক এবং স্টেট লিসেনার
  useEffect(() => {
    // ১. শুরুতে সেশন চেক করা
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // ২. লগইন/লগআউট পরিবর্তনের সময় স্টেট আপডেট করা
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const showNavbar = currentPage !== "exam";

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage setCurrentPage={setCurrentPage} setSelectedExam={setSelectedExam} />;
      case "mixed-setup":
        return <MixedExamSetup setCurrentPage={setCurrentPage} setSelectedExam={setSelectedExam} />;
      case "exam":
        return <ExamPage examId={selectedExam} setCurrentPage={setCurrentPage} />;
      case "leaderboard":
        return <LeaderboardPage />;
      case "about":
        return <AboutPage setCurrentPage={setCurrentPage} />;
      case "profile":
        return <ProfilePage />; // প্রোফাইল পেজ রেন্ডার
      case "login":
        return <AuthPage mode="login" setCurrentPage={setCurrentPage} />;
      case "signup":
        return <AuthPage mode="signup" setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} setSelectedExam={setSelectedExam} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && (
        <Navbar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          setSelectedExam={setSelectedExam}
          user={user} // এখানে আসল ইউজার স্টেটটি পাস করা হচ্ছে
        />
      )}
      <main className={showNavbar ? "pt-16" : ""}>
        {renderPage()}
      </main>
    </div>
  );
}