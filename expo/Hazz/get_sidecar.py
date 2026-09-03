with open('src/pages/superadmin/UsersList.jsx', 'r') as f:
    lines = f.readlines()

in_block = False
block = []
for i, line in enumerate(lines):
    if '{activeUser && (' in line:
        in_block = True
    if in_block:
        block.append(line)
        if '  );' in line and lines[i+1].startswith('};'):
            break

print("".join(block))
