import React, {useState, useEffect, useCallback} from 'react';
import {useSelector, useDispatch, shallowEqual} from 'react-redux';

import {setUsers} from '../store/houseFormActions';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

// Firebase
import firestore from '@react-native-firebase/firestore';

import Icon from 'react-native-vector-icons/MaterialIcons';
import TitlePage from '../components/TitlePage';
import {SearchBar} from 'react-native-elements';
import ItemList from '../components/ItemList';

const UserListSelectorScreen = ({
  navigation,
  userType,
  multiSelect = false,
  selection,
  setSelection,
}) => {
  const [search, setSearch] = useState();
  const [list, setList] = useState();
  const dispatch = useDispatch();

  const {users} = useSelector(
    ({houseForm: {users}}) => ({users}),
    shallowEqual,
  );

  const setUsersAction = useCallback((users) => dispatch(setUsers(users)), [
    dispatch,
  ]);

  useEffect(() => {
    const listUsers = [];
    firestore()
      .collection('users')
      .where('role', '==', 'owner')
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
      <ItemList
        item={item}
        schema={{img: 'profileImage', name: 'firstName'}}
        setter={setUsersAction}
        getter={users}
        multiple={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <TitlePage
        leftSide={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back-ios" size={30} color="black" />
          </TouchableOpacity>
        }
        title="Propietarios"
      />

      <View style={styles.userListSelectorScreen}>
        <SearchBar
          placeholder="Type Here..."
          onChangeText={handleSearch}
          value={search}
          platform="ios"
          containerStyle={styles.containerSearchBar}
          inputContainerStyle={styles.inputContainerStyle}
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
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

export default UserListSelectorScreen;
