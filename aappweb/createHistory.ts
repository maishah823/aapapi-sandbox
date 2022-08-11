import { version } from './src/environments/version';
const history = require('../AAPPAPI/version_history');

import { writeFileSync, readFileSync } from 'fs';

let updatedHistory = history || [];
let versionText = process.argv[2];

let major = version.major || 0;
let minor = version.minor || 0;
let build = version.build || 0;

if (versionText) {
    updatedHistory.unshift({ version: `${major}.${minor}.${build}`, description: versionText });

    writeFileSync('../AAPPAPI/version_history.js', `
module.exports = ${JSON.stringify(updatedHistory)};
`);

    console.log("Updated version: " + versionText || 'No description');
}
