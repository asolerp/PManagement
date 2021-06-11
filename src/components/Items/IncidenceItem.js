import React from 'react';
import {TouchableOpacity, StyleSheet, View, Text} from 'react-native';

// Utils
import {minimizetext, parseStateIncidecne} from '../../utils/parsers';
import {PRIORITY_HEIGHT, CHECKLIST_DONE} from '../../constants/colors';
import {GREY_1} from '../../styles/colors';
import {useTheme} from '../../Theme';
import moment from 'moment';

const styles = StyleSheet.create({
  container: {},
  checkItemWrapper: {
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
  date: {
    fontSize: 10,
  },
  checkText: {
    marginTop: 5,
  },
  priority: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'white',
  },
  countStyle: {
    fontWeight: '600',
    fontSize: 14,
  },
});

const IncidenceItem = ({incidence, onPress}) => {
  const {Fonts, Gutters, Layout} = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[Layout.fill]}>
      <View
        style={[
          Layout.fill,
          styles.checkItemWrapper,
          {
            borderLeftColor: parseStateIncidecne(incidence?.state),
          },
        ]}>
        <View style={[Layout.fill]}>
          <View>
            <View style={[Layout.rowCenter, Layout.justifyContentSpaceBetween]}>
              <Text>🏡 {incidence?.house?.houseName}</Text>
              <Text style={styles.date}>
                ⏱ {moment(incidence?.date?.toDate()).format('LL')}
              </Text>
            </View>
            <Text style={[Fonts.textTitle, Gutters.tinyTMargin]}>
              {incidence?.title}
            </Text>
            <Text style={styles.checkText}>
              {minimizetext(incidence?.incidence, 30)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default IncidenceItem;
