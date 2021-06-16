import React, {useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {View, StyleSheet, TouchableOpacity} from 'react-native';

// UI
import CustomButton from '../../components/Elements/CustomButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AddButton from '../../components/Elements/AddButton';
import {Info} from '../../components/Incidence';

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
import {openScreenWithPush, popScreen} from '../../Router/utils/actions';
import {
  CHAT_SCREEN_KEY,
  PAGE_OPTIONS_SCREEN_KEY,
} from '../../Router/utils/routerKeys';
import {INCIDENCES} from '../../utils/firebaseKeys';
import {useTheme} from '../../Theme';

const IncidenceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {Layout} = useTheme();

  const {incidenceId} = route.params;
  const [incidence] = useDocumentDataOnce(
    firestore().doc(`incidences/${incidenceId}`),
    {
      snapshotListenOptions: {includeMetadataChanges: true},
    },
  );

  const {updateFirebase} = useUpdateFirebase('incidences');

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
      console.log(err);
    } finally {
      navigation.goBack();
    }
  };

  return (
    <React.Fragment>
      <AddButton
        iconName="chat"
        bottom={100}
        onPress={() =>
          openScreenWithPush(CHAT_SCREEN_KEY, {
            collection: INCIDENCES,
            docId: incidenceId,
          })
        }
      />
      <PageLayout
        safe
        titleLefSide={
          <TouchableOpacity
            onPress={() => {
              popScreen();
            }}>
            <View>
              <Icon name="arrow-back" size={25} color={Colors.white} />
            </View>
          </TouchableOpacity>
        }
        titleRightSide={
          <TouchableOpacity
            onPress={() => {
              openScreenWithPush(PAGE_OPTIONS_SCREEN_KEY, {
                collection: INCIDENCES,
                docId: incidenceId,
              });
            }}>
            <View>
              <Icon name="settings" size={25} color={Colors.white} />
            </View>
          </TouchableOpacity>
        }
        footer={
          <CustomButton
            loading={false}
            styled="rounded"
            title={
              incidence?.done ? 'Incidencia resuelta' : 'Resolver incidencia'
            }
            onPress={() => {
              if (incidence?.done) {
                openIncidence(() => handleFinishTask(false));
              } else {
                finishIncidence(() => handleFinishTask(true));
              }
            }}
          />
        }
        titleProps={{
          title: 'Incidencia',
          subPage: true,
        }}>
        <Info />
      </PageLayout>
    </React.Fragment>
  );
};

export default React.memo(IncidenceScreen);
