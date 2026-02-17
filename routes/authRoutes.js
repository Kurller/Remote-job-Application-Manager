import express from "express";
import { body } from "express-validator";

import validate from "../middlewares/validate.js";
import auth from "../middlewares/auth.js";
import asyncHandler from "../middlewares/asyncHandler.js"; // <-- new
import {
  register,
  login,
  refresh,
  logout
} from "../controllers/authController.js";

const router = express.Router();

/* ======================
   REGISTER
====================== */
router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  validate,
  asyncHandler(register)
);

/* ======================
   LOGIN
====================== */
router.post(
  "/login",
  body("email").isEmail(),
  body("password").exists(),
  validate,
  asyncHandler(login)
);

/* ======================
   REFRESH TOKEN
====================== */
router.post("/refresh", asyncHandler(refresh));

/* ======================
   LOGOUT
====================== */
router.post("/logout", auth, asyncHandler(logout));

export default router;
