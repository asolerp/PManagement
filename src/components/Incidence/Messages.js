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
import {useGetDocFirebase} from '../../hooks/useGetDocFIrebase';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import {useGetFirebase} from '../../hooks/useGetFirebase';
import {setMessagesAsRead} from '../../firebase/setMessagesAsRead';

// Utils
import {launchImage} from '../../utils/imageFunctions';
import {cloudinaryUpload} from '../../cloudinary/index';
import {messageIdGenerator} from '../../utils/uuid';
import {Platform} from 'react-native';
import {userSelector} from '../../Store/User/userSlice';

const Messages = () => {
  const route = useRoute();
  const {incidenceId} = route.params;

  const [messageImage, setMessageImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(null);
  const [local, setLocal] = useState([]);

  const {list: messages, loading: loadingMessages} = useGetFirebase(
    `incidences/${incidenceId}/messages`,
    {
      field: 'createdAt',
      type: 'desc',
    },
  );

  const user = useSelector(userSelector, shallowEqual);
  const {document: userLoggedIn} = useGetDocFirebase('users', user.uid);
  const {addFirebase: addMessage} = useAddFirebase();

  const {updateFirebase} = useUpdateFirebase('jobs');

  const {addFirebase: addPhoto, loading: loadingAddPhoto} = useAddFirebase();

  const onSendImage = () => {
    launchImage(setMessageImage);
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
    if (messages.length > 0) {
      setMessagesAsRead(incidenceId, user.uid);
    }
  }, [messages, incidenceId, user.uid]);

  useEffect(() => {
    const uploadImage = async () => {
      const messageID = messageIdGenerator();

      const waitingSendImageMessage = {
        _id: messageID,
        image:
          'https://res.cloudinary.com/enalbis/image/upload/v1614849090/PortManagement/loader_ro9a3e.gif',
        messageType: 'image',
        createdAt: firestore.FieldValue.serverTimestamp(),
        user: {
          _id: userLoggedIn?.id,
          name: userLoggedIn?.firstName,
          avatar: userLoggedIn?.profileImage,
          token: userLoggedIn?.token,
          role: userLoggedIn?.role,
        },
      };

      const result = await addMessage(
        `incidences/${incidenceId}/messages`,
        waitingSendImageMessage,
      );

      const image = await cloudinaryUpload(
        messageImage,
        `/PortManagement/Incidences/${incidenceId}/Photos`,
      );

      updateFirebase(`${incidenceId}/messages/${result.id}`, {
        ...waitingSendImageMessage,
        image: image,
      });

      addPhoto(`incidences/${incidenceId}/photos`, {
        createdAt: firestore.FieldValue.serverTimestamp(),
        image: image,
      });
    };
    if (messageImage !== null) {
      uploadImage();
    }
  }, [
    messageImage,
    addMessage,
    addPhoto,
    incidenceId,
    updateFirebase,
    userLoggedIn,
  ]);

  const renderCustomView = (props) => {
    return <CustomView {...props} />;
  };

  return (
    <View
      style={{
        height: Platform.OS === 'ios' ? '98%' : '96%',
        marginTop: 20,
        marginBottom: 20,
      }}>
      <GiftedChat
        bottomOffset={-3}
        isLoadingEarlier={loadingAddPhoto}
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
          _id: userLoggedIn?.id,
          name: userLoggedIn?.firstName,
          avatar: userLoggedIn?.profileImage,
          token: userLoggedIn?.token,
          role: userLoggedIn?.role,
        }}
      />
    </View>
  );
};

export default React.memo(Messages);
