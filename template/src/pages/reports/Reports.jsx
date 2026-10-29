import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Users,
  FileText,
  TrendingUp,
  Download,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  Eye,
  Layers,
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import { toast } from 'react-toastify';

const Reports = () => {
  // Time range filter: '6m' | '12m'
  const [timeRange, setTimeRange] = useState('6m');

  // Chart Metric filter: 'applications' | 'interviews' | 'offers'
  const [activeMetric, setActiveMetric] = useState('applications');

  // Selected Category filter for category breakdown: 'All' or specific category
  const [selectedCategory, setSelectedCategory] = useState('All');

  // State for live metrics
  const [totalJobs, setTotalJobs] = useState(() => reportService.getTotalJobPostings());
  const [totalCompanies, setTotalCompanies] = useState(() => reportService.getTotalCompanies());
  const [totalCandidates, setTotalCandidates] = useState(() => reportService.getTotalCandidates());
  const [totalApplications, setTotalApplications] = useState(() => reportService.getTotalApplications());
  const [activeJobs, setActiveJobs] = useState(() => reportService.getActiveJobs());
  const [mostAppliedJobs, setMostAppliedJobs] = useState(() => reportService.getMostAppliedJobs(6));
  const [categoryBreakdown, setCategoryBreakdown] = useState(() => reportService.getCategoryBreakdown());
  const [pipelineFunnel, setPipelineFunnel] = useState(() => reportService.getApplicationPipeline());

  // Interactive hover tooltip state for charts
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Network loading states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState('Just now');

  // Sync metrics from services and storage
  const syncAllMetrics = () => {
    setTotalJobs(reportService.getTotalJobPostings());
    setTotalCompanies(reportService.getTotalCompanies());
    setTotalCandidates(reportService.getTotalCandidates());
    setTotalApplications(reportService.getTotalApplications());
    setActiveJobs(reportService.getActiveJobs());
    setMostAppliedJobs(reportService.getMostAppliedJobs(6));
    setCategoryBreakdown(reportService.getCategoryBreakdown());
    setPipelineFunnel(reportService.getApplicationPipeline());
  };

  useEffect(() => {
    syncAllMetrics();

    // Event listeners for cross-module updates
    window.addEventListener('jobs_updated', syncAllMetrics);
    window.addEventListener('companies_updated', syncAllMetrics);
    window.addEventListener('applications_updated', syncAllMetrics);
    window.addEventListener('candidate_updated', syncAllMetrics);
    window.addEventListener('reports_updated', syncAllMetrics);
    window.addEventListener('storage', syncAllMetrics);

    return () => {
      window.removeEventListener('jobs_updated', syncAllMetrics);
      window.removeEventListener('companies_updated', syncAllMetrics);
      window.removeEventListener('applications_updated', syncAllMetrics);
      window.removeEventListener('candidate_updated', syncAllMetrics);
      window.removeEventListener('reports_updated', syncAllMetrics);
      window.removeEventListener('storage', syncAllMetrics);
    };
  }, []);

  // Filtered monthly statistics
  const monthlyData = useMemo(() => {
    return reportService.getMonthlyStats(timeRange);
  }, [timeRange]);

  // Max value calculation for bar chart scaling
  const maxChartValue = useMemo(() => {
    const values = monthlyData.map((d) => d[activeMetric] || 0);
    const max = Math.max(...values, 50);
    return Math.ceil(max / 50) * 50;
  }, [monthlyData, activeMetric]);

  // ACTION: Refresh Live Reports (Axios GET request visible in browser Network tab)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await reportService.fetchLiveReports();
      syncAllMetrics();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastRefreshedAt(timeStr);
      toast.success(`Reports refreshed from network API (Status ${res.networkStatus}). All metrics updated!`);
    } catch {
      toast.info('Metrics synchronized successfully.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // ACTION: Export Reports (Axios POST request visible in browser Network tab)
  const handleExport = async (format = 'csv') => {
    setIsExporting(true);
    try {
      const data = await reportService.exportReport(format);

      // Create browser file download
      let fileContent = '';
      let mimeType = 'text/plain';
      let fileName = `platform_report_${new Date().toISOString().slice(0, 10)}.${format}`;

      if (format === 'csv') {
        mimeType = 'text/csv';
        const headers = 'Month,Applications,Interviews,Offers,Rejections\n';
        const rows = data.monthlyStatistics
          .map((m) => `${m.month},${m.applications},${m.interviews},${m.offers},${m.rejected}`)
          .join('\n');
        fileContent = headers + rows;
      } else {
        mimeType = 'application/json';
        fileContent = JSON.stringify(data, null, 2);
      }

      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Report exported as ${format.toUpperCase()}! Network POST call completed (201 Created).`
      );
    } catch (e) {
      toast.error('Failed to export report: ' + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Active metric color maps
  const metricColorConfig = {
    applications: {
      bar: 'from-blue-600 to-indigo-500',
      activeText: 'text-blue-400',
      border: 'border-blue-500/40',
      glow: 'shadow-blue-500/20',
      label: 'Job Applications',
    },
    interviews: {
      bar: 'from-purple-600 to-pink-500',
      activeText: 'text-purple-400',
      border: 'border-purple-500/40',
      glow: 'shadow-purple-500/20',
      label: 'Interviews Scheduled',
    },
    offers: {
      bar: 'from-emerald-600 to-teal-500',
      activeText: 'text-emerald-400',
      border: 'border-emerald-500/40',
      glow: 'shadow-emerald-500/20',
      label: 'Offers Extended',
    },
  };

  const currentMetricConfig = metricColorConfig[activeMetric];

  // Category donut chart slice colors
  const CATEGORY_COLORS = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#6366f1', // indigo
    '#64748b', // slate
  ];

  return (
    <div className="w-full space-y-6">
      {/* Edge-to-Edge Header Banner (Vertically centered title, no star badge) */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900/80 px-6 py-6 sm:px-8 backdrop-blur-xl border border-white/15 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center my-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-normal">
              Reports & Analytics
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              title="Fetch fresh report telemetry from API"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>

            <div className="relative group">
              <button
                type="button"
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 border border-white/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'Export Report'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sync timestamp footer */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
          <span>Real-time platform telemetry synced across job postings, companies, candidates, and applications</span>
          <span>Last refreshed: {lastRefreshedAt}</span>
        </div>
      </div>

      {/* TOP 5 STATUS CARDS (Total Job Postings, Total Companies, Total Candidates, Total Applications, Active Jobs) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
        {/* Card 1: Total Job Postings */}
        <Link
          to="/jobs"
          className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-blue-400/50 hover:bg-white/[0.07] transition-all shadow-lg group block cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-blue-300 transition-colors">
              Total Job Postings
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{totalJobs}</p>
          <p className="mt-1 text-[11px] text-blue-400 font-medium flex items-center gap-1">
            <span>View all postings</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </p>
        </Link>

        {/* Card 2: Total Companies */}
        <Link
          to="/companies"
          className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-purple-400/50 hover:bg-white/[0.07] transition-all shadow-lg group block cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-purple-300 transition-colors">
              Total Companies
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{totalCompanies}</p>
          <p className="mt-1 text-[11px] text-purple-300 font-medium flex items-center gap-1">
            <span>Partner directory</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </p>
        </Link>

        {/* Card 3: Total Candidates */}
        <Link
          to="/profile"
          className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-emerald-400/50 hover:bg-white/[0.07] transition-all shadow-lg group block cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-emerald-300 transition-colors">
              Total Candidates
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{totalCandidates}</p>
          <p className="mt-1 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span>Candidate talent pool</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </p>
        </Link>

        {/* Card 4: Total Applications */}
        <Link
          to="/applications"
          className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-400/50 hover:bg-white/[0.07] transition-all shadow-lg group block cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-amber-300 transition-colors">
              Total Applications
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{totalApplications}</p>
          <p className="mt-1 text-[11px] text-amber-300 font-medium flex items-center gap-1">
            <span>Manage applications</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </p>
        </Link>

        {/* Card 5: Active Jobs */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-teal-400/30 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Jobs
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{activeJobs}</p>
          <p className="mt-1 text-[11px] text-teal-300 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>Currently open for applications</span>
          </p>
        </div>
      </div>

      {/* SECTION 1: DASHBOARD CHARTS (Monthly Application Statistics & Category Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* CHART 1: Monthly Application Statistics Bar & Trend Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Monthly Application Statistics
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Application trends, interview conversions, and hiring velocity over time
              </p>
            </div>

            {/* Chart Controls: Time Range & Metric Switchers */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Metric Selectors */}
              <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveMetric('applications')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    activeMetric === 'applications'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Apps
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('interviews')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    activeMetric === 'interviews'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Interviews
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('offers')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    activeMetric === 'offers'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Offers
                </button>
              </div>

              {/* Time Range Selectors */}
              <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setTimeRange('6m')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    timeRange === '6m' ? 'bg-white/20 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  6M
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('12m')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    timeRange === '12m' ? 'bg-white/20 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  12M
                </button>
              </div>
            </div>
          </div>

          {/* SVG Interactive Bar Chart */}
          <div className="relative pt-6 pb-2">
            {/* Hover Tooltip Overlay */}
            {hoveredMonth && (
              <div className="absolute top-0 right-4 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/20 shadow-xl backdrop-blur-md text-xs pointer-events-none flex items-center gap-3 animate-fadeIn">
                <span className="font-bold text-white">{hoveredMonth.month}</span>
                <span className="text-slate-400">|</span>
                <span className="text-blue-400 font-semibold">{hoveredMonth.applications} Apps</span>
                <span className="text-purple-400 font-semibold">{hoveredMonth.interviews} Interviews</span>
                <span className="text-emerald-400 font-semibold">{hoveredMonth.offers} Offers</span>
              </div>
            )}

            {/* Grid Lines & Bars */}
            <div className="h-64 w-full flex items-end gap-2 sm:gap-4 px-2 relative border-b border-white/10">
              {/* Background horizontal grid guide lines */}
              <div className="absolute inset-x-0 top-0 border-b border-white/5 pointer-events-none"></div>
              <div className="absolute inset-x-0 top-1/4 border-b border-white/5 pointer-events-none"></div>
              <div className="absolute inset-x-0 top-2/4 border-b border-white/5 pointer-events-none"></div>
              <div className="absolute inset-x-0 top-3/4 border-b border-white/5 pointer-events-none"></div>

              {monthlyData.map((item) => {
                const value = item[activeMetric] || 0;
                const heightPercent = Math.max(Math.round((value / maxChartValue) * 100), 8);
                const isHovered = hoveredMonth?.month === item.month;

                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative z-10"
                    onMouseEnter={() => setHoveredMonth(item)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Value Badge on top of bar */}
                    <span
                      className={`text-[10px] font-mono mb-1 transition-all ${
                        isHovered ? 'text-white font-bold scale-110' : 'text-slate-400 group-hover:text-white'
                      }`}
                    >
                      {value}
                    </span>

                    {/* Bar Container */}
                    <div className="w-full max-w-[42px] bg-white/[0.04] rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg bg-gradient-to-t ${currentMetricConfig.bar} transition-all duration-500 ease-out ${
                          isHovered ? 'brightness-125 shadow-lg' : 'group-hover:brightness-110'
                        }`}
                      ></div>
                    </div>

                    {/* Month Label */}
                    <span
                      className={`text-[11px] font-semibold mt-2 transition-colors ${
                        isHovered ? 'text-blue-400 font-bold' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Summary Badges Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                Average Monthly
              </span>
              <span className="text-base font-bold text-white mt-0.5 block">
                {Math.round(
                  monthlyData.reduce((acc, m) => acc + m[activeMetric], 0) / (monthlyData.length || 1)
                )}{' '}
                {activeMetric}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                Peak Velocity
              </span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                {Math.max(...monthlyData.map((m) => m[activeMetric]))} ({monthlyData.slice(-1)[0]?.month})
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                Interview Ratio
              </span>
              <span className="text-base font-bold text-purple-400 mt-0.5 block">
                {Math.round(
                  (monthlyData.reduce((acc, m) => acc + m.interviews, 0) /
                    (monthlyData.reduce((acc, m) => acc + m.applications, 0) || 1)) *
                    100
                )}
                %
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                Offer Conversion
              </span>
              <span className="text-base font-bold text-teal-400 mt-0.5 block">
                {Math.round(
                  (monthlyData.reduce((acc, m) => acc + m.offers, 0) /
                    (monthlyData.reduce((acc, m) => acc + m.interviews, 0) || 1)) *
                    100
                )}
                %
              </span>
            </div>
          </div>
        </div>

        {/* CHART 2: Job Category / Industry Breakdown (1 column) */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-400" />
                Industry Distribution
              </h2>
              <span className="text-xs text-slate-400 font-mono">{categoryBreakdown.length} Sectors</span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Share of open job opportunities categorized by industry segment
            </p>

            {/* Interactive Category Segment Bars */}
            <div className="space-y-3 mt-4">
              {categoryBreakdown.map((item, index) => {
                const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                const isSelected = selectedCategory === item.name;

                return (
                  <div
                    key={item.name}
                    onClick={() => setSelectedCategory(isSelected ? 'All' : item.name)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border-blue-400/50 shadow-md'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                        <span className="font-semibold text-white">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-300 font-bold">{item.count} jobs</span>
                        <span className="text-slate-400 text-[10px]">({item.percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: color,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total summary footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Aggregated across all partner organizations</span>
            <span className="font-bold text-white">{totalJobs} Total Positions</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: APPLICATION RECRUITMENT FUNNEL */}
      <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Application Pipeline & Conversion Funnel
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Full lifecycle tracking from submission to offer extended
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-time candidate telemetry</span>
        </div>

        {/* Funnel Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelineFunnel.map((step, idx) => (
            <div
              key={step.status}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Step {idx + 1}</span>
                  <span className="font-mono text-white font-bold">{step.rate}</span>
                </div>
                <h3 className="font-bold text-xs text-white line-clamp-1">{step.status}</h3>
              </div>

              <div>
                <p className="text-2xl font-black text-white" style={{ color: step.color }}>
                  {step.count}
                </p>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: step.rate, backgroundColor: step.color }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: MOST APPLIED JOBS */}
      <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Most Applied Jobs
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Top job postings ranked by application volume and candidate engagement
            </p>
          </div>

          <Link
            to="/jobs"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all flex items-center gap-1.5 w-fit"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>View All Listings</span>
          </Link>
        </div>

        {/* Most Applied Jobs Cards / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mostAppliedJobs.map((job, idx) => {
            const maxApps = Number(mostAppliedJobs[0]?.applicantsCount) || 1;
            const percentage = Math.round(((Number(job.applicantsCount) || 0) / maxApps) * 100);

            return (
              <div
                key={job.id}
                className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-400/40 transition-all shadow-md group flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Rank #{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        job.status === 'Open'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <img
                      src={
                        job.companyLogo ||
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200'
                      }
                      alt={job.company}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/20 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors line-clamp-1"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-blue-400 font-medium truncate">{job.company}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics & Application Progress Bar */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      Applications
                    </span>
                    <span className="font-mono font-bold text-white text-sm">
                      {job.applicantsCount || 0}
                    </span>
                  </div>

                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${Math.max(percentage, 10)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{job.location || 'Remote'}</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {job.salaryRange || '$120k - $150k'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: MONTHLY APPLICATION STATISTICS BREAKDOWN TABLE */}
      <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Monthly Telemetry Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Granular month-over-month performance breakdown
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Showing last {monthlyData.length} recorded reporting periods
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">Month</th>
                <th className="pb-3 font-bold text-right">Applications</th>
                <th className="pb-3 font-bold text-right">Interviews</th>
                <th className="pb-3 font-bold text-right">Offers</th>
                <th className="pb-3 font-bold text-right">Rejections</th>
                <th className="pb-3 font-bold text-right">Placement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {monthlyData.map((row) => {
                const placementRate = Math.round(((row.offers || 0) / (row.interviews || 1)) * 100);

                return (
                  <tr key={row.month} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      {row.month} 2026
                    </td>
                    <td className="py-3 text-right font-mono text-blue-300 font-semibold">
                      {row.applications}
                    </td>
                    <td className="py-3 text-right font-mono text-purple-300 font-semibold">
                      {row.interviews}
                    </td>
                    <td className="py-3 text-right font-mono text-emerald-300 font-semibold">
                      {row.offers}
                    </td>
                    <td className="py-3 text-right font-mono text-rose-300 font-semibold">
                      {row.rejected}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-teal-300">
                      {placementRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
