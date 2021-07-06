import React, {useState, useEffect} from 'react';

import {View, Text, FlatList, StyleSheet} from 'react-native';

// Firebase
import {useGetFirebase} from '../hooks/useGetFirebase';

import {SearchBar} from 'react-native-elements';
import ItemList from './ItemList';
import CustomButton from './Elements/CustomButton';

const DynamicSelectorList = ({
  collection,
  searchBy,
  onSave,
  order,
  where,
  schema,
  set,
  get,
  multiple = false,
  closeModal,
}) => {
  const [search, setSearch] = useState();
  const [filteredList, setFilteredList] = useState();
  const {list, loading} = useGetFirebase(collection, order, where);
  const [selected, setSelected] = useState(get);

  const [loadingOnSave, setLoadingOnSave] = useState(false);

  const fList = search
    ? list.filter((item) =>
        item[searchBy].toLowerCase().includes(search?.toLowerCase()),
      )
    : list;

  const onSubmit = async () => {
    set(selected);
    if (onSave) {
      try {
        setLoadingOnSave(true);
        return await onSave(selected);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingOnSave(false);
        closeModal();
      }
    }
    closeModal();
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
          return setSelected([]);
        }
        return setSelected([item]);
      } else {
        if (!newValue) {
          const updatedItemList = selected?.filter((i) => i?.id !== item?.id);
          return setSelected(updatedItemList);
        }
        return setSelected([...(selected || []), item]);
      }
    };

    console.log(selected);

    return (
      <React.Fragment>
        <ItemList
          item={item}
          schema={schema}
          setter={set}
          handleChange={handleChange}
          active={selected?.some((i) => i?.id === item?.id)}
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
          placeholder="Escribe aquí..."
          onChangeText={setSearch}
          value={search}
          platform="ios"
          round
          containerStyle={{padding: 0}}
          inputStyle={{fontSize: 14, padding: 0}}
        />
        <View style={{flex: 1, alignSelf: 'stretch'}}>
          <FlatList
            data={fList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </View>
        <CustomButton
          loading={loadingOnSave}
          styled="rounded"
          title="Guardar"
          onPress={onSubmit}
        />
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
