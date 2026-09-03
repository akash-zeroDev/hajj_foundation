import re
with open('src/pages/admin/AgreementsTracking.jsx', 'r') as f:
    code = f.read()

import_stmt = "import PrimaryButton from '../../components/PrimaryButton';\n"
if "import PrimaryButton" not in code:
    code = code.replace("import SidebarLayout", import_stmt + "import SidebarLayout")

old_btn = """            <button className="agt-btn agt-btn-primary" onClick={handleRemindPending} disabled={isReminding || pendingCount === 0} style={{ opacity: isReminding || pendingCount === 0 ? 0.6 : 1, cursor: isReminding || pendingCount === 0 ? 'not-allowed' : 'pointer' }}>
  {isReminding ? (
    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" />
  ) : (
    <Send className="w-[18px] h-[18px] mr-1.5" />
  )}
  {isReminding ? 'Sending...' : 'Remind pending'}
</button>"""

new_btn = """            <PrimaryButton 
              onClick={handleRemindPending} 
              disabled={pendingCount === 0}
              isLoading={isReminding}
              icon={<Send className="w-[16px] h-[16px]" />}
            >
              {isReminding ? 'Sending...' : 'Remind pending'}
            </PrimaryButton>"""

code = code.replace(old_btn, new_btn)

with open('src/pages/admin/AgreementsTracking.jsx', 'w') as f:
    f.write(code)
