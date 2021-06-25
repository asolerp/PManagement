import {useRoute} from '@react-navigation/core';
import moment from 'moment';
import React, {useState} from 'react';
import {ScrollView, StyleSheet, Modal, View, Text} from 'react-native';
import {useTheme} from '../../Theme';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

// UI
import Avatar from '../Avatar';
import InfoIcon from '../InfoIcon';
import SituationIncidence from '../SituationIncidence';
import ImageViewer from 'react-native-image-zoom-viewer';
import {defaultLabel, marginBottom} from '../../styles/common';

import firestore from '@react-native-firebase/firestore';
import {useDocument} from 'react-firebase-hooks/firestore';

import {Colors} from '../../Theme/Variables';
import EditableInput from '../Elements/EditableInput';
import updateIncidenceInput from '../../Services/updateIncidenceInput';
import Badge from '../Elements/Badge';

const styles = StyleSheet.create({
  incidenceImage: {
    width: 80,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  observations: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.grey,
  },
});

const Info = () => {
  const {Layout, Gutters, Fonts} = useTheme();

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

  return (
    <React.Fragment>
      <View
        style={[
          Layout.rowCenter,
          Layout.alignItemsCenter,
          Layout.justifyContentSpaceBetween,
        ]}>
        <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>
          {value?.data()?.title}
        </Text>
        <Badge
          text={value?.data()?.done ? 'Resuelta' : 'Sin resolver'}
          variant={value?.data()?.done ? 'success' : 'danger'}
        />
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
      <View
        style={[
          Layout.colCenter,
          Layout.justifyContentStart,
          Layout.alignItemsStart,
          Gutters.smallVMargin,
        ]}>
        <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>Informador</Text>
        <Avatar uri={value?.data()?.user?.profileImage} size="big" />
      </View>
    </React.Fragment>
  );
};

export default Info;
