import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/HomePage";
import { ExamsPage } from "./components/ExamsPage";
import { ExamPage } from "./components/ExamPage";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { AboutPage } from "./components/AboutPage";
import { AuthPage } from "./components/AuthPage";
import { MixedExamSetup } from "./components/MixedExamSetup"; // ✅ ইম্পোর্ট করুন

export function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedExam, setSelectedExam] = useState<any>("hsc2"); // string/number/object সব নিতে পারবে

  const showNavbar = currentPage !== "exam";

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage setCurrentPage={setCurrentPage} setSelectedExam={setSelectedExam} />;
      case "exams":
        return <ExamsPage setCurrentPage={setCurrentPage} setSelectedExam={setSelectedExam} />;
      
      // ✅ নতুন Mixed Setup পেজ
      case "mixed-setup":
        return <MixedExamSetup setCurrentPage={setCurrentPage} setSelectedExam={setSelectedExam} />;
      
      case "exam":
        return <ExamPage examId={selectedExam} setCurrentPage={setCurrentPage} />;
      
      case "leaderboard":
        return <LeaderboardPage />;
      case "about":
        return <AboutPage setCurrentPage={setCurrentPage} />;
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
          setSelectedExam={setSelectedExam} // ✅ এটি পাস করুন যাতে Navbar থেকে মিক্সড সেটআপে যাওয়া যায়
          user={null} // আপনার ইউজার স্টেট থাকলে সেটি দিন
        />
      )}
      {renderPage()}
    </div>
  );
}