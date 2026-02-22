import { leaderboard } from "../data/examData";

const extendedLeaderboard = [
  ...leaderboard,
  { rank: 8, name: "Sharmin Akter", score: 89, exams: 94, badge: "⭐" },
  { rank: 9, name: "Khairul Alam", score: 88, exams: 89, badge: "⭐" },
  { rank: 10, name: "Rumana Islam", score: 87, exams: 82, badge: "⭐" },
  { rank: 11, name: "Moshiur Rahman", score: 86, exams: 77, badge: "⭐" },
  { rank: 12, name: "Nazmul Huda", score: 85, exams: 72, badge: "⭐" },
  { rank: 13, name: "Sabrina Yasmin", score: 84, exams: 68, badge: "⭐" },
  { rank: 14, name: "Zakir Hossain", score: 83, exams: 61, badge: "⭐" },
  { rank: 15, name: "Poly Begum", score: 82, exams: 55, badge: "⭐" },
];

export function LeaderboardPage() {
  const top3 = extendedLeaderboard.slice(0, 3);

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 py-12 px-4 text-center">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-3xl font-extrabold text-white mb-2">National Leaderboard</h1>
        <p className="text-yellow-100">Top aspirants of Bangladesh – This Month</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-4 mb-10">
          {/* 2nd place */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg mb-2">
              {top3[1].name.charAt(0)}
            </div>
            <p className="text-xs font-bold text-gray-700 mb-1 text-center w-20 truncate">{top3[1].name}</p>
            <p className="text-sm font-extrabold text-gray-600">{top3[1].score}%</p>
            <div className="mt-2 w-20 h-16 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-xl flex items-center justify-center">
              <span className="text-2xl">🥈</span>
            </div>
          </div>
          {/* 1st place */}
          <div className="flex flex-col items-center -mb-4">
            <div className="text-2xl mb-1">👑</div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl mb-2 ring-4 ring-yellow-300">
              {top3[0].name.charAt(0)}
            </div>
            <p className="text-sm font-bold text-gray-800 mb-1 text-center w-24 truncate">{top3[0].name}</p>
            <p className="text-base font-extrabold text-yellow-600">{top3[0].score}%</p>
            <div className="mt-2 w-24 h-24 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-xl flex items-center justify-center">
              <span className="text-3xl">🥇</span>
            </div>
          </div>
          {/* 3rd place */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg mb-2">
              {top3[2].name.charAt(0)}
            </div>
            <p className="text-xs font-bold text-gray-700 mb-1 text-center w-20 truncate">{top3[2].name}</p>
            <p className="text-sm font-extrabold text-amber-700">{top3[2].score}%</p>
            <div className="mt-2 w-20 h-10 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-xl flex items-center justify-center">
              <span className="text-2xl">🥉</span>
            </div>
          </div>
        </div>

        {/* Full Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 grid grid-cols-12 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Aspirant</div>
            <div className="col-span-3 text-center">Avg Score</div>
            <div className="col-span-3 text-center">Exams Done</div>
          </div>
          {extendedLeaderboard.map((user, i) => (
            <div
              key={user.rank}
              className={`px-6 py-4 grid grid-cols-12 items-center ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} ${i < 3 ? "border-l-4 border-yellow-400" : "border-l-4 border-transparent"} hover:bg-green-50/30 transition`}
            >
              <div className="col-span-1">
                <span className="font-bold text-gray-500 text-sm">#{user.rank}</span>
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                  i === 0 ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                  : i === 1 ? "bg-gradient-to-br from-gray-400 to-gray-500"
                  : i === 2 ? "bg-gradient-to-br from-amber-600 to-orange-600"
                  : "bg-gradient-to-br from-green-400 to-emerald-500"
                }`}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.badge} {i < 3 ? "Top Achiever" : "Aspirant"}</p>
                </div>
              </div>
              <div className="col-span-3 text-center">
                <span className={`text-base font-extrabold ${i < 3 ? "text-yellow-600" : "text-green-600"}`}>
                  {user.score}%
                </span>
              </div>
              <div className="col-span-3 text-center">
                <span className="text-sm font-semibold text-gray-600">{user.exams}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Your Rank Card */}
        <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 flex items-center justify-between text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">Y</div>
            <div>
              <p className="font-bold">You (Guest)</p>
              <p className="text-green-100 text-sm">Register to track your rank</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold">—</p>
            <p className="text-green-200 text-xs">Unranked</p>
          </div>
        </div>
      </div>
    </div>
  );
}
