import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

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

import InfoIcon from './InfoIcon';

// Utils
import moment from 'moment';
import {minimizetext} from '../utils/parsers';
import {DARK_BLUE, GREY, GREY_1} from '../styles/colors';
import {marginRight} from '../styles/common';
import {userSelector} from '../Store/User/userSlice';
import {useTheme} from '../Theme';
import {Colors} from '../Theme/Variables';
import useNoReadMessages from '../hooks/useNoReadMessages';
import {JOBS} from '../utils/firebaseKeys';
import Counter from './Counter';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: GREY_1,
  },
  firstSection: {
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderLeftWidth: 10,
    borderColor: GREY_1,
  },
  titleSubtitle: {
    flex: 1,
  },
  firstLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 10,
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
  },
  workers: {
    flexDirection: 'row',
  },
});

const JobItem = ({job, onPress}) => {
  const {Layout, Gutters, Fonts} = useTheme();

  const {noReadCounter} = useNoReadMessages({
    collection: JOBS,
    docId: job?.id,
  });

  return (
    <React.Fragment>
      {noReadCounter > 0 && (
        <Counter
          size="big"
          count={noReadCounter}
          customStyles={{
            position: 'absolute',
            zIndex: 1000,
            right: 5,
            top: 0,
          }}
        />
      )}
      <TouchableOpacity
        onPress={onPress}
        style={[
          Layout.fill,
          Gutters.smallTMargin,
          styles.firstSection,
          {
            borderLeftColor: Colors.pm,
          },
        ]}>
        <View style={[Layout.fill]}>
          <View>
            <View style={[Layout.rowCenter, Layout.justifyContentSpaceBetween]}>
              <Text>🏡 {job?.house?.[0]?.houseName}</Text>
              <Text style={styles.date}>
                ⏱ {moment(job?.date?.toDate()).format('LL')}
              </Text>
            </View>
            {job?.task?.desc && (
              <Text style={[Fonts.textTitle, Gutters.tinyTMargin]}>
                {job?.task?.desc}
              </Text>
            )}
            <Text style={[Gutters.tinyTMargin]}>
              {minimizetext(job?.observations, 30)}
            </Text>
            <View
              style={[
                Layout.fill,
                Layout.rowCenter,
                Layout.justifyContentSpaceBetween,
              ]}>
              <View style={[Layout.rowCenter]}>
                <InfoIcon
                  info={job.done ? 'Termianda' : 'Sin terminar'}
                  color={job.done ? '#7dd891' : '#ED7A7A'}
                />
              </View>
              <View
                style={[
                  Layout.rowCenter,
                  Layout.alignItemsEnd,
                  Gutters.smallRMargin,
                ]}>
                {job?.workers?.map((worker, i) => (
                  <Avatar
                    key={worker.id || i}
                    uri={worker.profileImage}
                    overlap={job?.workers?.length > 1}
                    size="medium"
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

export default JobItem;
