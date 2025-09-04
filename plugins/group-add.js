const { cmd } = require('../command');

cmd({
    pattern: "add",
    alias: ["a", "invite"],
    desc: "Adds a member to the group",
    category: "admin",
    react: "➕",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, isCreator, reply, quoted
}) => {
    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isCreator) return reply("❌ Only the bot owner can use this command.");
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0];
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, '');
    } else if (q && /^\d+$/.test(q)) {
        number = q;
    } else {
        return reply("❌ Please reply to a message, mention a user, or provide a number to add.");
    }

    const jid = number + "@s.whatsapp.net";

    try {
        await conn.groupParticipantsUpdate(from, [jid], "add");
        await conn.sendMessage(from, {
            text: `✅ Successfully added @${number}`,
            mentions: [jid]
        }, { quoted: mek });
    } catch (error) {
        console.error("Add command error:", error);
        reply("❌ Failed to add the member.");
    }
});
