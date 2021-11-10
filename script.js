var process = require('process');
const ioHook = require('iohook');

const Injector = require("./injector");
const Listener = require("./listener");

function app(callback) {
    const settings = {
        "leftSettings": {
            "minSpeed": 6,
            "minClicks": 3,
            "clickVariation": 0.1,
            "timeout": 200,
            "max": 19
        },
        "rightSettings": {
            "minSpeed": 6,
            "minClicks": 2,
            "clickVariation": 0.1,
            "timeout": 200,
            "max": 18
        },
    }


    //Create hook
    ioHook.on("mousedown", (event) => {
        leftListener.hookEvent(event);
        rightListener.hookEvent(event);
    })

    let ctrlPressed = false;
    let altPressed = false;

    function exitProgram() {
        process.exit();
    }

    ioHook.on("keydown", (event) => {
        switch (event.keycode) {
            case 41:
                if (ctrlPressed) exitProgram();
                break;
            case 29:
                ctrlPressed = true;
                break;
            case 56: 
                altPressed = true;
                break;
            case 12:
                if (ctrlPressed && altPressed) leftListener.decreaseMax(1);
                break;
            case 13:
                if (ctrlPressed && altPressed) leftListener.increaseMax(1);
                break;
            case 26:
                if (ctrlPressed && altPressed) rightListener.decreaseMax(1);
                break;
            case 27:
                if (ctrlPressed && altPressed) rightListener.increaseMax(1);
                break;

        }
    })

    ioHook.on("keyup", (event) => {
        switch (event.keycode) {
            case 29:
                ctrlPressed = false;
                break;
            case 56: 
                altPressed = false;
                break;
        }
    })

    //Create Injectors
    let leftInjector = new Injector(1, settings.leftSettings)
    let rightInjector = new Injector(2, settings.rightSettings)

    //Register listeners
    let leftListener = new Listener(1, leftInjector, settings.leftSettings, callback)
    let rightListener = new Listener(2, rightInjector, settings.rightSettings, callback)

    callback(1, settings.leftSettings.max);
    callback(2, settings.rightSettings.max);

    //Stark hook
    ioHook.start();
}

module.exports = app