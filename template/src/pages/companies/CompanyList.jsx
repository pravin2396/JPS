import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  Building2,
  PlusCircle,
  Search,
  MapPin,
  Globe,
  Mail,
  Users,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { toast } from 'react-toastify';
import { VALIDATION_RULES } from '../../utils/validation';

const ITEMS_PER_PAGE = 6;

const INDUSTRIES = [
  'All',
  'Technology & Software',
  'Cloud Infrastructure',
  'Fintech & AI',
  'Cybersecurity',
  'Healthcare Tech',
  'E-Commerce & Retail',
];

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Filter, Sort, Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const addForm = useForm({
    defaultValues: {
      name: '',
      industry: 'Technology & Software',
      location: '',
      website: '',
      email: '',
      employees: '100 - 250',
      logo: '',
      description: '',
    },
  });

  const editForm = useForm();

  // Load companies (Calls Third-Party API via Axios + LocalStorage sync)
  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await companyService.fetchCompanies();
      setCompanies(data);
    } catch (err) {
      console.warn('API error:', err?.message);
      setError('Failed to fetch companies from third-party API. Showing offline cache.');
      setCompanies(companyService.getLocalCompanies());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Set values when editing
  useEffect(() => {
    if (editingCompany) {
      editForm.reset({
        name: editingCompany.name,
        industry: editingCompany.industry,
        location: editingCompany.location,
        website: editingCompany.website,
        email: editingCompany.email,
        employees: editingCompany.employees,
        logo: editingCompany.logo,
        description: editingCompany.description,
      });
    }
  }, [editingCompany, editForm]);

  // CREATE / ADD COMPANY
  const handleAddCompany = async (formData) => {
    setIsSubmitting(true);
    try {
      const created = await companyService.addCompany(formData);
      setCompanies((prev) => [created, ...prev]);
      setShowAddModal(false);
      addForm.reset();
      toast.success(
        `Added "${created.name}"! Replicated in Network Tab (POST 201), LocalStorage, and Dashboard cards (+1).`
      );
    } catch (err) {
      toast.error('Failed to create company: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE / EDIT COMPANY
  const handleEditCompany = async (formData) => {
    if (!editingCompany) return;
    setIsSubmitting(true);
    try {
      const updated = await companyService.updateCompany(editingCompany.id, formData);
      setCompanies((prev) =>
        prev.map((c) => (c.id === editingCompany.id ? updated : c))
      );
      setEditingCompany(null);
      toast.success(
        `Updated "${updated.name}"! Replicated in Network Tab (PUT 200) and LocalStorage.`
      );
    } catch (err) {
      toast.error('Failed to update company: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE COMPANY
  const confirmDelete = async () => {
    if (!deletingCompany) return;
    setIsSubmitting(true);
    try {
      await companyService.deleteCompany(deletingCompany.id);
      setCompanies((prev) => prev.filter((c) => c.id !== deletingCompany.id));
      toast.info(
        `Deleted "${deletingCompany.name}". Replicated in Network Tab (DELETE 200), LocalStorage, and Dashboard cards (-1).`
      );
      setDeletingCompany(null);
    } catch (err) {
      toast.error('Failed to delete company: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // FILTER, SEARCH, SORT LOGIC
  const processedCompanies = useMemo(() => {
    let result = [...companies];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    // 2. Filter by Industry
    if (selectedIndustry !== 'All') {
      result = result.filter((c) => c.industry === selectedIndustry);
    }

    // 3. Sort by Name / Employees
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'employees-desc') {
      result.sort((a, b) => (parseInt(b.employees) || 0) - (parseInt(a.employees) || 0));
    } else if (sortBy === 'recent') {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [companies, searchQuery, selectedIndustry, sortBy]);

  // PAGINATION LOGIC
  const totalItems = processedCompanies.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedCompanies, currentPage]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedIndustry, sortBy]);

  return (
    <div className="w-full space-y-6">
      {/* Edge-to-Edge Hero Header Banner */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900/80 px-6 py-6 sm:px-8 backdrop-blur-xl border border-white/15 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center my-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-normal">
              Company Directory & Management
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 border border-white/20 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Add New Company
            </button>
            <button
              type="button"
              onClick={loadCompanies}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-1.5"
              title="Refresh from Third-Party API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync API
            </button>
          </div>
        </div>
      </div>

      {/* Search, Filter, Sort Controls Bar (Glassmorphic) */}
      <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search companies by name, location, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-white/15 bg-white/[0.07] text-white placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white/[0.12] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Industry */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-white/15 bg-[#0f142b] text-white outline-none focus:border-blue-400 transition-all appearance-none cursor-pointer"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind} className="bg-[#0f142b] text-white">
                  Industry: {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-white/15 bg-[#0f142b] text-white outline-none focus:border-blue-400 transition-all appearance-none cursor-pointer"
            >
              <option value="name-asc" className="bg-[#0f142b] text-white">Sort: Name (A to Z)</option>
              <option value="name-desc" className="bg-[#0f142b] text-white">Sort: Name (Z to A)</option>
              <option value="employees-desc" className="bg-[#0f142b] text-white">Sort: Employee Count</option>
              <option value="recent" className="bg-[#0f142b] text-white">Sort: Recently Added</option>
            </select>
          </div>
        </div>

        {/* Status Count & Active Filters Pills */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 pt-1 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-white">{paginatedCompanies.length}</strong> of{' '}
              <strong className="text-white">{totalItems}</strong> companies
            </span>
            {selectedIndustry !== 'All' && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] flex items-center gap-1">
                {selectedIndustry}
                <button
                  type="button"
                  onClick={() => setSelectedIndustry('All')}
                  className="hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          {(searchQuery || selectedIndustry !== 'All' || sortBy !== 'name-asc') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedIndustry('All');
                setSortBy('name-asc');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadCompanies}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold"
          >
            Retry API
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-12 bg-white/5 rounded"></div>
              <div className="h-8 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      ) : paginatedCompanies.length === 0 ? (
        /* Empty Results State */
        <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center shadow-lg space-y-3">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Companies Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            We couldn&apos;t find any companies matching your search or filters. Try adjusting your criteria or add a new company.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedIndustry('All');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 mt-2"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Company Cards Grid (Edge-to-Edge) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {paginatedCompanies.map((comp) => (
            <div
              key={comp.id}
              className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/25 transition-all shadow-xl p-6 flex flex-col justify-between group hover:-translate-y-1"
            >
              {/* Header Info */}
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={comp.logo}
                      alt={comp.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/15 bg-slate-900 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                        {comp.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-blue-400 block truncate">
                        {comp.industry}
                      </span>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingCompany(comp)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Edit Company (Replicates in Network Tab & LocalStorage)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingCompany(comp)}
                      className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 rounded-lg transition-colors"
                      title="Delete Company (Replicates in Network Tab, LocalStorage & Dashboard cards)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {comp.description}
                </p>

                {/* Details Pills */}
                <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span className="truncate">{comp.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <Users className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{comp.employees} employees</span>
                    </div>
                    {comp.openingsCount && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {comp.openingsCount} Jobs
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Links */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {comp.website && (
                    <span
                      className="p-1.5 rounded-lg bg-white/5 text-slate-400 text-xs flex items-center cursor-default select-none pointer-events-none"
                      title="Website provided"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {comp.email && (
                    <span
                      className="p-1.5 rounded-lg bg-white/5 text-slate-400 text-xs flex items-center cursor-default select-none pointer-events-none"
                      title="Email provided"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <Link
                  to={`/companies/${comp.id}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 transition-all flex items-center gap-1"
                >
                  View Details
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <span className="text-xs text-slate-400">
            Page <strong className="text-white">{currentPage}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                currentPage === 1
                  ? 'border-white/5 text-slate-600 cursor-not-allowed bg-transparent'
                  : 'border-white/15 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                currentPage === totalPages
                  ? 'border-white/5 text-slate-600 cursor-not-allowed bg-transparent'
                  : 'border-white/15 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ADD COMPANY GLASS MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0e1329] rounded-2xl border border-white/20 p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                Add New Company Partner
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={addForm.handleSubmit(handleAddCompany)} className="space-y-3.5" noValidate>
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  Company Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Cloud Corp"
                  {...addForm.register('name', { required: 'Company name is required' })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                />
                {addForm.formState.errors.name && (
                  <p className="text-[11px] text-rose-300 mt-1">{addForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Industry <span className="text-rose-400">*</span>
                  </label>
                  <select
                    {...addForm.register('industry')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  >
                    {INDUSTRIES.filter((i) => i !== 'All').map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Location / HQ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    {...addForm.register('location', { required: 'Location is required' })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                  {addForm.formState.errors.location && (
                    <p className="text-[11px] text-rose-300 mt-1">{addForm.formState.errors.location.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Website URL <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    {...addForm.register('website', { required: 'Website is required' })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                  {addForm.formState.errors.website && (
                    <p className="text-[11px] text-rose-300 mt-1">{addForm.formState.errors.website.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Contact Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="careers@example.com"
                    {...addForm.register('email', VALIDATION_RULES.email)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                  {addForm.formState.errors.email && (
                    <p className="text-[11px] text-rose-300 mt-1">{addForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Number of Employees
                  </label>
                  <select
                    {...addForm.register('employees')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  >
                    <option value="10 - 50">10 - 50</option>
                    <option value="50 - 100">50 - 100</option>
                    <option value="100 - 250">100 - 250</option>
                    <option value="250 - 500">250 - 500</option>
                    <option value="500 - 1,000">500 - 1,000</option>
                    <option value="1,000 - 5,000">1,000 - 5,000</option>
                    <option value="5,000+">5,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Company Logo URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    {...addForm.register('logo')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  Company Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide an overview of the organization mission, products, and culture..."
                  {...addForm.register('description', {
                    required: 'Description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' },
                  })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                ></textarea>
                {addForm.formState.errors.description && (
                  <p className="text-[11px] text-rose-300 mt-1">{addForm.formState.errors.description.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md border border-white/20"
                >
                  {isSubmitting ? 'Sending Request...' : 'Publish Company Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COMPANY GLASS MODAL */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0e1329] rounded-2xl border border-white/20 p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                Edit Company: {editingCompany.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCompany(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editForm.handleSubmit(handleEditCompany)} className="space-y-3.5" noValidate>
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">Company Name</label>
                <input
                  type="text"
                  {...editForm.register('name', { required: 'Name is required' })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Industry</label>
                  <select
                    {...editForm.register('industry')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  >
                    {INDUSTRIES.filter((i) => i !== 'All').map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Location</label>
                  <input
                    type="text"
                    {...editForm.register('location', { required: 'Location is required' })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Website URL</label>
                  <input
                    type="text"
                    {...editForm.register('website')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Contact Email</label>
                  <input
                    type="email"
                    {...editForm.register('email')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Number of Employees</label>
                  <select
                    {...editForm.register('employees')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  >
                    <option value="10 - 50">10 - 50</option>
                    <option value="50 - 100">50 - 100</option>
                    <option value="100 - 250">100 - 250</option>
                    <option value="250 - 500">250 - 500</option>
                    <option value="500 - 1,000">500 - 1,000</option>
                    <option value="1,000 - 5,000">1,000 - 5,000</option>
                    <option value="5,000+">5,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Logo URL</label>
                  <input
                    type="text"
                    {...editForm.register('logo')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">Description</label>
                <textarea
                  rows={3}
                  {...editForm.register('description')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md border border-white/20"
                >
                  {isSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0e1329] rounded-2xl border border-rose-500/30 p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Company Partner?</h3>
              <p className="text-xs text-slate-300">
                Are you sure you want to remove <strong className="text-white">{deletingCompany.name}</strong>?
                This will send a DELETE request over the network and decrement your Dashboard partner count.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCompany(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-white/10 hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Company'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
