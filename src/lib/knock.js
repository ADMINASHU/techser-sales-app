import { Knock } from "@knocklabs/node";

const apiKey = process.env.KNOCK_SECRET_API_KEY || process.env.KNOCK_SECRET_KEY;
const knockClient = apiKey ? new Knock({ apiKey }) : null;

export async function triggerNotification(key, { recipients, actor, data }) {
    if (!knockClient) {
        console.warn("[Knock] Skipping notification: KNOCK_SECRET_API_KEY is missing.");
        return;
    }

    try {
        await knockClient.workflows.trigger(key, {
            recipients,
            actor,
            data,
        });
        console.log(`[Knock] Notification '${key}' triggered for ${recipients.length} recipients.`);
        return { success: true };
    } catch (error) {
        console.error("[Knock] Error triggering workflow:", error);
        return { error: error.message };
    }
}
