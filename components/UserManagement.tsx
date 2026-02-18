import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    GraduationCap,
    Download,
    ShieldCheck,
    User,
    BookOpen,
    XCircle,
    CheckCircle,
    Lock
} from 'lucide-react';
import { User as UserProfile, UserRole, UserStatus, Course, Enrollment } from '../types';
import { getUsers, saveUser, createUser, getUserEnrollments, enrollUser, unenrollUser } from '../services/userService';
import { getCourses } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

// Helper to get initials
const getInitials = (name: string) => (name || 'User').split(' ').map(n => n ? n[0] : '').join('').substring(0, 2).toUpperCase() || 'U';

/**
 * UserModal: External component for adding/editing users
 */
const UserModal = ({ user, onClose, onSave }: { user: UserProfile | null, onClose: () => void, onSave: (data: Partial<UserProfile>) => void }) => {
    const [formData, setFormData] = useState<Partial<UserProfile>>(
        user ? { name: user.name, email: user.email, role: user.role } : { name: '', email: '', role: 'Student' }
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md glass border-hama-gold/10 bg-bg-secondary overflow-hidden animate-in zoom-in-95 duration-300 relative">
                <div className="p-8 border-b border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-hama-gold text-black rounded-xl">
                            <User size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-hama-gold serif italic">{user ? 'Edit Artist Profile' : 'New Member Registration'}</h3>
                            <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-black mt-1">HAMA Studio Ledger</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="noise opacity-10" />

                <form className="p-8 space-y-6 relative z-10" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] ml-1">Full Name</label>
                            <input
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-5 py-4 bg-white/2 border border-white/10 rounded-2xl focus:border-hama-gold outline-none text-text-primary text-sm transition-all"
                                placeholder="Artist Name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] ml-1">Email Address</label>
                            <input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-5 py-4 bg-white/2 border border-white/10 rounded-2xl focus:border-hama-gold outline-none text-text-primary text-sm transition-all"
                                placeholder="artist@hama.academy"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] ml-1">Studio Role</label>
                            <select
                                value={formData.role || 'Student'}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                className="w-full px-5 py-4 bg-white/2 border border-white/10 rounded-2xl focus:border-hama-gold outline-none text-text-primary text-sm transition-all appearance-none"
                            >
                                <option value="Admin" className="bg-bg-secondary">Administrator</option>
                                <option value="Teacher" className="bg-bg-secondary">Instructor</option>
                                <option value="Student" className="bg-bg-secondary">Student Artist</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-5 bg-hama-gold text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-hama-gold/10 hover:bg-text-primary transition-all transform active:scale-95"
                    >
                        {user ? 'Update Studio Record' : 'Register Member'}
                    </button>
                </form>
            </div>
        </div>
    );
};

/**
 * EnrollmentModal: External component for managing course enrollments
 */
