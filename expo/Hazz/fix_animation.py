with open('src/components/NotificationDropdown.jsx', 'r') as f:
    code = f.read()

import_statement_old = "import { Bell, Check, Trash2, X } from 'lucide-react';"
import_statement_new = "import { Bell, Check, Trash2, X } from 'lucide-react';\nimport { motion, AnimatePresence } from 'framer-motion';"
code = code.replace(import_statement_old, import_statement_new)

# 1. Animate dropdown container
old_dropdown_wrapper = """      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg ring-1 ring-slate-900/5 z-50 overflow-hidden flex flex-col max-h-[32rem]">"""

new_dropdown_wrapper = """      <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg ring-1 ring-slate-900/5 z-50 overflow-hidden flex flex-col max-h-[32rem] origin-top-right"
        >"""

code = code.replace(old_dropdown_wrapper, new_dropdown_wrapper)

# Fix the closing tag for the dropdown
old_dropdown_end = """        </div>
      )}
    </div>"""

new_dropdown_end = """        </motion.div>
      )}
      </AnimatePresence>
    </div>"""

code = code.replace(old_dropdown_end, new_dropdown_end)

# 2. Animate the individual list items
old_list_wrapper = """              <div className="space-y-1">
                {notifications.map((notif) => {"""

new_list_wrapper = """              <div className="space-y-1 overflow-hidden">
                <AnimatePresence initial={false}>
                {notifications.map((notif) => {"""

code = code.replace(old_list_wrapper, new_list_wrapper)

old_item_render = """                  return (
                    <div 
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`
                        w-full text-left p-3 rounded-lg transition-colors cursor-pointer group flex gap-3
                        ${isUnread ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-slate-50'}
                      `}
                    >"""

new_item_render = """                  return (
                    <motion.div 
                      layout
                      key={notif._id}
                      initial={{ opacity: 0, height: 0, scale: 0.9 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.9, marginTop: 0, marginBottom: 0, padding: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      onClick={() => handleNotificationClick(notif)}
                      className={`
                        w-full text-left p-3 rounded-lg transition-colors cursor-pointer group flex gap-3 overflow-hidden
                        ${isUnread ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-slate-50'}
                      `}
                    >"""

code = code.replace(old_item_render, new_item_render)


old_item_end = """                      </div>
                    </div>
                  );
                })}
              </div>"""

new_item_end = """                      </div>
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </div>"""

code = code.replace(old_item_end, new_item_end)


with open('src/components/NotificationDropdown.jsx', 'w') as f:
    f.write(code)
