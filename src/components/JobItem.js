import React from 'react';

import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';

//UI
import Avatar from './Avatar';

// Utils
import moment from 'moment';
import {minimizetext} from '../utils/parsers';
import {DARK_BLUE, GREY, GREY_1} from '../styles/colors';
import {useLocales} from '../utils/useLocales';
import {useTheme} from '../Theme';
import {Colors} from '../Theme/Variables';
import useNoReadMessages from '../hooks/useNoReadMessages';
import {JOBS} from '../utils/firebaseKeys';
import Counter from './Counter';
import Badge from './Elements/Badge';
import {useTranslation} from 'react-i18next';

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
  const {locale} = useLocales();
  const {t} = useTranslation();
  const {noReadCounter} = useNoReadMessages({
    collection: JOBS,
    docId: job?.id,
  });
  const taksDescByLocale =
    job &&
    (job?.task?.locales?.[locale]?.desc ||
      job?.task?.locales?.en?.desc ||
      job?.task?.desc);

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
            backgroundColor: Colors.white,
            borderTopColor: Colors.lowGrey,
            borderRightColor: Colors.lowGrey,
            borderBottomColor: Colors.lowGrey,
            borderLeftColor: Colors.pm,
          },
        ]}>
        <View style={[Layout.fill]}>
          <View>
            <View style={[Layout.row, Layout.justifyContentSpaceBetween]}>
              {job?.task?.desc && (
                <Text style={[Fonts.titleCard, {maxWidth: 150}]}>
                  {taksDescByLocale}
                </Text>
              )}
              <Badge text={job?.house?.[0]?.houseName} variant="purple" />
            </View>
            <Text style={[Fonts.textInfo, Gutters.smallBMargin]}>
              {minimizetext(job?.observations, 30)}
            </Text>
            <Badge
              text={moment(job?.date?.toDate()).format('LL')}
              label={t('common.date') + ': '}
            />
            <View
              style={[
                Layout.fill,
                Layout.rowCenter,
                Layout.justifyContentSpaceBetween,
              ]}>
              <View style={[Layout.row, Gutters.smallTMargin]}>
                {job?.workers?.map((worker, i) => (
                  <Avatar
                    key={worker.id || i}
                    index={i}
                    uri={worker.profileImage?.small}
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
