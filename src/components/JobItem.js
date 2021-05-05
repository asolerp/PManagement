import React, {useState, useEffect} from 'react';
import {useSelector, shallowEqual} from 'react-redux';

import firestore from '@react-native-firebase/firestore';

import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
  UIManager,
} from 'react-native';

//UI
import Avatar from './Avatar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import InfoIcon from './InfoIcon';

// Utils
import moment from 'moment';
import {parsePriorityColor} from '../utils/parsers';
import {DARK_BLUE, GREY, GREY_1} from '../styles/colors';
import {marginBottom, marginRight} from '../styles/common';
import {userSelector} from '../Store/User/userSlice';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    width: 220,
    borderWidth: 1,
    borderColor: GREY_1,
  },
  firstSection: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  titleSubtitle: {
    flex: 1,
    justifyContent: 'space-between',
  },
  firstLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    marginRight: 10,
    color: '#3DB6BA',
  },
  priority: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    width: 10,
    height: '50%',
    borderRadius: 20,
    marginLeft: 0,
    marginRight: 15,
  },
  title: {
    fontSize: 28,
    marginBottom: 5,
    fontWeight: '500',
    color: DARK_BLUE,
  },
  subtitle: {
    fontSize: 15,
    width: '95%',
    color: GREY,
  },
  progressContainer: {
    flex: 1,
  },
  bottomIcons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  percentage: {
    textAlign: 'right',
    fontWeight: 'bold',
  },
  iconsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  avatarWrapper: {
    flexDirection: 'row',
  },
  workers: {
    flexDirection: 'row',
  },
});

const JobItem = ({job, onPress}) => {
  const [noReadCounter, setNoReadCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const user = useSelector(userSelector);

  const onResult = (QuerySnapshot) => {
    setLoading(false);
    setNoReadCounter(
      QuerySnapshot.docs
        .map((doc) => ({...doc.data(), id: doc.id}))
        .filter((message) => !message.received)
        .filter((message) => message.user._id !== user.uid).length,
    );
  };

  const onError = (err) => {
    setLoading(false);
    setError(err);
  };

  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  useEffect(() => {
    const collectionJobs = firestore().collection('jobs');
    const jobDocument = collectionJobs.doc(job.id);
    const messagesQuery = jobDocument.collection('messages');
    const subscriber = messagesQuery.onSnapshot(onResult, onError);
    return () => subscriber();
  }, []);

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{...styles.container, ...marginRight(20)}}>
        <View style={styles.firstSection}>
          {job.priority && (
            <View
              style={[
                styles.priority,
                {backgroundColor: parsePriorityColor(job.priority)},
              ]}
            />
          )}
          <View style={styles.titleSubtitle}>
            <Text style={{...styles.date, ...marginBottom(10)}}>
              {moment(job.date.toDate()).format('LL')}
            </Text>
            <Text style={{...styles.title, ...marginBottom(10)}}>
              {`Trabajos en ${job.house[0].houseName}`}
            </Text>
            {job?.task?.desc && (
              <Text style={{...styles.subtitle, ...marginBottom(10)}}>
                {job?.task?.desc}
              </Text>
            )}
            <View style={{...styles.avatarWrapper, ...marginBottom(10)}}>
              {job?.workers?.map((worker, i) => (
                <Avatar
                  key={worker.id || i}
                  uri={worker.profileImage}
                  overlap
                  size="medium"
                />
              ))}
            </View>
            <View style={styles.iconsWrapper}>
              <InfoIcon
                style={marginRight(10)}
                info={noReadCounter}
                icon={'chat'}
                color="#ac76cc"
                active={noReadCounter > 0}
              />
              <InfoIcon
                info={job.done ? 'Termianda' : 'Sin terminar'}
                color={job.done ? '#7dd891' : '#ED7A7A'}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default JobItem;
