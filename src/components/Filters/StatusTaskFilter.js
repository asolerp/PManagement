import React, {useCallback} from 'react';

// Redux
import {useSelector, useDispatch} from 'react-redux';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  setStatusTaskFilter,
  statusTaskFilterSelector,
} from '../../Store/Filters/filtersSlice';
import {useTheme} from '../../Theme';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 0,
  },
  filterWrapper: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  filterText: {
    color: 'white',
  },
});

export const Filter = ({text, onPress, color, active}) => {
  const {Fonts, Gutters} = useTheme();
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          ...styles.filterWrapper,
          ...{backgroundColor: color, opacity: active ? 1 : 0.4},
        }}>
        <Text style={[Fonts.textWhite, Gutters.smallHPadding]}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const StatusTaskFilter = () => {
  const dispatch = useDispatch();

  const statusTaskFilter = useSelector(statusTaskFilterSelector);

  const handleStatusFilter = useCallback(
    (payload) => dispatch(setStatusTaskFilter({payload})),
    [dispatch],
  );

  return (
    <View style={styles.container}>
      <Filter
        text="Terminadas"
        color="#7dd891"
        active={statusTaskFilter === true}
        onPress={() => handleStatusFilter(true)}
      />
      <Filter
        text="Sin finalizar"
        color="#ED7A7A"
        active={statusTaskFilter === false}
        onPress={() => handleStatusFilter(false)}
      />
    </View>
  );
};

export default React.memo(StatusTaskFilter);
