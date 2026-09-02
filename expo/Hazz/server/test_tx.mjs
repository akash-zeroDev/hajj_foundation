import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const txs = await mongoose.connection.db.collection('transactions').find().toArray();
    console.log("Transactions:", txs);
    mongoose.disconnect();
}).catch(console.error);
