import React, {useState} from 'react';

import {View, FlatList, StyleSheet, KeyboardAvoidingView} from 'react-native';

// Firebase
import {useGetFirebase} from '../hooks/useGetFirebase';

import {error} from '../lib/logging';
import {SearchBar} from 'react-native-elements';
import ItemList from './ItemList';
import CustomButton from './Elements/CustomButton';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../Theme';

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
  const {t} = useTranslation();
  const [search, setSearch] = useState();
  const {list} = useGetFirebase(collection, order, where);
  const [selected, setSelected] = useState(get);
  const [loadingOnSave, setLoadingOnSave] = useState(false);
  const {Gutters} = useTheme();

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
      } catch (err) {
        error({
          message: err.message,
          track: true,
          asToast: true,
        });
      } finally {
        setLoadingOnSave(false);
        closeModal();
      }
    }
    closeModal();
  };

  const renderItem = ({item}) => {
    const handleChange = (newValue) => {
      if (!multiple) {
        if (!newValue) {
          return setSelected([]);
        }
        return setSelected([item]);
      } else {
        if (!newValue) {
          const updatedItemList = selected?.filter(
            (i) => (i?.id || i?.uid) !== item?.id,
          );
          return setSelected(updatedItemList);
        }
        return setSelected([...(selected || []), item]);
      }
    };

    return (
      <React.Fragment>
        <ItemList
          item={item}
          schema={schema}
          setter={set}
          handleChange={handleChange}
          active={selected?.some((i) => (i?.id || i?.uid) === item?.id)}
          multiple={multiple}
        />
        <View style={styles.separator} />
      </React.Fragment>
    );
  };

  return (
    <View>
      <View style={styles.userListSelectorScreen}>
        <SearchBar
          placeholder={t('common.search_name')}
          onChangeText={setSearch}
          value={search}
          platform="ios"
          round
          containerStyle={{padding: 0}}
          inputStyle={{fontSize: 14, padding: 0}}
        />
        <View style={[Gutters.regularVPadding]}>
          <FlatList
            data={fList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </View>
        <KeyboardAvoidingView behavior="padding">
          <CustomButton
            loading={loadingOnSave}
            styled="rounded"
            title={t('common.save')}
            onPress={onSubmit}
          />
        </KeyboardAvoidingView>
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
