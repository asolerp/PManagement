import React from 'react';
import {View, StyleSheet} from 'react-native';

import NewFormHome from '../../components/Forms/Homes/NewHomeForm';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';
import PageLayout from '../../components/PageLayout';
import {useTheme} from '../../Theme';

const NewHouseScreen = ({navigation}) => {
  const {Gutters} = useTheme();

  return (
    <PageLayout safe backButton>
      <View style={styles.newHomeScreen}>
        <View style={[Gutters.regularBMargin]}>
          <ScreenHeader title="Nueva casa" />
        </View>
        <NewFormHome />
      </View>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  newHomeScreen: {
    flexGrow: 1,
  },
});

export default NewHouseScreen;
