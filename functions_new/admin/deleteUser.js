const admin = require("firebase-admin");
const { onDocumentDeleted } = require("firebase-functions/v2/firestore");
const { REGION } = require("../utils");

const deleteUser = onDocumentDeleted(
  { document: "users/{userId}", region: REGION },
  async (event) => {
    const deletedUser = event.data.data();
    console.log("DELETED USER", deletedUser);
    await admin.auth().deleteUser(deletedUser.id);
  },
);

module.exports = { deleteUser };
