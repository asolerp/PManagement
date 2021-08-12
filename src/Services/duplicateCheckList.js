import firestore from '@react-native-firebase/firestore';
import {error} from '../lib/logging';

const duplicateCheckList = async (checkId) => {
  try {
    const checklist = await firestore()
      .collection('checklists')
      .doc(checkId)
      .get();

    const checks = await firestore()
      .collection('checklists')
      .doc(checkId)
      .collection('checks')
      .get();

    const duplicatedCheck = {
      ...checklist._data,
      date: new Date(),
      done: 0,
      finished: false,
    };

    delete duplicatedCheck.id;

    const duplicatedCheckList = await firestore()
      .collection('checklists')
      .add(duplicatedCheck);

    const duplicatedListOfChecks = checks._docs.map((doc) => ({
      ...doc._data,
      done: false,
      date: null,
      numberOfPhotos: 0,
      worker: null,
    }));

    await Promise.all(
      duplicatedListOfChecks.map((check) =>
        firestore()
          .collection('checklists')
          .doc(duplicatedCheckList.id)
          .collection('checks')
          .add(check),
      ),
    );
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
  }
};

export default duplicateCheckList;
