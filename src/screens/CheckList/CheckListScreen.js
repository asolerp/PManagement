import React from 'react';

import {View, FlatList, Text, StyleSheet, TouchableOpacity} from 'react-native';
import CheckItem from '../../components/CheckItem';
import AddButton from '../../components/Elements/AddButton';

import PagetLayout from '../../components/PageLayout';

// Styles
import {defaultLabel, marginBottom} from '../../styles/common';
import GlobalFilters from '../../components/GlobalFilters';
import useFilter from '../../hooks/useFilter';
import {useGetFirebase} from '../../hooks/useGetFirebase';

const styles = StyleSheet.create({
  filterWrapper: {
    marginVertical: 20,
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 40,
    zIndex: 10,
  },
  todayStyle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  checkListWrapper: {
    marginTop: 20,
  },
});

const CheckListScreen = ({navigation}) => {
  const {list, loading} = useGetFirebase('checklists');

  const renderItem = ({item}) => (
    <CheckItem
      key={item.id}
      check={item}
      onPress={() =>
        navigation.navigate('Check', {
          checkId: item.id,
        })
      }
    />
  );

  const handleNewCheckList = () => {
    navigation.navigate('NewCheckList');
  };

  if (loading) {
    return null;
  }

  return (
    <React.Fragment>
      <View style={styles.addButton}>
        <TouchableOpacity onPress={() => handleNewCheckList()}>
          <AddButton iconName="add" />
        </TouchableOpacity>
      </View>
      <PagetLayout
        titleLefSide={true}
        titleProps={{
          title: 'CheckList',
          subPage: false,
        }}>
        <View>
          <View style={styles.filterWrapper}>
            {/* <GlobalFilters storage="checklists" /> */}
            <View style={styles.checkListWrapper}>
              <Text style={{...defaultLabel, ...marginBottom(20)}}>
                CheckList
              </Text>
              <FlatList
                data={list}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
              />
            </View>
          </View>
        </View>
      </PagetLayout>
    </React.Fragment>
  );
};

export default CheckListScreen;
