import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, BookOpen, GraduationCap, Clock, CheckSquare, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, getEnrollments } from '../services/userService';
import { getCourses } from '../services/courseService';
import { User, Course, Enrollment } from '../types';
import CertificatePreview from './CertificatePreview';

const data = [
  { name: 'Mon', students: 400, completions: 240 },
  { name: 'Tue', students: 300, completions: 139 },
  { name: 'Wed', students: 200, completions: 980 },
  { name: 'Thu', students: 278, completions: 390 },
  { name: 'Fri', students: 189, completions: 480 },
  { name: 'Sat', students: 239, completions: 380 },
  { name: 'Sun', students: 349, completions: 430 },
];

const engagementData = [
  { name: 'Video', value: 85 },
  { name: 'Quiz', value: 65 },
  { name: 'Text', value: 45 },
  { name: 'Interact', value: 70 },
];

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: any;
  color?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, onClick }) => (
  <div
    className={`bento-card p-3 md:p-8 flex items-start gap-2 md:gap-4 group min-w-0 transition-all ${onClick ? 'cursor-pointer hover:border-hama-gold/30 active:scale-95' : 'cursor-default'}`}
    onClick={onClick}
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
        <p className="text-xs md:text-[10px] font-black text-text-muted uppercase tracking-[0.2em] md:tracking-[0.3em] truncate">{title}</p>
        {onClick && (
          <span className="text-[10px] md:text-[8px] font-black text-hama-gold bg-hama-gold/10 px-1 md:px-1.5 py-0.5 rounded border border-hama-gold/20 uppercase tracking-widest animate-pulse shrink-0">
            Duba
          </span>
        )}
      </div>
      <div className="flex items-end gap-1.5 md:gap-2 flex-wrap">
        <h4 className="text-lg md:text-3xl lg:text-4xl font-black text-hama-gold tracking-tighter md:tracking-tight font-sans truncate lead-none">{value}</h4>
        <span className={`text-[10px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 rounded-full mb-0.5 md:mb-1 shrink-0 ${change.startsWith('+') ? 'bg-hama-success/10 text-hama-success' : 'bg-red-500/10 text-red-500'}`}>
          {change}
        </span>
      </div>
    </div>
    <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center bg-white/5 border border-hama-gold/10 group-hover:border-hama-gold/30 transition-all relative z-10`}>
      <Icon size={16} className="text-hama-gold md:hidden" />
      <Icon size={20} className="text-hama-gold hidden md:block" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [showCertPreview, setShowCertPreview] = useState(false);
  const [stats, setStats] = useState({
    userCount: 0,
    courseCount: 0,
    rewardCount: 0,
    activeFlow: '0h 0m'
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const mockCertData = {
    studentName: user?.name || 'Artist Name',
    courseTitle: 'Advanced Audio Production',
    completionDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    certificateId: `HAMA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [users, courses, enrollments] = await Promise.all([
          getUsers(),
          getCourses(),
          getEnrollments()
        ]);

        const userEnrollments = user ? enrollments.filter(e => e.userId === user.id) : [];

        setStats({
          userCount: users.length,
          courseCount: courses.length,
          rewardCount: enrollments.filter(e => e.status === 'Completed').length,
          activeFlow: `${userEnrollments.length} Active`
        });

        // Use enrollments to show recent activity
        const activity = enrollments.slice(0, 5).map(e => {
          const student = users.find(u => u.id === e.userId);
          const course = courses.find(c => c.id === e.courseId);
          return {
            userName: student?.name || 'Artist',
            moduleName: course?.title || 'Course Session',
            time: e.enrolledAt,
            status: e.status
          };
        });

        setRecentActivity(activity);
      } catch (error) {
        console.error("Dashboard synchronization failed");
      }
    };
    loadDashboardData();
  }, [user]);

  return (
    <div className="space-y-12">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hama-gold/5 border border-hama-gold/10 text-hama-gold text-xs font-bold uppercase tracking-[0.3em] mb-4">
          Barka da komowa
        </div>
        <h1 className="text-4xl md:text-5xl font-bold serif mb-4 text-text-primary">
          {user?.role === 'Admin' ? 'Admin Area' : user?.role === 'Teacher' ? 'Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-text-secondary mt-4 max-w-lg leading-relaxed font-light">Duba ci gaban ka da darussa.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {user?.role === 'Student' ? (
          <>
            <StatCard title="Darussa Na" value={recentActivity.length} change="Aiki" icon={BookOpen} />
            <StatCard title="Mataki" value="Online" change="Tabbatacce" icon={CheckSquare} />
            <StatCard
              title="Takardu"
              value={recentActivity.filter(a => a.status === 'Completed').length}
              change="Tabbatacce"
              icon={GraduationCap}
              onClick={() => setShowCertPreview(true)}
            />
            <StatCard title="Rijista" value="Aiki" change="Aiki" icon={Clock} />
          </>
        ) : (
          <>
            <StatCard title={user?.role === 'Admin' ? "Matasan Jimlar" : "Matalikai Na"} value={stats.userCount} change="+5%" icon={Users} />
            <StatCard title="Darussa Aiki" value={stats.courseCount} change="+2" icon={BookOpen} />
            <StatCard title="Kammalawa" value={stats.rewardCount} change="+12%" icon={GraduationCap} onClick={() => setShowCertPreview(true)} />
            <StatCard title="Aiki na Mako" value={stats.activeFlow} change="+4%" icon={Clock} />
          </>
        )}
      </div>

      {/* Charts Row */}
      {user?.role !== 'Student' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bento-card p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold serif mb-6 md:mb-8 text-hama-gold">Rijista</h3>
            <div className="h-64 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F2C94C" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F2C94C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(11, 15, 25, 0.8)', borderRadius: '12px', border: '1px solid rgba(242, 201, 76, 0.18)', backdropFilter: 'blur(12px)' }}
                    itemStyle={{ color: '#F2C94C', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="students" stroke="#F2C94C" strokeWidth={2} fillOpacity={1} fill="url(#colorGold)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bento-card p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold serif mb-6 md:mb-8 text-hama-gold">Nau'o'in Kayyade</h3>
            <div className="h-64 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
                  <Bar dataKey="value" fill="#F2C94C" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bento-card overflow-hidden">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center relative z-10">
          <h3 className="text-xl font-bold serif text-text-primary">
            {user?.role === 'Student' ? 'Ci Gaba Na' : 'Ayyuka'}
          </h3>
          <button className="text-xs font-black uppercase tracking-[0.2em] text-hama-gold/60 hover:text-hama-gold transition-colors">Duba Duk</button>
        </div>
        <div className="relative z-10">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto text-sm">
            <table className="w-full text-left">
              <thead className="text-xs font-black uppercase tracking-[0.2em] text-white/20">
                <tr className="border-b border-white/5">
                  {user?.role !== 'Student' && <th className="px-8 py-4">Malami</th>}
                  <th className="px-8 py-4">Darussa</th>
                  <th className="px-8 py-4">Kwanan wata</th>
                  <th className="px-8 py-4">Mataki</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentActivity.map((activity: any, i: number) => (
                  <tr key={i} className="hover:bg-white/2 transition-colors group">
                    {user?.role !== 'Student' && <td className="px-8 py-6 font-bold text-text-primary">{activity.userName}</td>}
                    <td className="px-8 py-6 text-text-secondary">{activity.moduleName}</td>
                    <td className="px-8 py-6 text-text-muted">{new Date(activity.time).toLocaleDateString()}</td>
                    <td className="px-8 py-6 flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full bg-white/5 text-[9px] font-black uppercase tracking-widest text-text-muted">{activity.status}</span>
                      {activity.status === 'Completed' && (
                        <button
                          onClick={() => setShowCertPreview(true)}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-xs font-black text-hama-gold uppercase tracking-widest transition-all hover:underline"
                        >
                          <Eye size={12} /> Duba Takarda
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-white/5">
            {recentActivity.map((activity: any, i: number) => (
              <div key={i} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{activity.moduleName}</p>
                    {user?.role !== 'Student' && <p className="text-xs text-hama-gold mt-1">Malami: {activity.userName}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-black uppercase tracking-widest text-text-muted shrink-0">{activity.status}</span>
                    {activity.status === 'Completed' && (
                      <button
                        onClick={() => setShowCertPreview(true)}
                        className="text-[10px] font-black text-hama-gold uppercase tracking-widest flex items-center gap-1"
                      >
                        <Eye size={10} /> Duba
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-text-muted uppercase tracking-widest">{new Date(activity.time).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCertPreview && (
        <CertificatePreview
          {...mockCertData}
          onClose={() => setShowCertPreview(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;