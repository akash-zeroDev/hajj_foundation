import React, { useState, useEffect } from 'react';
import { useAuth, useOrganization } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { orgAdminNavigation } from '../../config/navigation';
import SearchFilterBar from '../../components/SearchFilterBar';

export const AgreementsTracking = () => {
  const { getToken } = useAuth();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAgreements = async () => {
      if (!orgLoaded || !organization) return;
      try {
        setIsLoading(true);
        const token = await getToken();
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/organisations/clerk/${organization.id}/employee-agreements`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          
          let emailMap = {};
          try {
            const mems = await organization.getMemberships();
            const memList = mems?.data || mems || [];
            memList.forEach(m => {
               emailMap[m.publicUserData.userId] = m.publicUserData.identifier;
            });
          } catch(e) { console.error('Failed to fetch clerk members for emails'); }

          const employeesWithEmail = (data.data || []).map(emp => ({
             ...emp,
             email: emailMap[emp.clerkUserId] || ''
          }));
          
          setEmployees(employeesWithEmail);
        }
      } catch (err) {
        console.error('Error fetching agreements:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgreements();
  }, [orgLoaded, organization]);

  const activeEmployees = employees.filter(e => !e.isRemoved);
  const signedCount = activeEmployees.filter(e => e.agreementStatus === 'signed').length;
  const pendingCount = activeEmployees.filter(e => e.agreementStatus !== 'signed').length;
  const totalCount = activeEmployees.length;
  const pct = totalCount ? Math.round((signedCount / totalCount) * 100) : 0;

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = (emp.firstName + ' ' + emp.lastName + ' ' + emp.email).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                          (filter === 'signed' && emp.agreementStatus === 'signed') || 
                          (filter === 'pending' && emp.agreementStatus !== 'signed');
    return matchesSearch && matchesFilter;
  });

  return (
    <SidebarLayout title="Agreements Tracking" navigation={orgAdminNavigation}>
      <style>{`
        .agt-bg { background: #f4f7f6; color: #0e1a16; font-family: "Plus Jakarta Sans", sans-serif; }
        .agt-card { background: #fff; border: 1px solid #e6ecea; border-radius: 14px; box-shadow: 0 1px 2px rgba(14,26,22,.04), 0 8px 24px -18px rgba(14,26,22,.35); }
        .agt-page-head { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
        .agt-page-head h3 { margin: 0; font-size: 23px; letter-spacing: -.5px; font-weight: 700; }
        .agt-page-head p { margin: 4px 0 0; color: #5c6b65; font-size: 13.5px; }
        .agt-actions { margin-left: auto; display: flex; gap: 10px; }
        .agt-btn { border: 0; cursor: pointer; font: inherit; font-weight: 600; font-size: 13.5px; padding: 11px 18px; border-radius: 10px; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .agt-btn svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 2; fill: none; }
        .agt-btn-primary { color: #fff; background: linear-gradient(180deg, #17a377, #0b7a5b); box-shadow: 0 10px 22px -12px rgba(11,122,91,.9); }
        .agt-btn-primary:hover { filter: brightness(1.06); }
        .agt-btn-ghost { background: #fff; border: 1px solid #e6ecea; color: #0e1a16; }
        .agt-btn-ghost:hover { background: #f2f6f5; }
        .agt-grid { display: grid; gap: 16px; }
        .agt-kpis { grid-template-columns: repeat(3, 1fr); margin-bottom: 16px; }
        .agt-kpi { padding: 18px; position: relative; }
        .agt-kpi .agt-row { display: flex; align-items: center; justify-content: space-between; }
        .agt-kpi .agt-label { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #8a9994; font-weight: 700; }
        .agt-kpi .agt-ic { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: rgba(11,122,91,.10); color: #0b7a5b; }
        .agt-kpi .agt-ic svg { width: 17px; height: 17px; stroke: currentColor; stroke-width: 1.8; fill: none; }
        .agt-kpi .agt-val { margin: 14px 0 6px; font-size: 30px; font-weight: 800; letter-spacing: -1px; line-height: 1; }
        .agt-kpi .agt-foot { font-size: 12.5px; color: #5c6b65; }
        .agt-kpi.agt-amber .agt-ic { background: #fdf3e3; color: #c8811f; }
        .agt-meter { padding: 18px; }
        .agt-meter .agt-top { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; }
        .agt-meter h4 { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: -.2px; }
        .agt-meter .agt-pct { margin-left: auto; font-size: 13.5px; font-weight: 700; color: #0b7a5b; }
        .agt-bar { height: 8px; border-radius: 999px; background: #eef2f1; overflow: hidden; }
        .agt-bar i { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #17a377, #0b7a5b); transition: width 1s ease-out; }
        .agt-meter small { display: block; margin-top: 9px; color: #8a9994; font-size: 12.4px; }
        .agt-card-head { display: flex; align-items: center; gap: 12px; padding: 16px 18px; border-bottom: 1px solid #e6ecea; flex-wrap: wrap; }
        .agt-card-head h4 { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: -.2px; }
        .agt-card-head .agt-sub { font-size: 12.5px; color: #8a9994; }
        .agt-tools { margin-left: auto; display: flex; gap: 8px; align-items: center; }
        .agt-search { display: flex; align-items: center; gap: 8px; border: 1px solid #e6ecea; border-radius: 10px; padding: 8px 11px; background: #fff; }
        .agt-search svg { width: 15px; height: 15px; stroke: #8a9994; stroke-width: 2; fill: none; }
        .agt-search input { border: 0; outline: none; font: inherit; font-size: 13px; width: 190px; color: #0e1a16; background: transparent; }
        .agt-seg { display: flex; border: 1px solid #e6ecea; border-radius: 10px; overflow: hidden; background: #fff; }
        .agt-seg button { border: 0; background: #fff; font: inherit; font-size: 12.8px; font-weight: 600; color: #5c6b65; padding: 8px 13px; cursor: pointer; border-left: 1px solid #e6ecea; transition: all 0.2s; }
        .agt-seg button:first-child { border-left: 0; }
        .agt-seg button.agt-on { background: #0b7a5b; color: #fff; }
        .agt-table { width: 100%; border-collapse: collapse; }
        .agt-table th, .agt-table td { text-align: left; padding: 13px 18px; font-size: 13.5px; border-bottom: 1px solid #e6ecea; }
        .agt-table th { font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: #8a9994; font-weight: 700; }
        .agt-table tbody tr:last-child td { border-bottom: 0; }
        .agt-table tbody tr:hover { background: #f7faf9; }
        .agt-who { display: flex; align-items: center; gap: 10px; font-weight: 600; }
        .agt-mini { width: 28px; height: 28px; flex: 0 0 28px; border-radius: 8px; display: grid; place-items: center; font-size: 11px; color: #fff; font-weight: 700; background: linear-gradient(145deg, #17a377, #0a6b50); }
        .agt-mini.agt-mute { background: #e6ecea; color: #8a9994; }
        .agt-muted { color: #8a9994; }
        .agt-mono { font-variant-numeric: tabular-nums; color: #5c6b65; }
        .agt-tag { font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; background: rgba(23,163,119,.14); color: #0b7a5b; display: inline-flex; align-items: center; gap: 6px; }
        .agt-tag svg { width: 12px; height: 12px; stroke: currentColor; stroke-width: 2.4; fill: none; }
        .agt-tag.agt-warn { background: #fdf3e3; color: #c8811f; }
        .agt-row-act { background: transparent; border: 0; cursor: pointer; color: #0b7a5b; font: inherit; font-size: 12.8px; font-weight: 600; padding: 0; transition: color 0.2s; }
        .agt-row-act:hover { text-decoration: underline; color: #0a6b50; }
        .agt-empty { padding: 34px 18px; text-align: center; color: #8a9994; font-size: 13.5px; }
        .agt-tfoot { padding: 12px 18px; border-top: 1px solid #e6ecea; display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #8a9994; }
        @media(max-width:1100px){ .agt-kpis{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:820px){ .agt-kpis{grid-template-columns:1fr} .agt-search input{width:120px} }
      `}</style>
      
      <div className="agt-bg max-w-[1360px] mx-auto pb-10">
        <div className="agt-page-head">
          <div>
            <h3>Master Agreements</h3>
            <p>Track which employees have reviewed and signed the Shariah master agreement.</p>
          </div>
          <div className="agt-actions">
            <button className="agt-btn agt-btn-primary"><svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z"/></svg>Remind pending</button>
          </div>
        </div>

        {isLoading ? (
          <>
            <div className="agt-grid agt-kpis">
              {[1,2,3].map(i => (
                <div key={i} className="agt-card agt-kpi animate-pulse">
                  <div className="agt-row"><div className="h-3 bg-slate-200 rounded w-1/2" /><div className="w-[34px] h-[34px] rounded-[10px] bg-slate-200" /></div>
                  <div className="h-8 bg-slate-200 rounded w-1/3" style={{margin:'14px 0 6px'}} />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              ))}
            </div>
            <div className="agt-card agt-meter animate-pulse" style={{ marginBottom: 16 }}>
              <div className="h-4 bg-slate-200 rounded w-1/4" style={{marginBottom:10}} />
              <div className="h-2 bg-slate-200 rounded-full w-full" />
            </div>
          </>
        ) : (
          <>
            <div className="agt-grid agt-kpis">
              <div className="agt-card agt-kpi">
                <div className="agt-row"><span className="agt-label">Total enrolled</span>
                  <span className="agt-ic"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M17 8.5a2.8 2.8 0 010 5.5"/></svg></span></div>
                <div className="agt-val">{totalCount}</div>
                <div className="agt-foot">Employees invited to the plan</div>
              </div>
              <div className="agt-card agt-kpi">
                <div className="agt-row"><span className="agt-label">Fully compliant</span>
                  <span className="agt-ic"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg></span></div>
                <div className="agt-val">{signedCount}</div>
                <div className="agt-foot">Employees with active agreements</div>
              </div>
              <div className="agt-card agt-kpi agt-amber">
                <div className="agt-row"><span className="agt-label">Pending signature</span>
                  <span className="agt-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/></svg></span></div>
                <div className="agt-val">{pendingCount}</div>
                <div className="agt-foot">Awaiting employee action</div>
              </div>
            </div>

            <div className="agt-card agt-meter" style={{ marginBottom: 16 }}>
              <div className="agt-top"><h4>Compliance rate</h4><span className="agt-pct">{pct}%</span></div>
              <div className="agt-bar"><i style={{ width: `${pct}%` }}></i></div>
              <small>{signedCount} of {totalCount} employees have signed the active Master Shariah Agreement</small>
            </div>
          </>
        )}

        <div className="agt-card">
          <div className="agt-card-head">
            <div><h4>Employee audit trail</h4><div className="agt-sub">Signature records for the active agreement version</div></div>
            <div className="agt-tools">
              <div className="agt-search">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.2-4.2"/></svg>
                <input 
                  placeholder="Search name or email" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="agt-seg">
                <button className={filter === 'all' ? 'agt-on' : ''} onClick={() => setFilter('all')}>All</button>
                <button className={filter === 'signed' ? 'agt-on' : ''} onClick={() => setFilter('signed')}>Signed</button>
                <button className={filter === 'pending' ? 'agt-on' : ''} onClick={() => setFilter('pending')}>Pending</button>
              </div>
            </div>
          </div>

          <table className="agt-table">
            <thead>
              <tr><th>Employee</th><th>Email address</th><th>Legal status</th><th>Date signed</th></tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td><div className="h-3 bg-slate-200 rounded w-28" /></td>
                    <td><div className="h-3 bg-slate-200 rounded w-40" /></td>
                    <td><div className="h-5 bg-slate-200 rounded-full w-16" /></td>
                    <td><div className="h-3 bg-slate-200 rounded w-20" /></td>
                  </tr>
                ))
              ) : filteredEmployees.length === 0 ? (
                <tr><td colSpan="4" className="agt-empty">No employees match this filter.</td></tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp._id}>
                    <td>
                      <span className="agt-who">
                        {emp.firstName ? (
                          <span className="agt-mini">{emp.firstName[0]}{emp.lastName?.[0]}</span>
                        ) : (
                          <span className="agt-mini agt-mute">—</span>
                        )}
                        {emp.firstName ? `${emp.firstName} ${emp.lastName}` : <span className="agt-muted">Not yet onboarded</span>}
                        {emp.isRemoved && <span style={{fontSize: '9px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f1f4f3', color: '#8a9994', border: '1px solid #e6ecea', marginLeft: '6px'}}>Removed</span>}
                      </span>
                    </td>
                    <td className="agt-muted">{emp.email || '—'}</td>
                    <td>
                      {emp.agreementStatus === 'signed' ? (
                        <span className="agt-tag"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>Signed</span>
                      ) : (
                        <span className="agt-tag agt-warn"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/></svg>Pending</span>
                      )}
                    </td>
                    <td className="agt-mono">
                      {emp.agreementStatus === 'signed' ? new Date(emp.updatedAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : <span className="agt-muted">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="agt-tfoot"><span>Showing {filteredEmployees.length} of {totalCount} records</span></div>
        </div>
      </div>
    </SidebarLayout>
  );
};
