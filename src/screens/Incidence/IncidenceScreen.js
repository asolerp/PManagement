import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {View, TouchableOpacity, ScrollView} from 'react-native';

// UI
import CustomButton from '../../components/Elements/CustomButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChatButtonWithMessagesCounter from '../../components/ChatButtonWithMessagesCounter';
import {Info, Photos} from '../../components/Incidence';

// Firebase
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import firestore from '@react-native-firebase/firestore';
import {useDocumentDataOnce} from 'react-firebase-hooks/firestore';

// Utils
import PageLayout from '../../components/PageLayout';

import {
  finishIncidence,
  openIncidence,
} from '../../components/Alerts/incidences';

import {firebase} from '@react-native-firebase/firestore';

import {Colors} from '../../Theme/Variables';
import {openScreenWithPush} from '../../Router/utils/actions';
import {PAGE_OPTIONS_SCREEN_KEY} from '../../Router/utils/routerKeys';
import {INCIDENCES} from '../../utils/firebaseKeys';

import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';
import {useTranslation} from 'react-i18next';
import {error} from '../../lib/logging';

const IncidenceScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const route = useRoute();
  const {incidenceId} = route.params;
  const user = useSelector(userSelector);
  const [incidence] = useDocumentDataOnce(
    firestore().doc(`${INCIDENCES}/${incidenceId}`),
    {
      snapshotListenOptions: {includeMetadataChanges: true},
    },
  );

  const {updateFirebase} = useUpdateFirebase(INCIDENCES);

  const handleFinishTask = async (status) => {
    try {
      if (status) {
        await updateFirebase('stats', {
          count: firebase.firestore.FieldValue.increment(-1),
        });
      } else {
        await updateFirebase('stats', {
          count: firebase.firestore.FieldValue.increment(1),
        });
      }
      await updateFirebase(`${incidenceId}`, {
        done: status,
      });
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    } finally {
      navigation.goBack();
    }
  };

  return (
    <React.Fragment>
      <ChatButtonWithMessagesCounter
        collection={INCIDENCES}
        docId={incidenceId}
      />
      <PageLayout
        safe
        backButton
        titleRightSide={
          user.role === 'admin' && (
            <TouchableOpacity
              onPress={() => {
                openScreenWithPush(PAGE_OPTIONS_SCREEN_KEY, {
                  collection: INCIDENCES,
                  docId: incidenceId,
                  editable: false,
                  showDelete: true,
                  duplicate: false,
                });
              }}>
              <View>
                <Icon name="settings" size={25} color={Colors.white} />
              </View>
            </TouchableOpacity>
          )
        }
        footer={
          user.role === 'admin' && (
            <CustomButton
              loading={false}
              styled="rounded"
              title={
                incidence?.done
                  ? t('incidence.resolved')
                  : t('incidence.no_resolved')
              }
              onPress={() => {
                if (incidence?.done) {
                  openIncidence(() => handleFinishTask(false));
                } else {
                  finishIncidence(() => handleFinishTask(true));
                }
              }}
            />
          )
        }
        titleProps={{
          subPage: true,
        }}>
        <View style={{flex: 1, marginTop: 15}}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Info />
            <Photos />
          </ScrollView>
        </View>
      </PageLayout>
    </React.Fragment>
  );
};

export default React.memo(IncidenceScreen);
