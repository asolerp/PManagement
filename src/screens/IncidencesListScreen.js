import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import StatusIncidence from '../components/Filters/StatusIncidence';
import IncidencesList from '../components/IncidencesList';
import PagetLayout from '../components/PageLayout';

//Firebase
import {useGetFirebase} from '../hooks/useGetFirebase';

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
  const {list, loading, error} = useGetFirebase('incidences');
  const [state, setState] = useState(false);

  return (
    <PagetLayout
      titleLefSide={true}
      titleProps={{
        title: 'Listado Incidencias',
        subPage: false,
      }}>
      <React.Fragment>
        <View style={styles.filterWrapper}>
          <Text style={{...styles.todayStyle}}>🚨 Incidencias</Text>
          <StatusIncidence onChangeFilter={setState} state={state} />
        </View>
        <IncidencesList
          list={list.filter((inci) => inci.done === state)}
          loading={loading}
        />
      </React.Fragment>
    </PagetLayout>
  );
};

export default IncidencesListScreen;
