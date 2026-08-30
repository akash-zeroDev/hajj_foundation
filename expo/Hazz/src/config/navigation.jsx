// Navigation configurations for different roles

export const superAdminNavigation = [
  { name: 'Dashboard Overview', href: '/superadmin' },
  { name: 'Organisations', href: '/superadmin/organisations' },
  { name: 'Users', href: '/superadmin/users' },
  { name: 'Payments & Revenues', href: '/superadmin/payments' },
  { name: 'Awards', href: '/superadmin/awards' },
  { name: 'Documents', href: '/superadmin/documents' },
  { name: 'Bank Accounts', href: '/superadmin/banks' },
  { name: 'Reports & Audit', href: '/superadmin/reports' },
];

export const orgAdminNavigation = [
  { name: 'Overview', href: '/admin' },
  { name: 'Employees', href: '/admin/employees' },
  { name: 'Agreements', href: '/admin/agreements' },
  { name: 'Employee Payments', href: '/admin/payments' },
];

export const employeeNavigation = [
  { name: 'My Portal', href: '/employee' },
  { name: 'Contributions', href: '/employee/contributions' },
  { name: 'Statements', href: '/employee/statements' },
];
