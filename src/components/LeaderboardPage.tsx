import { useState, useEffect } from "react";
// ইমপোর্ট করে নিন
import { supabase } from "../lib/supabase";

export function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      setLoading(true);
      try {
        // আজকের দিনের শুরু (00:00:00) নির্ধারণ
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
          .from("exam_results")
          .select("user_name, user_avatar, score, user_id, created_at")
          .gte("created_at", todayStart.toISOString())
          .order("created_at", { ascending: true }); // লেটেস্ট স্কোর পেতে এসেন্ডিং সর্ট

        if (error) throw error;

        if (data && data.length > 0) {
          const userMap = data.reduce((acc: any, curr: any) => {
            const id = curr.user_id || curr.user_name;
            if (!acc[id]) {
              acc[id] = { 
                user_name: curr.user_name, 
                user_avatar: curr.user_avatar, 
                todayScore: curr.score, // লেটেস্ট স্কোর
                totalScore: curr.score,
                total_exams: 1 
              };
            } else {
              acc[id].total_exams += 1;
              acc[id].totalScore += curr.score;
              acc[id].todayScore = curr.score; // সর্বশেষ পরীক্ষার স্কোরটি আপডেট হবে
            }
            return acc;
          }, {});

          const sortedLeaders = Object.values(userMap)
            .map((user: any) => ({
              ...user,
              avgScore: (user.totalScore / user.total_exams).toFixed(1)
            }))
            .sort((a: any, b: any) => b.todayScore - a.todayScore) // আজকের স্কোরের ভিত্তিতে র‍্যাঙ্কিং
            .slice(0, 20);

          setLeaders(sortedLeaders);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaders();
  }, []);

  // কাস্টম লোডিং স্ক্রিন
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
      <p className="text-emerald-600 font-bold animate-pulse"></p>
    </div>
  );

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 py-12 px-4 text-center shadow-lg">
        <div className="text-5xl mb-3 animate-bounce">🏅</div>
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Daily Leaderboard</h1>
        <p className="text-emerald-50 text-sm font-medium opacity-90">
          Rankings for {new Date().toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {leaders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border-2 border-dashed border-emerald-100">
            <p className="text-gray-500 font-bold text-lg">আজকে এখনো কেউ পরীক্ষা দেয়নি!</p>
            <p className="text-emerald-600 text-sm mt-1">প্রথম পরীক্ষা দিয়ে লিডারবোর্ডের শীর্ষে চলে আসুন।</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 bg-emerald-50/50 border-b border-emerald-100 grid grid-cols-12 text-[10px] font-black text-emerald-800 uppercase tracking-widest">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Aspirant</div>
              <div className="col-span-2 text-center">Today</div>
              <div className="col-span-2 text-center">Avg</div>
              <div className="col-span-2 text-right">Exams</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-50">
              {leaders.map((user, i) => (
                <div
                  key={i}
                  className={`px-6 py-4 grid grid-cols-12 items-center transition-all ${
                    i === 0 ? "bg-emerald-50/60" : 
                    i === 1 ? "bg-gray-50/60" : 
                    i === 2 ? "bg-orange-50/60" : "bg-white hover:bg-emerald-50/30"
                  }`}
                >
                  {/* Rank & Medal */}
                  <div className="col-span-1 flex items-center">
                    {i === 0 ? (
                      <span className="text-2xl">🥇</span>
                    ) : i === 1 ? (
                      <span className="text-2xl">🥈</span>
                    ) : i === 2 ? (
                      <span className="text-2xl">🥉</span>
                    ) : (
                      <span className="font-black text-gray-400 text-sm ml-2">#{i + 1}</span>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="col-span-5 flex items-center gap-3">
                    <img 
                      src={user.user_avatar || `https://ui-avatars.com/api/?name=${user.user_name}&background=${i < 3 ? '059669' : '10b981'}&color=fff`} 
                      className={`w-10 h-10 rounded-full object-cover border-2 ${
                        i === 0 ? "border-yellow-400 scale-110 shadow-md" : 
                        i === 1 ? "border-gray-300" : 
                        i === 2 ? "border-orange-300" : "border-transparent"
                      }`} 
                    />
                    <div>
                      <p className={`text-sm truncate ${i < 3 ? "font-black text-gray-900" : "font-bold text-gray-800"}`}>
                        {user.user_name}
                      </p>
                      {i < 3 && <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">Top Performer</p>}
                    </div>
                  </div>

                  {/* Scores & Exams */}
                  <div className={`col-span-2 text-center font-black ${i < 3 ? "text-emerald-700 text-lg" : "text-emerald-600"}`}>
                    {user.todayScore}%
                  </div>
                  
                  <div className={`col-span-2 text-center font-bold ${i < 3 ? "text-orange-600" : "text-orange-400 text-sm"}`}>
                    {user.avgScore}%
                  </div>

                  <div className="col-span-2 text-right font-bold text-gray-400 text-[10px] uppercase">
                    {user.total_exams} Exams
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}