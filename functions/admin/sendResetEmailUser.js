const {createTransporter} = require('../utils/email/config');

const sendResetEmailUser = async ({ email, link }) => {

  const generateEmail = () => {
    return `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="x-apple-disable-message-reformatting">
      <title></title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        table, td, div, h1, p {font-family: Arial, sans-serif;}
      </style>
    </head>
    <body style="margin:0;padding:0;background-color: #F2F2F2;">
    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
      <tr>
        <td align="center" style="padding:0; background: #f2f2f2;">
          <table role="presentation" style="width:602px;border: 0;text-align:left; background: white; padding: 0 10px;">
              <tr>
                <td align="center" style="padding:20px 0 20px 0;">
                  <img src="https://res.cloudinary.com/enalbis/image/upload/v1684221984/PortManagement/varios/o9rgrefebivmftjjifq1.jpg" alt="" width="120" style="background-color:white; padding: 0 10px; height:auto;position:absolute;left:50%;transform: translateX(-50%); z-index: 2;" />            
                </td>
              </tr>
              <tr>
                  <td align="left" style="padding: 20px;">
                    <p style="font-size:14px;margin-top: 60px;font-family:Arial,sans-serif;">
                      <p>Welcome and thank you for registering with us!</p>
                      <p>To get started with your new account, you need to create a secure password. This password will be your key to access your account and all of its features.</p>
                      <p>
                        Please click on the following link to set up your password:
                      </p>
                      <a href="${link}">Set password</a>
                      <p>
                        This will direct you to a secure page where you can create your password. Here are some suggestions to make your password secure:
                      </p>
                      <ul>
                        <li>Make your password at least 12 characters long.</li>
                        <li>Use a mix of upper case and lower case letters, numbers, and special characters.</li>
                        <li>Don't use obvious information like your name, birthday, or common words.</li>
                      </ul>
                      <p>If you did not create this account, if the link doesn't work, or if you need any assistance, please contact our support team immediately at info@portmanagement.es.</p>
                      <p>We look forward to serving you!</p>
                      <br>
                        Best Regards,</br>
                        Port Management
                      </p>
                    </p>
                    
                  </td>
              </tr>
            </table>
          </div>
        </body>
      </html>
     `;
  };

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `Reset your Port Management password`,
    html: generateEmail(),
  };

  let emailTransporter = await createTransporter();

  return emailTransporter.sendMail(mailOptions, (error, data) => {
    if (error) {
      console.log(error);
      return;
    }
    console.log('Sent!');
  });
};

module.exports = {
  sendResetEmailUser,
};
