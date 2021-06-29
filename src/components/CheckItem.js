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
          <View
            style={[
              Layout.fill,
              Layout.row,
              Layout.justifyContentSpaceBetween,
            ]}>
            <View>
              <Badge
                label="Fecha: "
                text={moment(check?.date?.toDate()).format('LL')}
              />
              <Text style={[Fonts.textInfo, Gutters.smallVMargin]}>
                {minimizetext(check.observations, 30)}
              </Text>
              <Badge text={check?.house?.[0].houseName} variant="purple" />
              <View style={[Layout.row, Gutters.smallTMargin]}>
                {check?.workers?.map((worker, i) => (
                  <Avatar
                    overlap={check?.workers.length > 1}
                    index={i}
                    id={worker.id}
                    key={worker.id}
                    uri={worker.profileImage}
                    size="medium"
                  />
                ))}
              </View>
            </View>
            <View>
              <AnimatedCircularProgress
                size={50}
                width={3}
                fill={Math.round((check?.done / check?.total) * 100)}
                tintColor={Colors.pm}
                backgroundColor={Colors.lowGrey}
                backgroundWidth={2}
                onAnimationComplete={() => console.log('onAnimationComplete')}>
                {() => (
                  <Text style={{fontSize: 12}}>
                    {Math.round((check?.done / check?.total) * 100)}%
                  </Text>
                )}
              </AnimatedCircularProgress>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

export default CheckItem;
