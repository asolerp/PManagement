import moment from 'moment';
import React from 'react';
import {TouchableOpacity, StyleSheet, View, Text} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import useNoReadMessages from '../hooks/useNoReadMessages';
import {DARK_BLUE, GREY_1} from '../styles/colors';
import {useTheme} from '../Theme';
import {Colors} from '../Theme/Variables';
import {CHECKLISTS} from '../utils/firebaseKeys';
import Avatar from '../components/Avatar';

// Utils
import {minimizetext} from '../utils/parsers';
import {parsePercentageDone} from '../utils/parsers';
import Counter from './Counter';
import Badge from './Elements/Badge';
import {useTranslation} from 'react-i18next';
import EntityItem from './EntityItem';

const styles = StyleSheet.create({
  bold: {
    fontWeight: 'bold',
  },
  checkItemWrapper: {
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: GREY_1,
    borderLeftWidth: 10,
  },
  checkText: {
    marginTop: 5,
    color: DARK_BLUE,
  },
  priority: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'white',
  },
  date: {
    fontSize: 10,
  },
  countStyle: {
    color: DARK_BLUE,
    fontWeight: '600',
    fontSize: 14,
  },
});

const CheckItem = ({check, onPress}) => {
  const {Layout, Gutters, Fonts} = useTheme();
  const {t} = useTranslation();
  const {noReadCounter} = useNoReadMessages({
    collection: CHECKLISTS,
    docId: check.id,
  });

  return (
    <EntityItem
      check={check}
      title="Checklist"
      subtitle={minimizetext(check.observations, 30)}
      date={moment(check?.date?.toDate()).format('LL')}
      house={check?.house?.[0].houseName}
      statusColor={parsePercentageDone(check.done / check.total)}
      workers={check?.workers}
      onPress={onPress}
    />
  );
};

export default CheckItem;
