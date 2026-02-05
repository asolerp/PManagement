import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc
} from '@react-native-firebase/firestore';
import { error } from '../lib/logging';

const duplicateCheckList = async checkId => {
  try {
    const db = getFirestore();
    const checklistRef = doc(collection(db, 'checklists'), checkId);
    const checklist = await getDoc(checklistRef);

    const checksCollection = collection(checklistRef, 'checks');
    const checks = await getDocs(checksCollection);

    const duplicatedCheck = {
      ...checklist.data(),
      date: new Date(),
      done: 0,
      finished: false
    };

    delete duplicatedCheck.id;

    const checklistsCollection = collection(db, 'checklists');
    const duplicatedCheckList = await addDoc(
      checklistsCollection,
      duplicatedCheck
    );

    const duplicatedListOfChecks = checks.docs.map(docSnap => ({
      ...docSnap.data(),
      done: false,
      date: null,
      numberOfPhotos: 0,
      worker: null,
      photos: null
    }));

    await Promise.all(
      duplicatedListOfChecks.map(check => {
        const duplicatedChecksCollection = collection(
          doc(collection(db, 'checklists'), duplicatedCheckList.id),
          'checks'
        );
        return addDoc(duplicatedChecksCollection, check);
      })
    );
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true
    });
  }
};

export default duplicateCheckList;
