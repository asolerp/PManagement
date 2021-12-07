import React from 'react';

import AddButton from './Elements/AddButton';
import useNoReadMessages from '../hooks/useNoReadMessages';
import {openScreenWithPush} from '../Router/utils/actions';
import {CHAT_SCREEN_KEY} from '../Router/utils/routerKeys';

const ChatButtonWithMessagesCounter = ({collection, docId}) => {
  const {noReadCounter} = useNoReadMessages({collection, docId});

  return (
    <AddButton
      badgeCount={noReadCounter}
      iconName="chat"
      bottom={80}
      onPress={() =>
        openScreenWithPush(CHAT_SCREEN_KEY, {
          collection: collection,
          docId: docId,
        })
      }
    />
  );
};

export default ChatButtonWithMessagesCounter;
