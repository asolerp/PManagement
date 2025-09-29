const { createTransporter } = require('../utils/email/config');

const ADMIN_EMAIL = 'recepcion@portmanagement.es';
const DEFAULT_HOUSE_IMAGE =
  'https://firebasestorage.googleapis.com/v0/b/port-management-9bd53.appspot.com/o/other%2Fpmanagement.png?alt=media&token=432d2425-d425-4f38-9840-52e907e221fa';

const sendResumeChecklistOwner = async ({
  email,
  checklist,
  checks,
  checklistId
}) => {
  const { observations } = checklist;
  const { street, owner } = checklist.house[0];

  const { lastName, gender, language } = owner;

  const arrayOfEmails = email.split(',');

  const generateImageTable = (images, itemsPerRow) => {
    let html =
      '<table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto" align="left">';
    let rowOpen = false;

    if (!images) {
      return '';
    }

    images.forEach((image, index) => {
      if (index % itemsPerRow === 0) {
        if (rowOpen) {
          html += '</tr>'; // Cierra la fila anterior
        }
        html += '<tr>'; // Abre una nueva fila
        rowOpen = true;
      }

      // Agrega la celda con la imagen
      html += `
            <td style="padding: 10px;">
              <a href="${image}" style="text-decoration: none;">
                <img src="${image}" alt="Imagen ${index + 1}" width="140" height="140" style="object-fit: cover; border-radius: 10px; width: 140px; height: 140px;">
              </a>
            </td>
        `;
    });

    if (rowOpen) {
      html += '</tr>'; // Cierra la última fila
    }

    html += '</table>';
    return html;
  };

  const generateTitle = () => (gender === 'male' ? 'Dear' : 'Dear');

  const generateChecks = () => {
    let checksHtml = '';
    checks
      .sort((a, b) => {
        // Si el idioma seleccionado no está disponible, usa 'en' como idioma predeterminado
        const localeA = a.locale[language] ? a.locale[language] : a.locale.en;
        const localeB = b.locale[language] ? b.locale[language] : b.locale.en;

        // Compara las cadenas para determinar el orden (alfabéticamente)
        return localeA.localeCompare(localeB);
      })
      .forEach(check => {
        checksHtml += `
      <tr>
        <td style="padding: 10px 0;">
          <h3 style="font-size: 22px;">✅ ${check.locale[language] ? check.locale[language] : check.locale.en}</h3>
          ${generateImageTable(check.photos, 4)}
        </td>
      </tr>
      `;
      });
    return checksHtml;
  };

  const generateEmail = language => {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Checklist de Vivienda</title>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Roboto', Arial, sans-serif; /* Roboto con respaldo */
                letter-spacing: 1px;
            }
            a {
                text-decoration: underline;
                color: #333;
            }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; color: #333;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                  <td style="padding: 20px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px;">
                             ${
                               language === 'en'
                                 ? generateEnglishEmail()
                                 : generateSpanishEmail()
                             }
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
        <td style="padding: 10px 0 10px 0; text-align: left;">
          <img src="${DEFAULT_HOUSE_IMAGE}" alt="Owner house" width="100%" height="300" style="object-fit: cover; border-radius: 0%; display: block; margin: 0 auto;">
          <h1 style="font-size: 28px;">Your checklist is ready!</h1>
          <h3 style="font-size: 22px; margin-top: 20px">${generateTitle()} ${lastName}</h3>
          <p style="font-size: 16px;">We checked the functioning and state of your villa located in <b>${street}</b></p>
        </td>
      </tr>
      <tr>
        ${generateChecks()}
      </tr>
      <tr style="margin: 20px 0">
        <td style="padding: 10px 0; text-align: left;">
          <p style="font-size: 16px;"><b>👓 Observations:</b></p>
          <p font-size: 16px;>${observations}</p
        </td>
      </tr>
      <tr>
          <td style="padding: 20px 0;">
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto" align="left">
                  <tr>
                      <td>
                          <img src="https://firebasestorage.googleapis.com/v0/b/port-management-9bd53.appspot.com/o/other%2Fcontact.png?alt=media&token=b1af96ae-7c39-442c-9e9d-4fae1d7b9d6f" alt="Contacto" width="300" height="300" style="object-fit: cover;">
                      </td>
                     <td align="center" style="margin: 0 auto; background-color: #eaeaea; color: #777;  padding: 10px; font-size: 18px;">
                          <p>PORT MANAGEMENT</p>
                          <a href="tel:+34629024171">+34 629 024 171</a>
                          <a href="mailto:info@portmanagement.es">info@portmanagement.es</a>
                      </td>
                  </tr>
              </table>
          </td>
      </tr>
      <tr>
        <td style="color: #777; text-align: center; padding: 20px; font-size: 18px;">
          This email was automatically generated. If you have any questions, contact us. Port Management
        </td>
      </tr>
    `;
  };

  const generateSpanishEmail = () => {
    return `
      <tr>
        <td style="padding: 10px 0 10px 0; text-align: left;">
          <img src="${DEFAULT_HOUSE_IMAGE}" alt="Owner house" width="100%" height="300" style="object-fit: cover; border-radius: 0%; display: block; margin: 0 auto;">
          <h1 style="font-size: 28px;">Your checklist is ready!</h1>
          <h3 style="font-size: 22px;">${generateTitle()} ${lastName}</h3>
          <p style="font-size: 16px;">Hemos revisado el funcionamiento y estado de su villa ubicada en <b>${street}</b></p>
        </td>
      </tr>
      ${generateChecks()}
      <tr style="margin: 20px 0">
        <td style="padding: 10px 0; text-align: left;">
          <p style="font-size: 16px;"><b>👓 Observaciones:</b></p>
          <p style="font-size: 16px;">${observations}</p>
        </td>
      </tr>
      <tr>
          <td style="padding: 20px 0;">
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto" align="left">
                  <tr>
                      <td>
                          <img src="https://firebasestorage.googleapis.com/v0/b/port-management-9bd53.appspot.com/o/other%2Fcontact.png?alt=media&token=b1af96ae-7c39-442c-9e9d-4fae1d7b9d6f" alt="Contacto" width="300" height="300" style="object-fit: cover;">
                      </td>
                      <td align="center" style="margin: 0 auto; background-color: #eaeaea; color: #777;  padding: 10px; font-size: 18px;">
                          <p>PORT MANAGEMENT</p>
                          <a href="tel:+34629024171">+34 629 024 171</a>
                          <a href="mailto:info@portmanagement.es">info@portmanagement.es</a>
                      </td>
                  </tr>
              </table>
          </td>
      </tr>
      <tr>
        <td style="color: #777; text-align: center; padding: 20px; font-size: 18px;">
          This email was automatically generated. If you have any questions, contact us. Port Management
        </td>
      </tr>
    `;
  };

  const sendEmail = async () => {
    return new Promise(async resolve => {
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
            : generateEmail('es')
      };
      emailTransporter.sendMail(mailOptions, error => {
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

  const emailResult = await sendEmail();

  console.log('Email result:', emailResult, 'checklistId:', checklistId);

  // Marcar en la base de datos si el email se envió exitosamente
  if (emailResult && checklistId) {
    console.log('Attempting to update database for checklist:', checklistId);
    try {
      const admin = require('firebase-admin');
      await admin.firestore().collection('checklists').doc(checklistId).update({
        send: true,
        sendAt: admin.firestore.FieldValue.serverTimestamp(),
        sendTo: arrayOfEmails
      });
      console.log(
        'Email tracking updated successfully for checklist:',
        checklistId
      );
    } catch (error) {
      console.error('Error updating email tracking:', error);
    }
  } else {
    console.log(
      'Not updating database - emailResult:',
      emailResult,
      'checklistId:',
      checklistId
    );
  }

  return emailResult;
};

module.exports = {
  sendResumeChecklistOwner
};
