import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {StatusBar} from 'react-native';
import {useNavigation} from '@react-navigation/native';

// Redux
import {useSelector, useDispatch} from 'react-redux';

// UI
import Icon from 'react-native-vector-icons/MaterialIcons';
import AddButton from '../../components/Elements/AddButton';
import HouseFilter from '../../components/Filters/HouseFilter';
import StatusTaskFilter from '../../components/Filters/StatusTaskFilter';
import JobItem from '../../components/JobItem';
import CalendarStrip from 'react-native-calendar-strip';

//Firebase
import {useGetFirebase} from '../../hooks/useGetFirebase';

// Styles
import {defaultTextTitle, marginTop} from '../../styles/common';
import {LOW_GREY, PM_COLOR} from '../../styles/colors';

// Utils
import moment from 'moment';
import {generateCalendarDots} from '../../utils/parsers';
import PagetLayout from '../../components/PageLayout';
import {FlatList} from 'react-native';
import {
  filterDateSelector,
  housesSelector,
  setDate,
  addHouse,
  statusTaskFilterSelector,
} from '../../Store/Filters/filtersSlice';

const JobsScreen = () => {
  const dispatch = useDispatch();
  const {list} = useGetFirebase('jobs');

  const houses = useSelector(housesSelector);
  const filterDate = useSelector(filterDateSelector);
  const statusTaskFilter = useSelector(statusTaskFilterSelector);

  const [filteredList, setFilteredList] = useState([]);
  const navigation = useNavigation();

  const handleNewJob = () => {
    navigation.navigate('NewJobTaskSelector');
  };

  const setFilterDateAction = useCallback((date) => dispatch(setDate({date})), [
    dispatch,
  ]);

  const addHouseAction = useCallback(
    (payload) => dispatch(addHouse({houses: payload})),
    [dispatch],
  );

  useEffect(() => {
    if (houses === null) {
      const fList = list
        .filter((job) => job.house === null)
        .filter(
          (job) =>
            moment(job?.date?.toDate()).format('DD-MM-YY') ===
            moment(filterDate).format('DD-MM-YY'),
        );
      setFilteredList(fList);
    } else {
      if (houses?.length === 0) {
        setFilteredList(
          list.filter(
            (job) =>
              moment(job?.date?.toDate()).format('DD-MM-YY') ===
              moment(filterDate).format('DD-MM-YY'),
          ),
        );
      } else {
        const fList = list
          .filter((j) => j.house !== null)
          .filter((job) =>
            houses?.find(
              (houseId) => houseId === job?.house && job?.house[0]?.id,
            ),
          )
          .filter(
            (job) =>
              moment(job?.date?.toDate()).format('DD-MM-YY') ===
              moment(filterDate).format('DD-MM-YY'),
          );
        setFilteredList(fList);
      }
    }
  }, [houses, list, filterDate, statusTaskFilter]);

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
      <StatusBar barStyle="default" />
      <View style={styles.addButton}>
        <TouchableOpacity onPress={() => handleNewJob()}>
          <AddButton iconName="add" />
        </TouchableOpacity>
      </View>
      <PagetLayout
        titleProps={{
          title: 'Listado de trabajos',
          subtitle: 'En esta semana',
          color: 'white',
        }}>
        <View style={styles.jobsScreen}>
          {/* <View style={{height: 100}}>
            <CalendarStrip
              startingDate={moment(new Date()).subtract(3, 'days')}
              markedDates={generateCalendarDots(list)}
              selectedDate={moment(filterDate) || moment(new Date())}
              onDateSelected={(date) => setFilterDateAction(date)}
              style={styles.calendarContainer}
              scrollable
              iconStyle={{color: PM_COLOR}}
              leftSelector={
                <Icon name="keyboard-arrow-left" size={15} color={PM_COLOR} />
              }
              rightSelector={
                <Icon name="keyboard-arrow-right" size={15} color={PM_COLOR} />
              }
              dateContainerStyle={{color: PM_COLOR}}
              dateNameStyle={{color: PM_COLOR}}
              dateNumberStyle={styles.dateNumberStyle}
              highlightDateNameStyle={styles.highlightDateNameStyle}
              highlightDateNumberStyle={styles.highlightDateNumberStyle}
              highlightDateContainerStyle={styles.highlightDateContainerStyle}
              calendarHeaderContainerStyle={styles.calendarHeaderContainerStyle}
              calendarHeaderStyle={styles.calendarHeaderStyle}
            />
          </View> */}
          <View style={styles.housesWrapper}>
            <HouseFilter houses={houses} addHouse={addHouseAction} />
          </View>
          <View style={{...styles.jobsListWrapper, ...marginTop(20)}}>
            <View style={styles.jobsTitleWrapper}>
              <Text style={{...defaultTextTitle}}>Trabajos</Text>
              <StatusTaskFilter />
            </View>
            {filteredList.length > 0 ? (
              <View style={{marginTop: 20, flex: 1}}>
                {filteredList?.filter((job) => job.done === statusTaskFilter)
                  .length === 0 ? (
                  <View style={styles.infoMessageWrapper}>
                    <Text style={styles.infoMessageStyle}>
                      No tienes ninguna en este estado.
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={filteredList?.filter(
                      (job) => job.done === statusTaskFilter,
                    )}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                  />
                )}
              </View>
            ) : (
              <View style={styles.infoMessageWrapper}>
                <Text style={styles.infoMessageStyle}>
                  No tienes ninguna tarea creada para este día.
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
  housesWrapper: {
    height: 200,
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
