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

exports.SendRegistrationEmail = async (email, name) => {
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
          <img style="height:7em;" src="https://res.cloudinary.com/da6bsligl/image/upload/v1741530918/teams/yyyjnwuefugf5vefuuop.png" alt="Developers Day 2025 Logo" border="0">
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

exports.SendApprovePasswordEmail = async (email, name, baCode, password) => {
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
          subject: 'Brand Ambassador Portal Details',
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Brand Ambassador Portal Details</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">

<div style="max-width: 600px; margin: 20px auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
  
  <h2 style="text-align: center; color: #a02723;">Brand Ambassador Portal Details</h2>
  
  <p>Dear <strong>${name}</strong>,</p>

  <p>We are excited to have you on board as a brand ambassador for our upcoming event!</p>

  <p>To make your experience seamless and help you track your progress, we have created a dedicated portal for you. Through this portal, you'll be able to easily monitor the teams you've helped register, as well as track the commissions earned through your efforts.</p>

  <p><strong>Your updated Ambassador Code:</strong> <span style="color: #a02723;">${baCode}</span></p>

  <p><strong>Autogenerated Password:</strong> <span style="color: #a02723;">${password}</span></p>

  <p>To access the portal, simply visit <a href="https://ba.devday25.com" target="_blank" style="color: #a02723; font-weight: bold;">ba.devday25.com</a> and enter your details.</p>

  <p>Once you log in, you'll have the option to change your password to something more personalized if you'd prefer. Please feel free to update it at any time.</p>

  <p>If you encounter any issues or need assistance, don't hesitate to reach out to us.</p>

  <p>Thank you for your efforts in making this event a success, and we’re looking forward to seeing the impact you’ll make!</p>

  <p>Best regards,<br>
  <strong>Team Developers' Day 2025</strong></p>

  <hr style="border: 1px solid #ddd; margin: 20px 0;">

  <p style="text-align: center;"><strong>Follow us for further updates:</strong></p>
  <p style="text-align: center;">
    <a href="https://www.linkedin.com/company/developersday" target="_blank" style="margin: 0 10px;"><img src="https://img.icons8.com/color/48/linkedin.png" alt="LinkedIn"></a>
    <a href="https://www.facebook.com/developersday" target="_blank" style="margin: 0 10px;"><img src="https://img.icons8.com/color/48/facebook-new.png" alt="Facebook"></a>
    <a href="https://www.instagram.com/developersday" target="_blank" style="margin: 0 10px;"><img src="https://img.icons8.com/color/48/instagram-new--v1.png" alt="Instagram"></a>
  </p>

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