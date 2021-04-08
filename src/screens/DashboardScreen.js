import React, {useCallback, useState} from 'react';
import {useSelector, shallowEqual} from 'react-redux';

import {View, StyleSheet, Text, Button} from 'react-native';

import {useDispatch} from 'react-redux';

//Firebase
import {useGetFirebase} from '../hooks/useGetFirebase';

// Components
import JobsResume from '../components/JobsResume/JobsResume';
import ProfileBar from '../components/ProfileBar';
import TitlePage from '../components/TitlePage';
import IncidencesList from '../components/IncidencesList';
import StatusIncidence from '../components/Filters/StatusIncidence';

// UI
import LinearGradient from 'react-native-linear-gradient';

// Styles
import {LOW_GREY, DARK_BLUE, PRIORITY_HEIGHT} from '../styles/colors';

// Utils
import moment from 'moment';
import {ScrollView} from 'react-native';
import subDays from 'date-fns/subDays';
import {TouchableOpacity} from 'react-native';
import {defaultLabel, marginLeft, marginRight, width} from '../styles/common';

const DashboardScreen = ({navigation}) => {
  const {list, loading, error} = useGetFirebase('incidences', null, [
    {
      label: 'done',
      operator: '==',
      condition: false,
    },
  ]);
  const [state, setState] = useState(false);

  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);

  return (
    <React.Fragment>
      <View style={{backgroundColor: LOW_GREY}}>
        <TitlePage>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <ProfileBar />
          </TouchableOpacity>
        </TitlePage>
      </View>
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        colors={['#126D9B', '#67B26F']}
        style={styles.homeBackScreen}>
        <ScrollView style={styles.container} nestedScrollEnabled>
          <View style={styles.home}>
            <View style={styles.content}>
              <Text style={{...styles.todayStyle, ...{marginVertical: 20}}}>
                Hoy es {date.join(' ')} ☀️
              </Text>
              <Text style={styles.todayStyle}>Trabajos activos</Text>
              <JobsResume />
              <View style={{...styles.filterWrapper, ...width(80)}}>
                <Text style={{...defaultLabel, ...marginRight(10)}}>
                  Incidencias
                </Text>
                <View style={styles.badget}>
                  <Text style={{...defaultLabel, ...{color: 'white'}}}>
                    {list.length}
                  </Text>
                </View>
              </View>
              {list?.filter((inci) => inci.done === false).length > 0 ? (
                <IncidencesList
                  list={list.filter((inci) => inci.done === false)}
                  loading={loading}
                />
              ) : (
                <Text>No tienes incidencias sin resolver hoy</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOW_GREY,
    borderTopRightRadius: 50,
  },
  homeBackScreen: {
    flex: 1,
  },
  home: {
    backgroundColor: LOW_GREY,
    flex: 5,
  },
  content: {
    paddingHorizontal: 20,
  },
  filterWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginVertical: 20,
  },
  todayStyle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DARK_BLUE,
  },
  badget: {
    color: 'white',
    backgroundColor: PRIORITY_HEIGHT,
    width: 30,
    height: 30,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardScreen;
