with open('src/components/NotificationDropdown.jsx', 'r') as f:
    code = f.read()

# Remove ExternalLink from imports
import_statement_old = "import { Bell, Check, Trash2, ExternalLink, X } from 'lucide-react';"
import_statement_new = "import { Bell, Check, Trash2, X } from 'lucide-react';"
code = code.replace(import_statement_old, import_statement_new)

# Remove the ExternalLink rendering block
old_render = """                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead([notif._id]);
                          }}
                          className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full p-1 shadow-sm border border-slate-200 transition-colors"
                          title="Clear notification"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {notif.actionUrl && (
                          <div className="text-emerald-600 p-1">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        )}"""

new_render = """                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead([notif._id]);
                          }}
                          className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full p-1 shadow-sm border border-slate-200 transition-colors"
                          title="Clear notification"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>"""

code = code.replace(old_render, new_render)

with open('src/components/NotificationDropdown.jsx', 'w') as f:
    f.write(code)
