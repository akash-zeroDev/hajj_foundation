import re

# 1. Backend Controller
with open('server/controllers/employeeController.js', 'r') as f:
    controller = f.read()

new_method = """
exports.remindPendingAgreements = async (req, res) => {
  try {
    const auth = getAuth(req);
    const orgId = auth.orgId;
    if (!orgId) return res.status(400).json({ success: false });
    if (auth.orgRole !== 'org:admin') return res.status(403).json({ success: false });

    const org = await Organisation.findOne({ clerkOrganizationId: orgId });
    if (!org) return res.status(404).json({ success: false });

    const pendingEmployees = await Employee.find({ 
      organisationId: org._id, 
      agreementStatus: 'pending',
      isRemoved: false 
    });

    if (pendingEmployees.length === 0) {
      return res.status(400).json({ success: false, message: 'No pending employees' });
    }

    const promises = pendingEmployees.map(emp => 
      NotificationService.notifyUser({
        userId: emp.clerkUserId,
        senderId: org.clerkOrganizationId,
        senderName: org.name,
        type: 'AGREEMENT_REMINDER',
        title: 'Action Required: Master Agreement',
        message: 'Please review and sign the Shariah master agreement to complete your onboarding.',
        actionUrl: '/dashboard'
      })
    );

    await Promise.all(promises);
    res.status(200).json({ success: true, count: pendingEmployees.length });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
"""
with open('server/controllers/employeeController.js', 'w') as f:
    f.write(controller + new_method)

# 2. Backend Routes
with open('server/routes/employeeRoutes.js', 'r') as f:
    routes = f.read()

routes = routes.replace(
    "router.post('/invite', requireOrgAdmin, employeeController.inviteEmployee);",
    "router.post('/invite', requireOrgAdmin, employeeController.inviteEmployee);\nrouter.post('/remind-pending', requireOrgAdmin, employeeController.remindPendingAgreements);"
)
with open('server/routes/employeeRoutes.js', 'w') as f:
    f.write(routes)


# 3. Frontend Component
with open('src/pages/admin/AgreementsTracking.jsx', 'r') as f:
    frontend = f.read()

import_toast = "import { useToast } from '../../context/ToastContext';\nimport { useAuth } from '@clerk/react';"
frontend = frontend.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\n" + import_toast)

state_declaration = """  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');"""
  
new_state = """  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isReminding, setIsReminding] = useState(false);
  const { showToast } = useToast();
  const { getToken } = useAuth();
  
  const handleRemindPending = async () => {
    if (pendingCount === 0) {
      showToast('No employees with pending agreements.', 'error');
      return;
    }
    
    setIsReminding(true);
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/employees/remind-pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Reminder sent to ${data.count} pending employees.`, 'success');
      } else {
        showToast(data.message || 'Failed to send reminders.', 'error');
      }
    } catch (err) {
      showToast('Network error while sending reminders.', 'error');
    } finally {
      setIsReminding(false);
    }
  };
"""
frontend = frontend.replace(state_declaration, new_state)

old_button = """<button className="agt-btn agt-btn-primary"><svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z"/></svg>Remind pending</button>"""
new_button = """<button className="agt-btn agt-btn-primary" onClick={handleRemindPending} disabled={isReminding || pendingCount === 0} style={{ opacity: isReminding || pendingCount === 0 ? 0.6 : 1, cursor: isReminding || pendingCount === 0 ? 'not-allowed' : 'pointer' }}>
  {isReminding ? (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
  ) : (
    <svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z"/></svg>
  )}
  {isReminding ? 'Sending...' : 'Remind pending'}
</button>"""
frontend = frontend.replace(old_button, new_button)

with open('src/pages/admin/AgreementsTracking.jsx', 'w') as f:
    f.write(frontend)

