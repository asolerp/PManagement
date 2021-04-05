import React from 'react';
import {TouchableOpacity, StyleSheet, View, Text} from 'react-native';

// Utils
import {minimizetext} from '../utils/parsers';
import {parsePercentageDone} from '../utils/parsers';

const styles = StyleSheet.create({
  container: {},
  checkItemWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    borderRadius: 10,
    marginBottom: 10,
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
            <Text>🏡 {check.house[0].houseName}</Text>
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
