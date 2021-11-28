const asar = require('asar');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec, execFile } = require('child_process');
const {findDir, replaceFile, editFile, getFileData} = require("./fileHelpers");
const {installDeps, rebuildModules, copyPrebuiltModules, buildGamingChair} = require("./moduleHelpers");
const {closeDiscord} = require("./helpers");
const {findDiscordVerion} = require("./getVersion");

function deleteOldFolder(asarDest) {
    return new Promise((res, rej) => {
        if (asarDest.includes("tempcore") && fs.existsSync(asarDest)) {
            console.log("Deleting old tempcore...")
            fs.rmdir(asarDest, { recursive: true }, (err) => {
                if (err) {
                    console.log(err);
                    rej(err)
                }

                res()
            })
        } else res();
    })
}

async function amendIndex(containingFolder) {
    const indexPath = path.join(containingFolder, "index.js")

    await editFile(indexPath, (text) => {
        const destLoc = path.join("tempcore", "app", "index.js").replace(/\\/g, "\\\\")

        const newText = text.replace(/require\(\'.+\'\)/, `require('.\\\\${destLoc}')`)

        return newText
    })
}

async function injectDiscord(asarDest) {
    const mainScreenPath = path.join(asarDest, "app", "mainScreen.js");
    const indexPath = path.join(asarDest, "app", "gamingchairjs", "index.js").replace(/\\/g, "\\\\");


    const payload1 = `
    var GamingChair = require("${indexPath}");
    `

    const payload2 = await getFileData("./store/payloadGCJS.js")

    await editFile(mainScreenPath, (text) => {
        let newText
        // newText = text.replace(`var _electron = require("electron");`, `var _electron = require("electron");${payload1}`);
        newText = text.replace(`did-finish-load', () => {`, `did-finish-load', () => {${payload1}\n${payload2}`);

        return newText
    })

    console.log("gamingchairjs successfully injected!")
}



async function findSource() {
    console.log("Closing Discord")
    await closeDiscord();

    const startpath = path.join(os.homedir(), "AppData\\Local\\Discord");

    const findDiscord = findDir(startpath, "discord_desktop_core\\core\.asar");

    console.log("Found Asar: ", findDiscord);

    const containingFolder = path.join(findDiscord, "..");
    const asarDest = path.join(containingFolder, "tempcore");

    await deleteOldFolder(asarDest);

    console.log("Unpacking Asar...")
    await asar.extractAll(findDiscord, asarDest);
    await amendIndex(containingFolder);

    console.log("Finding discord version...")
    const {abi, platform, arch} = await findDiscordVerion(asarDest);

    console.log("Updating package.json...");
    await replaceFile("./store/package.json", path.join(asarDest, "package.json"));


    console.log("Installing dependencies...");
    const install = await installDeps(asarDest);
    if (install) console.log("Dependencies installed successfully!");

    console.log("Rebuilding modules...")
    await rebuildModules(asarDest);

    console.log("Copying prebuilt modules...")
    await copyPrebuiltModules(asarDest);

    console.log("Building gamingchairjs...");
    await buildGamingChair(asarDest);

    console.log("Injecting gamingchairjs...");
    await injectDiscord(asarDest);

    console.log("\n\n## ################################# ##\n## Injection successfully completed! ##\n## ################################# ##");

}

findSource().catch(e => console.log(e));