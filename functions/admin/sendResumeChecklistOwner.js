const {createTransporter} = require('../utils/email/config');

const ADMIN_EMAIL = 'info@portmanagement.es';

const sendResumeChecklistOwner = async ({email, checklist, checks}) => {
  const {observations} = checklist;
  const {
    street,
    owner,
    houseImage: {original},
  } = checklist.house[0];

  const {lastName, gender, language} = owner;

  const arrayOfEmails = email.split(',');

  const generateTitle = () => (gender === 'male' ? 'Mr' : 'Mrs');

  const generateChecks = () => {
    let checksHtml = '';
    checks.forEach((check, i) => {
      let checkImages = '';
      if (check.photos) {
        check.photos.length > 0 &&
          check.photos.forEach((photo) => {
            checkImages += `
            <td>
              <a href="${photo}" style="text-decoration: none; margin: 5px;">
                <img src="${photo}" style="height:auto;display:block;object-fit:contain; border-radius: 10px; width:150px; height: 150px;" alt="">
              </a>
            </td>
            `;
          });
      }
      checksHtml += `
      <tr>
        <td style="padding-bottom:30px;vertical-align:top;color:#153643;">
          <table>
            <tr>
              <td>
                <table style="display: flex; flex-direction: row; align-items: center; margin-bottom: 10px;">
                  <tr>
                    <td align="center" style="background-color: #98B29A; width: 50px; height: 50px; border-radius: 100%;">
                      <p style="margin:0;font-size:30px;line-height:24px;font-family:Arial,sans-serif; font-weight: 100; color:white;">${
                        i + 1
                      }</p>
                    </td>
                    <td style="padding-left: 10px;">
                      <p style="margin:0;font-size:24px;font-weight:100;letter-spacing: 2px; line-height:24px;font-family:Arial,sans-serif; color: #42505F">
                      ${
                        check.locale[language]
                          ? check.locale[language]
                          : check.locale.en
                      }
                      </p>
                    </td>
                  </tr>
                </table>
                <table style="display: flex; flex-direction: row;">
                  <tr>
                    ${checkImages}
                  </tr>
                </table>
              </td>
            </tr>
          </table>
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
    <body style="margin:0;padding:0;background-color: red;">
    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
      <tr>
        <td align="center" style="padding:0; background: #f2f2f2;">
          <table role="presentation" style="width:602px;border: 0;text-align:left; background: white; padding: 0 10px;">
              <tr>
                <td align="center" style="padding:20px 0 20px 0;">
                  <img src="https://firebasestorage.googleapis.com/v0/b/port-management-9bd53.appspot.com/o/other%2Fport.png?alt=media&token=41156ea7-76a2-4a28-8625-27f779433b78" alt="" width="120" style="background-color:white; padding: 0 10px; height:auto;position:absolute;left:50%;transform: translateX(-50%); z-index: 2;" />            
                </td>
              </tr>
              <tr>
                <td align="left" style="padding:40px 0 30px 0;">
                  <img src="${original}" alt="" height="300" style="display:block;border-radius: 10px; width: 100%; object-fit: cover;" />
                </td>
              </tr>
              <tr>
                  <td align="left" style="padding:10px 0 0px 0px;">
                    <h1 style="font-size:34px;margin:0 0 0px 0;font-family:Arial,sans-serif;">Your checklist is ready!</h1>
                  </td>
              </tr>
              <tr>
                <td style="padding:36px 30px 42px 0px;">
                  <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                    <tr style="margin-top: 20px">
                      <td style="padding:0 0 10px 0; margin-left: 20px; color:#153643;">
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
                      <td style="padding:30px;">
                        <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;">
                          <tr>
                            <td align="center" style="padding:20px 0 40px 0;">
                              <p style="margin:0;font-size:12px;line-height:24px;font-family:Arial,sans-serif; font-weight: 100; color:#98B29A;">WWW.PORTMANAGEMENT.ES</p>
                            </td>         
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        </body>
      </html>
     `;
  };

  const generateEnglishEmail = () => {
    return `
      <tr>
        <td style="padding:0 0 10px 0;color:#153643;">
          <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;">${generateTitle()} ${lastName}</h1>
          <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">We checked the functioning and state of your villa located in <b>${street}</b></p>
        </td>
      </tr>
      <tr style="margin-top: 20px">
        <td style="padding:0 0 10px 0; margin-left: 20px; color:#153643;">
          <table style="margin-bottom: 20px;">
            <tr>
              <td>
                <div style="background-color: #98B29A; padding:20px 10px;">
                  <p style="margin:0;font-size:20px;line-height:24px;font-family:Arial,sans-serif; font-weight: 100; color:white; padding: 0px 10px">CHECKLIST</p>
                </div>
              </td>
            </tr>
          </table>
          <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
            ${generateChecks()}   
            <tr style="width:20px;padding:0;font-size:0;line-height:0;"> </tr>
            <tr>
              <td>
                <p style="margin-top: 80px;"><b>👓 Observations:</b></p>
                <p>${observations}</p
              </td>
            </tr>                     
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
          <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">Hemos comprobado las funcionalidades y el estado de su villa en <b>${street}</b></p>
        </td>
      </tr>
      <tr style="margin-top: 20px">
        <td style="padding:0 0 10px 0; margin-left: 20px; color:#153643;">
          <table style="margin-bottom: 20px;">
            <tr>
              <td>
                <div style="background-color: #98B29A; padding:20px 10px;">
                  <p style="margin:0;font-size:20px;line-height:24px;font-family:Arial,sans-serif; font-weight: 100; color:white; padding: 0px 10px">CHECKLIST</p>
                </div>
              </td>
            </tr>
          </table>
          <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
            ${generateChecks()}   
            <tr style="width:20px;padding:0;font-size:0;line-height:0;"> </tr>
            <tr>
              <td>
                <p style="margin-top: 80px;"><b>👓 Observaciones:</b></p>
                <p>${observations}</p
              </td>
            </tr>                     
          </table>
        </td>
      </tr>
    `;
  };

  const sendEmail = async () => {
    return new Promise(async (resolve, reject) => {
      let emailTransporter = await createTransporter();

      const mailOptions = {
        from: process.env.EMAIL,
        cc: ADMIN_EMAIL,
        to: arrayOfEmails,
        subject: `CHECK LIST ${street}`,
        html: !language
          ? generateEmail('en')
          : language === 'en'
            ? generateEmail('en')
            : generateEmail('es'),
      };
      emailTransporter.sendMail(mailOptions, (error, data) => {
        if (error) {
          console.log(error);
          resolve(false);
        } else {
          console.log('Sent!');
          resolve(true);
        }
      });
    });
  };

  await sendEmail();
};

module.exports = {
  sendResumeChecklistOwner,
};
