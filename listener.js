class Listener {
    constructor(button, injector, settings, callback) {
        this.settings = settings;
        this.button = button;
        this.injector = injector
        this.max = settings.max
        this.callback = callback

        this.clickStart = new Date();
        this.lastClick = new Date();
        this.clicks = 0;
        this.totalclicks = 0;
    }

    increaseMax(amount) {
        this.max += amount;
        this.callback(this.button, this.max)
        console.log(this.button, this.max)
    }

    decreaseMax(amount) {
        this.max -= amount;
        this.callback(this.button, this.max)
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

    get totalcps() {
        let currentDate = new Date();

        let sinceStart = (currentDate - this.clickStart) / 1000

        return this.totalclicks / (sinceStart)
    }

    listenClick() {
        this.totalclicks++;
        
        let totalcps = this.totalcps

        if (totalcps > this.max) return;

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
            this.totalclicks = 0;
            this.clickStart = current;
            this.lastClick = new Date();
            return;
        }

        //Calc CPS
        let cps = this.cps

        //Inject clicks
        if (cps > this.settings.minSpeed && this.clicks >= 3) {
            if (totalcps > this.max) return;
            this.injector.addClick(cps);
        }

        this.lastClick = new Date();
    }
}

module.exports = Listener;