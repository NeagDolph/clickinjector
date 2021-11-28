var process = require('process');
const ioHook = require('iohook');

const Injector = require("./injector");
const Listener = require("./listener");

var settings = {
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

class GamingChair {
    constructor(callback) {
        //Create injectors
        this.leftInjector = new Injector(1, settings.leftSettings)
        this.rightInjector = new Injector(2, settings.rightSettings)

        //Register listeners
        this.leftListener = new Listener(1, this.leftInjector, settings.leftSettings, callback)
        this.rightListener = new Listener(2, this.rightInjector, settings.rightSettings, callback)

        this.ctrlPressed = false;
        this.altPressed = false;


        ioHook.on("mousedown", (event) => {
            this.leftListener.hookEvent(event);
            this.rightListener.hookEvent(event);
        })

        ioHook.on("keyup", this.keyup)

        ioHook.on("keydown", this.keydown)
        

        //Stark hook
        ioHook.start();

        if (callback) callback(1, settings.leftSettings.max);
        if (callback) callback(2, settings.leftSettings.max);
    }

    keyup = (event) => {
        switch (event.keycode) {
            case 29:
                this.ctrlPressed = false
                break;
            case 56:
                this.altPressed = false;
                break;
        }
    }

    keydown = (event) => {
        switch (event.keycode) {
            case 41:
                if (this.ctrlPressed) this.exitProgram();
                break;
            case 29:
                this.ctrlPressed = true;
                break;
            case 56:
                this.altPressed = true;
                break;
            case 12:
                if (this.ctrlPressed && this.altPressed) this.leftListener.decreaseMax(1);
                break;
            case 13:
                if (this.ctrlPressed && this.altPressed) this.leftListener.increaseMax(1);
                break;
            case 26:
                if (this.ctrlPressed && this.altPressed) this.rightListener.decreaseMax(1);
                break;
            case 27:
                if (this.ctrlPressed && this.altPressed) this.rightListener.increaseMax(1);
                break;

        }
    }

    exitProgram() {
        process.exit();
    }
}

module.exports = GamingChair