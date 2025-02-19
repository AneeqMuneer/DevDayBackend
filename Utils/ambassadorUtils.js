const nodemailer = require('nodemailer');

exports.CreateCode = (name, institution) => {
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
            html: `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Developer's Day 2025 - Brand Ambassador Applicant</title>
</head>

<body style="height: 100%; align-items: center; background-color: white; margin: 0; font-family: Arial, sans-serif; display: flex;">

  <div style="max-width: 600px; margin: 10px auto">
    <div style="margin: 0px 5px; padding: 0px;">
      <div style="margin: 5px 0px 0px 0px; background: linear-gradient(to bottom right, #a02723, #000000); color: #FFFFFF; padding: 10px; border-radius: 10px; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);">
        
        <div style="text-align: center; padding: 20px 0;">
          <img style="height:7em;" src="https://i.ibb.co/PGzM2VtS/DD-25-Logo-With-Outline-Full-V7.png" alt="Developers Day 2025 Logo" border="0">
        </div>

        <p style="margin-bottom: 0px; text-align: justify; padding: 0 25px 15px; font-size: 15px;">
          Dear ${name},
          <br><br>
          Thank you for your interest in becoming a Brand Ambassador for Developers Day 2025! We appreciate the time and effort you took to apply for this exciting opportunity.
          <br><br>
          We are pleased to inform you that your application has been successfully received. Our team will review your application carefully, and we will notify you further regarding the status of your application.
          <br><br>
          Thank you again for your enthusiasm and support for Developers Day 2025. We look forward to being in touch soon.
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
        console.log(`Mail sent to ${name} successfully.`);

        return true;
    } catch (error) {
        console.log('Error sending email:', error);
        throw error;
    }
};

exports.GenerateRandomPassword = async (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}