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
  const handlePressIncidenceFilter = (filter) => {
    if (filter === state) {
      onChangeFilter(null);
    } else {
      onChangeFilter(filter);
    }
  };

  const {t} = useTranslation();
  return (
    <View style={styles.container}>
      <Filter
        text={t('incidence.status.ini')}
        color={Variants.warningFilter}
        active={state === 'ini'}
        onPress={() => handlePressIncidenceFilter('ini')}
      />
      <Filter
        text={t('incidence.status.process')}
        color={Variants.filter}
        active={state === 'process'}
        onPress={() => handlePressIncidenceFilter('process')}
      />
      <Filter
        text={t('incidence.status.done')}
        color={Variants.successFilter}
        active={state === 'done'}
        onPress={() => handlePressIncidenceFilter('done')}
      />
    </View>
  );
};

export default React.memo(StatusIncidence);
