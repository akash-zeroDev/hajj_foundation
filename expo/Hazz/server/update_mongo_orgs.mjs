import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    // We'll update orgs that don't have adminFirstName
    await mongoose.connection.db.collection('organisations').updateMany(
        { adminFirstName: { $exists: false } },
        { $set: { adminFirstName: 'Admin', adminLastName: 'User', adminPhone: '07000000000' } }
    );
    console.log('Orgs updated');
    mongoose.disconnect();
}).catch(console.error);
