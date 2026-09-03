with open('src/pages/superadmin/UsersList.jsx', 'r') as f:
    code = f.read()

# Add handleCopyId function
if "const handleCopyId =" not in code:
    code = code.replace("  const fetchUsers = async () => {", """  const handleCopyId = async (id) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(id);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = id;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (error) {
          console.error(error);
        } finally {
          textArea.remove();
        }
      }
      showToast('ID Copied', 'success');
    } catch (err) {
      console.error('Failed to copy', err);
      showToast('Failed to copy ID', 'error');
    }
  };

  const fetchUsers = async () => {""")

# Replace the onClick handler
code = code.replace("onClick={() => { navigator.clipboard.writeText(activeUser.id); showToast('ID Copied', 'success') }}", "onClick={() => handleCopyId(activeUser.id)}")

with open('src/pages/superadmin/UsersList.jsx', 'w') as f:
    f.write(code)
