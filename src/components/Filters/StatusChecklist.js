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

const StatusChecklist = ({onChangeFilter, checklistState}) => {
  const {t} = useTranslation();
  return (
    <View style={styles.container}>
      <Filter
        text={t('common.filters.checklistState.resolved')}
        color={Variants.filter}
        active={checklistState}
        onPress={() => onChangeFilter(true)}
      />
      <Filter
        text={t('common.filters.checklistState.no_resolved')}
        color={Variants.dangerFilter}
        active={!checklistState}
        onPress={() => onChangeFilter(false)}
      />
    </View>
  );
};

export default StatusChecklist;
