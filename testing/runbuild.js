const GamingChair = require("../build/index")

console.log(GamingChair, GamingChair.default)

new GamingChair.app((a, b) => {console.log(a, b)});