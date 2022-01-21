'use strict'

import chalk from 'chalk';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const moduleName = 'node-mdaemon-api';
const md = require(moduleName);

if (!md.versionsMatch) {
    // Early abort
    throw new Error(`MDaemon version and ${moduleName} version do NOT match!`);
}

function demoVersion() {
    const mdInfo = md.getMdInfo();
    console.log(chalk.green(`Hello, MDaemon ${chalk.yellow(mdInfo.version.full)}!`));
}

function demoDomains() {
    const domains = md.MD_GetDomainNames() ?? [];
    console.log('Domains:');
    domains.forEach(domainName => {
        console.log(`- ${chalk.yellow(domainName)}`);
    });
}

function demoUsers() {
    const users = md.readUsersSync() ?? [];
    console.log('Users:');
    users.forEach(user => {
        if (user.FullName) {
            console.log(`- "${chalk.green(user.FullName)}" <${chalk.yellow(user.Email)}>`);
        } else {
            console.log(`- ${chalk.yellow(user.Email)}`);
        }
    });
}

const demos = [
    demoVersion,
    demoDomains,
    demoUsers,
];

if (md.isReady) {
    demos.forEach(demo => {
        demo();
        console.log();
    });
} else {
    console.error(`MDaemon ${chalk.red('not')} available.`);
}
