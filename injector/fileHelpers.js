const asar = require('asar');
const path = require('path')
const fs = require('fs');
const os = require('os')
const { exec } = require('child_process');

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

module.exports = {findDir, replaceFile, editFile, getFileData}