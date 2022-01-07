"use strict";

const colors = require('colors');
const md = require('node-mdaemon-api');

if (!md.versionsMatch) {
    // Early abort
    throw new Error('MDaemon version and node-mdaemon-api version do NOT match!');
}

if (md.isReady) {
    const mdInfo = md.getMdInfo();
    console.log(colors.green(`Hello, MDaemon ${colors.yellow(mdInfo.version.full)}!`));
} else {
    console.error(`MDaemon ${colors.red('not')} available.`);
}
