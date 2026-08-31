import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { superAdminNavigation } from '../../config/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const Reports = () => {
  const { getToken } = useAuth();
  const [isGeneratingCsv, setIsGeneratingCsv] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getToken();
        const res = await fetch('http://localhost:5000/api/reports/operational-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  
  const trackDownload = async (action, details) => {
    try {
      const token = await getToken();
      await fetch('http://localhost:5000/api/audit-logs/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, details })
      });
    } catch (e) {
      console.error('Failed to track download', e);
    }
  };

  const downloadCSV = async () => {
    setIsGeneratingCsv(true);
    await trackDownload('DOWNLOADED_LEDGER_CSV', 'Super Admin downloaded Global Financial Ledger CSV');
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/reports/ledger-export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      const transactions = json.data || [];

      if (transactions.length === 0) {
        alert("No transactions found to export.");
        setIsGeneratingCsv(false);
        return;
      }

      // Convert to CSV string
      const headers = ['Transaction ID', 'Date', 'Type', 'Entity Name', 'Entity Type', 'Amount (GBP)', 'Status', 'Stripe ID'];
      const csvRows = [headers.join(',')];

      transactions.forEach(tx => {
        const row = [
          tx.transactionId,
          new Date(tx.date).toISOString(),
          tx.type,
          `"${tx.entityName || ''}"`,
          tx.entityType,
          tx.amount,
          tx.status,
          tx.stripePaymentIntentId || ''
        ];
        csvRows.push(row.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `EdenHoldings_GlobalLedger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Failed to generate CSV export.');
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
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("Eden Holdings Ltd.", 14, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("Operational & Financial Summary", 14, 28);
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);

      // Financials Table
      doc.autoTable({
        startY: 45,
        head: [['Financial Metric', 'Amount (GBP)']],
        body: [
          ['Total Assets Under Management (Employee Savings)', `£${stats.financials.aum.toLocaleString()}`],
          ['Total Operating Revenue (Employer Fees)', `£${stats.financials.revenue.toLocaleString()}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [5, 150, 105] }, // emerald-600
        styles: { fontSize: 11, cellPadding: 6 }
      });

      // Operational Table
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
        headStyles: { fillColor: [51, 65, 85] }, // slate-700
        styles: { fontSize: 11, cellPadding: 6 }
      });
      
      // Footer
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("Strictly Confidential. For internal use by Eden Holdings Ltd.", 14, doc.internal.pageSize.height - 10);

      doc.save(`EdenHoldings_OperationalSummary_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <SidebarLayout title="Reports & Exports" navigation={superAdminNavigation}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Platform Reports</h1>
        <p className="text-slate-500 mt-1">Generate and export financial ledgers and operational summaries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CSV Export Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-8 flex-grow">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Global Financial Ledger</h2>
            <p className="text-slate-500">
              Export the raw, unpaginated transaction history for all employers and employees. Perfect for importing into Xero, QuickBooks, or handing to your accountants.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600 font-medium">
              <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> Includes all £12.3k revenues</li>
              <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> Includes all £50/mo savings</li>
              <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> Stripe Payment IDs mapped</li>
            </ul>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <button
              onClick={downloadCSV}
              disabled={isGeneratingCsv}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGeneratingCsv ? (
                 <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing Export...</>
              ) : 'Download CSV Export'}
            </button>
          </div>
        </div>

        {/* PDF Export Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-8 flex-grow">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Operational Summary</h2>
            <p className="text-slate-500">
              Generate a clean, branded PDF summarizing the platform's current health. Ideal for board meetings and executive reporting.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600 font-medium">
              <li className="flex items-center gap-2"><svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> Total AUM & Revenue figures</li>
              <li className="flex items-center gap-2"><svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> Organisation lifecycle status</li>
              <li className="flex items-center gap-2"><svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> Employee legal compliance tracking</li>
            </ul>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPdf || !stats}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGeneratingPdf ? (
                 <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Generating PDF...</>
              ) : !stats ? 'Loading metrics...' : 'Download PDF Summary'}
            </button>
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
};
