import {useNavigation} from '@react-navigation/core';
import React, {useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import StatusIncidence from '../components/Filters/StatusIncidence';
import IncidenceItem from '../components/Items/IncidenceItem';
import PagetLayout from '../components/PageLayout';

//Firebase
import {useGetFirebase} from '../hooks/useGetFirebase';
import {defaultLabel, marginBottom} from '../styles/common';

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
  const {list} = useGetFirebase('incidences');
  const [state, setState] = useState(false);
  const navigation = useNavigation();

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      navigation.navigate('Incidence', {
        incidenceId: item.id,
      });
    };
    return <IncidenceItem incidence={item} onPress={handlePressIncidence} />;
  };

  console.log('list', list);

  return (
    <PagetLayout
      titleLefSide={true}
      titleProps={{
        title: 'Listado Incidencias',
        subPage: false,
      }}>
      <React.Fragment>
        <View style={styles.filterWrapper}>
          <Text style={{...defaultLabel, ...marginBottom(10)}}>
            Incidencias
          </Text>
          <StatusIncidence onChangeFilter={setState} state={state} />
        </View>
        <FlatList
          data={list}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </React.Fragment>
    </PagetLayout>
  );
};

export default IncidencesListScreen;
