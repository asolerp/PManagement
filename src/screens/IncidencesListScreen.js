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

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

const styles = StyleSheet.create({
  filterWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  todayStyle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});

const IncidencesListScreen = () => {
  const [state, setState] = useState(false);
  const [filterHouses, setFilterHouses] = useState([]);
  const {Gutters} = useTheme();
  const navigation = useNavigation();

  const [values, loading] = useCollectionData(
    firestore().collection('incidences').where('done', '==', state),
    {
      idField: 'id',
    },
  );

  console.log(values);

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      navigation.navigate('Incidence', {
        incidenceId: item.id,
      });
    };
    return <IncidenceItem incidence={item} onPress={handlePressIncidence} />;
  };

  return (
    <PagetLayout
      titleLefSide={true}
      titleProps={{
        title: 'Listado Incidencias',
        subPage: false,
      }}>
      <View style={[Gutters.mediumTMargin]}>
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
          <FlatList
            data={values
              .filter((item) => item.id !== 'stats')
              .filter((incidence) =>
                filterHouses.length > 0
                  ? filterHouses.includes(incidence.houseId)
                  : true,
              )}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        )}
      </View>
    </PagetLayout>
  );
};

export default IncidencesListScreen;
