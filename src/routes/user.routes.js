import { Router } from "express";
import {
    getUser,
    loginUser,
    registerUser,
} from "../controllers/user.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const userRouter = Router();

// AUTHENTICATION
userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);

// CRUD
userRouter.route("/get-user/:id").get(verifyToken, getUser);

export default userRouter;
