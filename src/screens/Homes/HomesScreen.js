import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

// Firebase
import firestore from '@react-native-firebase/firestore';

import AddButton from '../../components/Elements/AddButton';
import TitlePage from '../../components/TitlePage';
import HouseItemList from '../../components/HouseItemList';
import {Dimensions} from 'react-native';
import PagetLayout from '../../components/PageLayout';

import {useGetFirebase} from '../../hooks/useGetFirebase';

const HomesScreen = ({navigation}) => {
  const {list: houses, loading: loadingHouses, error} = useGetFirebase(
    'houses',
  );

  const handleNewHome = () => {
    navigation.navigate('NewHome');
  };

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={{width: '100%'}}
        onPress={() =>
          navigation.navigate('HomeScreen', {
            houseId: item.id,
          })
        }>
        <HouseItemList house={item} />
      </TouchableOpacity>
    );
  };

  return (
    <React.Fragment>
      <View style={styles.addButton}>
        <TouchableOpacity onPress={() => handleNewHome()}>
          <AddButton iconName="add" />
        </TouchableOpacity>
      </View>
      <PagetLayout
        titleLefSide={true}
        titleProps={{
          leftSide: true,
          title: 'Casas',
          subPage: false,
        }}>
        <View style={styles.container}>
          <View style={styles.homesScreen}>
            {houses ? (
              <SafeAreaView style={{alignSelf: 'stretch'}}>
                <FlatList
                  data={houses}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: 'center',
                  }}
                />
              </SafeAreaView>
            ) : (
              <Text>No se han encontrado casas</Text>
            )}
          </View>
        </View>
      </PagetLayout>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 15,
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 40,
    zIndex: 10,
  },
  homesScreen: {
    flex: 10,
    paddingTop: 20,
  },
  scrollWrapper: {
    flex: 1,
    alignItems: 'center',
  },
});

export default HomesScreen;
