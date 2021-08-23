import React from 'react';
import {View, TouchableWithoutFeedback} from 'react-native';

import {Info} from '../../components/Check';
import ChatButtonWithMessagesCounter from '../../components/ChatButtonWithMessagesCounter';

// UI
import PageLayout from '../../components/PageLayout';

import CustomButton from '../../components/Elements/CustomButton';
import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../Theme/Variables';
import {sendOwnerChecklist} from '../../components/Alerts/checklist';
import finishAndSendChecklist from '../../Services/finshAndSendChecklist';

import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {openScreenWithPush, popScreen} from '../../Router/utils/actions';
import {PAGE_OPTIONS_SCREEN_KEY} from '../../Router/utils/routerKeys';
import {CHECKLISTS} from '../../utils/firebaseKeys';
import {useTranslation} from 'react-i18next';

const CheckScreen = ({route}) => {
  const {docId} = route.params;
  const {t} = useTranslation();
  const [checks, checksLoading] = useCollectionData(
    firestore().collection(CHECKLISTS).doc(docId).collection('checks'),
    {
      idField: 'id',
    },
  );

  const user = useSelector(userSelector);
  const areAllChecksDone =
    checks?.length === checks?.filter((check) => check.done).length;

  const handleFinishAndSend = () => {
    finishAndSendChecklist(docId);
    popScreen();
  };

  return (
    <React.Fragment>
      <ChatButtonWithMessagesCounter collection={CHECKLISTS} docId={docId} />
      <PageLayout
        safe
        backButton
        titleRightSide={
          user.role === 'admin' && (
            <TouchableWithoutFeedback
              onPress={() => {
                openScreenWithPush(PAGE_OPTIONS_SCREEN_KEY, {
                  collection: CHECKLISTS,
                  docId,
                  showDelete: true,
                  duplicate: true,
                });
              }}>
              <View>
                <Icon name="settings" size={25} color={Colors.white} />
              </View>
            </TouchableWithoutFeedback>
          )
        }
        titleProps={{
          subPage: true,
        }}
        footer={
          areAllChecksDone &&
          user.role === 'admin' &&
          !checksLoading && (
            <CustomButton
              styled="rounded"
              loading={false}
              title={t('check.done')}
              onPress={() => sendOwnerChecklist(() => handleFinishAndSend())}
            />
          )
        }>
        <Info />
      </PageLayout>
    </React.Fragment>
  );
};

export default CheckScreen;
