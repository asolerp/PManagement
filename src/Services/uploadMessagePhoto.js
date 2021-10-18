import {messageIdGenerator} from '../utils/uuid';
import firestore from '@react-native-firebase/firestore';
import {cloudinaryUpload} from '../cloudinary';
import {error} from '../lib/logging';

const uploadMessagePhoto = async (collection, docId, messageImage, user) => {
  try {
    const messageID = messageIdGenerator();

    const waitingSendImageMessage = {
      _id: messageID,
      image:
        'https://res.cloudinary.com/enalbis/image/upload/v1614849090/PortManagement/loader_ro9a3e.gif',
      messageType: 'image',
      createdAt: firestore.FieldValue.serverTimestamp(),
      user: {
        _id: user?.id,
        name: user?.firstName,
        avatar: user?.profileImage,
        token: user?.token,
        role: user?.role,
      },
    };

    const result = await firestore()
      .collection(collection)
      .doc(docId)
      .collection('messages')
      .add(waitingSendImageMessage);

    const image = await cloudinaryUpload(
      messageImage,
      `/PortManagement/${collection}/${docId}/Photos`,
    );

    await firestore()
      .collection(collection)
      .doc(docId)
      .collection('messages')
      .doc(result.id)
      .update({
        ...waitingSendImageMessage,
        image: image,
      });

    await firestore()
      .collection(collection)
      .doc(docId)
      .collection('photos')
      .add({
        createdAt: firestore.FieldValue.serverTimestamp(),
        image: image,
      });
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
  }
};

export default uploadMessagePhoto;
