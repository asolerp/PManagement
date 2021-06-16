import {useEffect, useCallback} from 'react';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {shallowEqual, useSelector} from 'react-redux';
import {setMessagesAsRead} from '../../../firebase/setMessagesAsRead';
import {useAddFirebase} from '../../../hooks/useAddFirebase';
import uploadMessagePhoto from '../../../Services/uploadMessagePhoto';
import {userSelector} from '../../../Store/User/userSlice';
import {launchImage} from '../../../utils/imageFunctions';
import firestore from '@react-native-firebase/firestore';

const useChat = ({collection, docId}) => {
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

  const user = useSelector(userSelector, shallowEqual);
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
        received: false,
      });
    },
    [addMessage, collection, docId],
  );

  useEffect(() => {
    if (messages?.length > 0) {
      setMessagesAsRead(docId, user.uid, collection);
    }
  }, [messages, docId, collection, user.uid]);

  return {
    messages,
    onSendMessage: onSend,
    onSendImage,
  };
};

export default useChat;
