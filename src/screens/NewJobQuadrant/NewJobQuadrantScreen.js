import {set} from 'date-fns';
import moment from 'moment';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {BottomModal} from '../../components/BottomModal';
import DynamicSelectorList from '../../components/DynamicSelectorList';
import CustomButton from '../../components/Elements/CustomButton';
import CustomInput from '../../components/Elements/CustomInput';
import DateSelector from '../../components/Forms/Jobs/DateSelector';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';
import PageLayout from '../../components/PageLayout';
import {DEFAULT_IMAGE} from '../../constants/general';
import theme from '../../Theme/Theme';

export const NewJobQuadrantScreen = ({route}) => {
  const {house} = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [workers, setWorkers] = useState();

  const [jobs, setJobs] = useState([]);

  const [rangeHour, setRangeHour] = useState();
  const [modalContent, setModalContent] = useState();

  const [startHour, setStartHour] = useState();
  const [endHour, setEndHour] = useState();

  const cleanForm = () => {
    setWorkers(null);
    setStartHour(null);
    setEndHour(null);
  };

  const handleAddJob = () => {
    workers?.value?.forEach((w) => {
      setJobs((oldValue) => [
        ...oldValue,
        {houseId: house.id, worker: w, startHour, endHour},
      ]);
    });
    cleanForm();
  };

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
              theme.itemsCenter,
              theme.borderB0_5,
              theme.borderGray300,
              theme.p3,
            ]}>
            <FastImage
              source={{
                uri: job?.worker?.profileImage?.small || DEFAULT_IMAGE,
                priority: FastImage.priority.normal,
              }}
              style={[theme.mR2, {width: 30, height: 30, borderRadius: 15}]}
            />
            <Text>{job.worker.firstName}</Text>
          </View>
        ))}
      </ScrollView>
      <CustomButton title="Guardar cuadrante" onPress={handleAddJob} />
    </PageLayout>
  );
};
