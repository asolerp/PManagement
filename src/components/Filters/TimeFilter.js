import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../Theme';
import {Variants} from '../../Theme/Variables';
import {parseTimeFilter} from '../../utils/parsers';
import Filter from './Filter';

const TimeFilter = ({onChangeFilter, state, withAll}) => {
  const {Layout, Gutters} = useTheme();

  return (
    <View style={[Layout.row, Gutters.smallBMargin]}>
      <Filter
        text="Esta semana"
        color={Variants.filter}
        active={state.filter === 'week'}
        onPress={() => onChangeFilter(parseTimeFilter('week'))}
      />
      <Filter
        text="Este mes"
        color={Variants.filter}
        active={state.filter === 'month'}
        onPress={() => onChangeFilter(parseTimeFilter('month'))}
      />
      <Filter
        text="Este año"
        color={Variants.filter}
        active={state.filter === 'year'}
        onPress={() => onChangeFilter(parseTimeFilter('year'))}
      />
      {withAll && (
        <Filter
          text="Todo"
          color={Variants.filter}
          active={state.filter === 'all'}
          onPress={() => onChangeFilter(parseTimeFilter('all'))}
        />
      )}
    </View>
  );
};

export default TimeFilter;
