// Navigation configurations for different roles

export const superAdminNavigation = [
  { name: 'Dashboard Overview', href: '/superadmin', category: 'Overview' },
  { name: 'Organisations', href: '/superadmin/organisations', category: 'Overview' },
  { name: 'Users', href: '/superadmin/users', category: 'Overview' },
  { name: 'Payments & Revenues', href: '/superadmin/payments', category: 'Finance' },
  { name: 'Awards', href: '/superadmin/awards', category: 'Finance' },
  { name: 'Bank Accounts', href: '/superadmin/banks', category: 'Finance' },
  { name: 'Documents', href: '/superadmin/documents', category: 'Records' },
  { name: 'Reports & Audit', href: '/superadmin/reports', category: 'Records' },
];

export const orgAdminNavigation = [
  { name: 'Overview', href: '/admin', category: 'Overview' },
  { name: 'Employees', href: '/admin/employees', category: 'Overview' },
  { name: 'Agreements', href: '/admin/agreements', category: 'Records' },
  { name: 'Employee Payments', href: '/admin/payments', category: 'Finance' },
];

export const employeeNavigation = [
  { name: 'My Portal', href: '/employee', category: 'Overview' },
  { name: 'Contributions', href: '/employee/contributions', category: 'Finance' },
  { name: 'Statements', href: '/employee/statements', category: 'Records' },
  { name: 'Profile Settings', href: '/employee/settings', category: 'Records', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];
