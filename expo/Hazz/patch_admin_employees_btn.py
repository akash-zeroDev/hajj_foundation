import re

with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    code = f.read()

old_button = """        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 border border-transparent rounded-lg text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Invite Employee
        </button>"""

new_button = """        <PrimaryButton 
          onClick={() => setIsInviteModalOpen(true)}
          icon={<Plus className="w-[18px] h-[18px]" />}
        >
          Invite Employee
        </PrimaryButton>"""

code = code.replace(old_button, new_button)

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(code)

