import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { superAdminNavigation } from '../../config/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '../../context/ToastContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export const Reports = () => {
  const { getToken } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('summary');
  
  const [stats, setStats] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCsv, setIsGeneratingCsv] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, ledgerRes, auditRes] = await Promise.all([
          fetch('http://localhost:5000/api/reports/operational-stats', { headers }),
          fetch('http://localhost:5000/api/reports/ledger-export', { headers }),
          fetch('http://localhost:5000/api/audit', { headers })
        ]);

        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats(s.data);
        }
        if (ledgerRes.ok) {
          const l = await ledgerRes.json();
          setLedgerData(l.data || []);
        }
        if (auditRes.ok) {
          const a = await auditRes.json();
          setAuditData(a.data || []);
        }
      } catch (error) {
        console.error('Error fetching reports data:', error);
        showToast('Failed to load report data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [getToken, showToast]);

  const trackDownload = async (action, details) => {
    try {
      const token = await getToken();
      await fetch('http://localhost:5000/api/audit/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, details })
      });
    } catch (error) {
      console.error('Failed to track audit:', error);
    }
  };

  const downloadCSV = async () => {
    setIsGeneratingCsv(true);
    await trackDownload('DOWNLOADED_LEDGER_CSV', 'Super Admin downloaded Global Financial Ledger CSV');
    
    try {
      if (!ledgerData || ledgerData.length === 0) {
         showToast('No ledger data available to export.', 'error');
         return;
      }
      const headers = ['Transaction ID', 'Date', 'Type', 'Amount (GBP)', 'Status', 'Entity Name', 'Entity Type', 'Stripe Payment ID'];
      const rows = ledgerData.map(tx => [
        tx.transactionId,
        new Date(tx.date).toISOString(),
        tx.type,
        tx.amount,
        tx.status,
        tx.entityName || 'N/A',
        tx.entityType || 'N/A',
        tx.stripePaymentIntentId || 'N/A'
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `HajjSavings_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating CSV:', error);
      showToast('Failed to generate CSV export.', 'error');
    } finally {
      setIsGeneratingCsv(false);
    }
  };

  const downloadPDF = async () => {
    if (!stats) return;
    setIsGeneratingPdf(true);
    await trackDownload('DOWNLOADED_OPS_PDF', 'Super Admin downloaded Operational Summary PDF');
    
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); 
      doc.text("Hajj Savings", 14, 20);
      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139); 
      doc.text("Operational & Financial Summary", 14, 28);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);

      doc.autoTable({
        startY: 45,
        head: [['Financial Metric', 'Amount (GBP)']],
        body: [
          ['Total Assets Under Management (Employee Savings)', `£${stats.financials.aum.toLocaleString()}`],
          ['Total Operating Revenue (Employer Fees)', `£${stats.financials.revenue.toLocaleString()}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [5, 150, 105] }, 
        styles: { fontSize: 11, cellPadding: 6 }
      });

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Operational Metric', 'Count']],
        body: [
          ['Total Enrolled Organisations', stats.organizations.total.toString()],
          ['Active Organisations', stats.organizations.active.toString()],
          ['Suspended Organisations', stats.organizations.suspended.toString()],
          ['Total Employees', stats.employees.total.toString()],
          ['Compliant Employees (Agreements Signed)', stats.employees.compliant.toString()],
          ['Pending Employees (Not Signed)', stats.employees.pending.toString()]
        ],
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] }, 
        styles: { fontSize: 11, cellPadding: 6 }
      });
      
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("Strictly Confidential. For internal use by Hajj Savings", 14, doc.internal.pageSize.height - 10);
      doc.save(`HajjSavings_OperationalSummary_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate PDF.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const renderOperationalSummary = () => {
    if (!stats) return <div className="p-8 text-center text-slate-500">Loading metrics...</div>;

    const employeePieData = [
      { name: 'Compliant', value: stats.employees.compliant },
      { name: 'Pending', value: stats.employees.pending }
    ];
    const COLORS = ['#10b981', '#f59e0b']; // emerald, amber

    const orgBarData = [
      { name: 'Active', count: stats.organizations.active },
      { name: 'Suspended', count: stats.organizations.suspended }
    ];

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 self-start">Employee Compliance</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={employeePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {employeePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 self-start">Organisation Status</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orgBarData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800">Key Performance Metrics</h3>
          </div>
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-700 w-1/2">Assets Under Management (AUM)</td>
                <td className="px-6 py-4 text-slate-900 font-bold">£{stats.financials.aum.toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-700 w-1/2">Total Platform Revenue</td>
                <td className="px-6 py-4 text-slate-900 font-bold">£{stats.financials.revenue.toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-700 w-1/2">Total Organisations</td>
                <td className="px-6 py-4 text-slate-600">{stats.organizations.total}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-700 w-1/2">Total Employees</td>
                <td className="px-6 py-4 text-slate-600">{stats.employees.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFinancialLedger = () => {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Entity Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerData.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-slate-500">No ledger records found.</td></tr>
              ) : (
                ledgerData.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{tx.entityName || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {tx.type === 'revenue' ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">Revenue</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Savings</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">£{tx.amount?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4">
                      {tx.status === 'succeeded' ? (
                         <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">Paid</span>
                      ) : (
                         <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">{tx.status}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAuditLog = () => {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditData.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-12 text-slate-500">No audit logs found.</td></tr>
              ) : (
                auditData.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{log.details}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <SidebarLayout title="Reports & Audit" navigation={superAdminNavigation}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Audit</h1>
          <p className="text-slate-500 mt-1">Review operational metrics, financial ledgers, and system logs.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={downloadCSV}
            disabled={isGeneratingCsv || isLoading}
            className="flex-1 md:flex-none px-4 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isGeneratingCsv ? 'Processing...' : (
              <><svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> Export Ledger (CSV)</>
            )}
          </button>
          
          <button
            onClick={downloadPDF}
            disabled={isGeneratingPdf || isLoading || !stats}
            className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isGeneratingPdf ? 'Generating...' : (
              <><svg className="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> Export Summary (PDF)</>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-xl mb-6 border border-slate-200/60 max-w-2xl">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2 px-4 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'summary' 
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Operational Summary
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-2 px-4 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'ledger' 
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Financial Ledger
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 px-4 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'audit' 
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          System Audit Log
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-slate-500 gap-3">
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
             Loading report data...
          </div>
        ) : (
          <>
            {activeTab === 'summary' && renderOperationalSummary()}
            {activeTab === 'ledger' && renderFinancialLedger()}
            {activeTab === 'audit' && renderAuditLog()}
          </>
        )}
      </div>

    </SidebarLayout>
  );
};
