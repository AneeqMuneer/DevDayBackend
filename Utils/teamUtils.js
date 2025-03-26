const nodemailer = require('nodemailer');

exports.SendTeamRegisterMail = async (email, team_name, competition_name) => {
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
        subject: `Registration Request Received for ${competition_name} - Developers Day 2025`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Developers Day 2025 - ${competition_name} Registration Request Received</title>
</head>
<body style="height: 100%; align-items: center; background-color: white; margin: 0; font-family: Arial, sans-serif; display: flex;">
  <div style="max-width: 600px; margin: 10px auto">
    <div style="margin: 0px 5px; padding: 0px;">
      <div style="margin: 5px 0px 0px 0px; background: linear-gradient(to bottom right, #a02723, #000000); color: #FFFFFF; padding: 10px; border-radius: 10px; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);">
        <div style="text-align: center; padding: 20px 0;">
          <img style="height:7em;" src="https://res.cloudinary.com/da6bsligl/image/upload/v1741530918/teams/yyyjnwuefugf5vefuuop.png" alt="Developers Day 2025 Logo" border="0">
        </div>
        <p style="margin-bottom: 0px; text-align: justify; padding: 0 25px 15px; font-size: 15px;">
          Dear <strong>${team_name}</strong>,
          <br><br>
          Thank you for registering for the <strong>${competition_name.toUpperCase()}</strong> competition at Developers Day 2025! We have received your registration request.
          <br><br>
          Please note that your registration will be <strong>confirmed</strong> once your payment has been successfully verified.
          <br><br>
          If you have any questions or require assistance, feel free to reach out to us.
          <br><br>
          Best regards,<br>
          Team Developers' Day 2025
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
    };

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully on attempt ${attempt}: ${info.response}`);
            return true;
        } catch (error) {
            console.log(`Error sending email on attempt ${attempt}:`, error);
            if (attempt === 2) {
                return;
            }
            console.log('Retrying email send...');
        }
    }
};