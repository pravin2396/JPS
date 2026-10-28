import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  MapPin,
  Phone,
  Shield,
  Edit3,
  LogOut,
  Upload,
  FileText,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  X,
  Download,
  Eye,
  Camera,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { toast } from 'react-toastify';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
];

const POPULAR_SKILLS = [
  'React.js',
  'Tailwind CSS',
  'TypeScript',
  'Node.js',
  'JavaScript',
  'Next.js',
  'Context API',
  'REST APIs',
  'GraphQL',
  'Docker',
  'Git',
  'Python',
  'Figma',
];

const Profile = () => {
  const { user, updateProfile: updateAuthProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Mode: 'view' | 'edit' | 'create'
  const [mode, setMode] = useState('view');
  const [profile, setProfile] = useState(() => profileService.getProfile());

  // Interactive dynamic states for Edit / Create form
  const [skillsList, setSkillsList] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [experienceList, setExperienceList] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New item draft states
  const [showAddExp, setShowAddExp] = useState(false);
  const [expDraft, setExpDraft] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: 'Present',
    current: true,
    description: '',
  });

  const [showAddEdu, setShowAddEdu] = useState(false);
  const [eduDraft, setEduDraft] = useState({
    degree: '',
    institution: '',
    fieldOfStudy: '',
    graduationYear: '',
    grade: '',
  });

  // React Hook Form for Core Profile Details with strict validation
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      mobileNumber: '',
      address: '',
      headline: '',
      bio: '',
      profilePhoto: '',
    },
  });

  // Load profile on mount and sync with localStorage / user
  useEffect(() => {
    const loaded = profileService.getProfile();
    setProfile(loaded);
  }, []);

  // Sync profile data to Form when entering Edit or Create mode
  const populateFormWithProfile = (data) => {
    setValue('fullName', data.fullName || user?.name || '');
    setValue('email', data.email || user?.email || '');
    setValue('mobileNumber', data.mobileNumber || user?.phone || '');
    setValue('address', data.address || user?.location || '');
    setValue('headline', data.headline || user?.title || 'Senior Software Engineer');
    setValue('bio', data.bio || user?.bio || '');
    setValue('profilePhoto', data.profilePhoto || user?.avatar || PRESET_AVATARS[0]);

    setAvatarPreview(data.profilePhoto || user?.avatar || PRESET_AVATARS[0]);
    setSkillsList(data.skills || []);
    setExperienceList(data.experience || []);
    setEducationList(data.education || []);
    setResumeData(data.resume || null);
  };

  const handleStartEdit = () => {
    populateFormWithProfile(profile);
    setMode('edit');
  };

  const handleStartCreate = () => {
    reset({
      fullName: '',
      email: '',
      mobileNumber: '',
      address: '',
      headline: '',
      bio: '',
      profilePhoto: PRESET_AVATARS[0],
    });
    setAvatarPreview(PRESET_AVATARS[0]);
    setSkillsList([]);
    setExperienceList([]);
    setEducationList([]);
    setResumeData(null);
    setMode('create');
  };

  // Add Skill Tag
  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || newSkillInput).trim();
    if (!trimmed) return;
    if (skillsList.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.info(`"${trimmed}" is already added.`);
      setNewSkillInput('');
      return;
    }
    setSkillsList([...skillsList, trimmed]);
    setNewSkillInput('');
  };

  // Remove Skill Tag
  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  // Add Experience Entry
  const handleAddExperience = () => {
    if (!expDraft.title.trim() || !expDraft.company.trim()) {
      toast.warning('Please provide both Job Title and Company.');
      return;
    }
    const newEntry = {
      id: `exp-${Date.now()}`,
      ...expDraft,
    };
    setExperienceList([newEntry, ...experienceList]);
    setExpDraft({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: 'Present',
      current: true,
      description: '',
    });
    setShowAddExp(false);
    toast.success('Experience record added!');
  };

  // Remove Experience Entry
  const handleRemoveExperience = (id) => {
    setExperienceList(experienceList.filter((e) => e.id !== id));
  };

  // Add Education Entry
  const handleAddEducation = () => {
    if (!eduDraft.degree.trim() || !eduDraft.institution.trim()) {
      toast.warning('Please provide both Degree and Institution.');
      return;
    }
    const newEntry = {
      id: `edu-${Date.now()}`,
      ...eduDraft,
    };
    setEducationList([newEntry, ...educationList]);
    setEduDraft({
      degree: '',
      institution: '',
      fieldOfStudy: '',
      graduationYear: '',
      grade: '',
    });
    setShowAddEdu(false);
    toast.success('Education record added!');
  };

  // Remove Education Entry
  const handleRemoveEducation = (id) => {
    setEducationList(educationList.filter((e) => e.id !== id));
  };

  // Resume Upload Simulator (UI Only)
  const handleResumeFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5MB size limit.');
      return;
    }

    const simulatedResume = {
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      fileType: file.type || 'application/pdf',
    };

    setResumeData(simulatedResume);
    toast.success(`Resume "${file.name}" uploaded successfully (UI)!`);
  };

  // Handle Form Submission (Edit / Create)
  const onSubmit = async (formData) => {
    if (skillsList.length === 0) {
      toast.warning('Please add at least one technical or professional skill.');
      return;
    }

    setIsSubmitting(true);
    const updatedProfile = {
      ...formData,
      profilePhoto: avatarPreview || formData.profilePhoto || PRESET_AVATARS[0],
      skills: skillsList,
      experience: experienceList,
      education: educationList,
      resume: resumeData,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (mode === 'create') {
        await profileService.createProfile(updatedProfile);
        toast.success(
          'Candidate Profile created successfully! Replicated in Network Tab (POST 201) & LocalStorage.'
        );
      } else {
        await profileService.saveProfile(updatedProfile);
        toast.success(
          'Candidate Profile updated successfully! Replicated in Network Tab (PUT 200) & LocalStorage.'
        );
      }

      // Sync with global auth state
      updateAuthProfile({
        name: updatedProfile.fullName,
        email: updatedProfile.email,
        phone: updatedProfile.mobileNumber,
        location: updatedProfile.address,
        avatar: updatedProfile.profilePhoto,
        title: updatedProfile.headline,
        bio: updatedProfile.bio,
      });

      setProfile(updatedProfile);
      setMode('view');
    } catch (err) {
      toast.error('Failed to save profile: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const watchedPhoto = watch('profilePhoto');
  useEffect(() => {
    if (watchedPhoto) {
      setAvatarPreview(watchedPhoto);
    }
  }, [watchedPhoto]);

  return (
    <div className="w-full space-y-6">
      {/* Edge-to-Edge Header Banner (Vertically centered title, no star badge) */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900/80 px-6 py-6 sm:px-8 backdrop-blur-xl border border-white/15 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center my-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-normal">
              Candidate Profile
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {mode === 'view' ? (
              <>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 border border-white/20 transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-1.5"
                  title="Initialize a fresh candidate profile"
                >
                  <Plus className="w-4 h-4" />
                  Create New Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setMode('view')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                Cancel & View Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW PROFILE MODE */}
      {mode === 'view' ? (
        <div className="space-y-6">
          {/* Main Identity Card */}
          <div className="w-full rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Top Banner Gradient */}
            <div className="h-36 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/60 relative border-b border-white/10">
              <div className="absolute right-6 top-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <Shield className="w-3.5 h-3.5" />
                  Verified Candidate
                </span>
              </div>
            </div>

            {/* Profile Avatar & Contact Header */}
            <div className="px-6 sm:px-10 pb-8 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-6 gap-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                  <img
                    src={profile.profilePhoto || PRESET_AVATARS[0]}
                    alt={profile.fullName}
                    className="w-28 h-28 rounded-2xl ring-4 ring-[#070913] shadow-2xl object-cover bg-slate-900"
                  />
                  <div className="pt-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {profile.fullName || user?.name || 'Candidate Name'}
                    </h1>
                    <p className="text-xs sm:text-sm text-blue-400 font-semibold mt-0.5">
                      {profile.headline || 'Senior Software Engineer'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md border border-white/20 transition-all flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Details
                  </button>
                </div>
              </div>

              {/* Non-Interactive Contact Badges Bar (Email, Mobile Number, Address) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 border-y border-white/10 text-xs">
                {/* Non-interactive Email */}
                <div className="flex items-center gap-2.5 cursor-default select-none pointer-events-none">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Email Address
                    </span>
                    <span className="text-white font-medium truncate block">
                      {profile.email || user?.email || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Non-interactive Mobile Number */}
                <div className="flex items-center gap-2.5 cursor-default select-none pointer-events-none">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Mobile Number
                    </span>
                    <span className="text-white font-medium truncate block">
                      {profile.mobileNumber || user?.phone || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Non-interactive Address */}
                <div className="flex items-center gap-2.5 cursor-default select-none pointer-events-none">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Current Location
                    </span>
                    <span className="text-white font-medium truncate block">
                      {profile.address || user?.location || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio / Summary */}
              {profile.bio && (
                <div className="mt-6 space-y-1.5">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                    Professional Summary
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 2-Column Grid: Skills & Resume (Left) | Experience & Education (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Left Column: Skills & Resume Card */}
            <div className="space-y-6">
              {/* Skills Cloud Card */}
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Skills & Competencies
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {profile.skills?.length || 0}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-white/5 text-blue-300 border border-white/10 shadow-xs"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!profile.skills || profile.skills.length === 0) && (
                    <p className="text-xs text-slate-400">No skills added yet.</p>
                  )}
                </div>
              </div>

              {/* Resume Card (UI Only) */}
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Resume & Portfolio
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    UI Only
                  </span>
                </div>

                {profile.resume ? (
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {profile.resume.fileName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {profile.resume.fileSize} • Uploaded {profile.resume.uploadDate}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toast.info(
                          `Downloading "${profile.resume.fileName}" (UI simulation verified).`
                        )
                      }
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                      title="Download Resume (UI)"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl border border-dashed border-white/15 text-center space-y-2">
                    <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400">No resume uploaded.</p>
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-300 hover:text-white border border-blue-500/30 transition-all inline-flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Resume
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Work Experience & Education */}
            <div className="lg:col-span-2 space-y-6">
              {/* Work Experience Section */}
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-400" />
                    Work Experience
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {profile.experience?.length || 0} Positions
                  </span>
                </div>

                <div className="space-y-4">
                  {profile.experience?.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h4 className="text-sm font-bold text-white">{exp.title}</h4>
                          <p className="text-xs text-blue-400 font-semibold">{exp.company}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>
                            {exp.startDate} – {exp.endDate}
                          </span>
                          {exp.current && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                      {exp.location && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {exp.location}
                        </p>
                      )}
                      {exp.description && (
                        <p className="text-xs text-slate-300 leading-relaxed pt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}

                  {(!profile.experience || profile.experience.length === 0) && (
                    <div className="p-8 text-center border border-dashed border-white/15 rounded-xl space-y-2">
                      <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-400">No work experience entries recorded.</p>
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white"
                      >
                        Add Experience
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Education Section */}
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    Education & Credentials
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {profile.education?.length || 0} Degrees
                  </span>
                </div>

                <div className="space-y-4">
                  {profile.education?.map((edu) => (
                    <div
                      key={edu.id}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all space-y-1.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h4 className="text-sm font-bold text-white">{edu.degree}</h4>
                          <p className="text-xs text-purple-300 font-semibold">{edu.institution}</p>
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          Class of {edu.graduationYear}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                        {edu.fieldOfStudy && <span>Major: {edu.fieldOfStudy}</span>}
                        {edu.grade && (
                          <span className="text-emerald-300 font-semibold font-mono">
                            {edu.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!profile.education || profile.education.length === 0) && (
                    <div className="p-8 text-center border border-dashed border-white/15 rounded-xl space-y-2">
                      <GraduationCap className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-400">No education entries recorded.</p>
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white"
                      >
                        Add Education
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* EDIT OR CREATE PROFILE MODE (Form Validation with React Hook Form) */
        <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                {mode === 'create' ? 'Create Candidate Profile' : 'Edit Candidate Profile'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update personal contact fields, skills, work experience, education, and resume
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMode('view')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Profile Photo & Presets */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-400" />
                Profile Photo
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={avatarPreview || PRESET_AVATARS[0]}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-2xl ring-2 ring-blue-500/50 object-cover bg-slate-900 shadow-md flex-shrink-0"
                />

                <div className="space-y-2 flex-1 w-full">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Photo URL
                    </label>
                    <input
                      type="text"
                      {...register('profilePhoto')}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                    />
                  </div>

                  {/* Preset Avatar Chooser */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Or pick preset:</span>
                    <div className="flex items-center gap-1.5">
                      {PRESET_AVATARS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAvatarPreview(preset);
                            setValue('profilePhoto', preset);
                          }}
                          className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all ${
                            avatarPreview === preset ? 'border-blue-400 scale-105' : 'border-transparent'
                          }`}
                        >
                          <img src={preset} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Core Personal & Contact Details (Form Validation) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Personal Information & Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('fullName', {
                      required: 'Full name is required',
                      minLength: { value: 3, message: 'Name must be at least 3 characters' },
                    })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                  {errors.fullName && (
                    <p className="text-rose-400 text-[11px] mt-0.5">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address format',
                      },
                    })}
                    placeholder="e.g. alex.morgan@example.com"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                  {errors.email && (
                    <p className="text-rose-400 text-[11px] mt-0.5">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Mobile Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('mobileNumber', {
                      required: 'Mobile phone number is required',
                      minLength: { value: 7, message: 'Enter a valid phone number' },
                    })}
                    placeholder="e.g. +1 (555) 349-8201"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                  {errors.mobileNumber && (
                    <p className="text-rose-400 text-[11px] mt-0.5">
                      {errors.mobileNumber.message}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('address', {
                      required: 'Address is required',
                      minLength: { value: 4, message: 'Address is too short' },
                    })}
                    placeholder="e.g. 742 Innovation Way, Austin, TX 78701"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                  {errors.address && (
                    <p className="text-rose-400 text-[11px] mt-0.5">{errors.address.message}</p>
                  )}
                </div>
              </div>

              {/* Headline & Summary */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    {...register('headline')}
                    placeholder="e.g. Senior Frontend & React Engineer"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Professional Bio / Summary
                  </label>
                  <textarea
                    rows={3}
                    {...register('bio')}
                    placeholder="Provide a concise summary of your engineering achievements and technical focus..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Section 3: Skills Management */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Skills ({skillsList.length}) <span className="text-rose-400">*</span>
                </h3>
                <span className="text-[11px] text-slate-400">Press enter or click Add</span>
              </div>

              {/* Input for adding new skill */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter..."
                  className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs"
                >
                  Add Skill
                </button>
              </div>

              {/* Removable Skills Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skillsList.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-300 transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Popular suggestions */}
              <div className="pt-2 border-t border-white/5">
                <span className="text-[11px] text-slate-400 block mb-1.5">Suggested popular skills:</span>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_SKILLS.filter((s) => !skillsList.includes(s)).map((skill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddSkill(skill)}
                      className="px-2 py-0.5 text-[10px] rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Work Experience Entries */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Work Experience ({experienceList.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddExp(!showAddExp)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Role
                </button>
              </div>

              {/* New Experience Entry Sub-Form */}
              {showAddExp && (
                <div className="p-4 rounded-xl bg-white/[0.05] border border-emerald-500/30 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-300">Add New Experience Entry</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={expDraft.title}
                      onChange={(e) => setExpDraft({ ...expDraft, title: e.target.value })}
                      placeholder="Job Title (e.g. Senior Frontend Engineer)"
                      className="px-3 py-2 text-xs rounded-lg border border-white/20 bg-white/[0.08] text-white outline-none focus:border-emerald-400"
                    />
                    <input
                      type="text"
                      value={expDraft.company}
                      onChange={(e) => setExpDraft({ ...expDraft, company: e.target.value })}
                      placeholder="Company Name (e.g. TechCorp Innovations)"
                      className="px-3 py-2 text-xs rounded-lg border border-white/20 bg-white/[0.08] text-white outline-none focus:border-emerald-400"
                    />
                    <input
                      type="text"
                      value={expDraft.location}
                      onChange={(e) => setExpDraft({ ...expDraft, location: e.target.value })}
                      placeholder="Location (e.g. Austin, TX / Remote)"
                      className="px-3 py-2 text-xs rounded-lg border border-white/20 bg-white/[0.08] text-white outline-none focus:border-emerald-400"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={expDraft.startDate}
                        onChange={(e) => setExpDraft({ ...expDraft, startDate: e.target.value })}
                        placeholder="Start Date (e.g. 2023-01)"
                        className="px-3 py-2 text-xs rounded-lg border border-white/20 bg-white/[0.08] text-white outline-none focus:border-emerald-400"
                      />
                      <input
                        type="text"
                        value={expDraft.endDate}
                        onChange={(e) => setExpDraft({ ...expDraft, endDate: e.target.value })}
                        placeholder="End Date (e.g. Present)"
                        className="px-3 py-2 text-xs rounded-lg border border-white/20 bg-white/[0.08] text-white outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={expDraft.description}
                    onChange={(e) => setExpDraft({ ...expDraft, description: e.target.value })}
                    placeholder="Key accomplishments and technical scope..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-white/20 bg-white/[0.08] text-white outline-none focus:border-emerald-400"
                  ></textarea>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddExp(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                    >
                      Save Role
                    </button>
                  </div>
                </div>
              )}

              {/* List of Experiences */}
              <div className="space-y-2">
                {experienceList.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-lg bg-white/[0.02] border border-white/10 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <strong className="text-white block">{exp.title}</strong>
                      <span className="text-blue-400 font-semibold">{exp.company}</span>
                      <span className="text-slate-400 ml-2">
                        ({exp.startDate} – {exp.endDate})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="text-rose-400 hover:text-rose-200 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Education Entries */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  Education Credentials ({educationList.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddEdu(!showAddEdu)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Degree
                </button>
              </div>

              {/* New Education Entry Sub-Form */}
              {showAddEdu && (
                <div className="p-4 rounded-xl bg-white/[0.05] border border-purple-500/30 space-y-3">
                  <h4 className="text-xs font-bold text-purple-300">Add New Education Credential</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={eduDraft.degree}
                      onChange={(e) => setEduDraft({ ...eduDraft, degree: e.target.value })}
                      placeholder="Degree (e.g. B.S. in Computer Science)"
                      className="px-3 py-2 text-xs rounded-lg border border-white/20 bg-white/[0.08] text-white outline-none focus:border-purple-400"
                    />
                    <input
                      type="text"
                      value={eduDraft.institution}
                      onChange={(e) => setEduDraft({ ...eduDraft, institution: e.target.value })}
                      placeholder="Institution (e.g. University of Texas at Austin)"
                      className="px-3 py-2 text-xs rounded-lg border border-white/20 bg-white/[0.08] text-white outline-none focus:border-purple-400"
                    />
                    <input
                      type="text"
                      value={eduDraft.fieldOfStudy}
                      onChange={(e) => setEduDraft({ ...eduDraft, fieldOfStudy: e.target.value })}
                      placeholder="Field of Study (e.g. Software Engineering)"
                      className="px-3 py-2 text-xs rounded-lg border border-white/20 bg-white/[0.08] text-white outline-none focus:border-purple-400"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={eduDraft.graduationYear}
                        onChange={(e) =>
                          setEduDraft({ ...eduDraft, graduationYear: e.target.value })
                        }
                        placeholder="Grad Year (e.g. 2020)"
                        className="px-3 py-2 text-xs rounded-lg border border-white/20 bg-white/[0.08] text-white outline-none focus:border-purple-400"
                      />
                      <input
                        type="text"
                        value={eduDraft.grade}
                        onChange={(e) => setEduDraft({ ...eduDraft, grade: e.target.value })}
                        placeholder="Grade/GPA (e.g. 3.8 GPA)"
                        className="px-3 py-2 text-xs rounded-lg border border-white/20 bg-white/[0.08] text-white outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddEdu(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="px-4 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                    >
                      Save Degree
                    </button>
                  </div>
                </div>
              )}

              {/* List of Education */}
              <div className="space-y-2">
                {educationList.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-3 rounded-lg bg-white/[0.02] border border-white/10 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <strong className="text-white block">{edu.degree}</strong>
                      <span className="text-purple-300 font-semibold">{edu.institution}</span>
                      <span className="text-slate-400 ml-2">({edu.graduationYear})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="text-rose-400 hover:text-rose-200 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6: Resume Upload (UI Only) */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Resume Document (UI Only)
                </h3>
                <span className="text-[11px] text-slate-400">PDF, DOC, DOCX up to 5MB</span>
              </div>

              {resumeData ? (
                <div className="p-3.5 rounded-xl bg-white/[0.05] border border-cyan-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{resumeData.fileName}</p>
                      <p className="text-[10px] text-slate-400">
                        {resumeData.fileSize} • Uploaded {resumeData.uploadDate}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeData(null);
                      toast.info('Resume attachment removed.');
                    }}
                    className="text-rose-400 hover:text-rose-200 text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-white/20 hover:border-cyan-400/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center block">
                  <Upload className="w-8 h-8 text-cyan-400 mb-2" />
                  <p className="text-xs font-semibold text-white">Click or drag & drop to upload resume</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Supports standard PDF or Word CVs</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setMode('view')}
                className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-white/10 hover:bg-white/15 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 border border-white/20 transition-all flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  'Saving Profile...'
                ) : mode === 'create' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Create Profile
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
