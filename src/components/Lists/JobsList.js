import React from 'react';

import {View, Text, StyleSheet, FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import {defaultLabel, marginRight, width} from '../../styles/common';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

// Utils

import {Colors} from '../../Theme/Variables';

import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import sortByDate from '../../utils/sorts';
import {openScreenWithPush} from '../../Router/utils/actions';
import {JOB_SCREEN_KEY} from '../../Router/utils/routerKeys';

import {JOBS} from '../../utils/firebaseKeys';
import JobItem from './JobItem';
import {useMemo} from 'react';

const styles = StyleSheet.create({
  incidenceWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    width: 220,
    height: 230,
    borderLeftWidth: 10,
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
    height: 50,
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
    width: 10,
    height: 10,
    borderRadius: 100,
  },
  filterWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginVertical: 20,
  },
  badget: {
    color: Colors.white,
    backgroundColor: Colors.pm,
    width: 20,
    height: 20,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const JobsList = ({uid}) => {
  let firestoreQuery;
  if (uid) {
    firestoreQuery = firestore()
      .collection(JOBS)
      .where('done', '==', false)
      .where('workersId', 'array-contains', uid);
  }
  if (!uid) {
    firestoreQuery = firestore().collection(JOBS).where('done', '==', false);
  }

  const [values, loading] = useCollectionData(firestoreQuery, {
    idField: 'id',
  });

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      openScreenWithPush(JOB_SCREEN_KEY, {
        jobId: item.id,
      });
    };

    return (
      <TouchableOpacity onPress={() => handlePressIncidence()}>
        <JobItem item={item} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <DashboardSectionSkeleton />;
  }

  if (values?.docs?.length === 0) {
    return <Text>No hay ninguna incidencia</Text>;
  }

  return (
    <React.Fragment>
      <View style={{...styles.filterWrapper, ...width(80)}}>
        <Text style={{...defaultLabel, ...marginRight(10)}}>Trabajos</Text>
        <View style={styles.badget}>
          <Text style={{color: Colors.white, fontWeight: 'bold'}}>
            {values?.filter((item) => item.id !== 'stats').length}
          </Text>
        </View>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={values?.filter((item) => item.id !== 'stats').sort(sortByDate)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </React.Fragment>
  );
};

export default JobsList;
