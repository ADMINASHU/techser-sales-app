import { Knock } from "@knocklabs/node";

const knockClient = new Knock(process.env.KNOCK_SECRET_KEY);

export async function triggerNotification(key, { recipients, actor, data }) {
    if (!process.env.KNOCK_SECRET_KEY) {
        console.warn("[Knock] Skipping notification: KNOCK_SECRET_KEY is missing.");
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
