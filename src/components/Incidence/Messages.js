import React, {useState, useCallback, useEffect} from 'react';
import {useRoute} from '@react-navigation/native';

import {View, StyleSheet, Platform} from 'react-native';

// Redux
import {useSelector, shallowEqual} from 'react-redux';
import {useAddFirebase} from '../../hooks/useAddFirebase';

// Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {setMessagesAsRead} from '../../firebase/setMessagesAsRead';

// Utils
import {launchImage} from '../../utils/imageFunctions';
import {userSelector} from '../../Store/User/userSlice';
import uploadMessagePhoto from '../../Services/uploadMessagePhoto';
import Chat from '../Chat/Chat';

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? '96%' : '96%',
    marginTop: 20,
    marginBottom: 20,
  },
});

const Messages = () => {
  const route = useRoute();
  const {incidenceId} = route.params;

  const [local, setLocal] = useState([]);

  const [messages] = useCollectionData(
    firestore()
      .collection('incidences')
      .doc(incidenceId)
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
      uploadMessagePhoto('incidences', incidenceId, messageImage, user),
    );
  };

  const onSend = useCallback(
    (messages = []) => {
      addMessage(`incidences/${incidenceId}/messages`, {
        ...messages[0],
        createdAt: new Date(),
        sent: true,
        received: false,
      });
    },
    [addMessage, incidenceId],
  );

  useEffect(() => {
    if (messages?.length > 0) {
      setMessagesAsRead(incidenceId, user.uid, 'incidences');
    }
  }, [messages, incidenceId, user.uid]);

  return (
    <View style={styles.container}>
      <Chat
        onSendMessage={(msgs) => onSend(msgs)}
        onSendImage={onSendImage}
        messages={messages}
      />
    </View>
  );
};

export default React.memo(Messages);
