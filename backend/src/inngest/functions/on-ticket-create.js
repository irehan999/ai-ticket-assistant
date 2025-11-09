import { inngestClient } from "../client.js";
import Ticket from "../../models/ticket.model.js";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import sendMail from "../../utils/mailer.js";
import  analyzeTicket from "../../utils/ai-agent.js";

const onTicketCreated = inngestClient.createFunction(
    { id: "on/ticket/created", retries: 2 },
    { event: "ticket/created" },
    async ({ event, step }) => {
        try {
            const { ticketId } = event.data;

            const ticket = await step.run("get-ticket", async() => {
                const ticketObject = await Ticket.findById(ticketId);
                if (!ticketObject) {
                    throw new NonRetriableError("Ticket not found");
                }
                return ticketObject;
            })
            
            const aiResponse = await analyzeTicket(ticket);

            const relatedSkills = await step.run("ai-process-skills", async() => {
                let skills = [];
                if(aiResponse) {
                    await Ticket.findByIdAndUpdate(ticketId, {
                        priority: !["low", "medium", "high"].includes(aiResponse.priority) ? "medium" : aiResponse.priority,
                        helpfulNotes: aiResponse.helpfulNotes,
                        status: "IN_PROGRESS",
                        relatedSkills: aiResponse.relatedSkills,
                    }, { new: true });
                    skills = aiResponse.relatedSkills || [];
                }
                return skills;
            });
            
            const moderator = await step.run("assign-moderator", async() => {
                let user = await User.findOne({ 
                    role: "moderator",
                    skills: { $in: relatedSkills } 
                });
                if (!user) {
                    user = await User.findOne({ role: "admin" });
                }
                await Ticket.findByIdAndUpdate(ticket._id, {
                    assignedTo: user._id,
                });
                return user;
            });

            await step.run("notify-moderator", async() => {
                const subject = `New Ticket Assigned: ${ticket.title}`;
                const body = `Hello ${moderator.email},\n\nYou have been assigned a new ticket: ${ticket.title}.\n\nBest,\nThe Team`;
                await sendMail(moderator.email, subject, body);
            });

            return { success: true, aiResponse, relatedSkills, moderator };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
)

export {onTicketCreated};