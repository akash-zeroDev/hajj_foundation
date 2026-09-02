import React from 'react';

const EmployeeProfileSidecar = ({ 
  isOpen, 
  onClose, 
  activeMember, 
  employeeProfile, 
  isFetchingProfile,
  onRemove,
  onDownloadStatement,
  isRemoving = false
}) => {
  if (!activeMember) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-[#09100d]/50 backdrop-blur-[2px] z-40 transition-opacity duration-[250ms] ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      ></div>

      <aside 
        className={`fixed top-0 right-0 h-screen w-[440px] max-w-[94vw] z-50 bg-[#fbfdfc] border-l border-[#e8edeb] flex flex-col transform transition-transform duration-[320ms] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[-30px_0_60px_-30px_rgba(14,26,22,.4)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog" 
        aria-label="Employee profile"
      >
        <div className="p-[8px_16px_10px] text-white bg-emerald-900 shrink-0">
          <div className="flex items-center gap-[10px]">
            <span className="text-[10px] tracking-[0.14em] uppercase text-white/50 font-bold">Employee profile</span>
            <button 
              className="ml-auto w-[24px] h-[24px] rounded-[6px] border border-white/20 bg-white/10 text-[#e3ede9] grid place-items-center cursor-pointer hover:bg-white/20 hover:text-white transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" className="w-[12px] h-[12px] stroke-current stroke-[2] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>
          <div className="flex items-center gap-[12px] mt-[6px]">
            <div className="w-[38px] h-[38px] shrink-0 rounded-[12px] grid place-items-center text-white font-extrabold text-[14px] tracking-[-0.4px] bg-gradient-to-br from-[#17a377] to-[#0a6b50] shadow-[0_6px_16px_-8px_rgba(23,163,119,.9)]">
              {(activeMember.publicUserData?.firstName || activeMember.publicMetadata?.firstName || '')[0]}
              {(activeMember.publicUserData?.lastName || activeMember.publicMetadata?.lastName || '')[0]}
            </div>
            <div>
              <h3 className="m-0 text-[16px] tracking-[-0.4px] font-bold leading-tight">
                {activeMember.publicUserData?.firstName || activeMember.publicMetadata?.firstName || ''} {activeMember.publicUserData?.lastName || activeMember.publicMetadata?.lastName || ''}
              </h3>
              <a href={`mailto:${activeMember.publicUserData?.identifier || activeMember.publicMetadata?.identifier || ''}`} className="inline-block mt-[1px] text-[#9ff0d2] text-[12px] font-medium no-underline hover:underline">
                {activeMember.publicUserData?.identifier || activeMember.publicMetadata?.identifier || ''}
              </a>
              <div className="flex gap-[6px] mt-[4px] flex-wrap">
                <span className="text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full bg-white/10 border border-white/20 text-[#dbe8e3]">
                  {activeMember.role === 'org:admin' ? 'Administrator' : 'Employee'}
                </span>
                {activeMember.isRemoved && (
                  <span className="text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full bg-red-500/20 border border-red-500/30 text-red-200">
                    Removed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-[18px_20px_24px]">
          {isFetchingProfile ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#17a377]"></div>
            </div>
          ) : employeeProfile ? (
            <>
              <div className="bg-white border border-[#e8edeb] rounded-[16px] p-[16px_17px] shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)]">
                <div className="flex items-end justify-between gap-[12px]">
                  <div>
                    <div className="text-[11px] text-[#93a19c] font-semibold">Total savings balance</div>
                    <b className="block mt-[4px] text-[27px] font-extrabold tracking-[-1px] tabular-nums leading-none text-[#0e1a16]">£{(employeeProfile.balance || 0).toFixed(2)}</b>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#93a19c] font-semibold">Monthly contribution</div>
                    <b className="text-[16px] tracking-[-0.4px] text-[#5c6b65]">£{(employeeProfile.contribution || 0).toFixed(2)}</b>
                  </div>
                </div>
                
                {(() => {
                  const target = employeeProfile.hajjTarget || 6000;
                  const balance = employeeProfile.balance || 0;
                  const pct = Math.min(100, (balance / target) * 100);
                  const months = employeeProfile.contribution > 0 ? Math.floor(balance / employeeProfile.contribution) : 0;
                  return (
                    <>
                      <div className="h-[6px] rounded-full bg-[#eef2f0] overflow-hidden mt-[16px]">
                        <div className="block h-full rounded-full bg-gradient-to-r from-[#17a377] to-[#0b7a5b]" style={{ width: `${Math.max(pct, 1.5)}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-[8px] text-[11.5px] text-[#93a19c]">
                        <span><b className="inline text-[11.5px] font-bold text-[#5c6b65] tracking-normal">{pct.toFixed(1)}%</b> of £{target.toLocaleString()} Hajj target</span>
                        <span>{months} month{months === 1 ? '' : 's'} contributed</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="text-[10.5px] tracking-[0.14em] uppercase text-[#93a19c] font-bold m-[22px_0_9px]">Compliance &amp; status</div>
              <div className="bg-white border border-[#e8edeb] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)]">
                <div className="flex items-center gap-[12px] p-[13px_15px] border-b border-[#e8edeb]">
                  <div className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center bg-[rgba(23,163,119,.12)] text-[#0b7a5b]">
                    <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current stroke-[1.8] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7z"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M10 14l2 2 4-4"/></svg>
                  </div>
                  <div>
                    <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#0e1a16]">Shariah agreement</div>
                    <div className="text-[11.8px] text-[#93a19c] mt-[2px]">Master agreement v2</div>
                  </div>
                  <div className="ml-auto text-right flex flex-col items-end gap-[4px]">
                    {employeeProfile.agreementStatus === 'signed' ? (
                      <>
                        <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[rgba(23,163,119,.12)] text-[#0b7a5b] border border-[rgba(11,122,91,.18)]">Signed</span>
                        <span className="text-[11px] text-[#93a19c]">{new Date(employeeProfile.createdAt).toLocaleDateString('en-GB')}</span>
                      </>
                    ) : (
                      <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[#fdf6e6] text-[#8a5b12] border border-[#f2e3c2]">Pending</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-[12px] p-[13px_15px] border-b border-[#e8edeb]">
                  <div className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center bg-[rgba(23,163,119,.12)] text-[#0b7a5b]">
                    <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current stroke-[1.8] fill-none"><rect x="3" y="6" width="18" height="12" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h3"/></svg>
                  </div>
                  <div>
                    <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#0e1a16]">Subscription</div>
                    <div className="text-[11.8px] text-[#93a19c] mt-[2px]">Direct debit · Stripe</div>
                  </div>
                  <div className="ml-auto text-right flex flex-col items-end gap-[4px]">
                    {employeeProfile.subscriptionStatus === 'active' ? (
                      <>
                        <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[rgba(23,163,119,.12)] text-[#0b7a5b] border border-[rgba(11,122,91,.18)]">Active</span>
                        <span className="text-[11px] text-[#93a19c]">Next: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
                      </>
                    ) : (
                      <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[#f1f4f3] text-[#93a19c] border border-[#e6ebe9]">Inactive</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-[12px] p-[13px_15px]">
                  <div className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center bg-[rgba(23,163,119,.12)] text-[#0b7a5b]">
                    <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current stroke-[1.8] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v6a8 8 0 01-16 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 20h6M12 18v2"/></svg>
                  </div>
                  <div>
                    <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#0e1a16]">Hajj award</div>
                    <div className="text-[11.8px] text-[#93a19c] mt-[2px]">Monthly draw eligibility</div>
                  </div>
                  <div className="ml-auto text-right flex flex-col items-end gap-[4px]">
                    <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[#f1f4f3] text-[#93a19c] border border-[#e6ebe9]">
                      {employeeProfile.awardStatus ? employeeProfile.awardStatus.charAt(0).toUpperCase() + employeeProfile.awardStatus.slice(1) : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {employeeProfile.agreementStatus !== 'signed' && (
                <div className="mt-[10px] flex gap-[11px] p-[12px_13px] rounded-[14px] bg-[#fdf6e6] border border-[#f2e3c2] text-[#6f4a0e]">
                  <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] shrink-0 mt-[2px] stroke-current stroke-[1.9] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v5M12 17h.01"/><path strokeLinecap="round" strokeLinejoin="round" d="M10.3 4l-7.4 13A2 2 0 004.6 20h14.8a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0z"/></svg>
                  <span>
                    <b className="block text-[12.6px]">Action needed</b>
                    <p className="m-[3px_0_0] text-[12.1px] leading-[1.55] text-[#8a5b12]">This employee has not signed the current agreement version.</p>
                  </span>
                </div>
              )}

              <div className="text-[10.5px] tracking-[0.14em] uppercase text-[#93a19c] font-bold m-[22px_0_9px]">Account details</div>
              <div className="bg-white border border-[#e8edeb] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)]">
                <div className="flex items-center gap-[12px] p-[13px_15px] border-b border-[#e8edeb]">
                  <div>
                    <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#0e1a16]">Joined</div>
                    <div className="text-[11.8px] text-[#93a19c] mt-[2px]">{activeMember.createdAt ? new Date(activeMember.createdAt).toLocaleString('en-GB') : 'Unknown'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-[12px] p-[13px_15px]">
                  <div>
                    <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#0e1a16]">User ID</div>
                    <div className="text-[11.6px] text-[#93a19c] mt-[2px] font-mono break-all">{activeMember.publicUserData?.userId || activeMember.id}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#93a19c]">Failed to load profile. This may happen if the employee has no associated DB record.</div>
          )}
        </div>

        {(onRemove || onDownloadStatement) && !activeMember.isRemoved && (
          <div className="p-[13px_20px] border-t border-[#e8edeb] bg-white grid gap-[9px] shrink-0">
            {onDownloadStatement && (
              <button 
                onClick={onDownloadStatement}
                className="font-inherit font-semibold text-[13.4px] p-[11px_16px] rounded-[11px] inline-flex items-center justify-center gap-[8px] w-full bg-[#f1f4f3] border border-[#e6ebe9] text-[#0e1a16] hover:bg-[#e8edeb] transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current stroke-[1.9] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Download Statement
              </button>
            )}
            
            {onRemove && (
              <button 
                onClick={onRemove}
                disabled={isRemoving}
                className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-inherit font-semibold text-[13.4px] p-[11px_16px] rounded-[11px] inline-flex items-center justify-center gap-[8px] w-full bg-white border border-[#f6cfcc] text-[#a3271f] hover:bg-[#fdeceb] transition-colors"
              >
                {isRemoving ? (
                  <div className="w-[16px] h-[16px] border-2 border-[#a3271f] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current stroke-[1.9] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/></svg>
                )}
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

export default EmployeeProfileSidecar;
