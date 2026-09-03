import re

with open('src/pages/superadmin/OrganisationDetails.jsx', 'r') as f:
    code = f.read()

# Add icons to import
import_pattern = r"import \{([^}]+)\} from 'lucide-react';"
def repl(m):
    icons = m.group(1)
    new_icons = " CreditCard, FileText, Mail, MapPin, Building2, Fingerprint, " + icons
    return f"import {{{new_icons}}} from 'lucide-react';"

code = re.sub(import_pattern, repl, code, count=1)

# Replace the overview content
old_content = """      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Financials & Legal Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Financial & Legal Status</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Agreed Annual Fee</p>
                  <p className="text-lg font-bold text-slate-900">£{org.annualFee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Fee Status</p>
                  {renderBadge(org.annualFeeStatus)}
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Agreement Status</p>
                  {renderBadge(org.agreementStatus)}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Signed Document</p>
                  {org.agreementUrl ? (
                    <a 
                      href={org.agreementUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded text-sm font-medium text-emerald-700 bg-white hover:bg-slate-50 transition"
                    >
                      <FileDown className="w-4 h-4" />
                      View PDF
                    </a>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No document available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Location Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Organisation Details</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Organisation ID</p>
                <p className="text-sm font-mono text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 break-all">{org._id}</p>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <p className="text-xs text-slate-500 mb-1">Admin Contact Email</p>
                <p className="text-sm font-medium text-slate-800 break-all">
                  {org.adminEmail ? (
                    <span className="flex items-center gap-2">
                      {org.adminEmail}
                      {org.agreementStatus === 'pending' && (
                        <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Invite Pending</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Not recorded</span>
                  )}
                </p>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <p className="text-xs text-slate-500 mb-1">Registered Address</p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{org.registeredAddress}</p>
              </div>
            </div>
          </div>
          
        </div>
      )}"""

new_content = """      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Financial & Legal Status Card */}
          <div className="bg-white rounded-[14px] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700 shadow-sm border border-emerald-200/50">
                <FileText className="w-[15px] h-[15px]" />
              </div>
              <h3 className="font-bold text-slate-800 text-[14.5px]">Financial & Legal Status</h3>
            </div>
            <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-center">
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Agreed Annual Fee</p>
                  <p className="text-[20px] font-bold text-slate-900 leading-none">£{org.annualFee.toLocaleString()}</p>
                </div>
                <div>{renderBadge(org.annualFeeStatus)}</div>
              </div>
              
              <div className="p-5 flex items-center justify-between bg-slate-50/30">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Agreement Status</p>
                  <div>{renderBadge(org.agreementStatus)}</div>
                </div>
                {org.agreementUrl ? (
                  <a 
                    href={org.agreementUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
                  >
                    <FileDown className="w-[14px] h-[14px] text-emerald-600" />
                    View PDF
                  </a>
                ) : (
                  <p className="text-[12px] text-slate-400 italic">No document</p>
                )}
              </div>
            </div>
          </div>

          {/* Organisation Details Card */}
          <div className="bg-white rounded-[14px] shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700 shadow-sm border border-blue-200/50">
                <Building2 className="w-[15px] h-[15px]" />
              </div>
              <h3 className="font-bold text-slate-800 text-[14.5px]">Organisation Details</h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-4 flex gap-4 items-center hover:bg-slate-50/50 transition-colors">
                <div className="w-[34px] h-[34px] rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60 text-slate-500">
                  <Fingerprint className="w-[16px] h-[16px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-[2px]">Organisation ID</p>
                  <p className="text-[13px] font-mono font-medium text-slate-700 truncate">{org._id}</p>
                </div>
              </div>
              
              <div className="p-4 flex gap-4 items-center hover:bg-slate-50/50 transition-colors">
                <div className="w-[34px] h-[34px] rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60 text-slate-500">
                  <Mail className="w-[16px] h-[16px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-[2px]">Admin Contact Email</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-slate-800 truncate">
                      {org.adminEmail || <span className="text-slate-400 italic font-normal">Not recorded</span>}
                    </p>
                    {org.adminEmail && org.agreementStatus === 'pending' && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0 uppercase tracking-wide">Pending</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 flex gap-4 items-start hover:bg-slate-50/50 transition-colors">
                <div className="w-[34px] h-[34px] rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60 text-slate-500 mt-0.5">
                  <MapPin className="w-[16px] h-[16px]" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-[2px]">Registered Address</p>
                  <p className="text-[13px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{org.registeredAddress}</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      )}"""

code = code.replace(old_content, new_content)

with open('src/pages/superadmin/OrganisationDetails.jsx', 'w') as f:
    f.write(code)
