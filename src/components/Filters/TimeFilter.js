import React from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useTheme} from '../../Theme';
import {Variants} from '../../Theme/Variables';
import {parseTimeFilter} from '../../utils/parsers';
import Filter from './Filter';

const TimeFilter = ({onChangeFilter, state, withAll}) => {
  const {t} = useTranslation();
  const {Layout} = useTheme();

  return (
    <View style={[Layout.row]}>
      <Filter
        text={t('common.filters.time.week')}
        color={Variants.filter}
        active={state.filter === 'week'}
        onPress={() => onChangeFilter(parseTimeFilter('week'))}
      />
      <Filter
        text={t('common.filters.time.month')}
        color={Variants.filter}
        active={state.filter === 'month'}
        onPress={() => onChangeFilter(parseTimeFilter('month'))}
      />
      <Filter
        text={t('common.filters.time.year')}
        color={Variants.filter}
        active={state.filter === 'year'}
        onPress={() => onChangeFilter(parseTimeFilter('year'))}
      />
      {withAll && (
        <Filter
          text={t('common.filters.time.all')}
          color={Variants.filter}
          active={state.filter === 'all'}
          onPress={() => onChangeFilter(parseTimeFilter('all'))}
        />
      )}
    </View>
  );
};

export default TimeFilter;
