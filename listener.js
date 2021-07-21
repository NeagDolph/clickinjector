class Listener {
    constructor(button, injector, settings) {
        this.settings = settings;
        this.button = button;
        this.injector = injector

        this.clickStart = new Date();
        this.lastClick = new Date();
        this.clicks = 0;
    }

    hookEvent(event) {
        if (event.button === this.button) {
            this.listenClick()
        }
    }

    get cps() {
        let currentDate = new Date();

        let sinceStart = (currentDate - this.clickStart) / 1000

        return this.clicks / (sinceStart)
    }

    listenClick() {
        //Kill injected click events
        if (this.injector.injected()) {
            this.injector.setInjected(false);
            return;
        }

        this.clicks++
        let current = new Date();

        //Reset on break
        if (current - this.lastClick >= this.settings.timeout) {
            this.clicks = 0;
            this.clickStart = current;
            this.lastClick = new Date();
            return;
        }

        //Calc CPS
        let cps = this.cps

        //Inject clicks
        if (cps > this.settings.minSpeed && this.clicks >= 3) {
            this.injector.addClick(cps);
        }

        this.lastClick = new Date();
    }
}

module.exports = Listener;