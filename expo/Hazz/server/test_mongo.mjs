import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to DB');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    for (let c of collections) {
        const count = await mongoose.connection.db.collection(c.name).countDocuments();
        console.log(`- ${c.name}: ${count}`);
    }
    
    // Check 'employees' specifically
    const empDocs = await mongoose.connection.db.collection('employees').find().limit(2).toArray();
    console.log('Sample Employees:', empDocs);
    
    mongoose.disconnect();
}).catch(console.error);
