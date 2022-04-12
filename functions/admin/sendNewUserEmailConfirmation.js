const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', //smtp.gmail.com  //in place of service use host...
  secure: false, //true
  port: 25, //465
  auth: {
    user: functions.config().gmail.account,
    pass: functions.config().gmail.password,
  },
});

const sendNewUserConfirmationEmail = ({email, password}) => {
  const mailOptions = {
    from: functions.config().gmail.account,
    to: functions.config().gmail.account,
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
  return transporter.sendMail(mailOptions, (error, data) => {
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