const EnrollmentModal = ({ user, onClose }: { user: UserProfile, onClose: () => void }) => {
    const { user: currentUser } = useAuth();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [eData, cData] = await Promise.all([
                    getUserEnrollments(user.id),
                    getCourses()
                ]);
                setEnrollments(eData);
                setCourses(cData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    const handleEnroll = async (courseId: string) => {
        if (!currentUser) return;
        try {
            await enrollUser(user.id, courseId, currentUser.id);
            const updated = await getUserEnrollments(user.id);
            setEnrollments(updated);
        } catch (err) {
            console.error(err);
        }
    };

    const isEnrolled = (courseId: string) => enrollments.some(e => e.courseId === courseId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl glass border-hama-gold/10 bg-bg-secondary overflow-hidden animate-in zoom-in-95 duration-300 relative">
                <div className="p-8 border-b border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-hama-gold text-black rounded-xl">
                            <GraduationCap size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-hama-gold serif italic">Studio Enrollment</h3>
                            <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-black mt-1">{user?.name} — Induction Status</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="noise opacity-10" />

                <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8 relative z-10">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] ml-1">Active Programs</h4>
                        {enrollments.length === 0 ? (
                            <div className="p-10 text-center border border-dashed border-white/5 rounded-2xl">
                                <p className="text-text-muted/10 text-[10px] font-black uppercase tracking-widest italic">No active curriculum enrollments detected</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {enrollments.map(e => {
                                    const course = courses.find(c => c.id === e.courseId);
                                    return (
                                        <div key={e.id} className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-hama-gold">
                                                    <BookOpen size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-text-primary serif">{course?.title || 'Unknown Program'}</p>
                                                    <p className="text-[9px] text-text-muted uppercase tracking-widest mt-0.5">Joined: {new Date(e.enrolledAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-hama-gold/10 text-hama-gold text-[8px] font-black uppercase tracking-widest border border-hama-gold/20 rounded-full">In Progress</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] ml-1">Enlist in New Program</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {courses.filter(c => !isEnrolled(c.id)).map(course => (
                                <button
                                    key={course.id}
                                    onClick={() => handleEnroll(course.id)}
                                    className="flex items-center justify-between p-4 border border-white/5 hover:border-hama-gold/30 hover:bg-white/5 rounded-2xl transition-all group"
                                >
                                    <span className="text-sm font-bold text-text-secondary group-hover:text-hama-gold serif">{course.title}</span>
                                    <div className="p-2 bg-white/5 rounded-xl group-hover:bg-hama-gold group-hover:text-black transition-all">
                                        <Plus size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Main UserManagement Component
 */
const UserManagement: React.FC = () => {
    const { addToast } = useToast();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            addToast("Failed to sync studio records", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleSaveUser = async (userData: Partial<UserProfile>) => {
        try {
            if (selectedUser) {
                await saveUser({ ...selectedUser, ...userData } as UserProfile);
                addToast("Artist profile updated", "success");
            } else {
                await createUser(userData);
                addToast("New member added to ledger", "success");
            }
            setIsModalOpen(false);
            loadUsers();
        } catch (error) {
            addToast("Profile synchronization failed", "error");
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hama-gold/5 border border-hama-gold/10 text-hama-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                        Staff Ledger
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold serif text-text-primary">Artists & Staff</h1>
                    <p className="text-text-secondary mt-4 max-w-lg leading-relaxed font-light">Manage Academy personnel, instructor assignments, and student enrollments for HAMA Studio.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                        className="flex items-center gap-3 px-8 py-4 bg-hama-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-hama-gold/10 hover:bg-text-primary transition-all font-sans"
                    >
                        <Plus size={16} /> Add Member
                    </button>
                </div>
            </div>

            {/* Control Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-hama-gold transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or studio email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-text-primary focus:ring-1 focus:ring-hama-gold/30 outline-none placeholder:text-white/10 transition-all font-sans"
                    />
                </div>

                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                    {(['All', 'Admin', 'Teacher', 'Student'] as const).map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${roleFilter === role
                                ? 'bg-hama-gold text-black shadow-lg shadow-hama-gold/10'
                                : 'text-text-muted hover:text-text-primary'
                                }`}
                        >
                            {role === 'All' ? 'All' : role + 's'}
                        </button>
                    ))}
                </div>

                <button className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-hama-gold hover:bg-white/10 transition-all font-sans">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* Users Table */}
            <div className="glass overflow-hidden bg-bg-secondary relative">
                <div className="noise opacity-10" />
                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left">
                        <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted border-b border-white/5">
                            <tr>
                                <th className="px-8 py-5">Identified Member</th>
                                <th className="px-8 py-5">Studio Role</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="w-8 h-8 border-2 border-hama-gold/20 border-t-hama-gold rounded-full animate-spin mx-auto mb-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/40 font-sans">Syncing records...</span>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <p className="text-text-muted italic text-sm font-light">No staff or artist records found matching your filters.</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.map((u) => (
                                <tr key={u.id} className="group hover:bg-white/2 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${u.role === 'Admin' ? 'bg-hama-gold text-black' :
                                                u.role === 'Teacher' ? 'bg-white/10 text-text-primary' :
                                                    'bg-white/5 text-text-muted'
                                                }`}>
                                                {getInitials(u.name || u.email || 'U')}
                                            </div>
                                            <div>
                                                <p className="font-bold text-text-primary serif">{u.name || 'Anonymous Artist'}</p>
                                                <p className="text-[11px] text-text-muted">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.role === 'Admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            u.role === 'Teacher' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                'bg-white/5 text-text-secondary border-white/10'
                                            }`}>
                                            {u.role === 'Teacher' ? 'Instructor' : u.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-emerald-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest font-sans">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setSelectedUser(u); setIsEnrollModalOpen(true); }}
                                                className="p-3 bg-white/5 border border-white/10 text-text-muted hover:text-hama-gold hover:border-hama-gold/30 rounded-xl transition-all"
                                                title="Manage Enrollments"
                                            >
                                                <GraduationCap size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(u); setIsModalOpen(true); }}
                                                className="p-3 bg-white/5 border border-white/10 text-text-muted hover:text-text-primary hover:border-white/30 rounded-xl transition-all"
                                                title="Edit Profile"
                                            >
                                                <ShieldCheck size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <UserModal
                    user={selectedUser}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveUser}
                />
            )}

            {isEnrollModalOpen && selectedUser && (
                <EnrollmentModal
                    user={selectedUser}
                    onClose={() => setIsEnrollModalOpen(false)}
                />
            )}
        </div>
    );
};

export default UserManagement;