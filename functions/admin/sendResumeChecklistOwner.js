const {createTransporter} = require('../utils/email/config');

const sendResumeChecklistOwner = async ({checklist, checks}) => {
  const {observations} = checklist;
  const {street, owner} = checklist.house[0];
  const {lastName, email, gender, language} = owner;

  const generateTitle = () => (gender === 'male' ? 'Mr' : 'Mrs');

  const generateChecks = () => {
    let checksHtml = '';
    checks.forEach((check) => {
      let checkImages = '';
      if (check.photos) {
        check.photos.length > 0 &&
          check.photos.forEach((photo) => {
            checkImages += `
            <a href="${photo}" style="text-decoration: none; margin: 5px;"><img src="${photo}" style="height:auto;display:block;object-fit:cover;" alt="" width="260" height="150"></a>
          `;
          });
      }
      checksHtml += `
              <tr>
                <td style="width:260px;padding:0;vertical-align:top;color:#153643;">
                  <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;line-height:24px;font-family:Arial,sans-serif;">${
                    check.locale[language]
                      ? check.locale[language]
                      : check.locale.en
                  }</p>
                  <p style="margin:0 0 25px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">
                  ${checkImages}
                  </p>
                </td>
              </tr>
              <tr style="width:20px;padding:0;font-size:0;line-height:0;">&nbsp;</tr>
      `;
    });
    return checksHtml;
  };

  const generateEmail = (language) => {
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
      <body style="margin:0;padding:0;">
        <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
          <tr>
            <td align="center" style="padding:0;">
              <table role="presentation" style="width:602px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
                <tr>
                  <td align="center" style="padding:20px 0 20px 0;background:#ffff;">
                    <img src="https://res.cloudinary.com/enalbis/image/upload/v1639415421/PortManagement/varios/port_logo_pv4jqk.png" alt="" width="120" style="height:auto;display:block;" />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:40px 0 30px 0;background:#ffff;">
                    <img src="https://res.cloudinary.com/enalbis/image/upload/v1679651296/PortManagement/email/nvcvcjlv2jfvw646qtrz.png" alt="" width="550" height="300" style="display:block;border-radius: 10px; object-fit: cover;" />
                  </td>
                </tr>
                <tr>
                    <td align="left" style="padding:10px 0 0px 25px;background:#ffff;">
                      <h1 style="font-size:34px;margin:0 0 0px 0;font-family:Arial,sans-serif;">Your checklist is ready!</h1>
                    </td>
                </tr>
                <tr>
                  <td style="padding:36px 30px 42px 30px;">
                    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                    ${
                      language === 'en'
                        ? generateEnglishEmail()
                        : generateSpanishEmail()
                    }
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px;background:#55A5AD;">
                    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;">
                      <tr>
                        <td style="padding:0;width:50%;" align="left">
                          <p style="margin:0;font-size:14px;line-height:16px;font-family:Arial,sans-serif;color:#ffffff;">
                            &reg; Port Management, Port d'Andratx 2023<br/>
                          </p>
                        </td>
                        <td style="padding:0;width:50%;" align="right">
                          <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
                            <tr>
                              <td style="padding:0 0 0 10px;width:38px;">
                                <a href="http://www.twitter.com/" style="color:#ffffff;"><img src="https://assets.codepen.io/210284/tw_1.png" alt="Twitter" width="38" style="height:auto;display:block;border:0;" /></a>
                              </td>
                              <td style="padding:0 0 0 10px;width:38px;">
                                <a href="http://www.facebook.com/" style="color:#ffffff;"><img src="https://assets.codepen.io/210284/fb_1.png" alt="Facebook" width="38" style="height:auto;display:block;border:0;" /></a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  };

  const generateEnglishEmail = () => {
    return `
    <tr>
      <td style="padding:0 0 10px 0;color:#153643;">
        <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;">${generateTitle()} ${lastName}</h1>
        <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">We checked the functioning and state of your villa located in </p>
        <p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif; font-weight: 700;">We have checked:</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0;">
        <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
            ${generateChecks()}
        </table>
      </td>
    </tr>
      `;
  };

  const generateSpanishEmail = () => {
    return `
      <tr>
        <td style="padding:0 0 10px 0;color:#153643;">
          <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;">${generateTitle()} ${lastName}</h1>
          <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">Hemos comprobado las funcionalidades y el estado de su villa en </p>
          <p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif; font-weight: 700;">Hemos comprobado:</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0;">
          <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
            <tr>
              ${generateChecks()}
            </tr>
          </table>
        </td>
      </tr>
    `;
  };

  const generateFooterEmail = () => {};

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `🏡 CHECK LIST ${street}`,
    html: !language
      ? generateEmail('en')
      : language === 'en'
      ? generateEmail('en')
      : generateEmail('es'),
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
  sendResumeChecklistOwner,
};
