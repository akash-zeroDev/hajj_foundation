import { useAuth } from '@clerk/react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLayout from '../../layouts/SidebarLayout';
import CustomSelect from '../../components/CustomSelect';
import PrimaryButton from '../../components/PrimaryButton';
import SearchFilterBar from '../../components/SearchFilterBar';
import { superAdminNavigation } from '../../config/navigation';

export const OrganisationsList = () => {
  const { getToken } = useAuth(); // OrganisationsList
  const navigate = useNavigate();
  const location = useLocation();
  const [showOnboard, setShowOnboard] = useState(false);
  const [form, setForm] = useState({ name:'', companyNumber:'', registeredAddress:'', annualFee:'', adminEmail:'' });
  const [agreementFile, setAgreementFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(location.search).get('onboard') === 'true') setShowOnboard(true);
  }, [location.search]);

  const handleOnboard = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('companyNumber', form.companyNumber);
      fd.append('registeredAddress', form.registeredAddress);
      fd.append('annualFee', form.annualFee);
      fd.append('adminEmail', form.adminEmail);
      if (agreementFile) fd.append('agreementFile', agreementFile);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/organisations/onboard`, { method:'POST', headers:{ Authorization:`Bearer ${await getToken()}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setShowOnboard(false);
      navigate('/superadmin/organisations', { replace:true });
      fetchOrganisations();
    } catch (err) { alert(err.message); } finally { setIsSubmitting(false); }
  };
  const [organisations, setOrganisations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrgs, setTotalOrgs] = useState(0);

  // Filters & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feeFilter, setFeeFilter] = useState('all');
  const [suspensionFilter, setSuspensionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrganisations();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery, statusFilter, feeFilter, suspensionFilter, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, feeFilter, sortBy]);

  const fetchOrganisations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        sort: sortBy,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { agreementStatus: statusFilter }),
        ...(feeFilter !== 'all' && { feeStatus: feeFilter }),
        ...(suspensionFilter !== 'all' && { isSuspended: suspensionFilter === 'suspended' ? 'true' : 'false' })
      });

      const res = await fetch(`http://localhost:5000/api/organisations?${params.toString()}`, { headers: { Authorization: `Bearer ${await getToken()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setOrganisations(data.organisations || []);
      setTotalPages(data.totalPages || 1);
      setTotalOrgs(data.totalOrganisations || 0);
    } catch (error) {
      console.error("Failed to fetch organisations", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      signed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      overdue: 'bg-red-50 text-red-700 border-red-200',
      expired: 'bg-slate-50 text-slate-700 border-slate-200'
    };
    const activeColor = colors[status] || 'bg-slate-50 text-slate-700 border-slate-200';
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${activeColor}`}>
        {status}
      </span>
    );
  };

  return (
    <SidebarLayout navigation={superAdminNavigation} title="Participating Organisations">
      
      <div className="flex justify-end mb-6">
        <PrimaryButton 
          onClick={() => setShowOnboard(true)}
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
        >
          Onboard Organisation
        </PrimaryButton>
      </div>
      {showOnboard && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={()=>{setShowOnboard(false); navigate('/superadmin/organisations',{replace:true});}} />
          <form onSubmit={handleOnboard} className="relative bg-white rounded-[14px] shadow-[0_16px_48px_-16px_rgba(0,0,0,.3)] w-full max-w-[560px] overflow-hidden max-h-[90vh] flex flex-col" style={{fontFamily:"'Inter',system-ui,sans-serif"}}>
            <div className="px-6 pt-6 pb-4 border-b border-[#EEF0F3]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#0B0F0E] leading-none">Onboard Organisation</h3>
                  <p className="mt-1.5 text-[13px] text-[#6B7280] leading-snug">Create a new participating organisation. An invite and fee invoice are sent automatically.</p>
                </div>
                <button type="button" onClick={()=>{setShowOnboard(false); navigate('/superadmin/organisations',{replace:true});}} className="w-8 h-8 grid place-items-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] shrink-0">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4 overflow-auto">
              <div className="grid gap-1">
                <label className="text-[12.5px] font-semibold text-[#2B3330]">Organisation name</label>
                <input placeholder="e.g. East London Mosque Trust" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[13.5px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0E5C3E] focus:ring-2 focus:ring-[#0E5C3E]/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <label className="text-[12.5px] font-semibold text-[#2B3330]">Company number</label>
                  <input placeholder="01234567" required value={form.companyNumber} onChange={e=>setForm({...form,companyNumber:e.target.value})} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[13.5px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0E5C3E] focus:ring-2 focus:ring-[#0E5C3E]/10" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[12.5px] font-semibold text-[#2B3330]">Annual fee (£)</label>
                  <input placeholder="£123" required type="number" value={form.annualFee} onChange={e=>setForm({...form,annualFee:e.target.value})} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[13.5px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0E5C3E] focus:ring-2 focus:ring-[#0E5C3E]/10" />
                </div>
              </div>
              <div className="grid gap-1">
                <label className="text-[12.5px] font-semibold text-[#2B3330]">Registered address</label>
                <input placeholder="City or address" required value={form.registeredAddress} onChange={e=>setForm({...form,registeredAddress:e.target.value})} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[13.5px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0E5C3E] focus:ring-2 focus:ring-[#0E5C3E]/10" />
              </div>
              <div className="grid gap-1">
                <label className="text-[12.5px] font-semibold text-[#2B3330]">Admin email</label>
                <input placeholder="admin@organisation.org" required type="email" value={form.adminEmail} onChange={e=>setForm({...form,adminEmail:e.target.value})} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[13.5px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0E5C3E] focus:ring-2 focus:ring-[#0E5C3E]/10" />
              </div>
              <div className="grid gap-1">
                <label className="text-[12.5px] font-semibold text-[#2B3330]">Agreement PDF <span className="font-normal text-[#9CA3AF]">(optional)</span></label>
                <label className="flex items-center gap-3 w-full border border-dashed border-[#D1D5DB] rounded-lg px-3 py-3 text-[13px] text-[#6B7280] hover:border-[#0E5C3E] hover:bg-[#F9FAFB] cursor-pointer">
                  <span className="px-2.5 py-1 rounded-md bg-[#F3F4F6] border border-[#E5E7EB] text-[12px] font-semibold text-[#2B3330] shrink-0">Choose file</span>
                  <span className="truncate">{agreementFile ? agreementFile.name : 'No file chosen'}</span>
                  <input type="file" accept="application/pdf" onChange={e=>setAgreementFile(e.target.files[0])} className="hidden" />
                </label>
              </div>
            </div>
            <div className="px-6 py-4 bg-[#FCFCFB] border-t border-[#EEF0F3] flex justify-end gap-3">
              <button type="button" onClick={()=>{setShowOnboard(false); navigate('/superadmin/organisations',{replace:true});}} className="px-4 py-2.5 text-[13.5px] font-medium border border-[#E5E7EB] bg-white rounded-lg hover:bg-[#F9FAFB]">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-[13.5px] font-semibold bg-[#0E5C3E] text-white rounded-lg hover:bg-[#0A3D2A] disabled:opacity-50">{isSubmitting?'Creating...':'Create organisation'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex flex-nowrap gap-3 items-center overflow-x-auto scrollbar-none">
          <div className="relative w-[220px] shrink-0">
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
            />
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex flex-nowrap gap-2 shrink-0 ml-auto">
            
            <CustomSelect
              className="min-w-[120px] shrink-0"
              value={suspensionFilter}
              onChange={setSuspensionFilter}
              options={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" }
              ]}
            />

            <CustomSelect
              className="min-w-[130px] shrink-0"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All Agreements" },
                { value: "pending", label: "Pending" },
                { value: "signed", label: "Signed" }
              ]}
            />
            
            <CustomSelect
              className="min-w-[110px] shrink-0"
              value={feeFilter}
              onChange={setFeeFilter}
              options={[
                { value: "all", label: "All Fees" },
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
                { value: "overdue", label: "Overdue" }
              ]}
            />
            
            <CustomSelect
              className="min-w-[130px] shrink-0"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "name-asc", label: "Name (A-Z)" },
                { value: "name-desc", label: "Name (Z-A)" },
                { value: "fee-high", label: "Fee (High to Low)" },
                { value: "fee-low", label: "Fee (Low to High)" }
              ]}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500 bg-white">
                <th className="px-6 py-4 font-medium">Organisation</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Annual Fee (£)</th>
                <th className="px-6 py-4 font-medium">Fee Status</th>
                <th className="px-6 py-4 font-medium">Agreement</th>
                <th className="px-6 py-4 font-medium">Date Onboarded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1,2,3,4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-28 mb-2" /><div className="h-3 bg-slate-200 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-14" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-16" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-16" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-20" /></td>
                  </tr>
                ))
              ) : organisations.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">No organisations found.</td></tr>
              ) : (
                organisations.map((org) => (
                  
                  <tr 
                    key={org._id} 
                    onClick={() => navigate(`/superadmin/organisations/${org._id}`)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors group ${org.isSuspended ? 'bg-slate-50/40 opacity-75 grayscale-[20%]' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">{org.name}</div>
                        {org.isSuspended && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider whitespace-nowrap">
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">No: {org.companyNumber}</div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600 max-w-[150px] truncate" title={org.registeredAddress}>
                      {org.registeredAddress}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      £{org.annualFee.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {renderBadge(org.annualFeeStatus)}
                    </td>
                    <td className="px-6 py-4">
                      {renderBadge(org.agreementStatus)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(org.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Showing <span className="font-medium">{organisations.length > 0 ? (currentPage - 1) * 10 + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * 10, totalOrgs)}</span> of <span className="font-medium">{totalOrgs}</span> results
          </span>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button 
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};
