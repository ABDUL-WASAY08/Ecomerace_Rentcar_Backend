const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter error:', error && error.stack ? error.stack : error);
    } else {
        console.log('Email transporter ready:', success);
    }
});

module.exports = { transporter };