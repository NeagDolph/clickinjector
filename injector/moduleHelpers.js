const asar = require('asar');
const path = require('path')
const fs = require('fs');
const os = require('os')
const { exec } = require('child_process');

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


module.exports = {installDeps, rebuildModules, copyPrebuiltModules, buildGamingChair}