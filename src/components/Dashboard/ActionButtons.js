import React from 'react';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {openScreenWithPush} from '../../Router/utils/actions';

import {
  NEW_CHECKLIST_SCREEN,
  NEW_INCIDENCE_SCREEN_KEY,
  NEW_JOB_STACK_KEY,
} from '../../Router/utils/routerKeys';
import {Colors} from '../../Theme/Variables';

export const ActionButtons = () => {
  return (
    <ActionButton buttonColor={Colors.danger} style={{zIndex: 10}} offsetX={20}>
      <ActionButton.Item
        buttonColor={Colors.rightGreen}
        onPress={() => openScreenWithPush(NEW_CHECKLIST_SCREEN)}>
        <Icon name="check" color={Colors.white} size={20} />
      </ActionButton.Item>
      <ActionButton.Item
        buttonColor={Colors.warning}
        onPress={() => openScreenWithPush(NEW_INCIDENCE_SCREEN_KEY)}>
        <Icon name="warning" color={Colors.white} size={20} />
      </ActionButton.Item>
      <ActionButton.Item
        buttonColor={Colors.pm}
        onPress={() => openScreenWithPush(NEW_JOB_STACK_KEY)}>
        <Icon name="construction" color={Colors.white} size={20} />
      </ActionButton.Item>
    </ActionButton>
  );
};
