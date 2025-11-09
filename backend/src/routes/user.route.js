import express from "express";
import { signup, login, logout, updateUser, getUsers } from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.post("/logout", auth, logout);
router.put("/update", auth, updateUser);
router.get("/users", auth, getUsers);

export default router;
