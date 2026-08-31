const mongoose = require('mongoose');
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const { faker } = require('@faker-js/faker');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const Organisation = require('../models/Organisation');
const Employee = require('../models/Employee');
const Transaction = require('../models/Transaction');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const credentials = [];
  const cleanupIds = { users: [], orgs: [], mongo: [] };
  const mockPassword = 'MockPassword123!@#';

  try {
    // 1. Create Employer User
    console.log('Creating Employer User...');
    const employerEmail = faker.internet.email({ provider: 'example.com' });
    const employer = await clerk.users.createUser({
      emailAddress: [employerEmail],
      password: mockPassword,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      publicMetadata: { is_mock_data: true }
    });
    cleanupIds.users.push(employer.id);
    credentials.push({ role: 'Employer / Org Admin', email: employerEmail, password: mockPassword });

    // 2. Create Organization
    console.log('Creating Organization...');
    const orgName = faker.company.name() + ' (Mock)';
    const org = await clerk.organizations.createOrganization({
      name: orgName,
      createdBy: employer.id,
      publicMetadata: { is_mock_data: true }
    });
    cleanupIds.orgs.push(org.id);

    // Save to Mongo
    const dbOrg = await Organisation.create({
      clerkOrganizationId: org.id,
      name: org.name,
      companyNumber: faker.string.alphanumeric(8).toUpperCase(),
      registeredAddress: faker.location.streetAddress(),
      annualFee: 1500,
      annualFeeStatus: 'paid',
      agreementStatus: 'signed'
    });
    cleanupIds.mongo.push({ model: 'Organisation', id: dbOrg._id });
    
    // 3. Create 2 Employees
    console.log('Creating 2 Employees...');
    for (let i = 0; i < 2; i++) {
      const empEmail = faker.internet.email({ provider: 'example.com' });
      const emp = await clerk.users.createUser({
        emailAddress: [empEmail],
        password: mockPassword,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        publicMetadata: { is_mock_data: true }
      });
      cleanupIds.users.push(emp.id);
      credentials.push({ role: 'Employee', email: empEmail, password: mockPassword });

      // Add to Clerk Org
      await clerk.organizations.createOrganizationMembership({
        organizationId: org.id,
        userId: emp.id,
        role: 'org:admin' // Clerk expects org:admin or org:member based on permissions
      }).catch(err => {
         console.log('Failed org:admin, trying basic_member...', err.message);
         return clerk.organizations.createOrganizationMembership({
           organizationId: org.id,
           userId: emp.id,
           role: 'basic_member' 
         }).catch(() => null);
      });

      // Add to Mongo
      const dbEmp = await Employee.create({
        clerkUserId: emp.id,
        organisationId: dbOrg._id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        phone: faker.phone.number(),
        agreementStatus: 'signed',
        monthlyContribution: 250,
        balance: faker.number.int({ min: 1000, max: 5000 })
      });
      cleanupIds.mongo.push({ model: 'Employee', id: dbEmp._id });

      // Add dummy transaction using CORRECT SCHEMA
      const tx = await Transaction.create({
        payerId: dbEmp._id,
        payerModel: 'Employee',
        orgId: dbOrg._id,
        type: 'employee_contribution',
        amount: 250,
        status: 'succeeded',
        stripeSessionId: 'mock_session_' + faker.string.alphanumeric(10)
      });
      cleanupIds.mongo.push({ model: 'Transaction', id: tx._id });
    }

    console.log('\n--- SEED COMPLETED SUCCESSFULLY ---');
    console.table(credentials);
    console.log('\nCLEANUP TRACKING (Keep this to delete later):');
    console.log(JSON.stringify(cleanupIds, null, 2));

  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    process.exit(0);
  }
}

seed();
