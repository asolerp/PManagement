import React from 'react';
import {TouchableWithoutFeedback, View} from 'react-native';
import PageLayout from '../../components/PageLayout';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Chat from '../../components/Chat/Chat';
import {Colors} from '../../Theme/Variables';
import {popScreen} from '../../Router/utils/actions';

import Avatar from '../../components/Avatar';

import {useConfigChatByNotification} from './utils/useConfigChatByNotificacion';

const ChatScreen = ({route}) => {
  const {collection, docId} = route.params;
  const {header, onPressHeader, chat} = useConfigChatByNotification(
    route.params,
  );

  return (
    <PageLayout
      safe
      titleLefSide={
        chat?.user && (
          <Avatar
            id={chat?.user.id}
            key={chat?.user.id}
            uri={chat?.user.profileImage}
            size="medium"
          />
        )
      }
      titleRightSide={
        <TouchableWithoutFeedback
          onPress={() => {
            popScreen();
          }}>
          <View>
            <Icon name="close" size={25} color={Colors.white} />
          </View>
        </TouchableWithoutFeedback>
      }
      titleProps={{
        title: header,
        subPage: true,
        onPress: onPressHeader,
      }}>
      <Chat collection={collection} docId={docId} />
    </PageLayout>
  );
};

export default ChatScreen;
