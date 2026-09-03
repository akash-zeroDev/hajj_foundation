import re

with open('src/pages/superadmin/UsersList.jsx', 'r') as f:
    code = f.read()

# Replace the whole block starting from `          {activeUser && (` to the end of the `aside` tag

old_block_pattern = r"\{activeUser && \(\s*<>\s*\{\/\* Premium Green Header \*\/\}.*?<\/aside>"
# Wait, regex dotall might be tricky. Let's just find the exact string indices.
start_str = "          {activeUser && ("
end_str = "        </aside>"
start_idx = code.find(start_str)
end_idx = code.find(end_str) + len(end_str)

new_block = """          {activeUser && (
            <>
              <div className="bg-white text-slate-900 shrink-0 relative overflow-hidden border-b border-slate-100" style={{ minHeight: '130px', padding: '24px' }}>
                <div className="absolute top-0 right-0 w-[60%] h-full opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'url(/assets/arches.png)', backgroundSize: 'cover', backgroundPosition: 'right bottom' }}></div>
                
                <button 
                  className="absolute top-[16px] right-[16px] w-[24px] h-[24px] grid place-items-center text-slate-400 hover:text-slate-700 transition-colors z-10"
                  onClick={handleCloseSidecard}
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
                
                <div className="flex items-center gap-[16px] relative z-10 mt-[10px]">
                  <div className="w-[56px] h-[56px] shrink-0 rounded-full grid place-items-center text-white font-semibold text-[20px] bg-[#1a493a]">
                    {activeUser.firstName?.[0] || 'U'}{activeUser.lastName?.[0] || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="m-0 text-[18px] font-bold leading-tight text-slate-900">
                      {activeUser.firstName || activeUser.lastName ? `${activeUser.firstName || ''} ${activeUser.lastName || ''}`.trim() : (
                        <span className="italic font-normal">Awaiting setup</span>
                      )}
                    </h3>
                    <a href={`mailto:${activeUser.emailAddresses?.[0]?.emailAddress}`} className="inline-block mt-[4px] text-slate-500 text-[13px] no-underline hover:underline truncate w-full">
                      {activeUser.emailAddresses?.[0]?.emailAddress}
                    </a>
                    <div className="mt-[6px]">
                      <span className={`text-[10px] font-semibold px-[8px] py-[2px] rounded-full inline-flex items-center gap-[6px] ${activeUser.publicMetadata?.isSuspended ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                        <span className={`w-[5px] h-[5px] rounded-full ${activeUser.publicMetadata?.isSuspended ? 'bg-red-600' : 'bg-emerald-600'}`}></span>
                        {activeUser.publicMetadata?.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white p-[24px]">
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
                          <div className="text-[12px] text-slate-500 truncate mt-[2px]">{activeUser.id}</div>
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText(activeUser.id); showToast('ID Copied', 'success') }} className="text-slate-400 hover:text-slate-700 p-2">
                          <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                      </div>

                      <div className="flex items-center gap-[16px] p-[16px]">
                        <div className="w-[36px] h-[36px] shrink-0 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200/60">
                          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-slate-900">Last Sign In</div>
                        </div>
                        <div className="text-[12px] text-slate-500">
                          {activeUser.lastSignInAt ? new Date(activeUser.lastSignInAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {employeeProfile && (
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
                  )}

                  {employeeProfile && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-[12px]">Compliance & Status</h4>
                      <div className="border border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm">
                        
                        <div className="flex items-center gap-[16px] p-[16px] border-b border-slate-100">
                          <div className="w-[36px] h-[36px] shrink-0 rounded-lg bg-emerald-50/50 flex items-center justify-center text-emerald-700 border border-emerald-100/50">
                            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
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
                  )}
                </div>
              </div>
                            
              {/* Action Footer */}
              <div className="p-[20px_24px_24px] bg-white grid grid-cols-3 gap-[10px] shrink-0">
                <button 
                  onClick={handleResetPassword}
                  disabled={isResetting || activeUser.publicMetadata?.isSuspended}
                  className="font-semibold text-[11px] py-[10px] rounded-lg inline-flex items-center justify-center gap-[6px] w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {isResetting ? (
                    <svg className="animate-spin h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  )}
                  Reset Password
                </button>
                
                <button 
                  onClick={handleToggleSuspend}
                  disabled={isSuspending}
                  className={`font-semibold text-[11px] py-[10px] rounded-lg inline-flex items-center justify-center gap-[6px] w-full bg-white border transition-colors disabled:opacity-50 ${
                    activeUser.publicMetadata?.isSuspended 
                      ? 'border-slate-200 text-slate-700 hover:bg-slate-50' 
                      : 'border-red-200 text-red-600 hover:bg-red-50'
                  }`}
                >
                  {isSuspending ? (
                    <svg className="animate-spin h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                  )}
                  {activeUser.publicMetadata?.isSuspended ? 'Unsuspend' : 'Suspend User'}
                </button>
                
                <button 
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="font-semibold text-[11px] py-[10px] rounded-lg inline-flex items-center justify-center gap-[6px] w-full bg-[#da3b3b] text-white hover:bg-[#c93232] transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <svg className="animate-spin h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  )}
                  Delete User
                </button>
              </div>
            </>
          )}
        </aside>"""

new_code = code[:start_idx] + new_block + code[end_idx:]

with open('src/pages/superadmin/UsersList.jsx', 'w') as f:
    f.write(new_code)
