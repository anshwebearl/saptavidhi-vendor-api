import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
    getAllMembershipPlans,
    getMembershipById,
} from "../controllers/membership.controller.js";

const membershipRouter = Router();

membershipRouter.route("/get-all").get(verifyToken, getAllMembershipPlans);
membershipRouter.route("/get-membership").get(verifyToken, getMembershipById);

export default membershipRouter;
