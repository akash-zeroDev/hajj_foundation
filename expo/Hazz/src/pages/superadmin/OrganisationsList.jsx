import { OnboardOrgModal } from '../../components/OnboardOrgModal';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../layouts/SidebarLayout';
import CustomSelect from '../../components/CustomSelect';
import PrimaryButton from '../../components/PrimaryButton';
import { Plus, Search } from 'lucide-react';

import SearchFilterBar from '../../components/SearchFilterBar';
import { superAdminNavigation } from '../../config/navigation';

export const OrganisationsList = () => {
  const { getToken } = useAuth(); // OrganisationsList
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('onboard') === 'true') {
      setShowModal(true);
    }
  }, [location]);

  const handleCloseModal = (success) => {
    setShowModal(false);
    navigate('/superadmin/organisations', { replace: true });
    if (success) fetchOrganisations();
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
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-5 h-5" />}
        >
          Onboard Organisation
        </PrimaryButton>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <SearchFilterBar 
            searchTerm={searchQuery} 
            setSearchTerm={setSearchQuery} 
            placeholder="Search by name or ID..." 
            containerClassName="w-full sm:w-64"
            inputClassName="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            
            <CustomSelect
              className="min-w-[140px]"
              value={suspensionFilter}
              onChange={setSuspensionFilter}
              options={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" }
              ]}
            />

            <CustomSelect
              className="min-w-[150px]"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All Agreements" },
                { value: "pending", label: "Pending" },
                { value: "signed", label: "Signed" }
              ]}
            />
            
            <CustomSelect
              className="min-w-[130px]"
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
              className="min-w-[160px]"
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
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">Loading organisations...</td></tr>
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
      <OnboardOrgModal isOpen={showModal} onClose={handleCloseModal} />
    </SidebarLayout>
  );
};
