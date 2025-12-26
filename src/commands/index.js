const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const commands = new Map();
const aliases = new Map();

function loadCommands() {
    const commandsDir = path.join(__dirname);
    const categories = fs.readdirSync(commandsDir).filter(file =>
        fs.statSync(path.join(commandsDir, file)).isDirectory()
    );

    for (const category of categories) {
        const categoryPath = path.join(commandsDir, category);
        const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

        for (const file of files) {
            try {
                const command = require(path.join(categoryPath, file));
                if (command.name && command.execute) {
                    commands.set(command.name, { ...command, category });

                    if (command.aliases && Array.isArray(command.aliases)) {
                        for (const alias of command.aliases) {
                            aliases.set(alias, command.name);
                        }
                    }
                }
            } catch (error) {
                logger.error(`Error loading command ${file}:`, error);
            }
        }
    }
    logger.info(`Loaded ${commands.size} commands`);
}

function getCommand(name) {
    if (commands.has(name)) return commands.get(name);
    if (aliases.has(name)) return commands.get(aliases.get(name));
    return null;
}

// Initial load
loadCommands();

module.exports = {
    commands,
    getCommand,
    loadCommands
};
