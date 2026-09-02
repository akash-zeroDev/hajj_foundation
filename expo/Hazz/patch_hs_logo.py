with open('src/pages/Dashboards.jsx', 'r') as f:
    content = f.read()

content = content.replace('<span className="mark">HS</span>', '')

with open('src/pages/Dashboards.jsx', 'w') as f:
    f.write(content)
