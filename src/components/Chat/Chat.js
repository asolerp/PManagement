import React from 'react';

import {
  View,
  ActivityIndicator,
  Text,
  Platform,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Bubble,
  GiftedChat,
  InputToolbar,
  Actions,
  Send,
} from 'react-native-gifted-chat';
import RenderDay from './RenderDay';
import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';
import {useTheme} from '../../Theme';
import moment from 'moment';

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? '99%' : '96%',
    marginTop: 20,
    marginBottom: 20,
  },
  inputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cccccc',
    marginBottom: 15,
  },
  timeStyle: {
    fontSize: 10,
    marginHorizontal: 10,
    marginBottom: 5,
  },
  sendButtonContainer: {
    borderWidth: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    marginRight: 20,
  },
  icon: {
    borderWidth: 0,
  },
});

const Chat = ({messages, onSendMessage, onSendImage}) => {
  const user = useSelector(userSelector);
  const {Gutters} = useTheme();
  return (
    <View style={styles.container}>
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
            containerStyle={styles.inputContainer}
          />
        )}
        messages={messages}
        messagesContainerStyle={[Gutters.mediumBPadding]}
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
              style={[
                styles.timeStyle,
                {color: props.position === 'left' ? 'black' : 'white'},
              ]}>
              {`${moment(props.currentMessage.createdAt.toDate()).format(
                'LT',
              )}`}
            </Text>
          </View>
        )}
        renderSend={(props) => {
          return (
            <Send {...props} containerStyle={styles.sendButtonContainer}>
              <Icon name="send" color={'#4F8AA3'} style={styles.icon} />
            </Send>
          );
        }}
        showUserAvatar
        onSend={(messages) => onSendMessage(messages)}
        user={{
          _id: user?.uid,
          name: user?.firstName,
          avatar: user?.profileImage,
          token: user?.token,
          role: user?.role,
        }}
      />
    </View>
  );
};

export default Chat;
