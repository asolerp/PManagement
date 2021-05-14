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
import {useGetFirebase} from '../../hooks/useGetFirebase';
import {useTheme} from '../../Theme';

// UI
import Avatar from '../Avatar';
import InfoIcon from '../InfoIcon';
import SituationIncidence from '../SituationIncidence';
import ImageViewer from 'react-native-image-zoom-viewer';

const styles = StyleSheet.create({});

const Info = () => {
  const {Layout} = useTheme();
  const [modal, setModal] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  const route = useRoute();

  const {incidenceId} = route.params;
  const {document: incidence} = useGetFirebase('incidences', incidenceId);

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

  return (
    <ScrollView style={styles.container}>
      <Modal
        visible={modal}
        transparent={true}
        onRequestClose={() => setModal(false)}>
        <ImageViewer
          index={imageIndex}
          imageUrls={incidence?.photos?.map((url) => ({url: url}))}
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
          {moment(incidence?.date?.toDate()).format('LL')}
        </Text>
        <InfoIcon
          info={incidence.done ? 'Resuelta' : 'Sin resolver'}
          color={incidence.done ? '#7dd891' : '#ED7A7A'}
        />
      </View>
      <SituationIncidence incidence={incidence} />
      <Text style={defaultLabel}>🏡 {incidence?.house?.houseName}</Text>
      <Text style={styles.title}>{incidence?.title}</Text>
      <Text style={{...defaultLabel, ...marginBottom(10)}}>Informador</Text>
      <View style={styles.workers}>
        <Avatar
          uri={incidence?.user?.profileImage}
          name={incidence?.user?.firstName}
          size="big"
        />
      </View>
      <Text style={{...defaultLabel, ...marginBottom(10)}}>Incidencia</Text>
      <TextWrapper>
        <Text style={styles.observations}>{incidence?.incidence}</Text>
      </TextWrapper>
      <Text style={{...defaultLabel, ...marginBottom(10)}}>Fotos</Text>
      <View style={styles.photosWrapper}>
        {incidence?.photos?.map((photo, i) => (
          <IncidenceImage photo={photo} index={i} key={photo} />
        ))}
      </View>
    </ScrollView>
  );
};

export default Info;
