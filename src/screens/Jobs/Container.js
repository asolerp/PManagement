import React, {useState} from 'react';
import {View, Text, TouchableWithoutFeedback} from 'react-native';

// UI
import Icon from 'react-native-vector-icons/MaterialIcons';
import JobItem from '../../components/JobItem';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

// Styles

// Utils
import {FlatList} from 'react-native';

import {useTheme} from '../../Theme';
import sortByDate from '../../utils/sorts';

import {openScreenWithPush} from '../../Router/utils/actions';
import {JOB_SCREEN_KEY} from '../../Router/utils/routerKeys';
import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';
import {JOBS} from '../../utils/firebaseKeys';
import {parseTimeFilter} from '../../utils/parsers';
import CustomModal from '../../components/Modal';
import Filters from '../../components/Filters/Filters';
import {useTranslation} from 'react-i18next';

const defaultFilterValues = {
  time: parseTimeFilter('all'),
  state: false,
};

const Container = () => {
  const {t} = useTranslation();
  const {Gutters, Layout, Fonts} = useTheme();
  const [visibleModal, setVisibleModal] = useState();
  const [filters, setFilters] = useState(defaultFilterValues);

  const user = useSelector(userSelector);

  let firebaseQuery;

  if (user.role === 'admin') {
    firebaseQuery = firestore()
      .collection(JOBS)
      .where('done', '==', filters.state)
      .where('date', '>', new Date(filters.time.start))
      .where('date', '<', new Date(filters.time.end));
  } else {
    firebaseQuery = firestore()
      .collection(JOBS)
      .where('done', '==', filters.state)
      .where('workersId', 'array-contains', user.uid)
      .where('date', '>', new Date(filters.time.start))
      .where('date', '<', new Date(filters.time.end));
  }

  const [jobs] = useCollectionData(firebaseQuery, {
    idField: 'id',
  });

  const jobsList = jobs
    ?.filter((job) =>
      filters?.workers?.length > 0
        ? filters.workers.some((fworker) => job?.workersId?.includes(fworker))
        : true,
    )
    .filter((job) =>
      filters?.houses?.length > 0 ? filters.houses.includes(job.houseId) : true,
    )
    .sort((a, b) => sortByDate(a, b, 'desc'));

  console.log(jobsList, 'trabajos');

  const renderItem = ({item}) => {
    return (
      <JobItem
        job={item}
        onPress={() =>
          openScreenWithPush(JOB_SCREEN_KEY, {
            jobId: item.id,
          })
        }
      />
    );
  };

  return (
    <View style={[Layout.fill]}>
      <CustomModal
        visible={visibleModal}
        setVisible={setVisibleModal}
        size={0.8}>
        <Filters
          initialFilters={filters}
          onSaveFilters={(f) => {
            setFilters(f);
            setVisibleModal(false);
          }}
        />
      </CustomModal>
      <View style={[Layout.fill]}>
        <TouchableWithoutFeedback onPress={() => setVisibleModal(true)}>
          <View
            style={[
              Layout.row,
              Layout.alignItemsCenter,
              Gutters.tinyBMargin,
              Gutters.mediumTMargin,
              {width: 70},
            ]}>
            <Icon name="filter-alt" size={20} />
            <Text style={Fonts.textSmall}>{t('common.filters.title')}</Text>
          </View>
        </TouchableWithoutFeedback>
        {jobsList?.length !== 0 ? (
          <FlatList
            data={jobsList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View
            style={[
              Layout.fill,
              Layout.rowCenter,
              Layout.justifyContentCenter,
              Layout.alignItemsCenter,
            ]}>
            <Text style={[Fonts.textSmall, {textAlign: 'center'}]}>
              No hay trabajos para la búsqueda seleccionada
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Container;
