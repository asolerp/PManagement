import React, {useCallback, useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';

// UI
import Avatar from '../components/Avatar';
import InfoIcon from '../components/InfoIcon';
import CustomButton from '../components/Elements/CustomButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Firebase
import {useUpdateFirebase} from '../hooks/useUpdateFirebase';
import {useGetDocFirebase} from '../hooks/useGetDocFIrebase';
import {useDeleteFirebase} from '../hooks/useDeleteFirebase';

// Redux
import {useSelector, useDispatch, shallowEqual} from 'react-redux';
import {editForm} from '../store/jobFormActions';

// Utils
import moment from 'moment';
import {
  finishTaskAlert,
  openTaskStatus,
} from '../components/Alerts/deleteJobAlert';
import {ScrollView} from 'react-native';
import PagetLayout from '../components/PageLayout';
import ImageViewer from 'react-native-image-zoom-viewer';
import {ImageBackground} from 'react-native';

import {finishIncidence, openIncidence} from '../components/Alerts/incidences';

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
  },
  infoWrapper: {
    width: '30%',
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonWrapper: {},
  date: {
    fontSize: 18,
    marginVertical: 10,
    color: '#3DB6BA',
  },
  label: {
    fontSize: 20,
    width: '90%',
    color: '#284748',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  houseName: {
    textAlign: 'left',
    fontSize: 25,
    width: '90%',
    color: '#284748',
    fontWeight: 'bold',
  },
  title: {
    textAlign: 'left',
    fontSize: 15,
    width: '90%',
    color: '#284748',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 30,
  },
  observations: {
    fontSize: 18,
    width: '90%',
    color: '#284748',
    marginBottom: 30,
  },
  houseItems: {
    fontSize: 18,
    width: '90%',
    color: '#284748',
  },
  houseImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    marginVertical: 10,
    borderRadius: 10,
  },
  workers: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  photosWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  incidenceImage: {
    width: 80,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
});

const IncidenceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const {incidenceId} = route.params;
  const {
    document: incidence,
    loadingIncidence,
    errorIncidence,
  } = useGetDocFirebase('incidences', incidenceId);

  const [modal, setModal] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  const {updateFirebase, loading, error} = useUpdateFirebase('incidences');

  const handleFinishTask = async (status) => {
    await updateFirebase(`${incidenceId}`, {
      done: status,
    });
  };

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
    <PagetLayout
      titleLefSide={
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <View style={styles.iconWrapper}>
            <Icon name="arrow-back" size={25} color="#5090A5" />
          </View>
        </TouchableOpacity>
      }
      footer={
        <CustomButton
          loading={false}
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
      <View style={styles.container}>
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
        <Text style={styles.houseName}>🏡 {incidence?.house?.houseName}</Text>
        <Text style={styles.title}>{incidence?.title}</Text>
        <View style={styles.infoWrapper}>
          <InfoIcon
            info={incidence.done ? 'Resuelta' : 'Sin resolver'}
            color={incidence.done ? '#7dd891' : '#ED7A7A'}
          />
        </View>
        <Text style={styles.date}>
          🕜 {moment(incidence?.date?.toDate()).format('LL')}
        </Text>
        <Text style={styles.label}>🕵️‍♀️ Informador</Text>
        <View style={styles.workers}>
          <Avatar uri={incidence?.user?.profileImage} overlap size="big" />
        </View>
        <Text style={styles.label}>⚠️ Incidencia</Text>
        <Text style={styles.observations}>{incidence?.incidence}</Text>
        <Text style={styles.label}>📷 Fotos</Text>
        <View style={styles.photosWrapper}>
          {incidence?.photos?.map((photo, i) => (
            <IncidenceImage photo={photo} index={i} key={photo} />
          ))}
        </View>
      </View>
    </PagetLayout>
  );
};

export default React.memo(IncidenceScreen);
