export function AboutPage({ setCurrentPage }: { setCurrentPage: (p: string) => void }) {
  return (
    <div className="pt-16 min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-800 py-16 px-4 text-center"
          style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-wide">অ্যাসপিরেন্টস সম্পর্কে</h1>
        <p className="text-green-100 max-w-xl mx-auto text-lg leading-relaxed">
          স্মার্ট পরীক্ষার প্রস্তুতির মাধ্যমে বাংলাদেশের সরকারি চাকুরিজীবী আগামী প্রজন্মকে ক্ষমতায়ন করা।
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12"
          style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
        {/* Mission */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-2xl font-extrabold text-gray-700 mb-4 flex items-center gap-2">🎯 আমাদের লক্ষ্য</h2>
          <p className="text-gray-600 leading-relaxed text-[15px]">
            অ্যাসপিরেন্টস (Aspirants) হলো সরকারি পরীক্ষার প্রস্তুতির জন্য বাংলাদেশের সবচেয়ে নির্ভরযোগ্য ও সমৃদ্ধ ডিজিটাল প্ল্যাটফর্ম। ঢাকা থেকে শুরু করে প্রত্যন্ত চরাঞ্চল পর্যন্ত—সমগ্র বাংলাদেশের প্রতিটি চাকরিপ্রার্থীর কাছে সহজলভ্য, সাশ্রয়ী এবং কার্যকর পড়াশোনার রিসোর্স পৌঁছে দিয়ে মানসম্মত পরীক্ষার প্রস্তুতিকে সবার জন্য উন্মুক্ত করাই আমাদের মূল লক্ষ্য।
          </p>
        </div>

        {/* What we offer */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-2xl font-extrabold text-gray-700 mb-6 flex items-center gap-2">📦 আমরা যা অফার করি</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "📋", title: "বিসিএস প্রস্তুতি", desc: "টপিক-ভিত্তিক প্র্যাকটিস সেট এবং পূর্ণাঙ্গ মক টেস্টের সাথে সম্পূর্ণ ২০০ নম্বরের সিলেবাস কভারেজ।" },
              { icon: "🏦", title: "ব্যাংক এক্সাম প্রিপারেশন", desc: "সোনালী ব্যাংক, জনতা ব্যাংক, বাংলাদেশ ব্যাংক (BB), বিবি এডি (BB AD) সহ সকল ব্যাংক জবের লিখিত ও এমসিকিউ প্রস্তুতি।" },
              { icon: "📚", title: "এনটিআরসিএ প্র্যাকটিস", desc: "স্কুল, কলেজ ও মাদ্রাসা পর্যায়ের এনটিআরসিএ (NTRCA) পরীক্ষার বিষয়ভিত্তিক প্রশ্ন ও সমাধান।" },
              { icon: "🎓", title: "প্রাথমিক বিদ্যালয় শিক্ষক", desc: "ডিপিই (DPE) এবং সরকারি প্রাথমিক সহকারী শিক্ষক নিয়োগ পরীক্ষার সকল বিষয়ের কমপ্লিট সেট।" },
              { icon: "🎖️", title: "ডিফেন্স জবস", desc: "বিগত বছরের প্রশ্নসহ সেনাবাহিনী, নৌবাহিনী ও বিমানবাহিনীর অফিসার পদের পরীক্ষার মক টেস্ট।" },
              { icon: "📊", title: "পারফরম্যান্স অ্যানালিটিক্স", desc: "বিস্তারিত প্রগ্রেস রিপোর্ট, বিষয়ভিত্তিক শক্তিশালী ও দুর্বল দিক বিশ্লেষণ এবং অগ্রগতি ট্র্যাকিং।" },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-green-50 transition">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-700 mb-1 text-[16px]">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Coverage */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-2xl font-extrabold text-gray-700 mb-6">🗂️ যেসকল পরীক্ষা আমরা কভার করি</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "বিসিএস প্রিলিমিনারি", "বিসিএস লিখিত", "বিসিএস ভাইভা", "সোনালী ব্যাংক", "জনতা ব্যাংক",
              "অগ্রণী ব্যাংক", "রূপালী ব্যাংক", "বাংলাদেশ ব্যাংক", "এনটিআরসিএ স্কুল", "এনটিআরসিএ কলেজ",
              "প্রাথমিক সহকারী শিক্ষক", "ডিপিই", "বিপিএসসি", "পিএসসি", "জেএসসি", "এসএসসি", "এইচএসসি",
              "আর্মি অফিসার", "নেভি অফিসার", "এয়ার ফোর্স", "পুলিশ এসআই", "এএসপি"
            ].map((exam) => (
              <span key={exam} className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl">
                {exam}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold mb-3">📬 আমাদের সাথে যোগাযোগ</h2>
          <p className="text-green-100 mb-4">কোনো প্রশ্ন আছে? আপনার বিজয়ের যাত্রায় সাহায্য করতে আমরা সর্বদা প্রস্তুত।</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm font-medium">
            <div className="flex items-center gap-2 justify-center">
              <span>📧</span>
              <span>support@aspirants.com.bd</span>
            </div>
           
            <div className="flex items-center gap-2 justify-center">
              <span>📍</span>
              <span>বাংলাদেশ</span>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage("signup")}
            className="mt-6 px-8 py-3 bg-yellow-400 text-green-900 font-extrabold rounded-xl hover:bg-yellow-300 transition shadow-lg tracking-wide text-[16px]"
          >
            ফ্রিতে অ্যাসপিরেন্টস-এ যোগ দিন →
          </button>
        </div>
      </div>
    </div>
  );
}
