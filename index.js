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

function yn(flag) {
    return flag ? 'yes' : 'no';
}

function printFunctionBanner(fn) {
    let banner = `   ${chalk.black(fn.name)}`;
    const tail = ' '.repeat(80 - banner.length);
    console.log(chalk.bgYellow(banner + tail));
}

function printVersion() {
    const mdInfo = md.getMdInfo();
    console.log(chalk.green(`Hello, MDaemon ${chalk.yellow(mdInfo.version.full)}!`));
}

function printDomains() {
    const domains = md.MD_GetDomainNames() ?? [];
    console.log('Domains:');
    domains.forEach(domainName => {
        console.log(`- ${chalk.yellow(domainName)}`);
    });
}

function printUsers() {
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

function printClusterStatus() {
    console.log('Clustering:');
    console.log(`- enabled              : ${yn(md.MD_ClusterGetEnabled())}`);
    console.log(`- primary node         : ${yn(md.MD_ClusterLocalNodeIsPrimary())}`);
	console.log(`- primary computer name: ${md.MD_ClusterGetPrimaryComputerName()}`);
	console.log(`- local node ID        : ${md.MD_ClusterGetLocalNodeId()}`);
	console.log(`- local server ID      : ${md.MD_ClusterGetLocalServerId()}`);
    console.log(`- local server UUID    : ${md.MD_ClusterGetLocalServerGUID()}`);
}

const demos = [
    printVersion,
    printDomains,
    printUsers,
    printClusterStatus,
];

if (md.isReady) {
    demos.forEach(demo => {
        printFunctionBanner(demo);
        demo();
        console.log();
    });
    printFunctionBanner({ name: 'Done'});
} else {
    console.error(`MDaemon ${chalk.red('not')} available.`);
}
