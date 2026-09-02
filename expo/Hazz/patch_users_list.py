import re

with open('src/pages/superadmin/UsersList.jsx', 'r') as f:
    content = f.read()

# Find the name rendering in UsersList.jsx
# Assuming it looks like <div className="font-medium text-slate-900">{user.name}</div>
# Let's search for user.firstName or user.name

old_name_pattern = re.compile(r'(<div className="font-medium text-slate-900[^>]*>.*?{.*?}.*?</div>)')

badge_html = """{user.isSuspended && (
                          <span className="px-2 py-0.5 ml-2 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider whitespace-nowrap">
                            Suspended
                          </span>
                        )}"""

def replace_name(match):
    return f"""<div className="flex items-center gap-2">
                        {match.group(1)}
                        {badge_html}
                      </div>"""

content = old_name_pattern.sub(replace_name, content)

with open('src/pages/superadmin/UsersList.jsx', 'w') as f:
    f.write(content)
