import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { serve } from "inngest/express";
import { inngestClient } from "./inngest/client.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js";
import userRoutes from "./routes/user.route.js";
import ticketRoutes from "./routes/ticket.route.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);

// Inngest endpoint
app.use("/api/inngest", serve({
    client: inngestClient,
    functions: [onUserSignup, onTicketCreated],
}));


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,

}).then(() => {

    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});