export function AboutPage({ setCurrentPage }: { setCurrentPage: (p: string) => void }) {
  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-800 py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-3">About Aspirants</h1>
        <p className="text-green-100 max-w-xl mx-auto text-lg">
          Empowering the next generation of Bangladesh's government officers through smart exam preparation.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Mission */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-2xl font-extrabold text-gray-700 mb-4 flex items-center gap-2">🎯 Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            Aspirants is Bangladesh's most comprehensive digital platform for government exam preparation. We aim to democratize quality exam preparation by providing accessible, affordable, and effective study resources to every aspirant across Bangladesh — whether in Dhaka or the remotest char.
          </p>
        </div>

        {/* What we offer */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-2xl font-extrabold text-gray-700 mb-6 flex items-center gap-2">📦 What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "📋", title: "BCS Preparation", desc: "Complete 200-mark syllabus coverage with topic-wise practice sets and full-length mock tests." },
              { icon: "🏦", title: "Bank Exam Prep", desc: "Sonali Bank, Janata Bank, BB, BB AD and all other bank job written & MCQ preparation." },
              { icon: "📚", title: "NTRCA Practice", desc: "School, College & Madrasa level NTRCA exam preparation with subject-wise questions." },
              { icon: "🎓", title: "Primary Teacher", desc: "DPE and Primary Assistant Teacher exam sets with all subjects covered." },
              { icon: "🎖️", title: "Defense Jobs", desc: "Army, Navy, Air Force officer exam mock tests with previous year questions." },
              { icon: "📊", title: "Performance Analytics", desc: "Detailed reports, subject-wise strength analysis, and progress tracking." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-green-50 transition">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-600 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        {/*
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-2xl font-extrabold text-gray-700 mb-6">👨‍💻 Our Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Md. Rafiqul Islam", role: "CEO & Founder", emoji: "👨‍💼" },
              { name: "Taslima Begum", role: "Content Head", emoji: "👩‍🏫" },
              { name: "Jahir Uddin", role: "Tech Lead", emoji: "👨‍💻" },
              { name: "Mariam Akter", role: "UX Designer", emoji: "👩‍🎨" },
            ].map((member) => (
              <div key={member.name} className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                <div className="text-4xl mb-2">{member.emoji}</div>
                <p className="font-bold text-gray-800 text-sm">{member.name}</p>
                <p className="text-xs text-green-600 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
        */}

        {/* Exam Coverage */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-2xl font-extrabold text-gray-700 mb-6">🗂️ Exams We Cover</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "BCS Preliminary", "BCS Written", "BCS Viva", "Sonali Bank", "Janata Bank",
              "Agrani Bank", "Rupali Bank", "Bangladesh Bank", "NTRCA School", "NTRCA College",
              "Primary Assistant Teacher", "DPE", "BPSC", "PSC", "JSC", "SSC", "HSC",
              "Army Officer", "Navy Officer", "Air Force", "Police SI", "ASP"
            ].map((exam) => (
              <span key={exam} className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl">
                {exam}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold mb-3">📬 Contact Us</h2>
          <p className="text-green-100 mb-4">Have questions? We're here to help you on your journey.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <div className="flex items-center gap-2 justify-center">
              <span>📧</span>
              <span>support@aspirants.com.bd</span>
            </div>
           
            <div className="flex items-center gap-2 justify-center">
              <span>📍</span>
              <span>Bangladesh</span>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage("signup")}
            className="mt-6 px-8 py-3 bg-yellow-400 text-green-900 font-bold rounded-xl hover:bg-yellow-300 transition shadow-lg"
          >
            Join Aspirants Free →
          </button>
        </div>
      </div>
    </div>
  );
}
