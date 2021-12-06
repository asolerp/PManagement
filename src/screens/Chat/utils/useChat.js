import {useEffect, useCallback} from 'react';
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import {useSelector} from 'react-redux';
import {setMessagesAsRead} from '../../../firebase/setMessagesAsRead';
import {useAddFirebase} from '../../../hooks/useAddFirebase';
import uploadMessagePhoto from '../../../Services/uploadMessagePhoto';
import {userSelector} from '../../../Store/User/userSlice';
import {launchImage} from '../../../utils/imageFunctions';
import firestore from '@react-native-firebase/firestore';

const useChat = ({collection, docId}) => {
  const [entity] = useDocumentData(
    firestore().collection(collection).doc(docId),
    {
      idField: 'id',
    },
  );

  const [messages] = useCollectionData(
    firestore()
      .collection(collection)
      .doc(docId)
      .collection('messages')
      .orderBy('createdAt', 'desc'),
    {
      idField: 'id',
    },
  );

  const user = useSelector(userSelector);

  const {addFirebase: addMessage} = useAddFirebase();

  const onSendImage = () => {
    launchImage((messageImage) =>
      uploadMessagePhoto(collection, docId, messageImage, user),
    );
  };

  const onSend = useCallback(
    (messages = []) => {
      addMessage(`${collection}/${docId}/messages`, {
        ...messages[0],
        createdAt: new Date(),
        sent: true,
        received: entity?.workersId.reduce(
          (acc, worker) => ({
            ...acc,
            [worker]: false,
          }),
          {},
        ),
      });
    },
    [addMessage, collection, docId, entity],
  );

  useEffect(() => {
    if (messages?.length > 0) {
      setMessagesAsRead(docId, user.id, collection);
    }
  }, [messages, docId, collection, user.id]);

  return {
    messages,
    onSendMessage: onSend,
    onSendImage,
  };
};

export default useChat;
