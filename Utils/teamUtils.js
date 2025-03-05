const nodemailer = require('nodemailer');

exports.SendTeamRegisterMail = async (email, team_name, competition_name) => {
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
            subject: `Congratulations! Registeration successful for ${competition_name} - Developers Day 2025`,
            html: `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Developers Day 2025 - ${competition_name} Registration Successful</title>
</head>

<body style="height: 100%; align-items: center; background-color: white; margin: 0; font-family: Arial, sans-serif; display: flex;">
  <div style="max-width: 600px; margin: 10px auto">
    <div style="margin: 0px 5px; padding: 0px;">
      <div style="margin: 5px 0px 0px 0px; background: linear-gradient(to bottom right, #a02723, #000000); color: #FFFFFF; padding: 10px; border-radius: 10px; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);">
        
        <div style="text-align: center; padding: 20px 0;">
          <img style="height:7em;" src="https://i.ibb.co/hRSB2k1w/DD-25-Logo-With-Outline-Full-V7.png" alt="Developers Day 2025 Logo" border="0">
        </div>

        <p style="margin-bottom: 0px; text-align: justify; padding: 0 25px 15px; font-size: 15px;">
          Dear <strong>${team_name}</strong>,
          <br><br>
          Congratulations! Your team has been successfully registered for the <strong>${competition_name.toUpperCase()}</strong> competition at Developers Day 2025! We are thrilled to have you join us in this exciting competition.
          <br><br>
          Get ready to showcase your skills and compete with some of the best talents. We will be sharing further details, schedules, and guidelines soon.
          <br><br>
          If you have any questions or require further assistance, feel free to reach out to us.
          <br><br>
          Best of luck, and we can't wait to see your team in action!
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
</html>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        console.log(`Mail sent to ${team_name} successfully.`);

        return true;
    } catch (error) {
        console.log('Error sending email:', error);
        throw error;
    }
};