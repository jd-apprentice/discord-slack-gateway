const fs = require("fs");

function Logger(message) {
    console.log(`[${new Date().toLocaleString()}] ${message}`);
}

function IsBot(payload) {
    if (payload?.d?.author?.bot) return true;
    if (payload?.subtype === "bot_message") return true;
}

function BumpVersion() {
    fs.readFile('package.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading package json:', err);
            return;
        }

        try {
            const packageJson = JSON.parse(data);

            const versionParts = packageJson.version.split('.');
            versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
            const newVersion = versionParts.join('.');

            packageJson.version = newVersion;

            fs.writeFile('package.json', JSON.stringify(packageJson, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file package.json:', err);
                    return;
                }
                console.log(`Versión actualizada a ${newVersion}`);
            });
        } catch (err) {
            console.error('Error to analize package.json:', err);
        }
    });
}

// Read arguments
if (process.argv[2] === 'BumpVersion') {
    BumpVersion();
}

module.exports = {
    Logger,
    IsBot,
    BumpVersion
};
