import Ticket from "../models/ticket.model.js";
import { inngestClient } from "../inngest/client.js";

const createTicket = async (req, res) => {
    try {
        const { title , description } = req.body;
        const createdBy = req.user._id;

        const ticket = await Ticket.create({
            title,
            description,
            createdBy,
        });

        await inngestClient.send({
            name: "ticket/created",
            data: {
                ticketId: ticket._id.toString(),
                title: ticket.title,
                description: ticket.description,
                createdBy: ticket.createdBy.toString(),
            },
        });

        res.status(201).json({ message: "Ticket created successfully", ticket });
    } catch (error) {
        res.status(500).json({ message: "Error creating ticket", error });
    }
}


const getTickets = async (req, res) => {
    try {
        const user = req.user;
        let tickets = [];
        if (user.role !== "user") {
            tickets = await Ticket.find().populate("assignedTo", "email _id name").populate("createdBy", "email _id name");
        } else {
            tickets = await Ticket.find({ createdBy: user._id }).select("title description status createdAt assignedTo").populate("assignedTo", "email _id name");
        }
        res.status(200).json({ tickets });
    } catch (error) {
        res.status(500).json({ message: "Error fetching tickets", error });
    }
}


const getTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const user = req.user;
        let ticket
        if(user.role !== "user") {
              ticket = await Ticket.findById(ticketId).populate("assignedTo", "email _id name").populate("createdBy", "email _id name");
        } else {
            ticket = await Ticket.findOne({ _id: ticketId, createdBy: user._id }).populate("assignedTo", "email _id name");
        }
       
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        res.status(200).json({ ticket });
    } catch (error) {
        res.status(500).json({ message: "Error fetching ticket", error });
    }
};

export { createTicket, getTickets, getTicket };