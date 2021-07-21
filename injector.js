const ioHook = require('iohook');
const robot = require("robotjs");

class Injector {
    constructor(button, settings) {
        this.button = button;
        this.injectedClick = false;
        this.settings = settings
    }

    setInjected(val) {
        this.injectedClick = !!val;
    }

    injected() {
        return this.injectedClick
    }

    addClick(cps) {
        //Click Chance
        if (Math.random() > this.settings.clickChance) {
            return;
        }

        //Inject click in-between
        let timeout = 500 / cps

        //Vary click speed by randomized amount based on set variation
        let variation = timeout * this.settings.clickVariation * (Math.random() - 0.5)
        let finalTimeout = variation + timeout;

        // console.log("CPS:", cps, " | Timeout:", finalTimeout)

        setTimeout(this.performClick.bind(this), finalTimeout)
    }

    performClick() {
        let buttonSide = this.button === 1 ? "left" : "right";

        this.setInjected(true);

        robot.mouseClick(buttonSide);
    }


}

module.exports = Injector;