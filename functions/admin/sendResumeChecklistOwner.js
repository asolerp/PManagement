const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', //smtp.gmail.com  //in place of service use host...
  secure: false, //true
  port: 587, //465
  auth: {
    user: functions.config().gmail.account,
    pass: functions.config().gmail.password,
  },
});

const sendResumeChecklistOwner = ({checklist, checks}) => {
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
        <li><p>${
          check.locale[language] ? check.locale[language] : check.locale.en
        }</p></li>
        <div style="display: flex; flex-direction: "row"; flex-wrap: wrap;>
          ${checkImages}
        </div>
      </div>
      `;
    });
    return checksHtml;
  };

  const mailOptions = {
    from: functions.config().gmail.account,
    to: email,
    subject: `CHECK LIST ${street}`,
    html: `
        <p><br>Dear ${generateTitle()} ${lastName}</br></p>
        <p>We checked the operation and condition of your villa located in <b>${street}</b>.
        </p>
        <p>
        We verified:
        </p>
        <ol>
          ${generateChecks()}
        </ol>
        ${
          observations &&
          `    <p><b>We found:</b></p>
          <p>
            ${observations}
          </p>`
        }
        <p>Thank you very much</p>
        <p>Regards</p>
        <img src="https://res.cloudinary.com/enalbis/image/upload/v1639415421/PortManagement/varios/port_logo_pv4jqk.png" alt="Girl in a jacket" width="100">
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
  sendResumeChecklistOwner,
};
