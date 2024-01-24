import React from 'react';

import {Info} from '../../components/Check';


// UI
import PageLayout from '../../components/PageLayout';

import CustomButton from '../../components/Elements/CustomButton';
import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';

import {sendOwnerChecklist} from '../../components/Alerts/checklist';

import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

import {CHECKLISTS} from '../../utils/firebaseKeys';
import {useTranslation} from 'react-i18next';
import {useCheck} from './hooks/useCheck';
import PageOptionsScreen from '../PageOptions/PageOptions';
import {useNotifyOwner} from '../../utils/useNotifyOwner';
import {error} from '../../lib/logging';

const CheckScreen = ({route}) => {
  const {docId} = route.params;
  const {t} = useTranslation();

  const {isCheckFinished} = useCheck({docId});
  const {notifyOwner} = useNotifyOwner();
  const [checks, checksLoading] = useCollectionData(
    firestore().collection(CHECKLISTS).doc(docId).collection('checks'),
    {
      idField: 'id',
    },
  );

  const user = useSelector(userSelector);
  const areAllChecksDone =
    checks?.length === checks?.filter((check) => check.done).length;

  const handleFinishAndSend = async () => {
    try {
      await notifyOwner(docId);
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    }
  };

  return (
    <React.Fragment>
      <PageLayout
        safe
        backButton
        titleRightSide={
          <PageOptionsScreen
            editable={!isCheckFinished}
            collection={CHECKLISTS}
            docId={docId}
            showDelete={true}
            duplicate={true}
          />
        }
        titleProps={{
          subPage: true,
        }}
        footer={
          areAllChecksDone &&
          user.role === 'admin' &&
          !checksLoading &&
          !isCheckFinished && (
            <CustomButton
              styled="rounded"
              loading={false}
              title={t('check.done')}
              onPress={() => sendOwnerChecklist(() => handleFinishAndSend())}
            />
          )
        }>
        <Info isCheckFinished={isCheckFinished} />
      </PageLayout>
    </React.Fragment>
  );
};

export default CheckScreen;
