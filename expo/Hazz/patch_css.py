with open('src/pages/Dashboards.jsx', 'r') as f:
    content = f.read()

content = content.replace('.hs-portal .logo .mark { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; background: rgba(255,255,255,.16); font-size: 13px; font-weight: 800; }', '')

with open('src/pages/Dashboards.jsx', 'w') as f:
    f.write(content)
