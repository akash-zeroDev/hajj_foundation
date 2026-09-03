with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    code = f.read()

old_btn = """                <button 
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-2 bg-emerald-600 border border-transparent rounded-lg text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </button>"""

new_btn = """                <PrimaryButton 
                  type="submit"
                  isLoading={isInviting}
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </PrimaryButton>"""

code = code.replace(old_btn, new_btn)

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(code)
