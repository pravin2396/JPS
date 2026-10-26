import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Building,
  Briefcase,
  MapPin,
  Phone,
  Shield,
  Edit3,
  Check,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    title: user?.title || '',
    company: user?.company || '',
    designation: user?.designation || '',
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isRecruiter = user?.role === 'recruiter';

  return (
    <div className="w-full space-y-6">
      {/* Profile Header Card (Glassmorphic) */}
      <div className="w-full rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden">
        {/* Banner with Ambient Gradient */}
        <div className="h-32 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/60 relative border-b border-white/10">
          <div className="absolute right-4 top-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${
                isRecruiter
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {user?.role} Account
            </span>
          </div>
        </div>

        {/* User Info Bar */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 mb-6 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                alt={user?.name}
                className="w-24 h-24 rounded-2xl ring-4 ring-[#070913] shadow-2xl object-cover bg-slate-900"
              />
              <div className="pt-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">{user?.name}</h1>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Edit Form or Readonly Overview */}
          {isEditing ? (
            <form onSubmit={handleSave} className="mt-6 border-t border-white/10 pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>
                {isRecruiter ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Target Job Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Bio / Profile Summary</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 border-t border-white/10 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  {isRecruiter ? 'Company' : 'Current Focus'}
                </span>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  {isRecruiter ? (
                    <>
                      <Building className="w-4 h-4 text-emerald-400" />
                      {user?.company || 'Company N/A'}
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-4 h-4 text-blue-400" />
                      {user?.title || 'Senior Frontend Developer'}
                    </>
                  )}
                </p>
                {isRecruiter && user?.designation && (
                  <p className="text-xs text-slate-400">{user.designation}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Location
                </span>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  {user?.location || 'San Francisco, CA'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Phone
                </span>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {user?.phone || '+1 (555) 234-5678'}
                </p>
              </div>

              <div className="sm:col-span-3 pt-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Bio / Summary
                </span>
                <p className="text-slate-300 mt-1 leading-relaxed text-xs sm:text-sm">
                  {user?.bio || 'Passionate software engineer building modern web applications.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
