import React, {useState} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

// UI

import JobItem from '../../components/JobItem';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

// Styles

import {LOW_GREY, PM_COLOR} from '../../styles/colors';

// Utils
import {FlatList} from 'react-native';

import {useTheme} from '../../Theme';
import sortByDate from '../../utils/sorts';
import WorkersFilter from '../../components/Filters/WorkeresFilter';
import StatusIncidence from '../../components/Filters/StatusIncidence';
import {openScreenWithPush} from '../../Router/utils/actions';
import {JOB_SCREEN_KEY} from '../../Router/utils/routerKeys';
import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';
import {JOBS} from '../../utils/firebaseKeys';
import TimeFilter from '../../components/Filters/TimeFilter';
import {parseTimeFilter} from '../../utils/parsers';
import CustomModal from '../../components/Modal';
import Filters from '../../components/Filters/Filters';

const Container = () => {
  const {Gutters, Layout, Fonts} = useTheme();
  const [visibleModal, setVisibleModal] = useState();
  const [filters, setFilters] = useState({
    time: parseTimeFilter('all'),
    state: false,
  });

  const user = useSelector(userSelector);

  console.log(filters, 'Filters');

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
    <View style={[Layout.fill, user.role !== 'admin' && Gutters.mediumTMargin]}>
      <CustomModal
        visible={visibleModal}
        setVisible={setVisibleModal}
        size={0.7}>
        <Filters
          initialFilters={filters}
          onSaveFilters={(f) => {
            setFilters(f);
            setVisibleModal(false);
          }}
        />
      </CustomModal>
      <View style={[Layout.fill]}>
        <Button title="Filtros" onPress={() => setVisibleModal(true)} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  jobsWrapper: {
    flex: 1,
  },
  jobsBackScreen: {
    flex: 10,
  },
  jobsScreen: {
    flex: 1,
    flexBasis: 'auto',
    backgroundColor: LOW_GREY,
    borderTopRightRadius: 50,
  },
  jobsTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  jobsListWrapper: {
    flex: 1,
  },
  calendarContainer: {
    height: '100%',
  },
  dateNumberStyle: {color: PM_COLOR, fontSize: 15},
  calendarHeaderContainerStyle: {
    marginTop: 10,
  },
  calendarHeaderStyle: {
    color: PM_COLOR,
    justifyContent: 'flex-start',
    textTransform: 'capitalize',
  },
  highlightDateNameStyle: {
    color: 'white',
  },
  highlightDateNumberStyle: {
    fontSize: 15,
    color: 'white',
  },
  highlightDateContainerStyle: {
    backgroundColor: PM_COLOR,
    borderRadius: 15,
  },
  infoMessageWrapper: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoMessageStyle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d2d2d',
    textAlign: 'center',
    paddingHorizontal: 50,
  },
});

export default Container;
