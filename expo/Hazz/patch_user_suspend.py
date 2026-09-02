with open('server/controllers/userController.js', 'r') as f:
    content = f.read()

old_func = """exports.toggleSuspend = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch user to check current banned status
    const user = await clerk.users.getUser(id);
    
    let updatedUser;
    const action = user.banned ? 'unban' : 'ban';
    
    const response = await fetch(`https://api.clerk.com/v1/users/${id}/${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.message || `Failed to ${action} user`);
    }

    updatedUser = await response.json();

    res.status(200).json({ success: true, banned: updatedUser.banned });
  } catch (error) {
    console.error('Error toggling suspend:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle suspend status' });
  }
};"""

new_func = """exports.toggleSuspend = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch user to check current custom suspended status
    const user = await clerk.users.getUser(id);
    const isCurrentlySuspended = user.publicMetadata?.isSuspended === true;
    
    const updatedUser = await clerk.users.updateUserMetadata(id, {
        publicMetadata: {
            isSuspended: !isCurrentlySuspended
        }
    });

    res.status(200).json({ success: true, banned: updatedUser.publicMetadata.isSuspended });
  } catch (error) {
    console.error('Error toggling suspend:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle suspend status' });
  }
};"""

if "const action = user.banned" in content:
    content = content.replace(old_func, new_func)

with open('server/controllers/userController.js', 'w') as f:
    f.write(content)
