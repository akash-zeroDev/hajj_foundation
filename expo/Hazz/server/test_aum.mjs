import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const totalAUM = await mongoose.connection.db.collection('employees').aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]).toArray();
    console.log("AUM:", totalAUM);
    mongoose.disconnect();
}).catch(console.error);
