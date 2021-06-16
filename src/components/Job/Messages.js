import React, {useState, useCallback, useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import {
  GiftedChat,
  Actions,
  Bubble,
  InputToolbar,
  Send,
} from 'react-native-gifted-chat';
import {View, Text, ActivityIndicator, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

//Chat
import RenderDay from '../Chat/RenderDay';

// Redux
import {useSelector, shallowEqual} from 'react-redux';
import {useAddFirebase} from '../../hooks/useAddFirebase';

// Firebase
import firestore from '@react-native-firebase/firestore';
import {useGetDocFirebase} from '../../hooks/useGetDocFIrebase';

import {setMessagesAsRead} from '../../firebase/setMessagesAsRead';

// Utils
import {launchImage} from '../../utils/imageFunctions';
import {Platform} from 'react-native';
import {userSelector} from '../../Store/User/userSlice';
import uploadMessagePhoto from '../../Services/uploadMessagePhoto';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {format} from 'date-fns/esm';
import moment from 'moment';
import Chat from '../Chat/Chat';

const Messages = () => {
  const route = useRoute();
  const {jobId} = route.params;

  const [messages] = useCollectionData(
    firestore()
      .collection('jobs')
      .doc(jobId)
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
      uploadMessagePhoto('jobs', jobId, messageImage, user),
    );
  };
  const onSend = useCallback(
    (messages = []) => {
      addMessage(`jobs/${jobId}/messages`, {
        ...messages[0],
        createdAt: firestore.FieldValue.serverTimestamp(),
        sent: true,
        received: false,
      });
    },
    [addMessage, jobId],
  );

  useEffect(() => {
    if (messages?.length > 0) {
      setMessagesAsRead(jobId, user.uid, 'jobs');
    }
  }, [messages, jobId, user.uid]);

  return (
    <Chat
      onSendMessage={(msgs) => onSend(msgs)}
      onSendImage={onSendImage}
      messages={messages}
    />
    // <ScrollView
    //   contentContainerStyle={{
    //     height: Platform.OS === 'ios' ? '97%' : '96%',
    //     marginTop: 20,
    //     marginBottom: 20,
    //   }}>
    // </ScrollView>
  );
};

export default React.memo(Messages);
