const robot = require("robotjs");

class Injector {
    constructor(button, settings) {
        this.button = button;
        this.injectedClick = false;
        this.settings = settings
        this.clickChance = 1
    }

    setInjected(val) {
        this.injectedClick = val;
    }



    injected() {
        return this.injectedClick
    }

    addClick(cps) {
        //Click Chance
        if (Math.random() > this.clickChance) {
            return;
        }

        //Inject click in-between
        let waitTimeout = 500 / cps;

        //Vary click speed by randomized amount based on set variation
        let variation = waitTimeout * this.settings.clickVariation * Math.abs(Math.random() - 0.5)

        let finalTimeout = (waitTimeout - variation);

        // console.log("CPS:", cps, " | Timeout:", finalTimeout)

        setTimeout(this.performClick.bind(this), finalTimeout)
    }

    async performClick() {
        let buttonSide = this.button === 1 ? "left" : "right";
        // let buttonSide = this.button === 1 ? mouse.leftClick : mouse.rightClick;
        this.setInjected(true)

        robot.mouseClick(buttonSide);
        robot.setMouseDelay(0)
    }


}

module.exports = Injector;