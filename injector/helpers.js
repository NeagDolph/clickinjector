const { exec, execFile } = require('child_process');

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

module.exports = {closeDiscord}