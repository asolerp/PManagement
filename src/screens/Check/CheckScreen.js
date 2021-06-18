import React, {useMemo} from 'react';
import {View, TouchableWithoutFeedback} from 'react-native';

import {Info} from '../../components/Check';
import ChatButtonWithMessagesCounter from '../../components/ChatButtonWithMessagesCounter';

// UI
import PageLayout from '../../components/PageLayout';

import CustomButton from '../../components/Elements/CustomButton';
import {shallowEqual, useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../Theme/Variables';
import {sendOwnerChecklist} from '../../components/Alerts/checklist';
import finishAndSendChecklist from '../../Services/finshAndSendChecklist';

import firestore from '@react-native-firebase/firestore';
import {useDocumentDataOnce} from 'react-firebase-hooks/firestore';
import {openScreenWithPush} from '../../Router/utils/actions';
import {PAGE_OPTIONS_SCREEN_KEY} from '../../Router/utils/routerKeys';
import {CHECKLISTS} from '../../utils/firebaseKeys';

const CheckScreen = ({route}) => {
  const {docId} = route.params;

  const query = useMemo(() => {
    return firestore().collection(CHECKLISTS).doc(docId);
  }, [docId]);

  const [checklist, loadingChecklist] = useDocumentDataOnce(query, {
    idField: 'id',
  });

  const user = useSelector(userSelector, shallowEqual);

  const handleFinishAndSend = () => {
    finishAndSendChecklist(docId);
  };

  return (
    <React.Fragment>
      <ChatButtonWithMessagesCounter collection={CHECKLISTS} docId={docId} />
      <PageLayout
        safe
        backButton
        titleRightSide={
          <TouchableWithoutFeedback
            onPress={() => {
              openScreenWithPush(PAGE_OPTIONS_SCREEN_KEY, {
                collection: CHECKLISTS,
                docId: docId,
              });
            }}>
            <View>
              <Icon name="settings" size={25} color={Colors.white} />
            </View>
          </TouchableWithoutFeedback>
        }
        titleProps={{
          subPage: true,
          title: `Checklist en ${
            checklist?.house && checklist?.house[0]?.houseName
          }`,
          color: 'white',
        }}
        footer={
          checklist?.done === checklist?.total &&
          user.role === 'admin' && (
            <CustomButton
              styled="rounded"
              loading={false}
              title="Finalizar y enviar al propietario"
              onPress={() => sendOwnerChecklist(() => handleFinishAndSend())}
            />
          )
        }>
        {!loadingChecklist && <Info />}
      </PageLayout>
    </React.Fragment>
  );
};

export default CheckScreen;
