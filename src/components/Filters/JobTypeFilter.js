import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet} from 'react-native';
import {Variants} from '../../Theme/Variables';
import Filter from './Filter';

export const JobTypeFilter = ({onChangeFilter, state}) => {
  const {t} = useTranslation();

  const handlePressFilter = (type) => {
    if (state?.some((t) => t === type)) {
      onChangeFilter(state.filter((t) => t !== type));
    } else {
      onChangeFilter(state.concat(type));
    }
  };

  return (
    <View style={styles.container}>
      <Filter
        text={t('jobs.title')}
        color={Variants.filter}
        active={state?.some((t) => t === 'jobs')}
        onPress={() => handlePressFilter('jobs')}
      />
      <Filter
        text={t('incidences.title')}
        color={Variants.filter}
        active={state?.some((t) => t === 'incidences')}
        onPress={() => handlePressFilter('incidences')}
      />
      <Filter
        text={t('checklists.title')}
        color={Variants.filter}
        active={state?.some((t) => t === 'checklists')}
        onPress={() => handlePressFilter('checklists')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 0,
  },
});
