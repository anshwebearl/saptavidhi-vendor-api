import express from "express";
import path from 'path';
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToDB from "./src/db/index.js";
import dotenv from "dotenv";
import vendorRouter from "./src/routes/vendor.routes.js";
import vendorAdminRouter from "./src/routes/vendorAdmin.routes.js";
import vendorCategoryRouter from "./src/routes/vendorCategory.routes.js";

dotenv.config({
    path: "./.env",
});

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static('./uploads'));

app.use("/api/vendor", vendorRouter);
app.use("/api/admin", vendorAdminRouter);
app.use("/api/vendor-category", vendorCategoryRouter);

connectToDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log("SERVER RUNNING ON PORT:", process.env.PORT);
        });
    })
    .catch((err) => {
        console.log("MONGODB CONNECTION FAILED: ", err);
    });
