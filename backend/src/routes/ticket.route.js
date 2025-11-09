import express from "express";
import { createTicket, getTickets, getTicket } from "../controllers/ticket.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// All ticket routes require authentication
router.post("/", auth, createTicket);
router.get("/", auth, getTickets);
router.get("/:id", auth, getTicket);

export default router;
