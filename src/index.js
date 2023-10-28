const inquirer = require('inquirer');
const spoofer = require('../Spoofer/spoofer');


const mainQuestion = {
  type: 'list',
  name: 'mainMode',
  message: 'Which mode would you like to use?',
  choices: ['Spoofer'],
};

const spooferQuestions = {
    type: 'list',
    name: 'spoofer',
    message: 'Which tool would you like to use?',
    choices: ['HWID Spoofer', 'Back'],
  };

async function mainMenu() {
  const answers = await inquirer.prompt(mainQuestion);

switch (answers.mainMode) {
  case 'Spoofer':
    const spooferAnswers = await inquirer.prompt(spooferQuestions);

    switch (spooferAnswers.spoofer) {
      case 'HWID Spoofer':
        await spoofer.run();
        break;

      case 'Back':
        await mainMenu();
        break;

      default:
        console.error('Invalid choice');
        break;
    }
    await mainMenu();
    break;       
  }
}

  const lunarSpoofer = async () => {
    mainMenu();
  }

module.exports = lunarSpoofer;