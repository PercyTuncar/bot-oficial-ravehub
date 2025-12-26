/**
 * Level System
 * Based on Net Worth (Wallet + Bank) in USD.
 */

const LEVELS = [
    { max: 10, level: 1, name: 'Youtube', desc: 'Lo ves desde tu casa, no te alcanzó' },
    { max: 20, level: 2, name: 'Vereda', desc: 'Escuchando desde la calle, tomando trago corto' },
    { max: 30, level: 3, name: 'Reja', desc: 'Apurando la entrada, pero todavía afuera' },
    { max: 40, level: 4, name: 'Tribuna', desc: 'Adentro, pero lo ves chiquitito y de lejos' },
    { max: 50, level: 5, name: 'General', desc: 'En el pogo, apretado y sudando' },
    { max: 60, level: 6, name: 'Preferencial', desc: 'Un poquito más cerca, pero igual parado' },
    { max: 70, level: 7, name: 'VIP', desc: 'Ya tienes pulsera, te sientes especial' },
    { max: 80, level: 8, name: 'SuperVIP', desc: 'Barra libre y baño limpio' },
    { max: 90, level: 9, name: 'Backstage', desc: 'Te codeas con los dueños y staff' },
    { max: 100, level: 10, name: 'Booth', desc: 'En la cabina, al lado del DJ' },
    { max: Infinity, level: 11, name: 'Headliner', desc: 'Tú eres la estrella, todos te miran' }
];

function calculateLevel(netWorth) {
    for (const lvl of LEVELS) {
        if (netWorth < lvl.max) {
            return lvl;
        }
    }
    return LEVELS[LEVELS.length - 1];
}

/**
 * Checks if user level has changed and returns the new level info if so.
 * Returns null if no change.
 */
function checkLevelChange(currentLevel, wallet, bank) {
    const netWorth = wallet + bank;
    const calculated = calculateLevel(netWorth);

    if (calculated.level !== currentLevel) {
        return calculated;
    }
    return null;
}

module.exports = {
    calculateLevel,
    checkLevelChange,
    LEVELS
};
