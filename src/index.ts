import { connectDb } from "./dbconfig.js";
import express from 'express';

const app = express();

await connectDb;

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`)
});
