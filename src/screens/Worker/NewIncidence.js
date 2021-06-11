import React, {useState, useCallback} from 'react';
import {useSelector, useDispatch, shallowEqual} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {useNavigation} from '@react-navigation/native';
import {Alert, View, Text, TouchableOpacity, StyleSheet} from 'react-native';

// UI
import Icon from 'react-native-vector-icons/MaterialIcons';
import PagetLayout from '../../components/PageLayout';
import NewIncidenceForm from '../../components/Forms/Incidence/NewIncidenceForm';
import MultipleImageSelector from '../../components/MultipleImageSelector';
import CustomButton from '../../components/Elements/CustomButton';

// Firebase
import {useAddFirebase} from '../../hooks/useAddFirebase';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import {useUploadCloudinaryImage} from '../../hooks/useUploadCloudinaryImage';
import {firebase} from '@react-native-firebase/firestore';
import {defaultLabel, marginBottom, marginTop} from '../../styles/common';
import {userSelector} from '../../Store/User/userSlice';
import {
  resetForm,
  setImages,
} from '../../Store/IncidenceForm/incidenceFormSlice';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      height: 0,
      width: 0,
    },
    shadowColor: '#BCBCBC',
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  label: {
    fontSize: 20,
    width: '90%',
    color: '#284748',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
  },
  actionsWrapper: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
});

const NewIncidence = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [lo, setLo] = useState(false);

  const user = useSelector(userSelector, shallowEqual);

  const {incidence, incidenceImages} = useSelector(
    ({incidenceForm: {incidence, incidenceImages}}) => ({
      incidence,
      incidenceImages,
    }),
    shallowEqual,
  );

  const setImagesAction = useCallback(
    (images) => dispatch(setImages({images})),
    [dispatch],
  );

  const {updateFirebase} = useUpdateFirebase('incidences');

  const resetFormAction = useCallback(() => dispatch(resetForm()), [dispatch]);

  const {addFirebase} = useAddFirebase();
  const {upload} = useUploadCloudinaryImage();

  const showAlert = () =>
    Alert.alert(
      'Lo sentimos',
      'Ha ocurrido un error al crear la incidencia. Inténtelo más tarde',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'Ok', onPress: () => console.log('OK Pressed')},
        ,
      ],
    );

  const createIncidence = async () => {
    try {
      setLo(true);
      await updateFirebase('stats', {
        count: firebase.firestore.FieldValue.increment(1),
      });
      const newIncidence = await addFirebase('incidences', {
        ...incidence,
        house: incidence.house.value[0],
        user: user,
        houseId: incidence.house.value[0].id,
        state: 'iniciada',
        date: new Date(),
        done: false,
      });

      if (incidenceImages?.length > 0) {
        const uploadImages = incidenceImages.map((file) =>
          upload(file, `/PortManagement/Incidences/${newIncidence.id}/Photos`),
        );

        const imagesURLs = await Promise.all(uploadImages);

        await updateFirebase(`${newIncidence.id}`, {
          photos: imagesURLs,
        });
      }

      resetFormAction();
      navigation.goBack();
    } catch (err) {
      console.log(err);
      showAlert();
    } finally {
      setLo(false);
    }
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
          loading={lo}
          title={t('newIncidence.form.create')}
          onPress={() => createIncidence()}
        />
      }
      titleProps={{
        title: t('newIncidence.title'),
        subPage: true,
      }}>
      <View style={styles.container}>
        <View>
          <Text
            style={{...defaultLabel, ...marginBottom(20), ...marginTop(20)}}>
            {t('newIncidence.subtitle')}
          </Text>
          <NewIncidenceForm />
          <Text style={styles.label}>📷 {t('newIncidence.form.photos')}</Text>
          <MultipleImageSelector
            images={incidenceImages}
            setImages={setImagesAction}
          />
        </View>
      </View>
    </PagetLayout>
  );
};

export default NewIncidence;
