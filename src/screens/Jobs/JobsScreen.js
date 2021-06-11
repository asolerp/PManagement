import React, {useState, useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import {useNavigation} from '@react-navigation/native';

// Redux

// UI

import AddButton from '../../components/Elements/AddButton';
import HouseFilter from '../../components/Filters/HouseFilter';

import JobItem from '../../components/JobItem';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

// Styles
import {defaultLabel, marginBottom} from '../../styles/common';
import {LOW_GREY, PM_COLOR} from '../../styles/colors';

// Utils

import PagetLayout from '../../components/PageLayout';
import {FlatList} from 'react-native';

import {useTheme} from '../../Theme';
import sortByDate from '../../utils/sorts';
import WorkersFilter from '../../components/Filters/WorkeresFilter';
import StatusIncidence from '../../components/Filters/StatusIncidence';

const JobsScreen = () => {
  const {Gutters, Layout, Fonts} = useTheme();
  const [filterHouses, setFilterHouses] = useState([]);
  const [filterWorkers, setFilterWorkers] = useState([]);
  const [state, setState] = useState(false);

  const query = useMemo(() => {
    return firestore().collection('jobs').where('done', '==', state);
  }, [state]);

  const [jobs] = useCollectionData(query, {
    idField: 'id',
  });

  const navigation = useNavigation();

  const handleNewJob = () => {
    navigation.navigate('NewJobTaskSelector');
  };

  const jobsList = jobs
    ?.filter((job) =>
      filterWorkers.length > 0
        ? filterWorkers.some((fworker) => job?.workersId?.includes(fworker))
        : true,
    )
    .filter((job) =>
      filterHouses.length > 0 ? filterHouses.includes(job.houseId) : true,
    )
    .sort((a, b) => sortByDate(a, b, 'desc'));

  const renderItem = ({item}) => {
    return (
      <JobItem
        job={item}
        onPress={() =>
          navigation.navigate('JobScreen', {
            jobId: item.id,
          })
        }
      />
    );
  };

  return (
    <React.Fragment>
      <View style={styles.addButton}>
        <TouchableOpacity onPress={() => handleNewJob()}>
          <AddButton iconName="add" />
        </TouchableOpacity>
      </View>
      <PagetLayout
        titleLefSide={true}
        titleProps={{
          title: 'Trabajos',
          subPage: false,
        }}>
        <View style={[Layout.fill]}>
          <View style={[styles.housesWrapper, Gutters.regularBMargin]}>
            <WorkersFilter
              workers={filterWorkers}
              onClickWorker={setFilterWorkers}
            />
            <HouseFilter houses={filterHouses} onClickHouse={setFilterHouses} />
          </View>
          <View
            style={[
              Layout.rowCenter,
              Layout.justifyContentSpaceBetween,
              Gutters.smallBMargin,
            ]}>
            <Text style={{...defaultLabel}}>Trabajos</Text>
            <StatusIncidence onChangeFilter={setState} state={state} />
          </View>
          <View style={[Layout.fill]}>
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
      </PagetLayout>
    </React.Fragment>
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
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    zIndex: 10,
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

export default JobsScreen;
