import {useRoute} from '@react-navigation/core';
import moment from 'moment';
import React, {useState} from 'react';
import {StyleSheet, View, Text, TouchableWithoutFeedback} from 'react-native';
import {useTheme} from '../../Theme';
import {BottomModal, ModalContent} from 'react-native-modals';

// UI
import Avatar from '../Avatar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SituationIncidence from '../SituationIncidence';

import firestore from '@react-native-firebase/firestore';
import {useDocument} from 'react-firebase-hooks/firestore';

import {Colors} from '../../Theme/Variables';
import EditableInput from '../Elements/EditableInput';
import updateIncidenceInput from '../../Services/updateIncidenceInput';
import Badge from '../Elements/Badge';
import DynamicSelectorList from '../DynamicSelectorList';
import {asignWorkerToIncidence} from '../../Services/asignWorkerToIncidence';

const styles = StyleSheet.create({
  asignerContainer: {
    width: 42,
    height: 42,
    borderRadius: 100,
    backgroundColor: Colors.pm,
  },
  saveButton: {
    position: 'absolute',
    bottom: 0,
  },
});

const Info = () => {
  const {Layout, Gutters, Fonts} = useTheme();
  const [modalVisible, setModalVisible] = useState();
  const [workers, setWorkers] = useState();
  const route = useRoute();

  const {incidenceId} = route.params;

  const [value, loading] = useDocument(
    firestore().doc(`incidences/${incidenceId}`),
    {
      snapshotListenOptions: {includeMetadataChanges: true},
    },
  );

  if (loading) {
    <Text>Cargando incidencia</Text>;
  }

  const asignedUsers = workers || value?.data().workers;

  const handleAsignWorker = async (asignedWorkers) => {
    await asignWorkerToIncidence(incidenceId, {
      workers: asignedWorkers,
      workersId: asignedWorkers?.map((worker) => worker.id),
    });
  };

  return (
    <React.Fragment>
      <BottomModal
        modalStyle={{borderRadius: 30}}
        height={0.9}
        visible={modalVisible}
        onSwipeOut={(event) => {
          setModalVisible(false);
        }}
        onTouchOutside={() => {
          setModalVisible(false);
        }}>
        <ModalContent style={{flex: 1, alignItems: 'center'}}>
          <DynamicSelectorList
            collection="users"
            store="jobForm"
            where={[
              {
                label: 'role',
                operator: '==',
                condition: 'worker',
              },
            ]}
            searchBy="firstName"
            schema={{img: 'profileImage', name: 'firstName'}}
            get={asignedUsers}
            set={(workers) => setWorkers(workers)}
            onSave={handleAsignWorker}
            multiple={true}
            closeModal={() => setModalVisible(false)}
          />
        </ModalContent>
      </BottomModal>
      <View style={[Layout.row, Gutters.smallBMargin]}>
        {(!value?.data()?.workers || value?.data()?.workers.length === 0) && (
          <Badge
            text={'Sin asginar'}
            variant={'danger'}
            containerStyle={Gutters.tinyRMargin}
          />
        )}
        <Badge
          text={value?.data()?.done ? 'Resuelta' : 'Sin resolver'}
          variant={value?.data()?.done ? 'success' : 'danger'}
        />
      </View>
      <View
        style={[
          Layout.rowCenter,
          Layout.alignItemsCenter,
          Layout.justifyContentSpaceBetween,
          Gutters.smallBMargin,
        ]}>
        <Text style={[Fonts.textTitle]}>{value?.data()?.title}</Text>
      </View>
      <EditableInput
        value={value?.data()?.incidence}
        onPressAccept={(change) =>
          updateIncidenceInput(incidenceId, {incidence: change})
        }
      />
      <Badge
        text={value?.data()?.house?.houseName}
        variant="purple"
        containerStyle={Gutters.smallVMargin}
      />
      <Badge
        label="Fecha: "
        text={moment(value?.data()?.date?.toDate()).format('LL')}
      />
      <SituationIncidence incidence={{...value?.data(), id: value?.id}} />
      <View style={[Layout.row]}>
        <View
          style={[
            Layout.colCenter,
            Layout.justifyContentStart,
            Layout.alignItemsStart,
            Gutters.smallVMargin,
            Gutters.regularRMargin,
          ]}>
          <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>
            Informador
          </Text>
          <Avatar uri={value?.data()?.user?.profileImage} size="big" />
        </View>
        <View
          style={[
            Layout.colCenter,
            Layout.justifyContentStart,
            Layout.alignItemsStart,
            Gutters.smallVMargin,
          ]}>
          <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>
            Asignado a
          </Text>
          <View style={[Layout.row]}>
            <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>
              <View
                style={[
                  Layout.colCenter,
                  Gutters.smallRMargin,
                  styles.asignerContainer,
                ]}>
                <Icon name="person" color={Colors.white} size={20} />
              </View>
            </TouchableWithoutFeedback>
            {asignedUsers?.map((worker, i) => (
              <Avatar
                overlap={asignedUsers?.length > 1}
                index={i}
                id={worker.id}
                key={worker.id}
                uri={worker.profileImage}
                size="big"
              />
            ))}
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

export default Info;
