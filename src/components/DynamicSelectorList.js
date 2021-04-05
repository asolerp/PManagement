import React, {useState, useEffect} from 'react';

import {View, Text, FlatList, StyleSheet} from 'react-native';

// Firebase
import {useGetFirebase} from '../hooks/useGetFirebase';

import {SearchBar} from 'react-native-elements';
import ItemList from './ItemList';

const DynamicSelectorList = ({
  collection,
  searchBy,
  order,
  where,
  schema,
  set,
  get,
  multiple = false,
}) => {
  const [search, setSearch] = useState();
  const [filteredList, setFilteredList] = useState();
  const {list, loading, error} = useGetFirebase(collection, order, where);

  const handleSearch = (text) => {
    setSearch(text);
    const fList = list.filter((item) =>
      item[searchBy].toLowerCase().includes(search?.toLowerCase()),
    );
    setFilteredList(fList);
  };

  useEffect(() => {
    if (search?.lenght === 0 || !search) {
      setFilteredList(undefined);
    }
  }, [search]);

  const renderItem = ({item}) => {
    const handleChange = (newValue) => {
      if (!multiple) {
        if (!newValue) {
          set([]);
        } else {
          console.log(item, 'item');
          set([item]);
        }
      } else {
        if (!newValue) {
          const updatedItemList = get?.filter((i) => i?.id !== item?.id);
          set(updatedItemList);
        } else {
          set([...(get || []), item]);
        }
      }
    };

    console.log(get?.some((i) => i?.id === item?.id));

    return (
      <React.Fragment>
        <ItemList
          item={item}
          schema={schema}
          setter={set}
          handleChange={handleChange}
          active={get?.some((i) => i?.id === item?.id)}
          multiple={multiple}
        />
        <View style={styles.separator} />
      </React.Fragment>
    );
  };

  if (loading) {
    return <Text>No se han encontrado propietarios</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.userListSelectorScreen}>
        <SearchBar
          placeholder="Type Here..."
          onChangeText={handleSearch}
          value={search}
          platform="ios"
          round
          containerStyle={{padding: 0}}
          inputStyle={{fontSize: 14, padding: 0}}
        />
        <View style={{flex: 1, alignSelf: 'stretch'}}>
          <FlatList
            data={list}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  titleWrapper: {},
  userListSelectorScreen: {},
  scrollWrapper: {
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
  separator: {
    borderBottomColor: '#EAEAEA',
    borderBottomWidth: 1,
  },
});

export default DynamicSelectorList;
