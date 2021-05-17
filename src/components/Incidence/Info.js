import {useRoute} from '@react-navigation/core';
import moment from 'moment';
import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Modal,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {useTheme} from '../../Theme';

// UI
import Avatar from '../Avatar';
import InfoIcon from '../InfoIcon';
import SituationIncidence from '../SituationIncidence';
import ImageViewer from 'react-native-image-zoom-viewer';
import {defaultLabel, marginBottom} from '../../styles/common';
import TextWrapper from '../TextWrapper';

import firestore from '@react-native-firebase/firestore';

import {useDocument} from 'react-firebase-hooks/firestore';
import {TextInput} from 'react-native';
import {Colors} from '../../Theme/Variables';

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
  const [modal, setModal] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  const route = useRoute();

  const {incidenceId} = route.params;

  const [value, loading] = useDocument(
    firestore().doc(`incidences/${incidenceId}`),
    {
      snapshotListenOptions: {includeMetadataChanges: true},
    },
  );

  const handlePressPhoto = (i) => {
    setModal(true);
    setImageIndex(i);
  };

  const IncidenceImage = ({photo, index}) => {
    return (
      <TouchableOpacity onPress={() => handlePressPhoto(index)}>
        <ImageBackground
          source={{uri: photo}}
          style={styles.incidenceImage}
          imageStyle={{borderRadius: 5}}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    <Text>Cargando incidencia</Text>;
  }

  return (
    <ScrollView style={[styles.container, Gutters.mediumTMargin]}>
      <Modal
        visible={modal}
        transparent={true}
        onRequestClose={() => setModal(false)}>
        <ImageViewer
          index={imageIndex}
          imageUrls={value?.data()?.photos?.map((url) => ({url: url}))}
          onSwipeDown={() => {
            setModal(false);
          }}
          enableSwipeDown={true}
        />
      </Modal>
      <View
        style={[
          Layout.fill,
          Layout.rowCenter,
          Layout.alignItemsCenter,
          Layout.justifyContentSpaceBetween,
        ]}>
        <Text style={styles.date}>
          🕜 {moment(value?.data()?.date?.toDate()).format('LL')}
        </Text>
        <InfoIcon
          info={value?.data()?.done ? 'Resuelta' : 'Sin resolver'}
          color={value?.data()?.done ? '#7dd891' : '#ED7A7A'}
        />
      </View>
      <SituationIncidence incidence={{...value?.data(), id: value?.id}} />
      <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>
        🏡 {value?.data()?.house?.houseName}
      </Text>
      <Text style={[Fonts.smallBMargin]}>{value?.data()?.title}</Text>
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
      <Text style={{...defaultLabel, ...marginBottom(10)}}>Incidencia</Text>
      <TextInput style={styles.observations} multiline numberOfLines={4}>
        {value?.data()?.incidence}
      </TextInput>
    </ScrollView>
  );
};

export default Info;
