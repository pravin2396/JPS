import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Briefcase,
  UserCheck,
  Search,
  Building,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  const benefits = [
    {
      icon: <Search className="w-5 h-5 text-blue-600" />,
      title: 'Curated Opportunities',
      desc: 'Browse hundreds of verified jobs across engineering, design, marketing, and leadership.',
    },
    {
      icon: <Building className="w-5 h-5 text-emerald-600" />,
      title: 'Top Hiring Companies',
      desc: 'Connect directly with certified hiring managers, tech startups, and global enterprises.',
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-indigo-600" />,
      title: 'Streamlined Applications',
      desc: 'Apply in seconds with your tailored profile and track real-time application updates.',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      title: 'Career Acceleration',
      desc: 'Access career insights, market salary ranges, and industry benchmarks to level up.',
    },
  ];

  return (
    <div className="space-y-16 py-10">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
          <Award className="w-3.5 h-3.5 text-blue-600" />
          <span>The Next-Generation Career & Recruitment Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Find Your Dream Job or Hire{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Exceptional Talent
          </span>
        </h1>

        <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
          Connecting ambitious job seekers with leading organizations worldwide. Fast, transparent, and seamless hiring.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              Open {user?.role === 'recruiter' ? 'Recruiter' : 'Candidate'} Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Role Selection Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Explore by Your Role</h2>
          <p className="text-sm text-slate-500 mt-1">
            Tailored experiences built specifically for candidates seeking jobs and employers looking to hire
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Candidate Card */}
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-8 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">For Job Seekers</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Candidate Portal</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Explore thousands of job openings, submit quick applications, and stay organized through your personalized dashboard.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign In as Candidate <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Recruiter Card */}
          <div className="bg-white rounded-2xl border-2 border-emerald-200 p-8 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">For Employers</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Recruiter Portal</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Post job vacancies, review talent pipelines, and collaborate with your hiring team to acquire top qualified candidates.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Sign In as Recruiter <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Why Professionals Choose JobPortal</h2>
            <p className="text-sm text-slate-500 mt-2">
              Everything you need to navigate the hiring landscape with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-white hover:border-slate-300 transition-all hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
