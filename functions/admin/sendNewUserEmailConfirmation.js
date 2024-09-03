const { createTransporter } = require('../utils/email/config');

const sendNewUserConfirmationEmail = async ({ email, password }) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Bienvenido a la app de Port Management',
    html: `
        <h1>Bienvenido!!</h1>
        <p>Se te ha dado de alta en la aplicación de Port Management para que tengas acceso a la visualización y gestión de las tareas que se te asignen.</p>
        <p>
        <b>Usuario: </b>${email}<br>
        </p>
        <p>
        <b>Contraseña: </b>${password}<br>
        </p>
        <img src="https://firebasestorage.googleapis.com/v0/b/port-management-9bd53.appspot.com/o/other%2Fport.png?alt=media&token=41156ea7-76a2-4a28-8625-27f779433b78" alt="Girl in a jacket" width="100">
        <p>Un saludo del equipo de Port Management</p>
        `
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
  sendNewUserConfirmationEmail
};
