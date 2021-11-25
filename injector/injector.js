const asar = require('asar');
const path = require('path')
const fs = require('fs');
const os = require('os')
const { exec } = require('child_process');


function findDir(startPath, filter) {
    let tot = []

    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }


    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);

        if (filename.indexOf(filter) >= 0) {
            return filename

        } else if (stat.isDirectory()) {
            tot.push({ fromDir: findDir, filename, filter }); //add folder to recurse list
        }
    };

    for (var i = 0; i < tot.length; i++) { //Recurse over all folders
        if (typeof tot[i] === "object") {

            const find = tot[i].fromDir(tot[i].filename, tot[i].filter,) || "";
            if (find.indexOf(tot[i].filter) >= 0) return find
        }
    }
};

function closeDiscord() {
    return new Promise((res, rej) => {
        exec(`taskkill /im Discord.exe /t /F`, (err, stdout, stderr) => {
            if (err) {
                console.log("Discord.exe not found")
                res(err);
                return;
            }

            console.log("Sucessfully closed Discord.exe")
            res(stdout)
        })
    })
}

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
        }
    })
}

function getFileData(path) {
    return new Promise((res, rej) => {
        fs.readFile(path, (err, buf) => {
            if (err) {
                rej(err)
            }

            res(buf.toString());
        })
    });
}

function editFile(filename, callback) {
    return new Promise((res, rej) => {
        fs.readFile(filename, (err, buf) => {
            const text = buf.toString();
            const editedText = callback(text);

            fs.writeFile(filename, editedText, (err) => {
                if (err) {
                    console.log(err);
                    rej(err)
                }
                console.log("Successfully Written to File.");
                res();
            });

        });
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

function replaceFile(from, to) {
    return new Promise((res, rej) => {
        fs.copyFile(from, to, (err) => {
            if (err) {
                throw err;
                rej();
            }
            // console.log(`${from} was copied to ${to}`);
            res()
        });
    })
}

function installDeps(asarDest) {
    return new Promise((res, rej) => {
        const cmd = `cd ${asarDest} && npm set msvs_version 2017 && npm install`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                rej(error);
                return;
            }
            // console.log(`stdout: ${stdout}`);
            // console.log(`stderr: ${stderr}`);
            res(stdout);
        });
    });
}

function rebuildModules(asarDest) {
    return new Promise((res, rej) => {
        const cmd = `cd ${asarDest} && npm rebuild --runtime=electron --target=13.4.0 --disturl=https://atom.io/download/atom-shell --abi=89 --arch=ia32`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error} ${stderr}`);
                rej(error);
                return;
            }

            console.log("Modules rebuilt successfully!")
            res(stdout);
        })
    });
}

async function copyPrebuiltModules(asarDest) {
    const nodeModulesDir = path.join(asarDest, "node_modules\\iohook")
    const destFile = findDir(nodeModulesDir, "Release\\iohook.node")

    const destDir = path.join(destFile, "..");

    const copyDir = path.resolve("./store/iohook")

    const copyFiles = fs.readdirSync(copyDir);

    for (let i = 0; i < copyFiles.length; i++) {
        const filePath = path.join(copyDir, copyFiles[i]);
        const destFile = path.join(destDir,  copyFiles[i])
        await replaceFile(filePath, destFile)
    }

    console.log("Prebuilt modules copied successfully!")

}

function buildGamingChair(asarDest) {
    return new Promise((res, rej) => {
        const outputPath = path.join(asarDest, "app", "gamingchairjs");
        if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true }); //make sure build folder exists

        //Build
        const cmd = "cd .. && npm run build"
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                rej(error);
                return;
            }
            console.log(`Sucessfully built gamingchairjs!`);
            // console.log(`stderr: ${stderr}`);
            const src = path.join(__dirname, "..", "build", "index.js");
            const dest = path.join(outputPath, "index.js");

            console.log(`Copying ${src} to ${dest}...`);
            fs.copyFile(src, dest, (error) => {
                if (error) {
                    console.error(`copy error: ${error}`);
                    rej(error);
                }

                
            console.log(`Sucessfully copied gamingchairjs!`);
            })
            res(stdout);
        })
    });
}

async function injectDiscord(asarDest) {
    const mainScreenPath = path.join(asarDest, "app", "mainScreen.js");
    const indexPath = path.join(asarDest, "app", "gamingchairjs", "index.js").replace(/\\/g, "\\\\");


    const payload1 = `
var GamingChair = require("${indexPath}");
    `

    const payload2 = await getFileData("./store/payload2.js")

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