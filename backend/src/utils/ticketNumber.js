const { nanoid } = require("nanoid");

// Generates a human-friendly ticket number e.g. HP-7F3K9QZP
const generateTicketNumber = () => `HP-${nanoid(8).toUpperCase()}`;

module.exports = generateTicketNumber;
