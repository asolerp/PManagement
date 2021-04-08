import React, {useState, useEffect} from 'react';
import {View, FlatList, Text, StyleSheet, TouchableOpacity} from 'react-native';
import CheckItem from '../../components/CheckItem';
import AddButton from '../../components/Elements/AddButton';
import HouseFilter from '../../components/Filters/HouseFilter';
import PagetLayout from '../../components/PageLayout';

//Firebase
import {useGetFirebase} from '../../hooks/useGetFirebase';

// Styles
import {defaultLabel, marginBottom} from '../../styles/common';

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

  const {list: checkLists, loading} = useGetFirebase('checklists');

  const [housesFilter, setHousesFilter] = useState([]);
  const [filteredChecksByHouse, setFilteredChecksByHouse] = useState([]);

  useEffect(() => {
    if (housesFilter.length > 0) {
      const fHouses = checkLists.filter((check) =>
        housesFilter?.find((houseId) => houseId === check?.houseId),
      );
      setFilteredChecksByHouse(fHouses);
    } else {
      setFilteredChecksByHouse(checkLists);
    }
  }, [housesFilter, checkLists]);

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
            <HouseFilter houses={housesFilter} addHouse={setHousesFilter} />
            <View style={styles.checkListWrapper}>
              <Text style={{...defaultLabel, ...marginBottom(20)}}>
                CheckList
              </Text>
              <FlatList
                data={filteredChecksByHouse}
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
