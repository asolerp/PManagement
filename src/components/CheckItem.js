import React from 'react';
import {TouchableOpacity, StyleSheet, View, Text} from 'react-native';
import {DARK_BLUE, GREY_1} from '../styles/colors';

// Utils
import {minimizetext} from '../utils/parsers';
import {parsePercentageDone} from '../utils/parsers';

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
  countStyle: {
    color: DARK_BLUE,
    fontWeight: '600',
    fontSize: 14,
  },
});

const CheckItem = ({check, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.checkItemWrapper}>
        <View style={{flexDirection: 'row'}}>
          <View
            style={[
              styles.priority,
              {backgroundColor: parsePercentageDone(check.done / check.total)},
            ]}
          />
          <View>
            <Text style={{...styles.checkText, ...styles.bold}}>
              🏡 {check.house[0].houseName}
            </Text>
            <Text style={styles.checkText}>
              {minimizetext(check.observations, 30)}
            </Text>
          </View>
        </View>
        <View>
          <Text style={styles.countStyle}>
            {check.done}/{check.total}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CheckItem;
