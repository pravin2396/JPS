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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-800 relative">
          <div className="absolute right-4 top-4">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                user?.role === 'recruiter'
                  ? 'bg-emerald-500/90 text-white shadow-xs'
                  : 'bg-white/90 text-blue-700 shadow-xs'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {user?.role} Account
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 mb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                alt={user?.name}
                className="w-20 h-20 rounded-full ring-4 ring-white shadow-md object-cover bg-slate-100"
              />
              <div className="pt-2">
                <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Profile Details or Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSave} className="mt-6 border-t border-slate-100 pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  />
                </div>
                {user?.role === 'recruiter' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 border-t border-slate-100 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  {user?.role === 'recruiter' ? 'Company' : 'Current Title'}
                </span>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  {user?.role === 'recruiter' ? (
                    <>
                      <Building className="w-4 h-4 text-emerald-600" />
                      {user?.company || 'Company N/A'}
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      {user?.title || 'Open to Opportunities'}
                    </>
                  )}
                </p>
                {user?.role === 'recruiter' && user?.designation && (
                  <p className="text-xs text-slate-500">{user.designation}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Location
                </span>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {user?.location || 'Not specified'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Phone
                </span>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {user?.phone || 'Not provided'}
                </p>
              </div>

              <div className="sm:col-span-3 pt-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Bio / Summary
                </span>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  {user?.bio || 'No bio entered yet.'}
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
