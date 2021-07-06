import React, {useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import {width} from '../../styles/common';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

// Utils
import CheckItem from './CheckItem';
import {Colors} from '../../Theme/Variables';
import {useTheme} from '../../Theme';

import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import sortByDate from '../../utils/sorts';
import {openScreenWithPush} from '../../Router/utils/actions';
import {CHECK_SCREEN_KEY, CHECK_STACK_KEY} from '../../Router/utils/routerKeys';
import TimeFilter from '../Filters/TimeFilter';
import {parseTimeFilter} from '../../utils/parsers';

const styles = StyleSheet.create({
  checkWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    width: 220,
    height: 170,
    borderLeftWidth: 10,
    borderWidth: 1,
  },
  avatarWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  infoWrapper: {
    marginTop: 10,
  },
  infoStyle: {
    color: Colors.darkBlue,
    height: 40,
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 25,
    marginBottom: 5,
    fontWeight: '500',
    color: Colors.darkBlue,
    height: 60,
  },
  bold: {
    fontWeight: '600',
    color: Colors.darkBlue,
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: Colors.darkBlue,
  },
  buble: {
    width: 20,
    height: 20,
    borderRadius: 100,
  },
  filterWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
  },
  badget: {
    backgroundColor: Colors.success,
    width: 20,
    height: 20,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const ChecklistList = ({uid, house}) => {
  const {Gutters, Fonts} = useTheme();
  const [timeFilter, setTimeFilter] = useState(parseTimeFilter('week'));

  let firestoreQuery;

  if (house) {
    firestoreQuery = firestore()
      .collection('checklists')
      .where('send', '==', false)
      .where('houseId', '==', house?.id)
      .where('date', '>', new Date(timeFilter.start))
      .where('date', '<', new Date(timeFilter.end));
  }
  if (uid) {
    firestoreQuery = firestore()
      .collection('checklists')
      .where('send', '==', false)
      .where('workersId', 'array-contains', uid)
      .where('date', '>', new Date(timeFilter.start))
      .where('date', '<', new Date(timeFilter.end));
  }
  if (!uid && !house) {
    firestoreQuery = firestore()
      .collection('checklists')
      .where('send', '==', false)
      .where('date', '>', new Date(timeFilter.start))
      .where('date', '<', new Date(timeFilter.end));
  }

  const [values, loading] = useCollectionData(firestoreQuery, {
    idField: 'id',
  });

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      openScreenWithPush(CHECK_STACK_KEY, {
        screen: CHECK_SCREEN_KEY,
        docId: item.id,
      });
    };

    return (
      <TouchableOpacity onPress={() => handlePressIncidence()}>
        <CheckItem item={item} />
      </TouchableOpacity>
    );
  };

  return (
    <React.Fragment>
      <View style={{...styles.filterWrapper, ...width(80)}}>
        {!house && (
          <View style={[styles.badget, Gutters.tinyRMargin]}>
            <Text style={{color: Colors.white, fontWeight: 'bold'}}>
              {values?.length || 0}
            </Text>
          </View>
        )}
        <Text style={[Fonts.textTitle, Gutters.mediumRMargin]}>Checklists</Text>
      </View>
      <TimeFilter onChangeFilter={setTimeFilter} state={timeFilter} />
      {loading && <DashboardSectionSkeleton />}
      {(!loading && !values) || values?.length === 0 ? (
        <Text>No hay ningun checklist</Text>
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={values?.sort(sortByDate)}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </React.Fragment>
  );
};

export default ChecklistList;
