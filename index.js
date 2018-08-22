const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const xml2js = require('xml2js')
const [,,inputFilename = 'input.xml', timeout = 1000] = process.argv

const t = ms => (new Promise(r => setTimeout(r, ms)))

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
}

const parseInput = filename => new Promise((resolve, reject) => {
    const fileToString = fs.readFileSync(path.resolve(__dirname, filename), {encoding: "latin1"})
    xml2js.parseString(fileToString, (err, result) =>{
        if (err) {
            console.log(err)
            reject(err)
            return
        }
        const players = result.LocalPlayers.Player.map(({$}) => $)
        return resolve(players)
    })
})

const navigateAndGetValue = async (page, dciNumber) => {
    console.log(`Fetching points for DCI#${dciNumber}`)
    await page.goto(`http://www.wizards.com/Magic/PlaneswalkerPoints/${dciNumber}`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => ShowPointHistoryModal('Yearly'))
    await t(timeout)
    const points = await page.evaluate(() => document.querySelector('#YearlyValue > div:nth-child(5) > div.PointsValue').innerText)
    return points
}

const iterate = async (page, player, stream) => {
    const dur = Date.now()
    const points = await navigateAndGetValue(page, player.DciNumber)
    if (parseInt(points) < 100) {
        console.log(`${player.FirstName} ${player.LastName} scored under 100 points, not logging. \n`)
        return
    }
    const line = `${player.FirstName}, ${player.LastName}, ${player.DciNumber}, ${points} \n`
    stream.write(line)
    console.log(`Fetched ${points} points for ${player.FirstName} ${player.LastName} in ${Date.now() - dur}ms \n`)
    return
}

const output = fs.createWriteStream('output.csv', {flags: 'a'});

(async () => {
    const players = await parseInput(inputFilename)
    console.log(`Checking ${players.length} players' points..`)
    const now = new Date()
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (['image', 'font', 'stylesheet'].includes(request.resourceType())){
            request.abort();
        } else {
            request.continue();
        }
    });
    await asyncForEach(players, n => iterate(page, n, output))
    await browser.close()
    await output.close()
    console.log(`Done in ${Date.now() - now}ms`)
    return
})()
