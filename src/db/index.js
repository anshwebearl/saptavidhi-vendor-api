import mongoose from "mongoose";

const connectToDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
        console.log("CONNECTED TO MONGODB");
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED: ", error);
    }
};

export default connectToDB;
