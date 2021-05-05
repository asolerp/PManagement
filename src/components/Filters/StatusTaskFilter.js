import React, {useCallback} from 'react';

// Redux
import {useSelector, useDispatch, shallowEqual} from 'react-redux';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  setStatusTaskFilter,
  statusTaskFilterSelector,
} from '../../Store/Filters/filtersSlice';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 0,
  },
  filterWrapper: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 50,
    marginRight: 10,
  },
  filterText: {
    color: 'white',
  },
});

const Filter = ({text, onPress, color, active}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          ...styles.filterWrapper,
          ...{backgroundColor: color, opacity: active ? 1 : 0.4},
        }}>
        <Text style={styles.filterText}>{text}</Text>
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
