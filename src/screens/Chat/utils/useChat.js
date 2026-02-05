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
import { getFirestore, collection, doc, query, orderBy } from '@react-native-firebase/firestore';
import {useCameraOrLibrary} from '../../../hooks/useCamerOrLibrary';

const useChat = ({collection: collectionName, docId}) => {
  const db = getFirestore();
  const entityRef = doc(collection(db, collectionName), docId);
  
  const [entity] = useDocumentData(entityRef, {
    idField: 'id',
  });

  const messagesQuery = query(
    collection(entityRef, 'messages'),
    orderBy('createdAt', 'desc')
  );

  const [messages] = useCollectionData(messagesQuery, {
    idField: 'id',
  });

  const user = useSelector(userSelector);
  const {addFirebase: addMessage} = useAddFirebase();

  const onSendImage = async (messageImage) => {
    await uploadMessagePhoto(collectionName, docId, messageImage, user);
  };

  const onSend = useCallback(
    (messages = []) => {
      addMessage(`${collectionName}/${docId}/messages`, {
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
    [addMessage, collectionName, docId, entity],
  );

  useEffect(() => {
    if (messages?.length > 0) {
      setMessagesAsRead(docId, user.id, collectionName);
    }
  }, [messages, docId, collectionName, user.id]);

  return {
    messages,
    onSendMessage: onSend,
    onSendImage,
  };
};

export default useChat;
