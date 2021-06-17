import React from 'react';
import {TouchableWithoutFeedback, View} from 'react-native';
import PageLayout from '../../components/PageLayout';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Chat from '../../components/Chat/Chat';
import {Colors} from '../../Theme/Variables';
import {popScreen} from '../../Router/utils/actions';

const ChatScreen = ({route}) => {
  const {collection, docId} = route.params;

  return (
    <PageLayout
      safe
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
        title: 'Chat',
        subPage: true,
      }}>
      <Chat collection={collection} docId={docId} />
    </PageLayout>
  );
};

export default ChatScreen;
