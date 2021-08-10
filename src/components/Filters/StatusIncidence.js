import React from 'react';
import {useTranslation} from 'react-i18next';
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
  const {t} = useTranslation();
  return (
    <View style={styles.container}>
      <Filter
        text={t('common.filters.state.resolved')}
        color={Variants.success}
        active={state === true}
        onPress={() => onChangeFilter(true)}
      />
      <Filter
        text={t('common.filters.state.no_resolved')}
        color={Variants.danger}
        active={state === false}
        onPress={() => onChangeFilter(false)}
      />
    </View>
  );
};

export default React.memo(StatusIncidence);
