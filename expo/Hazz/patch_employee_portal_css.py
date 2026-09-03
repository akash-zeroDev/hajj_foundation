with open('src/pages/Dashboards.jsx', 'r') as f:
    code = f.read()

# Replace the variables line
old_vars = ".hs-portal { --green: #0b7a5b; --green-400: #17a377; --green-soft: rgba(11,122,91,.12);"
new_vars = ".hs-portal { --green: #296043; --green-400: #296043; --green-soft: rgba(41,96,67,.12);"
code = code.replace(old_vars, new_vars)

# Replace the btn-primary style
old_btn = ".hs-portal .btn-primary { color: #fff; background: linear-gradient(180deg, var(--green-400), var(--green)); box-shadow: 0 10px 22px -12px rgba(11,122,91,.9); }"
new_btn = ".hs-portal .btn-primary { color: #fff; background: var(--green); }"
code = code.replace(old_btn, new_btn)

# Replace the btn-primary hover style
old_hover = ".hs-portal .btn-primary:hover { filter: brightness(1.06); }"
new_hover = ".hs-portal .btn-primary:hover { background: #1e4531; filter: none; }"
code = code.replace(old_hover, new_hover)

# Also fix the background bar inside 'Compliance rate' if any uses gradient
old_bar = ".hs-portal .bar i { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--green-400), var(--green)); }"
new_bar = ".hs-portal .bar i { display: block; height: 100%; border-radius: 999px; background: var(--green); }"
code = code.replace(old_bar, new_bar)

with open('src/pages/Dashboards.jsx', 'w') as f:
    f.write(code)
