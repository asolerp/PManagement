import React from 'react';

import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';
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
import {Colors} from '../../Theme/Variables';
import useChat from '../../Screens/Chat/utils/useChat';

const styles = StyleSheet.create({
  inputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cccccc',
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

const Chat = ({collection, docId}) => {
  const user = useSelector(userSelector);
  const {messages, onSendMessage, onSendImage} = useChat({collection, docId});

  const {Gutters, Layout} = useTheme();
  return (
    <View style={[Layout.fill, Gutters.smallTMargin]}>
      <GiftedChat
        bottomOffset={1}
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
        renderLoading={() => (
          <ActivityIndicator size="small" color={Colors.pm} />
        )}
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

export default Chat;
