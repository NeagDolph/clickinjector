const psList = require('ps-list');
const ps = require("process")
const {exec} = require('child_process')


// psList().then(list => {
    // const discord = list.find(e => e.name.toLowerCase().includes("discord"))

    // if (discord) {
    //     console.log("Discord process found!")

    //     ps.kill(discord.pid, function (err) {
    //         if (err) {
    //             throw new Error(err);
    //         }
    //         else {
    //             console.log('Discord process has been killed!');
    //         }
    //     });
    // }

    exec(`taskkill /im Discord.exe /t /F`, (err, stdout, stderr) => {
        if (err) {
          throw err
        }
    
        console.log('stdout', stdout)
        console.log('stderr', err)
      })
    // })
// })