import React, {useState, useCallback} from 'react';
import {useSelector, useDispatch, shallowEqual} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {View, Text, StyleSheet, TouchableWithoutFeedback} from 'react-native';

// UI
import Icon from 'react-native-vector-icons/MaterialIcons';
import PageLayout from '../../components/PageLayout';
import NewIncidenceForm from '../../components/Forms/Incidence/NewIncidenceForm';
import MultipleImageSelector from '../../components/MultipleImageSelector';
import CustomButton from '../../components/Elements/CustomButton';

// Firebase
import {useAddFirebase} from '../../hooks/useAddFirebase';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import {useUploadCloudinaryImage} from '../../hooks/useUploadCloudinaryImage';
import {firebase} from '@react-native-firebase/firestore';

import {userSelector} from '../../Store/User/userSlice';
import {
  resetForm,
  setImages,
} from '../../Store/IncidenceForm/incidenceFormSlice';
import {popScreen} from '../../Router/utils/actions';
import {Colors} from '../../Theme/Variables';
import {error} from '../../lib/logging';

import {DismissKeyboard} from '../../components/DismissKeyboard';

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
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

const NewIncidenceScreen = () => {
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

  const createIncidence = async () => {
    try {
      setLo(true);
      const newIncidence = await addFirebase('incidences', {
        ...incidence,
        house: incidence.house.value[0],
        user: user,
        houseId: incidence.house.value[0].id,
        workers: [user],
        workersId: [user.id],
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
      popScreen();
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    } finally {
      setLo(false);
    }
  };

  return (
    <PageLayout
      safe
      titleRightSide={
        <TouchableWithoutFeedback
          onPress={() => {
            popScreen();
          }}>
          <View>
            <Icon name="close" size={25} />
          </View>
        </TouchableWithoutFeedback>
      }
      footer={
        <CustomButton
          styled="rounded"
          loading={lo}
          title={t('newIncidence.form.create')}
          onPress={() => createIncidence()}
        />
      }
      titleProps={{
        title: t('newIncidence.title'),
        subPage: true,
      }}>
      <DismissKeyboard>
        <View style={styles.container}>
          <View>
            <NewIncidenceForm />
            <Text style={styles.label}>{t('newIncidence.form.photos')}</Text>
            <MultipleImageSelector
              images={incidenceImages}
              setImages={setImagesAction}
            />
          </View>
        </View>
      </DismissKeyboard>
    </PageLayout>
  );
};

export default NewIncidenceScreen;
