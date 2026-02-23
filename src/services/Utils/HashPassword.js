const bcrypt = require("bcrypt");

const hashPassword = async (plainPassword) => {
    const saltRounds = 10; 
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    return hash;
};
const comparePassword = async (plainPassword, hashedPassword) => {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch; 
};

module.exports = { hashPassword, comparePassword };