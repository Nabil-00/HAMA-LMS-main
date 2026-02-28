import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, BookOpen, GraduationCap, Clock, CheckSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, getEnrollments } from '../services/userService';
import { getCourses } from '../services/courseService';
import { User, Course, Enrollment } from '../types';

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
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon }) => (
  <div className="bento-card p-4 md:p-8 flex items-start gap-4 group cursor-default min-w-0">
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-2 truncate">{title}</p>
      <div className="flex items-end gap-2 flex-wrap">
        <h4 className="text-3xl lg:text-4xl font-black text-hama-gold tracking-tight font-sans truncate">{value}</h4>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mb-1 shrink-0 ${change.startsWith('+') ? 'bg-hama-success/10 text-hama-success' : 'bg-red-500/10 text-red-500'}`}>
          {change}
        </span>
      </div>
    </div>
    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center bg-white/5 border border-hama-gold/10 group-hover:border-hama-gold/30 transition-all relative z-10`}>
      <Icon size={20} className="text-hama-gold" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    userCount: 0,
    courseCount: 0,
    rewardCount: 0,
    activeFlow: '0h 0m'
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hama-gold/5 border border-hama-gold/10 text-hama-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
          Welcome Back
        </div>
        <h1 className="text-4xl md:text-5xl font-bold serif mb-4 text-text-primary">
          {user?.role === 'Admin' ? 'Admin Area' : user?.role === 'Teacher' ? 'Teacher Dashboard' : 'My Dashboard'}
        </h1>
        <p className="text-text-secondary mt-4 max-w-lg leading-relaxed font-light">Track your progress and courses.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {user?.role === 'Student' ? (
          <>
            <StatCard title="My Courses" value={recentActivity.length} change="Live" icon={BookOpen} />
            <StatCard title="Academy Status" value="Online" change="Verified" icon={CheckSquare} />
            <StatCard title="Certificates" value={recentActivity.filter(a => a.status === 'Completed').length} change="Verified" icon={GraduationCap} />
            <StatCard title="Enrollment Status" value="Active" change="Live" icon={Clock} />
          </>
        ) : (
          <>
            <StatCard title={user?.role === 'Admin' ? "Total Artists" : "My Students"} value={stats.userCount} change="+5%" icon={Users} />
            <StatCard title="Active Courses" value={stats.courseCount} change="+2" icon={BookOpen} />
            <StatCard title="Completions" value={stats.rewardCount} change="+12%" icon={GraduationCap} />
            <StatCard title="Weekly Usage" value={stats.activeFlow} change="+4%" icon={Clock} />
          </>
        )}
      </div>

      {/* Charts Row */}
      {user?.role !== 'Student' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bento-card p-8">
            <h3 className="text-xl font-bold serif mb-8 text-hama-gold">Enrollments</h3>
            <div className="h-80 w-full">
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

          <div className="bento-card p-8">
            <h3 className="text-xl font-bold serif mb-8 text-hama-gold">Content Types</h3>
            <div className="h-80 w-full">
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
            {user?.role === 'Student' ? 'My Recent Progress' : 'Recent Activity'}
          </h3>
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-hama-gold/60 hover:text-hama-gold transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
              <tr className="border-b border-white/5">
                {user?.role !== 'Student' && <th className="px-8 py-4">Student</th>}
                <th className="px-8 py-4">Module</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 relative z-10">
              {recentActivity.map((activity: any, i: number) => (
                <tr key={i} className="hover:bg-white/2 transition-colors">
                  {user?.role !== 'Student' && <td className="px-8 py-6 font-bold text-text-primary">{activity.userName}</td>}
                  <td className="px-8 py-6 text-text-secondary">{activity.moduleName}</td>
                  <td className="px-8 py-6 text-text-muted">{new Date(activity.time).toLocaleDateString()}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full bg-white/5 text-[9px] font-black uppercase tracking-widest text-text-muted">{activity.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;