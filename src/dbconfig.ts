import mongoose from "mongoose";

export const connectDb = await mongoose
  .connect(process.env.MONGODB_URI!)
  .catch((e) => {
    console.log("Connection to MongoDB failed! \n" + e);
    return;
  })
  .then((con: any) => {
    console.log(`MongoDB Connected: ${con.connection.host}`);
  });
