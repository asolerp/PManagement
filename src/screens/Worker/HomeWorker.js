import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useSelector, shallowEqual} from 'react-redux';
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';

import TitlePage from '../../components/TitlePage';
import ProfileBar from '../../components/ProfileBar';
import StatusTaskFilter from '../../components/Filters/StatusTaskFilter';
import AddButton from '../../components/Elements/AddButton';

import {useGetFirebase} from '../../hooks/useGetFirebase';

// UI
import LinearGradient from 'react-native-linear-gradient';
import JobItem from '../../components/JobItem';

// Styles
import {defaultLabel} from '../../styles/common';

// Utils
import moment from 'moment';
import subDays from 'date-fns/subDays';
import {ScrollView} from 'react-native';
import CheckItem from '../../components/CheckItem';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 20,
    zIndex: 10,
  },
  homeBackScreen: {
    flex: 1,
  },
  home: {
    backgroundColor: 'white',
    borderTopRightRadius: 50,
    flex: 5,
  },
  content: {
    paddingHorizontal: 20,
  },
  todayStyle: {
    fontSize: 20,
    color: '#284748',
    fontWeight: 'bold',
    marginTop: 20,
  },
  label: {
    fontSize: 20,
    width: '90%',
    color: '#284748',
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 20,
  },
  checksWrapper: {
    marginBottom: 20,
  },
});

const HomeWorker = () => {
  const navigation = useNavigation();
  const {user} = useSelector(
    ({userLoggedIn: {user}}) => ({user}),
    shallowEqual,
  );

  const {statusTaskFilter} = useSelector(
    ({filters: {statusTaskFilter}}) => ({statusTaskFilter}),
    shallowEqual,
  );

  const {list} = useGetFirebase('jobs', null, [
    {
      label: 'date',
      operator: '>',
      condition: subDays(new Date(), 1),
    },
    {
      label: 'workersId',
      operator: 'array-contains',
      condition: user.uid,
    },
  ]);

  const {list: checklist} = useGetFirebase('checklists', null, [
    {
      label: 'date',
      operator: '>',
      condition: subDays(new Date(), 1),
    },
  ]);

  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);

  return (
    <View style={styles.container}>
      <View style={styles.addButton}>
        <TouchableOpacity onPress={() => navigation.navigate('NewIncidence')}>
          <AddButton iconName="add-alert" backColor="#F5C66D" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{backgroundColor: 'white'}}>
        <TitlePage>
          <ProfileBar />
        </TitlePage>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={['#126D9B', '#67B26F']}
          style={styles.homeBackScreen}>
          <View style={styles.home}>
            <View style={styles.content}>
              <Text style={styles.todayStyle}>Hoy es {date.join(' ')} ☀️</Text>
              <Text style={styles.label}>
                Estos son tus trabajos asignados para hoy 💪🏡
              </Text>
              <Text style={{...defaultLabel, marginBottom: 20}}>
                ✅ Check list
              </Text>
              <View style={styles.checksWrapper}>
                {checklist?.map((check) => (
                  <CheckItem
                    key={check.id}
                    check={check}
                    onPress={() =>
                      navigation.navigate('Check', {
                        checkId: check.id,
                      })
                    }
                  />
                ))}
              </View>
              <StatusTaskFilter />
              <View style={{marginTop: 20}}>
                {list.length > 0 ? (
                  <React.Fragment>
                    {list
                      ?.filter((job) => job.done === statusTaskFilter)
                      .sort((a, b) => a.date - b.date)
                      .map((item) => (
                        <JobItem
                          job={item}
                          key={item.id}
                          onPress={() =>
                            navigation.navigate('JobScreen', {
                              jobId: item.id,
                            })
                          }
                        />
                      ))}
                  </React.Fragment>
                ) : (
                  <Text>No tienes tareas asignadas para hoy</Text>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

export default HomeWorker;
