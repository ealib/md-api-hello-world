"use strict";

const colors = require('colors');
const md = require('node-mdaemon-api');

if (md && md.isReady) {
    const mdInfo = md.getMdInfo();
    console.log(colors.green(`Hello, MDaemon ${colors.yellow(mdInfo.version.full)}!`));
} else {
    console.error(`MDaemon ${colors.red('not')} available.`);
}
