const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const inquirer = require('inquirer');

const createColorizedLogger = require('../Functions/logger');
const logger = createColorizedLogger();

const executeCommand = async (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
};

const getMACAddress = () => {
    const networkInterfaces = os.networkInterfaces();
    for (let iface of Object.keys(networkInterfaces)) {
        for (let ifaceInfo of networkInterfaces[iface]) {
            if (!ifaceInfo.internal && ifaceInfo.mac !== '00:00:00:00:00:00') {
                return { mac: ifaceInfo.mac, iface: iface };
            }
        }
    }
    return null;
};

const generateValidMACAddress = () => {
    const macStartOptions = ['2', '6', 'A', 'E'];
    let mac = macStartOptions[Math.floor(Math.random() * macStartOptions.length)];

    for (let i = 1; i < 6; i++) {
        mac += ':' + (Math.floor(Math.random() * 256).toString(16)).padStart(2, '0').toUpperCase();
    }

    return mac;
};

const changeMACAddress = async (iface, newMac) => {
    await executeCommand(`netsh interface set interface "${iface}" admin=disable`);
    await executeCommand(`reg add HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e972-e325-11ce-bfc1-08002be10318}\\0001 /v NetworkAddress /t REG_SZ /d ${newMac.replace(/:/g, '')} /f`);
    await executeCommand(`netsh interface set interface "${iface}" admin=enable`);
};

const run = async () => {
    try {
        let details = {};

        details.motherboardSerial = await executeCommand('wmic baseboard get serialnumber');
        details.motherboardSerial = details.motherboardSerial.split('\n')[1];

        details.cpuSerial = await executeCommand('wmic cpu get processorid');
        details.cpuSerial = details.cpuSerial.split('\n')[1];

        details.hddSerial = await executeCommand('wmic diskdrive get serialnumber');
        details.hddSerial = details.hddSerial.split('\n')[1];

        details.ramSerial = await executeCommand('wmic memorychip get SerialNumber');
        details.ramSerial = details.ramSerial.split('\n')[1];

        details.gpuSerial = await executeCommand('wmic path win32_videocontroller get PNPDeviceID');
        details.gpuSerial = details.gpuSerial.split('\n')[1];

        const macInfo = getMACAddress();
        if (macInfo) {
            details.currentMac = macInfo.mac;
            logger.http(`Current MAC Address: ${macInfo.mac}`);
        }

        logger.info('Current HWIDs:');
        for (let key in details) {
            logger.warn(`${key}: ${details[key]}`);
        }

        const answer = await inquirer.prompt({
            type: 'confirm',
            name: 'changeHWID',
            message: 'Would you like to spoof your HWID/MAC Address?',
        });

        if (answer.changeHWID) {
            const oldDetails = { ...details };

            for (let key in details) {
                details[key] = uuidv4();
            }

            if (macInfo) {
                const newMac = generateValidMACAddress();
                await changeMACAddress(macInfo.iface, newMac);
                details.newMac = newMac;
            }

            const dirPath = path.join(os.homedir(), 'AppData', 'Local', 'DigitalEntitlements');
            if (fs.existsSync(dirPath)) {
                fs.rmdirSync(dirPath, { recursive: true });
                logger.info('Deleted DigitalEntitlements directory.');
            } else {
                logger.warn('DigitalEntitlements directory not found.');
            }

            console.log("\nOld HWIDs:", oldDetails);
            console.log("New HWIDs:", details);
        }
    } catch (error) {
        console.error("Failed to fetch hardware details:", error);
    }
};

module.exports.run = run;
