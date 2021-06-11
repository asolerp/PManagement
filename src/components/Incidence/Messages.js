import React, {useState, useCallback, useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import {
  GiftedChat,
  Actions,
  Bubble,
  InputToolbar,
  CustomView,
  Send,
} from 'react-native-gifted-chat';
import {View, Text, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

//Chat
import RenderDay from '../Chat/RenderDay';

// Redux
import {useSelector, shallowEqual} from 'react-redux';
import {useAddFirebase} from '../../hooks/useAddFirebase';

// Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {setMessagesAsRead} from '../../firebase/setMessagesAsRead';

// Utils
import {launchImage} from '../../utils/imageFunctions';
import {Platform} from 'react-native';
import {userSelector} from '../../Store/User/userSlice';
import uploadMessagePhoto from '../../Services/uploadMessagePhoto';

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
        createdAt: firestore.FieldValue.serverTimestamp(),
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
    <View
      style={{
        height: Platform.OS === 'ios' ? '98%' : '96%',
        marginTop: 20,
        marginBottom: 20,
      }}>
      <GiftedChat
        bottomOffset={-3}
        renderBubble={(props) => (
          <Bubble
            {...props}
            textStyle={{
              right: {
                color: 'white',
              },
            }}
            wrapperStyle={{
              right: {
                backgroundColor: '#5BAB9C',
              },
            }}
          />
        )}
        renderLoading={() => <ActivityIndicator size="large" color="#0000ff" />}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            onPressActionButton={() => onSendImage()}
            containerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#cccccc',
              marginBottom: 15,
            }}
          />
        )}
        messages={GiftedChat.append(messages, local)}
        messagesContainerStyle={{paddingBottom: 20}}
        renderActions={(props) => (
          <Actions
            {...props}
            icon={() => (
              <Icon name="camera-alt" size={25} color={'#4F8AA3'} style={{}} />
            )}
          />
        )}
        renderDay={(props) => <RenderDay message={props} />}
        renderTime={(props) => (
          <View style={props.containerStyle}>
            <Text
              style={{
                marginHorizontal: 10,
                marginBottom: 5,
                color: props.position === 'left' ? 'black' : 'white',
              }}>
              {`${props.currentMessage.createdAt
                .toDate()
                .toLocaleString('es-ES', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: false,
                })}`}
            </Text>
          </View>
        )}
        renderSend={(props) => {
          return (
            <Send
              {...props}
              containerStyle={{
                borderWidth: 0,
                flexDirection: 'column',
                justifyContent: 'center',
                marginRight: 20,
              }}>
              <Icon name="send" color={'#4F8AA3'} style={{borderWidth: 0}} />
            </Send>
          );
        }}
        showUserAvatar
        onSend={(messages) => onSend(messages)}
        user={{
          _id: user?.id,
          name: user?.firstName,
          avatar: user?.profileImage,
          token: user?.token,
          role: user?.role,
        }}
      />
    </View>
  );
};

export default React.memo(Messages);
