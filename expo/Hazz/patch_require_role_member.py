with open('src/components/RequireRole.jsx', 'r') as f:
    code = f.read()

old_member_handling = """  // Handle Org Admin (Clerk B2B Role)
  else if (role === 'org:admin') {
    if (!membership || membership.role !== 'org:admin') {
      // If they are a superadmin, gently redirect them to their own dashboard
      if (user.publicMetadata?.role === 'superadmin') {
         return <Navigate to="/superadmin" replace />;
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }"""

new_member_handling = """  // Handle Org Admin (Clerk B2B Role)
  else if (role === 'org:admin') {
    if (!membership || membership.role !== 'org:admin') {
      // If they are a superadmin, gently redirect them to their own dashboard
      if (user.publicMetadata?.role === 'superadmin') {
         return <Navigate to="/superadmin" replace />;
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }
  else if (role === 'org:member') {
    if (!membership) {
      if (user.publicMetadata?.role === 'superadmin') return <Navigate to="/superadmin" replace />;
      return <Navigate to="/unauthorized" replace />;
    }
  }"""

code = code.replace(old_member_handling, new_member_handling)
with open('src/components/RequireRole.jsx', 'w') as f:
    f.write(code)

