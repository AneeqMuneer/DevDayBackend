const nodemailer = require('nodemailer');

exports.createCode = (name, institution) => {
    const getInitials = (str) => {
        const words = str.trim().split(' ');
        if (words.length > 1) {
            return words[0][0].toUpperCase() + words[1][0].toUpperCase();
        } else {
            return str.substring(0, 2).toUpperCase();
        }
    };

    const nameInitials = getInitials(name);
    const institutionInitials = getInitials(institution);

    const randomNumbers = Math.floor(10 + Math.random() * 90);

    const finalCode = `${nameInitials}${institutionInitials}${randomNumbers}`;

    return finalCode;
};

exports.SendEmail = async (email, name) => {
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
            subject: 'Application Received - Developers Day 2025 Brand Ambassador',
            text: `Dear ${name},\n
Thank you for your interest in becoming a Brand Ambassador for Developers Day 2025! We appreciate the time and effort you took to apply for this exciting opportunity.\n
We are pleased to inform you that your application has been successfully received. Our team will review your application carefully, and we will notify you further regarding the status of your application.\n
Thank you again for your enthusiasm and support for Developers Day 2025. We look forward to being in touch soon.\n
Best regards,
Team Developers' Day 2025`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        console.log(`Mail sent to ${name} successfully.`);

        return true;
    } catch (error) {
        console.log('Error sending email:', error);
        throw error;
    }
};