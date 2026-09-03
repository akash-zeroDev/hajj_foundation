import re

with open('src/App.jsx', 'r') as f:
    code = f.read()

# Replace imports
code = code.replace(
    "import { Show, RedirectToSignIn, useUser, useOrganization } from '@clerk/react';",
    "import { Show, RedirectToSignIn, RedirectToSignUp, useUser, useOrganization } from '@clerk/react';"
)

# Replace ProtectedRoute
old_route = """const ProtectedRoute = ({ children }) => (
  <>
    <Show when="signed-in">{children}</Show>
    <Show when="signed-out"><RedirectToSignIn /></Show>
  </>
);"""

new_route = """const ProtectedRoute = ({ children }) => {
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

code = code.replace(old_route, new_route)

with open('src/App.jsx', 'w') as f:
    f.write(code)
