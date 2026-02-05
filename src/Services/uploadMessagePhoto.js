import { messageIdGenerator } from '../utils/uuid';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp
} from '@react-native-firebase/firestore';
import { cloudinaryUpload } from '../cloudinary';
import { error } from '../lib/logging';

const uploadMessagePhoto = async (
  collectionName,
  docId,
  messageImage,
  user
) => {
  try {
    const db = getFirestore();
    const messageID = messageIdGenerator();

    const waitingSendImageMessage = {
      _id: messageID,
      image:
        'https://res.cloudinary.com/enalbis/image/upload/v1614849090/PortManagement/loader_ro9a3e.gif',
      messageType: 'image',
      createdAt: serverTimestamp(),
      user: {
        _id: user?.id,
        name: user?.firstName,
        avatar: user?.profileImage?.small,
        token: user?.token,
        role: user?.role
      }
    };

    const messagesCollection = collection(
      doc(collection(db, collectionName), docId),
      'messages'
    );
    const result = await addDoc(messagesCollection, waitingSendImageMessage);

    const image = await cloudinaryUpload(
      messageImage,
      `/PortManagement/${collectionName}/${docId}/Photos`
    );

    const messageRef = doc(messagesCollection, result.id);
    await updateDoc(messageRef, {
      ...waitingSendImageMessage,
      image: image
    });

    const photosCollection = collection(
      doc(collection(db, collectionName), docId),
      'photos'
    );
    await addDoc(photosCollection, {
      createdAt: serverTimestamp(),
      image: image
    });
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true
    });
  }
};

export default uploadMessagePhoto;
