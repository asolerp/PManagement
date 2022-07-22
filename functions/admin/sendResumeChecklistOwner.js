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
            <a href="${photo}" style="text-decoration: none; margin: 5px;"><img src="${photo}" style="object-fit: cover; border-radius: 5px;" alt="W3Schools.com" width="100" height="100"></a>
          `;
          });
      }
      checksHtml += `
      <div>
       <p>${
         check.locale[language] ? check.locale[language] : check.locale.en
       } ✅</p>
        <div style="display: flex; flex-direction: "row"; flex-wrap: wrap;>
          ${checkImages}
        </div>
      </div>
      `;
    });
    return checksHtml;
  };

  const generateEnglishEmail = () => {
    return `
      <p><br>Dear ${generateTitle()} ${lastName}</br></p>
      <p>We checked the functioning and state of your villa located in <b>${street}</b>.
      </p>
      <p>
      We have checked:
      </p>
      <ol>
        ${generateChecks()}
      </ol>
      ${
        observations &&
        `<p><b>👓 Observations:</b></p>
        <p>
          ${observations}
        </p>`
      }
      <p>Thank you very much</p>
      <p>Regards</p>
      <img src="https://res.cloudinary.com/enalbis/image/upload/v1639415421/PortManagement/varios/port_logo_pv4jqk.png" alt="Port Management" >
      `;
  };

  const generateSpanishEmail = () => {
    return `
      <p><br>${generateTitle()} ${lastName}</br></p>
      <p>Hemos comprobado las funcionalidades y el estado de su villa en <b>${street}</b>.
      </p>
      <p>
      Hemos comprobado:
      </p>
      <div>
        ${generateChecks()}
      </div>
      ${
        observations &&
        `<p><b>👓 Observaciones:</b></p>
        <p>
          ${observations}
        </p>`
      }
      <p>Muchas gracias</p>
      <p>Reciba un cordial saludo</p>
      <img src="https://res.cloudinary.com/enalbis/image/upload/v1639415421/PortManagement/varios/port_logo_pv4jqk.png" alt="Port Management" width="120" >
      `;
  };

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `🏡 CHECK LIST ${street}`,
    html: language === 'en' ? generateEnglishEmail() : generateSpanishEmail(),
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
