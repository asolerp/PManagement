import React from 'react';
import {TouchableWithoutFeedback, View} from 'react-native';
import PageLayout from '../../components/PageLayout';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Chat from '../../components/Chat/Chat';

import {popScreen} from '../../Router/utils/actions';

import {useConfigChatByNotification} from './utils/useConfigChatByNotificacion';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';

const ChatScreen = ({route}) => {
  const {collection, docId} = route.params;
  const {header, onPressHeader} = useConfigChatByNotification(route.params);

  return (
    <PageLayout safe backButton>
      <>
        <ScreenHeader title={header} />
        <Chat collection={collection} docId={docId} />
      </>
    </PageLayout>
  );
};

export default ChatScreen;
