const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');

const updateOwnerHouse = functions
  .region(REGION)
  .firestore.document('users/{userId}')
  .onUpdate(async (change, context) => {
    const user = change.after.data();
    const userId = context.params.userId;

    try {
      const houses = await admin
        .firestore()
        .collection('houses')
        .where('owner.id', '==', userId)
        .get();

      const houseData = houses.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      await Promise.all(
        houseData.map(async house => {
          await admin
            .firestore()
            .collection('houses')
            .doc(house.id)
            .set(
              {
                owner: {
                  id: userId,
                  ...user
                }
              },
              { merge: true }
            );
        })
      );
    } catch (err) {
      console.log(err);
    }
  });

module.exports = { updateOwnerHouse };
