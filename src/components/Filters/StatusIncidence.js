import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Variants} from '../../Theme/Variables';
import Filter from './Filter';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 0,
  },
});

const StatusIncidence = ({onChangeFilter, state}) => {
  return (
    <View style={styles.container}>
      <Filter
        text="Resuletas"
        color={Variants.success}
        active={state === true}
        onPress={() => onChangeFilter(true)}
      />
      <Filter
        text="Sin resolver"
        color={Variants.danger}
        active={state === false}
        onPress={() => onChangeFilter(false)}
      />
    </View>
  );
};

export default React.memo(StatusIncidence);
