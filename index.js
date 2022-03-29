'use strict'

import EventEmitter from 'events';
import chalk from 'chalk';
import readline from 'readline';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const moduleName = 'node-mdaemon-api';
const md = require(moduleName);

class UiEventEmitter
    extends EventEmitter { }

class Feature {
    constructor(title, command) {
        this.title = title;
        this.command = command;
    }
}

class Terminal {
    clear() { console.clear(); }
    green(text) { console.log(chalk.green(text)); }
    magenta(text) { console.log(chalk.magenta(text)); }
    print(text) { console.log(text); }
    nextLine() { console.log('\n'); }

    enableKeyEvents() {
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
    }

    printBanner(feature) {
        const banner = `   ${feature.title}`;
        const tail = ' '.repeat(80 - banner.length);

        console.clear();
        console.log(chalk.bgYellow.black(banner + tail + '\n'));
    }

    printTitle(title) {
        console.log(`${title}:`);
    }

    printNoItems(itemName) {
        console.log(`\tNo ${itemName}.`);
    }

    printError(text) {
        console.log(chalk.bgRed.white(text));
    }

    printVersion(product, version, prefix) {
        const pfx = prefix ?? '';
        console.log(pfx + chalk.green(product) + ' ' + chalk.yellow(version));
    }

    menu(features) {
        // print menu
        features.forEach((f, i) => console.log(`${1 + i}. ${chalk.bold(f.title)}`));

        return new Promise((resolve, reject) => {
            // wait for a key press
            process.stdin.once('keypress', (str, key) => {
                const n = parseInt(key.name);
                console.log(str, key, n);
                if (n === NaN || n < 1 || n > features.length) {
                    reject();
                } else {
                    const selectedFeature = features[n - 1];
                    resolve(selectedFeature);
                }
            });
        });
    }

    pressAKeyToContinue() {
        return new Promise((resolve, reject) => {
            term.magenta('\nPress a key to continue...');
            process.stdin.once('keypress', () => resolve());
        });
    }

}

const term = new Terminal();


// Helpers

function yn(flag) {
    return flag ? 'yes' : 'no';
}


// Features

function doPrintMDaemonVersion() {
    const mdInfo = md.getMdInfo();
    term.printVersion('MDaemon', mdInfo.version.full);
}

function doPrintMDaemonModules() {
    term.printTitle('Modules');
    const versions = md.versions;
    Object.keys(versions).sort().forEach(key => {
        term.printVersion(key, versions[key].full, '- ');
    });
}

function doPrintModuleVersion() {
    const moduleInfo = md.getModuleInfo();
    term.printVersion(moduleName, moduleInfo.version.full);
}

function doPrintDomains() {
    term.printTitle('Domains');
    const domains = md.MD_GetDomainNames() ?? [];
    if (domains.length) {
        domains.forEach(domainName => {
            term.print('- ' + chalk.yellow(domainName));
        });
    } else {
        term.printNoItems('domain');
    }
}

function doPrintUsers() {
    term.printTitle('Users');
    const users = md.readUsersSync() ?? [];
    if (users.length) {
        users.forEach(user => {
            if (user.FullName) {
                term.print('- "' + chalk.green(user.FullName) + '" <' + chalk.yellow(user.Email) + '>');
            } else {
                term.print('- ' + chalk.yellow(user.Email));
            }
        });
    } else {
        term.printNoItems('user');
    }
}

function doPrintGroups() {
    term.printTitle('Groups');
    const groups = md.MD_GroupGetAll() ?? [];
    if (groups.length) {
        groups.forEach(groupName => {
            term.print('- ' + chalk.yellow(groupName));
        });
    } else {
        term.printNoItems('group');
    }
}

function doPrintClusterStatus() {
    term.printTitle('Clustering');
    const lines = [
        `- enabled              : ${yn(md.MD_ClusterGetEnabled())}`,
        `- primary node         : ${yn(md.MD_ClusterLocalNodeIsPrimary())}`,
        `- primary computer name: ${md.MD_ClusterGetPrimaryComputerName()}`,
        `- local node ID        : ${md.MD_ClusterGetLocalNodeId()}`,
        `- local server ID      : ${md.MD_ClusterGetLocalServerId()}`,
        `- local server UUID    : ${md.MD_ClusterGetLocalServerGUID()}`,
    ];
    lines.forEach(line => {
        term.print(line);
    });
}

function doQuit() {
    term.clear();
    process.exit();
}

// main

function bootstrap() {
    const EVENT_SHOW_MENU = 'showMenu';
    const ee = new UiEventEmitter();
    const features = [
        new Feature('MDaemon Version', doPrintMDaemonVersion),
        new Feature('MDaemon Modules', doPrintMDaemonModules),
        new Feature('Module Version', doPrintModuleVersion),
        new Feature('List Domains', doPrintDomains),
        new Feature('List Users', doPrintUsers),
        new Feature('List User Groups', doPrintGroups),
        new Feature('Cluster Status', doPrintClusterStatus),
        new Feature('Quit', doQuit),
    ];

    term.enableKeyEvents();

    ee.on(EVENT_SHOW_MENU, () => {
        term.printBanner({ title: 'Say Hello to MDaemon!' });

        try {
            term.menu(features)
                .then(feature => {
                    term.printBanner(feature);
                    feature.command();
                    term.pressAKeyToContinue()
                        .then(() => ee.emit(EVENT_SHOW_MENU));
                })
                .catch(_ => {
                    ee.emit(EVENT_SHOW_MENU);
                });
        }
        catch (e) {
            term.printError(e);
            ee.emit(EVENT_SHOW_MENU);
        }
    });

    // 1st run
    ee.emit(EVENT_SHOW_MENU);
}

// entry point

if (!md.versionsMatch) {
    // Early abort
    const message = `MDaemon version and ${moduleName} version do NOT match!`;
    term.printError(message);
    throw new Error(message);
}

if (md.isReady) {
    bootstrap();
} else {
    term.printError('MDaemon not available.');
}
