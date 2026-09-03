import re

code = """import React from 'react';
import { X, CreditCard, Award, FileText, Download, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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
  const { showToast } = useToast();
  
  if (!activeMember) return null;

  const firstName = activeMember.publicUserData?.firstName || activeMember.publicMetadata?.firstName || '';
  const lastName = activeMember.publicUserData?.lastName || activeMember.publicMetadata?.lastName || '';
  const email = activeMember.publicUserData?.identifier || activeMember.emailAddresses?.[0]?.emailAddress || '';
  const userId = activeMember.publicUserData?.userId || activeMember.id;
  
  const isSuspended = activeMember.publicMetadata?.isSuspended;

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
        <div className="bg-white text-slate-900 shrink-0 relative overflow-hidden border-b border-slate-100" style={{ minHeight: '130px', padding: '24px' }}>
          <div className="absolute top-0 right-0 w-[60%] h-full opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'url(/assets/arches.png)', backgroundSize: 'cover', backgroundPosition: 'right bottom' }}></div>
          
          <button 
            className="absolute top-[16px] right-[16px] w-[24px] h-[24px] grid place-items-center text-slate-400 hover:text-slate-700 transition-colors z-10 border border-slate-200 rounded-md bg-white shadow-sm"
            onClick={onClose}
          >
            <X className="w-[14px] h-[14px]" />
          </button>
          
          <div className="flex items-center gap-[16px] relative z-10 mt-[10px]">
            <div className="w-[56px] h-[56px] shrink-0 rounded-full grid place-items-center text-white font-semibold text-[20px] bg-[#1a493a]">
              {firstName?.[0] || 'U'}{lastName?.[0] || ''}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="m-0 text-[18px] font-bold leading-tight text-slate-900">
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : (
                  <span className="italic font-normal">Awaiting setup</span>
                )}
              </h3>
              <a href={`mailto:${email}`} className="inline-block mt-[4px] text-slate-500 text-[13px] no-underline hover:underline truncate w-full">
                {email}
              </a>
              <div className="mt-[6px]">
                <span className={`text-[10px] font-semibold px-[8px] py-[2px] rounded-full inline-flex items-center gap-[6px] ${isSuspended ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                  <span className={`w-[5px] h-[5px] rounded-full ${isSuspended ? 'bg-red-600' : 'bg-emerald-600'}`}></span>
                  {isSuspended ? 'Suspended' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-[24px]">
          {isFetchingProfile ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : employeeProfile ? (
            <div className="space-y-[28px]">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-[12px]">Account Details</h4>
                <div className="border border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm">
                  <div className="flex items-center gap-[16px] p-[16px] border-b border-slate-100">
                    <div className="w-[36px] h-[36px] shrink-0 rounded-lg bg-emerald-50/50 flex items-center justify-center text-emerald-700 border border-emerald-100/50">
                      <CreditCard className="w-[18px] h-[18px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-slate-900">Clerk User ID</div>
                      <div className="text-[12px] text-slate-500 truncate mt-[2px]">{userId}</div>
                    </div>
                    <button onClick={() => { 
                      try {
                        navigator.clipboard.writeText(userId);
                        showToast('ID Copied', 'success');
                      } catch(e) {
                         const textArea = document.createElement("textarea");
                         textArea.value = userId;
                         textArea.style.position = "absolute";
                         textArea.style.left = "-999999px";
                         document.body.prepend(textArea);
                         textArea.select();
                         try { document.execCommand('copy'); showToast('ID Copied', 'success'); } 
                         catch (error) { showToast('Failed to copy', 'error'); } 
                         finally { textArea.remove(); }
                      }
                    }} className="text-slate-400 hover:text-slate-700 p-2">
                      <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-[16px] p-[16px]">
                    <div className="w-[36px] h-[36px] shrink-0 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200/60">
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-slate-900">Joined</div>
                    </div>
                    <div className="text-[12px] text-slate-500">
                      {activeMember.createdAt ? new Date(activeMember.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-[12px]">Hajj Savings Profile</h4>
                <div className="border border-slate-100 rounded-xl bg-white p-[20px] flex items-center justify-between shadow-sm">
                  <div className="flex-1 text-center">
                    <div className="text-[11px] font-medium text-slate-500 mb-[4px]">Total savings balance</div>
                    <div className="text-[22px] font-bold text-[#1a493a]">£{employeeProfile.totalSavings?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div className="w-[1px] h-[40px] bg-slate-100 mx-[10px]"></div>
                  <div className="flex-1 text-center">
                    <div className="text-[11px] font-medium text-slate-500 mb-[4px]">Monthly contribution</div>
                    <div className="text-[22px] font-bold text-[#1a493a]">£{employeeProfile.monthlyContribution?.toFixed(2) || '0.00'}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-[12px]">Compliance & Status</h4>
                <div className="border border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm">
                  
                  <div className="flex items-center gap-[16px] p-[16px] border-b border-slate-100">
                    <div className="w-[36px] h-[36px] shrink-0 rounded-lg bg-emerald-50/50 flex items-center justify-center text-emerald-700 border border-emerald-100/50">
                      <FileText className="w-[18px] h-[18px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-slate-900">Shariah agreement</div>
                      <div className="text-[12px] text-slate-500 truncate mt-[2px]">Master agreement v2</div>
                    </div>
                    <div className="ml-auto flex items-center">
                      {employeeProfile.agreementStatus === 'signed' ? (
                        <span className="text-[11px] font-semibold px-[12px] py-[4px] rounded-full bg-white text-emerald-600 border border-emerald-200">Signed</span>
                      ) : (
                        <span className="text-[11px] font-semibold px-[12px] py-[4px] rounded-full bg-white text-amber-600 border border-amber-200">Pending</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-[16px] p-[16px] border-b border-slate-100">
                    <div className="w-[36px] h-[36px] shrink-0 rounded-lg bg-emerald-50/50 flex items-center justify-center text-emerald-700 border border-emerald-100/50">
                      <CreditCard className="w-[18px] h-[18px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-slate-900">Subscription</div>
                      <div className="text-[12px] text-slate-500 truncate mt-[2px]">Direct debit • Stripe</div>
                    </div>
                    <div className="ml-auto flex items-center">
                      {employeeProfile.subscriptionStatus === 'active' ? (
                        <span className="text-[11px] font-semibold px-[12px] py-[4px] rounded-full bg-white text-emerald-600 border border-emerald-200">Active</span>
                      ) : (
                        <span className="text-[11px] font-semibold px-[12px] py-[4px] rounded-full bg-white text-slate-500 border border-slate-200">Inactive</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-[16px] p-[16px]">
                    <div className="w-[36px] h-[36px] shrink-0 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-200/60">
                      <Award className="w-[18px] h-[18px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-slate-900">Hajj award</div>
                      <div className="text-[12px] text-slate-500 truncate mt-[2px]">Monthly draw eligibility</div>
                    </div>
                    <div className="ml-auto flex items-center">
                      <span className="text-[11px] font-semibold px-[12px] py-[4px] rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                        {employeeProfile.awardStatus ? employeeProfile.awardStatus.charAt(0).toUpperCase() + employeeProfile.awardStatus.slice(1) : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#93a19c]">Failed to load profile. This may happen if the employee has no associated DB record.</div>
          )}
        </div>

        {(onRemove || onDownloadStatement) && !activeMember.isRemoved && (
          <div className="p-[20px_24px_24px] bg-white grid gap-[10px] shrink-0 border-t border-slate-100">
            {onDownloadStatement && (
              <button 
                onClick={onDownloadStatement}
                className="font-semibold text-[11px] py-[10px] rounded-lg inline-flex items-center justify-center gap-[6px] w-full bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <Download className="w-[14px] h-[14px]" />
                Download Statement
              </button>
            )}
            
            {onRemove && (
              <button 
                onClick={onRemove}
                disabled={isRemoving}
                className="font-semibold text-[11px] py-[10px] rounded-lg inline-flex items-center justify-center gap-[6px] w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isRemoving ? (
                  <div className="w-[14px] h-[14px] border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-[14px] h-[14px]" />
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
"""

with open('src/components/EmployeeProfileSidecar.jsx', 'w') as f:
    f.write(code)

