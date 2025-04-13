const nodemailer = require('nodemailer');

exports.SendForgetPasswordMail = async (email, authCode) => {
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
            subject: 'Password Reset Verification Code - Developers Day 2025',
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Code</title>
</head>
<body style="height: 100%; align-items: center; background-color: white; margin: 0; font-family: Arial, sans-serif; display: flex;">

  <div style="max-width: 600px; margin: 10px auto">
    <div style="margin: 0px 5px; padding: 0px;">
      <div style="margin: 5px 0px 0px 0px; background: linear-gradient(to bottom right, #a02723, #000000); color: #FFFFFF; padding: 10px; border-radius: 10px; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);">
        
        <div style="text-align: center; padding: 20px 0;">
          <img style="height:7em;" src="https://res.cloudinary.com/da6bsligl/image/upload/v1741530918/teams/yyyjnwuefugf5vefuuop.png" alt="Developers Day 2025 Logo" border="0">
        </div>

        <p style="margin-bottom: 0px; text-align: justify; padding: 0 25px 15px; font-size: 15px;">
          Dear User,
          <br><br>
          We received a request to reset your password for your Developers Day 2025 account.
          <br><br>
          Please use the following verification code to proceed:
        </p>

        <div style="text-align: center; padding: 20px;">
          <div style="display: inline-block; font-size: 24px; font-weight: bold; color: #FFFFFF; border: 2px dashed #FFFFFF; padding: 15px 30px; border-radius: 8px; background-color: rgba(255, 255, 255, 0.05);">
            ${authCode}
          </div>
        </div>

        <p style="text-align: justify; padding: 0 25px 15px; font-size: 14px;">
          If you did not request this password reset, please ignore this email. This code is valid for one-time use only and will expire shortly.
          <br><br>
          Best regards,<br>
          Team Developers' Day 2025
        </p>

        <table style="width: 100%; text-align: center; margin-top: 5px;">
          <tr>
            <td>
              <p style="margin: 0; padding-bottom: 5px; font-size: 0.9em;"><strong>For Further Updates<br>Stay Tuned!</strong></p>
              <div class="social-icons" style="margin: 10px;">
                  <a href="https://www.linkedin.com/company/developersday" target="_blank" style="display: inline-block;"><img src="https://img.icons8.com/color/48/linkedin.png" alt="LinkedIn"></a>
                  <a href="https://www.facebook.com/developersday" target="_blank" style="display: inline-block;"><img src="https://img.icons8.com/color/48/facebook-new.png" alt="Facebook"></a>
                  <a href="https://www.instagram.com/developersday" target="_blank" style="display: inline-block;"><img src="https://img.icons8.com/color/48/instagram-new--v1.png" alt="Instagram"></a>
              </div>
            </td>
          </tr>
        </table>

      </div>
    </div>
  </div>

</body>
</html>
`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Password reset code sent to ${email}: `, info.response);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};