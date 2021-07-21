const ioHook = require('iohook');
const robot = require("robotjs");
const Injector = require("./injector");
const Listener = require("./listener");


ioHook.on("keydown", (event) => {
    if (event.keycode === 41) {
        console.log("Exited Program")
        process.exit()
    }
})


let leftSettings = {
    minSpeed: 6,
    minClicks: 3,
    clickVariation: 0.1,
    timeout: 500,
    clickChance: 1
};

let rightSettings = {
    minSpeed: 6,
    minClicks: 2,
    clickVariation: 0.1,
    timeout: 500,
    clickChance: 1
};

//Create Injectors
let leftInjector = new Injector(1, leftSettings)
let rightInjector = new Injector(2, rightSettings)

//Register listeners
let leftListener = new Listener(1, leftInjector, leftSettings)
let rightListener = new Listener(2, rightInjector, rightSettings)

//Create hook
ioHook.on("mousedown", (event) => {
    leftListener.hookEvent(event);
    rightListener.hookEvent(event);
})

//Stark hook
ioHook.start();