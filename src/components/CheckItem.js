import moment from 'moment';
import React from 'react';
import {TouchableOpacity, StyleSheet, View, Text} from 'react-native';
import useNoReadMessages from '../hooks/useNoReadMessages';
import {DARK_BLUE, GREY_1} from '../styles/colors';
import {useTheme} from '../Theme';
import {CHECKLISTS} from '../utils/firebaseKeys';

// Utils
import {minimizetext} from '../utils/parsers';
import {parsePercentageDone} from '../utils/parsers';
import Counter from './Counter';

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

  const {noReadCounter} = useNoReadMessages({
    collection: CHECKLISTS,
    docId: check.id,
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
            top: 2,
          }}
        />
      )}
      <TouchableOpacity
        onPress={onPress}
        style={[Layout.fill, Gutters.smallTMargin]}>
        <View
          style={[
            Layout.fill,
            styles.checkItemWrapper,
            {borderLeftColor: parsePercentageDone(check.done / check.total)},
          ]}>
          <View style={[Layout.fill]}>
            <View>
              <View
                style={[
                  Layout.fill,
                  Layout.rowCenter,
                  Layout.justifyContentSpaceBetween,
                ]}>
                <Text>🏡 {check?.house?.[0].houseName}</Text>
                <Text style={styles.date}>
                  ⏱ {moment(check?.date?.toDate()).format('LL')}
                </Text>
              </View>
              <Text style={[Fonts.textTitle, Gutters.smallTMargin]}>
                {minimizetext(check.observations, 30)}
              </Text>
            </View>
            <View
              style={[Layout.fill, Layout.rowCenter, Layout.justifyContentEnd]}>
              <Text style={styles.countStyle}>
                {check.done}/{check.total}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

export default CheckItem;
