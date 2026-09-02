import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    await mongoose.connection.db.collection('organisations').updateOne(
        { name: 'org2' },
        { $set: { adminFirstName: 'adminfirst2', adminLastName: 'adminlast2' } }
    );
    console.log('org2 name updated');
    mongoose.disconnect();
}).catch(console.error);
