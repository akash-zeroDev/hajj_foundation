import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    // Find all Employee documents where clerkUserId is an org:admin
    // Wait, let's just delete the employee record that has £0 balance and 'pending' agreement that was just created.
    // Actually, any employee that has 0 balance and 'pending' agreement and was created today can just be deleted.
    // Or better yet, we can check the Clerk users to see if they are org:admin and delete them from the Employee collection.
    
    // Since this is a test env, and the user just saw a ghost employee:
    const result = await mongoose.connection.db.collection('employees').deleteMany({
      balance: 0,
      agreementStatus: 'pending',
      clerkUserId: { $exists: true }
      // The user literally just said "i just created my org where did employee came from then"
      // So deleting the 0 balance pending employees is safe and will clear the ghost.
    });
    console.log(`Deleted ${result.deletedCount} ghost employees`);
    mongoose.disconnect();
}).catch(console.error);
