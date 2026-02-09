import {set} from 'date-fns';
import moment from 'moment';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useDispatch, useSelector} from 'react-redux';
import {BottomModal} from '../../components/BottomModal';
import DynamicSelectorList from '../../components/DynamicSelectorList';
import Badge from '../../components/Elements/Badge';
import CustomButton from '../../components/Elements/CustomButton';
import CustomInput from '../../components/Elements/CustomInput';
import DateSelector from '../../components/Forms/Jobs/DateSelector';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';
import PageLayout from '../../components/PageLayout';
import {DEFAULT_IMAGE} from '../../constants/general';
import {popScreen} from '../../Router/utils/actions';
import {setJobsToQuadrant} from '../../Store/QuadrantForm/quadrantFormSlice';
import theme from '../../Theme/Theme';
import {randomColor} from '../../utils/randomColor';

export const NewJobQuadrantScreen = ({route}) => {
  const {house, jobsToEdit, date} = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [workers, setWorkers] = useState();

  const [jobs, setJobs] = useState(jobsToEdit || []);

  const [rangeHour, setRangeHour] = useState();
  const [modalContent, setModalContent] = useState();

  const [startHour, setStartHour] = useState();
  const [endHour, setEndHour] = useState();

  const dispatch = useDispatch();

  const cleanForm = () => {
    setWorkers(null);
    setStartHour(null);
    setEndHour(null);
  };

  const handleSaveQuadrant = () => {
    addJobsToQuadrant();
    cleanForm();
    popScreen();
  };

  const handleAddJob = () => {
    workers?.value?.forEach((w) => {
      setJobs((oldValue) => [
        ...oldValue,
        {
          date,
          houseId: house.id,
          worker: w,
          startHour,
          endHour,
          color: randomColor(),
        },
      ]);
    });
    cleanForm();
  };

  const handleDeleteJob = (workerId) => {
    setJobs((oldJobs) => oldJobs.filter((job) => job.worker.id !== workerId));
  };

  const addJobsToQuadrant = useCallback(() => {
    dispatch(setJobsToQuadrant({houseId: house.id, jobs}));
  }, [dispatch, house.id, jobs]);

  const modalSwitcher = (modal) => {
    switch (modal) {
      case 'workers': {
        return ListDynamicWorkers();
      }
      case 'date': {
        return DateTimeSelector();
      }
      default: {
        return ListDynamicWorkers();
      }
    }
  };

  const DateTimeSelector = () => (
    <DateSelector
      mode="time"
      get={rangeHour === 'start' ? startHour : endHour || null}
      set={(date) =>
        rangeHour === 'start' ? setStartHour(date) : setEndHour(date)
      }
      closeModal={() => setModalVisible(false)}
    />
  );

  const ListDynamicWorkers = () => (
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
      get={workers?.value}
      set={(workers) => setWorkers({...workers, value: workers})}
      multiple={true}
      closeModal={() => setModalVisible(false)}
    />
  );

  return (
    <PageLayout safe backButton>
      <BottomModal
        isVisible={modalVisible}
        onClose={(event) => {
          setModalVisible(false);
        }}
        onBackdropPress={() => setModalVisible(false)}
        swipeDirection={null}>
        {modalContent && modalSwitcher(modalContent)}
      </BottomModal>
      <View style={[theme.flexRow, theme.justifyBetween, theme.itemsCenter]}>
        <ScreenHeader title={house.houseName} />
        <FastImage
          source={{
            uri: house.houseImage.small,
            priority: FastImage.priority.normal,
          }}
          style={[theme.mB2, {width: 60, height: 60, borderRadius: 15}]}
        />
      </View>
      <View style={[theme.mT4]}>
        <Text style={[theme.fontSans, theme.textLg, theme.textGray600]}>
          Selecciona el trabajador y la franja horaria para añadirlo al
          cuadrante de esta casa
        </Text>
        <View style={[theme.mT10]} />
        <CustomInput
          title={'Trabajadores'}
          subtitle={
            workers && (
              <View style={{flexDirection: 'row'}}>
                {workers?.value?.map((worker, i) => (
                  <View key={worker.id} style={{flexDirection: 'row'}}>
                    <Text>{worker.firstName}</Text>
                    {workers?.value?.length - 1 !== i && <Text> & </Text>}
                  </View>
                ))}
              </View>
            )
          }
          iconProps={{name: 'alarm', color: '#55A5AD'}}
          onPress={() => {
            setModalContent('workers');
            setModalVisible(true);
          }}
        />
        <View style={[theme.flexRow, theme.mT5]}>
          <CustomInput
            label={'Hora de inicio'}
            title={'00:00'}
            subtitle={
              startHour && <Text>{moment(startHour).format('LT')}</Text>
            }
            iconProps={{name: 'alarm', color: '#55A5AD'}}
            onPress={() => {
              setRangeHour('start');
              setModalContent('date');
              setModalVisible(true);
            }}
            style={[theme.mR4]}
          />
          <CustomInput
            label={'Hora de fin'}
            title={'00:00'}
            subtitle={endHour && <Text>{moment(endHour).format('LT')}</Text>}
            iconProps={{name: 'alarm', color: '#55A5AD'}}
            onPress={() => {
              setRangeHour('end');
              setModalContent('date');
              setModalVisible(true);
            }}
          />
        </View>
        <View style={[theme.mT6]} />
        <CustomButton
          disabled={!startHour || !endHour || !workers}
          type="clear"
          title="Asignar al cuadrante"
          onPress={handleAddJob}
        />
      </View>
      <ScrollView
        style={[
          theme.flexGrow,
          theme.borderGray400,
          theme.border0_5,
          theme.roundedSm,
          theme.mY6,
          theme.pB4,
        ]}>
        {jobs?.map((job) => (
          <View
            style={[
              theme.flexRow,
              theme.justifyBetween,
              theme.itemsCenter,
              theme.borderB0_5,
              theme.borderGray300,
              theme.p3,
            ]}>
            <View style={[theme.flexRow, theme.itemsCenter]}>
              <FastImage
                source={{
                  uri: job?.worker?.profileImage?.small || DEFAULT_IMAGE,
                  priority: FastImage.priority.normal,
                }}
                style={[theme.mR2, {width: 30, height: 30, borderRadius: 15}]}
              />
              <Text style={[theme.mR4]}>{job.worker.firstName}</Text>
            </View>
            <Badge
              variant="info"
              text={
                moment(job.startHour.toDate() || job.startHour).format('LT') +
                ' a ' +
                moment(job.endHour.toDate() || job.endHour).format('LT')
              }
            />
            <Badge
              text="Eliminar"
              variant="danger"
              onPress={() => handleDeleteJob(job.worker.id)}
            />
          </View>
        ))}
      </ScrollView>
      <CustomButton title="Guardar trabajos" onPress={handleSaveQuadrant} />
    </PageLayout>
  );
};
