import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import NewFormHome from '../../components/Forms/Homes/NewHomeForm';
import { ScreenHeader } from '../../components/Layout/ScreenHeader';
import PageLayout from '../../components/PageLayout';
import { Spacing } from '../../Theme/Variables';

const NewHouseScreen = () => {
  const { t } = useTranslation();

  return (
    <PageLayout safe backButton edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ScreenHeader title={t('houses.newHouse')} />
        </View>
        <NewFormHome />
      </View>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    marginBottom: Spacing.lg
  }
});

export default NewHouseScreen;
