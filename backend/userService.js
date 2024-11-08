// В отдельном файле, например, userService.js
async function findUserByConfirmationCode(code) {
    const user = await db.query("SELECT * FROM users WHERE confirmation_code = ?", [code]);
    return user[0];
}

module.exports = { findUserByConfirmationCode };
