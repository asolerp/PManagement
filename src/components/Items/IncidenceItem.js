import React from 'react';
import {TouchableOpacity, StyleSheet, View, Text} from 'react-native';

// Utils
import {minimizetext, parseStateIncidecne} from '../../utils/parsers';
import {PRIORITY_HEIGHT, CHECKLIST_DONE} from '../../constants/colors';
import {GREY_1} from '../../styles/colors';
import {useTheme} from '../../Theme';
import moment from 'moment';
import Counter from '../Counter';
import useNoReadMessages from '../../hooks/useNoReadMessages';
import {INCIDENCES} from '../../utils/firebaseKeys';
import Badge from '../Elements/Badge';
import {useTranslation} from 'react-i18next';
import {Colors} from '../../Theme/Variables';

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
  const {t} = useTranslation();
  const {noReadCounter} = useNoReadMessages({
    collection: INCIDENCES,
    docId: incidence.id,
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
            right: 0,
            top: 0,
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
            {
              backgroundColor: Colors.white,
              borderTopColor: Colors.lowGrey,
              borderRightColor: Colors.lowGrey,
              borderBottomColor: Colors.lowGrey,
              borderLeftColor: parseStateIncidecne(incidence?.state),
            },
          ]}>
          <View style={[Layout.fill]}>
            <View>
              <View
                style={[Layout.rowCenter, Layout.justifyContentSpaceBetween]}>
                <Text style={[Fonts.titleCard, Gutters.tinyTMargin]}>
                  {incidence?.title}
                </Text>
                <Badge text={incidence?.house?.houseName} variant="purple" />
              </View>
              <Text style={[Gutters.smallBMargin, styles.checkText]}>
                {minimizetext(incidence?.incidence, 50)}
              </Text>
              <Badge
                label={t('common.date') + ': '}
                text={moment(incidence?.date?.toDate()).format('LL')}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

export default IncidenceItem;
