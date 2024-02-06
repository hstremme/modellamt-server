import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { connectDb } from "./dbconfig.js";
import { api } from "./api.js";

const app = express();
app.use(cors({
    "origin": process.env.CLIENT_URL,
    "credentials": true
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(api);

await connectDb;

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
