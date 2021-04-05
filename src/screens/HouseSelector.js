import React, {useState, useEffect} from 'react';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  Button,
} from 'react-native';

// Firebase
import firestore from '@react-native-firebase/firestore';

import {SearchBar} from 'react-native-elements';
import HouseList from '../components/HouseList';

const HouseSelector = ({handleClose}) => {
  const [search, setSearch] = useState();
  const [list, setList] = useState();

  const [usersSelected, setUsersSelected] = useState({});

  useEffect(() => {
    const listUsers = [];
    firestore()
      .collection('houses')
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          listUsers.push({id: documentSnapshot.id, ...documentSnapshot.data()});
        });
      })
      .then(() => setList(listUsers));
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
  };

  const renderItem = ({item}) => {
    return (
      <React.Fragment>
        <HouseList
          house={item}
          selectedUser={usersSelected}
          setSelectedUser={setUsersSelected}
        />
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.userListSelectorScreen}>
        <SearchBar
          placeholder="Type Here..."
          onChangeText={handleSearch}
          value={search}
          platform="ios"
        />

        <ScrollView contentContainerStyle={styles.scrollWrapper}>
          {list ? (
            <View style={{flex: 1, alignSelf: 'stretch'}}>
              <FlatList
                data={list}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
              />
            </View>
          ) : (
            <Text>No se han encontrado propietarios</Text>
          )}
        </ScrollView>
        <Button onPress={() => handleClose()} title="Cerrar" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    marginTop: 50,
  },
  titleWrapper: {
    flex: 1.2,
  },
  userListSelectorScreen: {
    flex: 6,
  },
  scrollWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerSearchBar: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
  },
  inputContainerStyle: {
    backgroundColor: 'white',
  },
});

export default HouseSelector;
