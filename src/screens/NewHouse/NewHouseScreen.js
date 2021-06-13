import React from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';

import {TouchableOpacity} from 'react-native-gesture-handler';

import Icon from 'react-native-vector-icons/MaterialIcons';
import NewFormHome from '../../components/Forms/Homes/NewHomeForm';
import PageLayout from '../../components/PageLayout';

import TitlePage from '../../components/TitlePage';

export const NEW_HOUSE_SCREEN_KEY = 'newHouseScreen';

const NewHouseScreen = ({navigation}) => {
  return (
    <PageLayout
      backButton
      titleLefSide={true}
      titleProps={{
        leftSide: true,
        title: 'Nueva casa',
        subPage: false,
      }}>
      <View style={styles.newHomeScreen}>
        <NewFormHome />
      </View>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  newHomeScreen: {
    flex: 7,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
});

export default NewHouseScreen;
