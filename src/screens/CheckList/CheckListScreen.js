import React, {useCallback} from 'react';

import {View, FlatList, Text, StyleSheet, TouchableOpacity} from 'react-native';
import CheckItem from '../../components/CheckItem';
import AddButton from '../../components/Elements/AddButton';

import PagetLayout from '../../components/PageLayout';

// Styles
import {defaultLabel, marginBottom} from '../../styles/common';
import {useGetFirebase} from '../../hooks/useGetFirebase';
import HouseFilter from '../../components/Filters/HouseFilter';
import {useSelector} from 'react-redux';
import {housesSelector} from '../../Store/Filters/filtersSlice';
import {useTheme} from '../../Theme';

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
    marginTop: 0,
  },
  housesWrapper: {},
});

const CheckListScreen = ({navigation}) => {
  const {Gutters} = useTheme();
  const houses = useSelector(housesSelector);
  const housesFilter = [
    {
      label: 'houseId',
      operator: 'in',
      condition: houses,
    },
  ];

  const {list, loading} = useGetFirebase(
    'checklists',
    null,
    houses.length > 0 && housesFilter,
  );

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
              <View
                style={[
                  styles.housesWrapper,
                  Gutters.tinyTMargin,
                  Gutters.regularBMargin,
                ]}>
                <HouseFilter />
              </View>
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
