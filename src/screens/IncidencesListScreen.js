import {useNavigation} from '@react-navigation/core';
import React, {useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import StatusIncidence from '../components/Filters/StatusIncidence';
import IncidenceItem from '../components/Items/IncidenceItem';
import PagetLayout from '../components/PageLayout';
import {defaultLabel, marginBottom} from '../styles/common';
import ItemListSkeleton from '../components/Skeleton/ItemListSkeleton';
import HouseFilter from '../components/Filters/HouseFilter';
import {useTheme} from '../Theme';

import sortByDate from '../utils/sorts';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {useSelector} from 'react-redux';
import {userSelector} from '../Store/User/userSlice';
import {TouchableOpacity} from 'react-native';
import AddButton from '../components/Elements/AddButton';
import {Colors} from '../Theme/Variables';

const styles = StyleSheet.create({
  filterWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 20,
    zIndex: 10,
  },
  todayStyle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});

const IncidencesListScreen = () => {
  const [state, setState] = useState(false);
  const [filterHouses, setFilterHouses] = useState([]);
  const {Gutters, Layout} = useTheme();
  const navigation = useNavigation();
  const user = useSelector(userSelector);

  let firebaseQuery;

  if (user.role === 'admin') {
    firebaseQuery = firestore()
      .collection('incidences')
      .where('done', '==', state);
  } else {
    firebaseQuery = firestore()
      .collection('incidences')
      .where('done', '==', state)
      .where('user.uid', '==', user.uid);
  }

  const [values, loading] = useCollectionData(firebaseQuery, {
    idField: 'id',
  });

  const incidencesList = values
    ?.filter((item) => item.id !== 'stats')
    ?.filter((incidence) =>
      filterHouses.length > 0 ? filterHouses.includes(incidence.houseId) : true,
    )
    ?.sort((a, b) => sortByDate(a, b, 'asc'));

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      navigation.navigate('Incidence', {
        incidenceId: item.id,
      });
    };
    return <IncidenceItem incidence={item} onPress={handlePressIncidence} />;
  };

  return (
    <React.Fragment>
      <View style={styles.addButton}>
        <TouchableOpacity onPress={() => navigation.navigate('NewIncidence')}>
          <AddButton iconName="warning" backColor={Colors.pm} />
        </TouchableOpacity>
      </View>
      <PagetLayout
        titleLefSide={true}
        titleProps={{
          title: 'Listado Incidencias',
          subPage: false,
        }}>
        <View style={[Layout.fill, Gutters.mediumTMargin]}>
          <View
            style={[
              styles.housesWrapper,
              Gutters.tinyTMargin,
              Gutters.smallBMargin,
            ]}>
            <HouseFilter houses={filterHouses} onClickHouse={setFilterHouses} />
          </View>
          <View style={styles.filterWrapper}>
            <Text style={{...defaultLabel, ...marginBottom(10)}}>
              Incidencias
            </Text>
            <StatusIncidence onChangeFilter={setState} state={state} />
          </View>
          {loading ? (
            <ItemListSkeleton />
          ) : (
            <View style={[Layout.fill]}>
              <FlatList
                showsVerticalScrollIndicator={false}
                data={incidencesList}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
              />
            </View>
          )}
        </View>
      </PagetLayout>
    </React.Fragment>
  );
};

export default IncidencesListScreen;
