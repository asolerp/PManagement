const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');
const { createTransporter } = require('../utils/email/config');

const generateEmail = resetLink => {
  return `
    <!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta name="x-apple-disable-message-reformatting">
        <title></title>
        <style>
            table, td, div, h1, p {font-family: Arial, sans-serif;}
        </style>
        </head>
        <body style="margin:0;padding:0;">
        <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
            <tr>
            <td style="padding:0 0 10px 0;color:#153643;">
                <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;">Your recovery link</h1>
                <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">Here you have the link to reset your password.</p>
                <a href="${resetLink}" style="background:#f9b414;text-decoration:none;font-weight:400;font-size:18px;line-height:24px;text-align:center;color:#ffffff;border-radius:4px;display:inline-block;">Reset Password</a>
                <p style="margin:12px 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">If you didn't request this, you can ignore this email.</p>
                <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">Thanks, Port Management.</p>
            </td>
            </tr>
            </table>
        </body>
        </html>
    `;
};

const sendResentLinkEmail = async (email, resetLink) => {
  console.log('Sending email to:', email);
  console.log('Reset link:', resetLink);
  return new Promise(async resolve => {
    let emailTransporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: `Restablecer contraseña / Reset password`,
      html: generateEmail(resetLink)
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

exports.sendPasswordResetEmail = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    // Verificar que la solicitud proviene de un administrador
    console.log('Context Auth:', context.auth);
    console.log('Data:', data);
    // if (!context.auth || !context.auth.token.admin) {
    //   throw new functions.https.HttpsError(
    //     'unauthenticated',
    //     'Solo los administradores pueden realizar esta operación.'
    //   );
    // }

    const email = data.email;

    try {
      const resetLink = await admin.auth().generatePasswordResetLink(email);
      await sendResentLinkEmail(email, resetLink);
      return { success: true };
    } catch (error) {
      throw new functions.https.HttpsError(
        'internal',
        'Error al enviar el enlace de restablecimiento de contraseña.',
        error
      );
    }
  });
