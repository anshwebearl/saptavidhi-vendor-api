import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToDB from "./src/db/index.js";
import dotenv from "dotenv";
import vendorRouter from "./src/routes/vendor.routes.js";

dotenv.config({
    path: "./.env",
});

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/vendor", vendorRouter);

connectToDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log("SERVER RUNNING ON PORT:", process.env.PORT);
        });
    })
    .catch((err) => {
        console.log("MONGODB CONNECTION FAILED: ", err);
    });
