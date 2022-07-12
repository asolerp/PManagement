const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const EMAIL = functions.config().email;
const CLIENT_ID = functions.config().client_id;
const CLIENT_SECRET = functions.config().client_secret;
const REFRESH_TOKEN = functions.config().refresh_token;

const REDIRECT_URL = 'https://developers.google.com/oauthplayground';

const createTransporter = async () => {
  const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Failed to create access token :(');
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: EMAIL,
      accessToken,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
    },
  });

  return transporter;
};

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
        <li><p><br>${
          check.locale[language] ? check.locale[language] : check.locale.en
        }</br></p></li>
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
        `<p><b>Observations:</b></p>
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
      <p>Hemos comprobado las funcionalidades y estado de su villa en <b>${street}</b>.
      </p>
      <p>
      Hemos comprobado:
      </p>
      <ol>
        ${generateChecks()}
      </ol>
      ${
        observations &&
        `<p><b>Observaciones:</b></p>
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
    from: functions.config().gmail.account,
    to: email,
    subject: `CHECK LIST ${street}`,
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
