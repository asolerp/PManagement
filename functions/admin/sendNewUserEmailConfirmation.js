const {createTransporter} = require('../utils/email/config');

const sendNewUserConfirmationEmail = async ({email, password}) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Bienvenido a la app de Port Management',
    html: `
        <h1>Bienvenido!!</h1>
        <p>Se te ha dado de alta en la aplicación para que tengas acceso a la visualización y gestión de las tareas que se te asignen.</p>
        <p>
        <b>Usuario: </b>${email}<br>
        </p>
        <p>
        <b>Contraseña: </b>${password}<br>
        </p>
        <img src="https://res.cloudinary.com/enalbis/image/upload/v1639415421/PortManagement/varios/port_logo_pv4jqk.png" alt="Girl in a jacket" width="100">
        <p>Un saludo del equipo de Port Management</p>
        `,
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
  sendNewUserConfirmationEmail,
};
