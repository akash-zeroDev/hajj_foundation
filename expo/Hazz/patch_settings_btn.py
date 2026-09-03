import re
with open('src/pages/admin/Settings.jsx', 'r') as f:
    code = f.read()

# Add import
import_stmt = "import PrimaryButton from '../../components/PrimaryButton';\n"
code = code.replace("import SidebarLayout", import_stmt + "import SidebarLayout")

old_btn = """              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>"""

new_btn = """              <PrimaryButton
                type="submit"
                isLoading={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </PrimaryButton>"""

code = code.replace(old_btn, new_btn)

with open('src/pages/admin/Settings.jsx', 'w') as f:
    f.write(code)
