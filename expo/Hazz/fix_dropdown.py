with open('src/components/NotificationDropdown.jsx', 'r') as f:
    code = f.read()

# Change lucide-react imports to include X
import_statement_old = "import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';"
import_statement_new = "import { Bell, Check, Trash2, ExternalLink, X } from 'lucide-react';"
code = code.replace(import_statement_old, import_statement_new)

# Change "Mark all read" to "Clear all"
old_mark_all = """<Check className="w-3 h-3" /> Mark all read"""
new_mark_all = """<Trash2 className="w-3 h-3" /> Clear all"""
code = code.replace(old_mark_all, new_mark_all)

# Add X button on hover to individual items
old_item_render = """                      {notif.actionUrl && (
                        <div className="shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-4 h-4 text-emerald-600" />
                        </div>
                      )}"""

new_item_render = """                      <div className="shrink-0 flex flex-col items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity gap-2 pt-1">
                        <button 
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
                        )}
                      </div>"""

code = code.replace(old_item_render, new_item_render)

with open('src/components/NotificationDropdown.jsx', 'w') as f:
    f.write(code)
