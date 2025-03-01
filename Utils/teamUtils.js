const nodemailer = require('nodemailer');

exports.SendTeamRegisterMail = async (email, name, competition_name) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: `Application Received - Developers Day 2025 ${competition_name} Competition Team Registration Successful`,
            text: `Dear ${name},\n\nThank you for registering your team for Developers Day 2025 ${competition_name} Competition`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);

        return true;
    } catch (error) {
        console.log('Error sending email:', error);
        throw error;
    }
};