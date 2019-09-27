#!/usr/bin/env node

const program = require('commander');

program.version(require('../package').version).usage('<command> [options]');


program
    .command('build')
    .version('0.0.1', '-v, --version')
    .description('create a new project powered by tus-cli')
    .option('-t, --type <typeName>', 'The type of project to be created！')
    .option('-f, --force', 'Overwrite target directory if it exists')
    .alias('c')
    .action((cmd) => {
        const options = cleanArgs(cmd);
        require('../lib/build')(options);
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
function camelize(str) {
    return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs(cmd) {
    const args = {};
    cmd.options.forEach((o) => {
        const key = camelize(o.long.replace(/^--/, ''));
        // if an option is not present and Command has a method with the same name
        // it should not be copied
        if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
            args[key] = cmd[key];
        }
    });
    return args;
}
