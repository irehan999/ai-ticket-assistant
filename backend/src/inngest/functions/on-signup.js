import { inngestClient } from "../client.js";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import sendMail from "../../utils/mailer.js";

const onUserSignup = inngestClient.createFunction(
    { id: "on/user/signup", retries: 2 },
    { event: "user/signup" },
    async ({ event, step }) => {
        try {
            const { email } = event.data;

            const user = await step.run("get-user", async() => {
                const userObject = await User.findOne({ email });
                if (!userObject) {
                    throw new NonRetriableError("User not found");
                }
                return userObject;
            })

            await step.run("send-welcome-email", async() => {
                const subject = "Welcome to Our Platform!";
                const body = `Hello, ${user.name},

                                    Welcome to our platform! We're excited to have you on board.

                                    Best regards,
                                    The Team`;

                await sendMail(user.email, subject, body);
            });

            return { success: true };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }
);

export { onUserSignup };