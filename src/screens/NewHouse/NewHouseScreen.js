import React from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';

import {TouchableOpacity} from 'react-native-gesture-handler';

import Icon from 'react-native-vector-icons/MaterialIcons';
import NewFormHome from '../../components/Forms/Homes/NewHomeForm';
import PageLayout from '../../components/PageLayout';
import {popScreen} from '../../Router/utils/actions';

export const NEW_HOUSE_SCREEN_KEY = 'newHouseScreen';

const NewHouseScreen = ({navigation}) => {
  return (
    <PageLayout
      backButton
      titleProps={{
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
  newHomeScreen: {
    paddingTop: 20,
  },
});

export default NewHouseScreen;
