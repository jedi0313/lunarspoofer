var Spinner = require('cli-spinner').Spinner;

async function main() {
    var spinner = new Spinner('Loading Lunar Spoofer... %s');
    spinner.start();

    setTimeout(() => {
        spinner.stop(true);
        const lunarSpooferArt = `
        ╔╗───────────╔══╗─────╔═╗
        ║║╔╦╦═╦╦═╗╔╦╗║══╬═╦═╦═╣═╬═╦╦╗
        ║╚╣║║║║║╬╚╣╔╝╠══║╬║╬║╬║╔╣╩╣╔╝
        ╚═╩═╩╩═╩══╩╝─╚══╣╔╩═╩═╩╝╚═╩╝
        ────────────────╚╝                                                                       
        `
       console.log(lunarSpooferArt); 
       const lunarSpoofer = require('./src/index');
       lunarSpoofer();
    }, 5000)
}

main();