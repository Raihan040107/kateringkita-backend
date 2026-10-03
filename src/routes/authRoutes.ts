import { Router } from "express";
import { getMerchantTypes, register, login } from "../controllers/authController";

const router = Router();

router.get("/types", getMerchantTypes);
router.post("/register", register);
router.post("/login", login);

export default router;
