import React, {useState, useCallback, useEffect} from 'react';
import {useSelector, useDispatch, shallowEqual} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {View, Text, StyleSheet} from 'react-native';

// UI

import PageLayout from '../../components/PageLayout';
import NewIncidenceForm from '../../components/Forms/Incidence/NewIncidenceForm';
import MultipleImageSelector from '../../components/MultipleImageSelector';
import CustomButton from '../../components/Elements/CustomButton';

// Firebase
import {useAddFirebase} from '../../hooks/useAddFirebase';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import {useUploadCloudinaryImage} from '../../hooks/useUploadCloudinaryImage';

import {userSelector} from '../../Store/User/userSlice';
import {
  resetForm,
  setImages,
} from '../../Store/IncidenceForm/incidenceFormSlice';
import {popScreen} from '../../Router/utils/actions';

import {error} from '../../lib/logging';

import {DismissKeyboard} from '../../components/DismissKeyboard';
import {LoadingModalContext} from '../../context/loadinModalContext';
import {useContext} from 'react';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';
import {useTheme} from '../../Theme';
import useUploadImageCheck from '../../hooks/useUploadImage';
import {INCIDENCES} from '../../utils/firebaseKeys';

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

const NewIncidenceScreen = () => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [lo, setLo] = useState(false);

  const user = useSelector(userSelector, shallowEqual);
  const {Gutters} = useTheme();
  const {incidence, incidenceImages} = useSelector(
    ({incidenceForm: {incidence, incidenceImages}}) => ({
      incidence,
      incidenceImages,
    }),
    shallowEqual,
  );

  const {uploadImages} = useUploadImageCheck(INCIDENCES);
  const {addFirebase} = useAddFirebase();

  const setImagesAction = useCallback(
    (images) => dispatch(setImages({images})),
    [dispatch],
  );

  const resetFormAction = useCallback(() => dispatch(resetForm()), [dispatch]);

  const {setVisible} = useContext(LoadingModalContext);

  const hasFormFilled =
    !!incidence?.title &&
    incidence?.incidence &&
    incidence?.house?.value?.length > 0;

  const createIncidence = async () => {
    try {
      setLo(true);
      setVisible(true);

      const newIncidence = await addFirebase('incidences', {
        ...incidence,
        house: incidence.house.value[0],
        user: user,
        houseId: incidence.house.value[0].id,
        workers: [user],
        workersId: [user.id],
        state: 'initiate',
        date: new Date(),
        done: false,
      });

      if (incidenceImages?.length > 0) {
        await uploadImages(incidenceImages, null, newIncidence.id);
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
      setVisible(false);
      setLo(false);
    }
  };

  useEffect(() => {
    resetFormAction();
  }, []);

  return (
    <PageLayout
      safe
      backButton
      footer={
        <CustomButton
          disabled={!hasFormFilled}
          styled="rounded"
          loading={lo}
          title={t('newIncidence.form.create')}
          onPress={() => createIncidence()}
        />
      }>
      <>
        <ScreenHeader title={t('newIncidence.title')} />
        <DismissKeyboard>
          <View style={[Gutters.regularBMargin, styles.container]}>
            <View style={[Gutters.regularTMargin]}>
              <View>
                <NewIncidenceForm />
              </View>
              <Text style={styles.label}>{t('newIncidence.form.photos')}</Text>
              <MultipleImageSelector
                images={incidenceImages}
                setImages={setImagesAction}
              />
            </View>
          </View>
        </DismissKeyboard>
      </>
    </PageLayout>
  );
};

export default NewIncidenceScreen;
