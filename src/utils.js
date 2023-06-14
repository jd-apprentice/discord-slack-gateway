function Logger(message) {
    console.log(`[${new Date().toLocaleString()}] ${message}`);
}

module.exports = {
    Logger
};