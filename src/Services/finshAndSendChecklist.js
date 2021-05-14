import firestore from '@react-native-firebase/firestore';

const finishAndSendChecklist = async (checkId) => {
  try {
    await firestore()
      .collection('checklists')
      .doc(checkId)
      .update({send: true});
  } catch (err) {
    console.log(err);
  }
};

export default finishAndSendChecklist;
