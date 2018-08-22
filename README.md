## PWP checker

Crawls the DCI page for planeswalker points for the last season as Wizards has refused to provide a decent API for this.


### Installation:

- Make sure you have [NodeJS 10+](https://nodejs.org/en/) and [Git](https://git-scm.com/) installed
- Check out this repository: `git clone https://github.com/vlasn/pwp-check.git`
- Install dependencies (puppeteer and xml2js) via `npm install`
- Run the script: `node .`
- In case you're too lazy to rename your input file, you can specify its name as the first argument: `node . iamlazy.xml`. Defaults to `input.xml`
- Should you want to go faster, you can also define the amount of time the script should wait (ms) after opening the points' modal as the second argument: `node . input.xml 500`. This defaults to 1000ms or 1 second. Might not be a good idea, based on how fast your computer is.

The script expects your input file format to be XML, as per the following model:
```xml
<LocalPlayers>
    <Player FirstName="Veljo" LastName="Lasn" MiddleInitial="" DciNumber="9115259053" CountryCode="EE" IsJudge="False" />
</LocalPlayers>
```