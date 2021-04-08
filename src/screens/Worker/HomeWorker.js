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
import {defaultLabel, marginBottom, marginTop} from '../../styles/common';

// Utils
import moment from 'moment';
import subDays from 'date-fns/subDays';
import {ScrollView} from 'react-native';
import CheckItem from '../../components/CheckItem';
import {DARK_BLUE, GREY, LOW_GREY} from '../../styles/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: LOW_GREY,
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
    backgroundColor: LOW_GREY,
    borderTopRightRadius: 50,
    flex: 5,
  },
  content: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 20,
    width: '90%',
    color: DARK_BLUE,
    fontWeight: '500',
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
      condition: moment(new Date(), 1),
    },
    {
      label: 'workersId',
      operator: 'array-contains',
      condition: user.uid,
    },
  ]);

  const {list: checklist} = useGetFirebase('checklists', null, [
    {
      label: 'finished',
      operator: '==',
      condition: false,
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
              <Text
                style={{
                  ...defaultLabel,
                  ...marginBottom(10),
                  ...marginTop(20),
                }}>
                Hoy es {date.join(' ')} ☀️
              </Text>
              <Text style={{...styles.label, ...marginBottom(20)}}>
                Estos son tus trabajos asignados para hoy 💪🏡
              </Text>
              <Text style={{...defaultLabel, ...marginBottom(10)}}>
                Check list
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
