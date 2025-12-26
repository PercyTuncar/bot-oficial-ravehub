const { updateMember, FieldValue } = require('./database');
const logger = require('../utils/logger');

const MESSAGE_VALUE = 0.01;
const PAYOUT_THRESHOLD = 0.50;

/**
 * Process a new message for economy (per-group)
 * @param {string} groupId - Group ID
 * @param {string} userId - User ID
 * @param {object} member - Current member data
 * @returns {object} Result of processing
 */
async function processMessageEconomy(groupId, userId, member) {
    let updates = {
        pending: parseFloat(((member.pending || 0) + MESSAGE_VALUE).toFixed(2))
    };

    let currentDebt = member.debt || 0;

    // Check Payout Threshold
    if (updates.pending >= PAYOUT_THRESHOLD) {
        const payoutAmount = updates.pending;

        if (currentDebt > 0) {
            // Pay Debt first
            if (payoutAmount >= currentDebt) {
                // Debt cleared, rest to wallet
                const remaining = parseFloat((payoutAmount - currentDebt).toFixed(2));
                updates.debt = 0;
                updates.wallet = parseFloat(((member.wallet || 0) + remaining).toFixed(2));
                updates.pending = 0;

                await updateMember(groupId, userId, updates);
                return { paidDebt: true, cleared: true, amount: remaining, totalPayout: payoutAmount };
            } else {
                // Partial debt payment
                updates.debt = parseFloat((currentDebt - payoutAmount).toFixed(2));
                updates.pending = 0;

                await updateMember(groupId, userId, updates);
                return { paidDebt: true, cleared: false, amount: 0, totalPayout: payoutAmount };
            }
        } else {
            // Normal Payout
            updates.wallet = parseFloat(((member.wallet || 0) + payoutAmount).toFixed(2));
            updates.pending = 0;

            await updateMember(groupId, userId, updates);
            return { payout: true, amount: payoutAmount };
        }
    }

    // Just update pending if no payout
    await updateMember(groupId, userId, updates);
    return { payout: false };
}

/**
 * Transfer from Wallet to Bank (per-group)
 */
async function deposit(groupId, userId, member, amount) {
    if (amount === 'all' || amount === 'todo') amount = member.wallet;
    amount = parseFloat(amount);

    if (isNaN(amount) || amount <= 0) throw new Error("Cantidad inválida");
    if ((member.wallet || 0) < amount) throw new Error("No tienes suficiente efectivo");

    const updates = {
        wallet: parseFloat(((member.wallet || 0) - amount).toFixed(2)),
        bank: parseFloat(((member.bank || 0) + amount).toFixed(2))
    };

    await updateMember(groupId, userId, updates);
    return updates;
}

/**
 * Transfer from Bank to Wallet (per-group)
 */
async function withdraw(groupId, userId, member, amount) {
    if (amount === 'all' || amount === 'todo') amount = member.bank;
    amount = parseFloat(amount);

    if (isNaN(amount) || amount <= 0) throw new Error("Cantidad inválida");
    if ((member.bank || 0) < amount) throw new Error("No tienes fondos suficientes en el banco");

    const updates = {
        bank: parseFloat(((member.bank || 0) - amount).toFixed(2)),
        wallet: parseFloat(((member.wallet || 0) + amount).toFixed(2))
    };

    await updateMember(groupId, userId, updates);
    return updates;
}

module.exports = {
    processMessageEconomy,
    deposit,
    withdraw,
    MESSAGE_VALUE,
    PAYOUT_THRESHOLD
};
