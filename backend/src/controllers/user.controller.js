import User from "../models/user.model.js";
import { inngestClient } from "../inngest/client.js";

const signup = async (req, res) => {
    try {
        const { email, name, password, role, skills } = req.body;

        const user = await User.create({ email, name, password, role, skills });

        // Trigger Inngest event
        await inngestClient.send({
            name: "user/signup",
            data: {
                email: user.email,
            },
        });

        const token = user.generateJWT();

        res.status(201).json({ message: "User created successfully", user, token });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = user.generateJWT();

        res.status(200).json({ message: "Login successful", user, token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};

const logout = async (req, res) => {
    // Since JWTs are stateless, logout can be handled on the client side
    res.status(200).json({ message: "Logout successful" });
}

const updateUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
};

const getUsers = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        const users = await User.find();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
};

export { signup, login, logout, updateUser, getUsers };