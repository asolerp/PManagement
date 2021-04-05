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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
  },
  swipperContainer: {
    borderRadius: 10,
    marginBottom: 10,
  },
  firstSection: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    width: 10,
    height: '100%',
    borderRadius: 20,
    marginLeft: 0,
    marginRight: 15,
    backgroundColor: 'white',
    elevation: 2,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    shadowColor: '#BCBCBC',
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  title: {
    fontSize: 19,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#284748',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 5,
    width: '95%',
    color: '#284748',
  },
  calendar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    marginBottom: 5,
    fontWeight: 'bold',
  },
  iconsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  workers: {
    flexDirection: 'row',
  },
});

const JobItem = ({job, onPress}) => {
  const [noReadCounter, setNoReadCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const {user} = useSelector(
    ({userLoggedIn: {user}}) => ({user}),
    shallowEqual,
  );

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
      <View style={styles.container}>
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
            <View style={styles.firstLine}>
              <Text style={styles.date}>
                🕜 {moment(job.date.toDate()).format('LL')}
              </Text>
              {job?.workers?.map((worker, i) => (
                <Avatar
                  key={worker.id || i}
                  uri={worker.profileImage}
                  overlap
                />
              ))}
            </View>
            <Text style={styles.title}>
              🏡 {`Trabajos en ${job.house[0].houseName}`}
            </Text>
            {job?.task?.desc && (
              <Text style={styles.subtitle}>{job?.task?.desc}</Text>
            )}
            <View style={styles.iconsWrapper}>
              <InfoIcon
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
          <View>
            <Icon name="keyboard-arrow-right" color="#284748" size={30} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default JobItem;
