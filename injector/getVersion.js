const path = require('path')
const fs = require('fs');
const os = require('os')
const { execFile } = require('child_process');
const { findDir, editFile, getFileData } = require("./fileHelpers")

function executeDiscordVersion(discordExe, watchFile) {
    return new Promise((res, rej) => {
        const executing = execFile(discordExe, function (err, data) {
            // console.log(err);
            // console.log(data.toString());
            return err
        });

        fs.watchFile(watchFile, (curr, prev) => {
            executing.kill();
            // executing.disconnect();
            getFileData(watchFile).then(data => {
                res(JSON.parse(data))
            })
        });
    })
}

async function findDiscordVersion(asarDest) {
    const mainScreenPath = path.join(asarDest, "app", "mainScreen.js");

    const watchFile = path.resolve("./store/watch.json")

    const payload = await getFileData("./store/payloadVersion.js");
    const editedPayload = payload.replace("FILENAMEHERE", watchFile).replace(/\\/g, "\\\\");

    const mainScreenContent = await getFileData(mainScreenPath)

    if (!mainScreenContent.includes("VERSIONCHECK")) {
        await editFile(mainScreenPath, (text) => {
            return text.replace(`did-finish-load', () => {`, `did-finish-load', () => {\n//VERSIONCHECK\n${editedPayload}\n//VERSIONCHECK\n`);
        });
    }

    console.log("Version check successfully injected! Running discord to find version");

    const discordDir = path.join(os.homedir(), "AppData\\Local\\Discord");
    const discordExe = findDir(discordDir, "Discord.exe");

    return await executeDiscordVersion(discordExe, watchFile)

}

module.exports = {findDiscordVersion}