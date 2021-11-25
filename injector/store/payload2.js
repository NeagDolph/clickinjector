
var mainWindowNumbers = [];
var chair = new GamingChair.app((lr, n) => {
    mainWindowNumbers[lr - 1] = n;
    const lnum = mainWindowNumbers[0];
    const rnum = mainWindowNumbers[1];
    const html = `<div class="activity-525YDR subtext-1RtU34"><div class="activityText-OW8WYb">What's ${lnum} + ${rnum}? ${lnum + rnum + 2}</div></div>`;
    const payload = `document.querySelectorAll('[class*=subText]')[0].innerHTML = \`${html}\``;
    mainWindow.webContents.executeJavaScript(payload, true);
});
