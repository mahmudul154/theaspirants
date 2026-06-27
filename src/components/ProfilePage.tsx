import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#16a34a', '#e5e7eb'];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: examData } = await supabase
          .from('exams_history')
          .select('subject, score')
          .eq('user_id', user.id);

        if (examData && examData.length > 0) {
          const totalExams = examData.length;
          const totalScore = examData.reduce((acc, curr) => acc + Number(curr.score), 0);
          const avgScore = (totalScore / totalExams).toFixed(1);

          setProfile({
            name: "Md. Mahmudul Hasan",
            email: user.email,
            total_exams: totalExams,
            average_score: avgScore,
            streak: 5,
            completed_lessons: 75
          });

          // Stacked Chart এর জন্য ডাটা ফরম্যাট
          setChartData(examData.map(item => ({ 
            name: item.subject, 
            score: item.score,
            remaining: 100 - item.score // Stacked বার তৈরির জন্য বাকি অংশ
          })));

          setPieData([
            { name: 'সম্পন্ন', value: 75 },
            { name: 'বাকি', value: 25 }
          ]);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center text-green-600 font-bold">...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
        <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">হ্যালো, {profile?.name}! 👋</h1>
          </div>
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-green-200">
            {profile?.streak || 0}🔥
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-8 rounded-3xl text-white shadow-xl shadow-green-200">
          <p className="opacity-80 text-sm font-bold uppercase">গড় পারফরম্যান্স</p>
          <h2 className="text-5xl font-black mt-2">{profile?.average_score || 0}%</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6"
        style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
        {/* Stacked Bar Chart Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">বিষয়ভিত্তিক স্কোর (Stacked)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" stackId="a" fill="#16a34a" name="প্রাপ্ত নম্বর" />
              <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" name="বাকি" />
            </BarChart>
          </ResponsiveContainer>
        </div>

       
      </div>
    </div>
  );
};