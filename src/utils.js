function Logger(message) {
    console.log(`[${new Date().toLocaleString()}] ${message}`);
}

function IsBot(payload) {
    if (payload?.d?.author?.bot) return true;
    if (payload?.subtype === "bot_message") return true;
}

module.exports = {
    Logger,
    IsBot
};