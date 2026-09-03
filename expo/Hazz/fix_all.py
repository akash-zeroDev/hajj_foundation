import re

# 1. Fix Backend
with open('server/controllers/organisationController.js', 'r') as f:
    backend_code = f.read()

old_invite = """await clerk.organizations.createOrganizationInvitation({
      organizationId: clerkOrg.id,
      emailAddress: adminEmail,
      role: 'org:admin',
      
      publicMetadata: {"""

new_invite = """await clerk.organizations.createOrganizationInvitation({
      organizationId: clerkOrg.id,
      emailAddress: adminEmail,
      role: 'org:admin',
      redirectUrl: 'http://localhost:5173/dashboard',
      publicMetadata: {"""

backend_code = backend_code.replace(old_invite, new_invite)

with open('server/controllers/organisationController.js', 'w') as f:
    f.write(backend_code)


# 2. Fix Frontend
with open('src/App.jsx', 'r') as f:
    frontend_code = f.read()

old_route = """const ProtectedRoute = ({ children }) => {
  const hasTicket = new URLSearchParams(window.location.search).has('__clerk_ticket');
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        {hasTicket ? <RedirectToSignUp /> : <RedirectToSignIn />}
      </Show>
    </>
  );
};"""

new_route = """const ProtectedRoute = ({ children }) => {
  const hasTicket = new URLSearchParams(window.location.search).has('__clerk_ticket');
  
  // If there's a ticket, DO NOT aggressively redirect. 
  // Let Clerk's internal JS detect the ticket and handle the Hosted UI handoff natively!
  if (hasTicket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Processing your invitation...</p>
      </div>
    );
  }

  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out"><RedirectToSignIn /></Show>
    </>
  );
};"""

frontend_code = frontend_code.replace(old_route, new_route)

with open('src/App.jsx', 'w') as f:
    f.write(frontend_code)

