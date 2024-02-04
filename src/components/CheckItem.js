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

import {useTranslation} from 'react-i18next';
import EntityItem from './EntityItem';

const CheckItem = ({check, onPress}) => {
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
