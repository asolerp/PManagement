import React, {useState} from 'react';
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

// Utils
import moment from 'moment';

import PagetLayout from '../components/PageLayout';
import ImageViewer from 'react-native-image-zoom-viewer';
import {ImageBackground} from 'react-native';

import {finishIncidence, openIncidence} from '../components/Alerts/incidences';
import TextWrapper from '../components/TextWrapper';
import {firebase} from '@react-native-firebase/firestore';
import {ScrollView} from 'react-native';
import {defaultLabel, marginBottom} from '../styles/common';
import {DARK_BLUE} from '../styles/colors';

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
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
    marginBottom: 20,
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
    fontSize: 20,
    width: '90%',
    color: DARK_BLUE,
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

  const {incidenceId} = route.params;
  const {document: incidence} = useGetDocFirebase('incidences', incidenceId);

  const [modal, setModal] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  const {updateFirebase} = useUpdateFirebase('incidences');

  const handleFinishTask = async (status) => {
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
        <View style={styles.infoWrapper}>
          <InfoIcon
            info={incidence.done ? 'Resuelta' : 'Sin resolver'}
            color={incidence.done ? '#7dd891' : '#ED7A7A'}
          />
        </View>
        <Text style={styles.date}>
          {moment(incidence?.date?.toDate()).format('LL')}
        </Text>
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
    </PagetLayout>
  );
};

export default React.memo(IncidenceScreen);
