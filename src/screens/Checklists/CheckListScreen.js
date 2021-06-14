import React, {useState} from 'react';

import {View, FlatList, Text, StyleSheet, TouchableOpacity} from 'react-native';
import CheckItem from '../../components/CheckItem';
import AddButton from '../../components/Elements/AddButton';

import PageLayout from '../../components/PageLayout';

// Styles
import {defaultLabel, marginBottom} from '../../styles/common';

import HouseFilter from '../../components/Filters/HouseFilter';
import {useTheme} from '../../Theme';
import ItemListSkeleton from '../../components/Skeleton/ItemListSkeleton';

import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {openScreenWithPush} from '../../Router/utils/actions';
import {
  CHECK_SCREEN_KEY,
  CHECK_STACK_KEY,
  NEW_CHECKLIST_SCREEN,
} from '../../Router/utils/routerKeys';

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
});

const CheckListScreen = ({navigation}) => {
  const {Gutters, Layout, Fonts} = useTheme();
  const [filterHouses, setFilterHouses] = useState([]);

  const [values, loading] = useCollectionData(
    firestore().collection('checklists').orderBy('date', 'asc'),
    {
      idField: 'id',
    },
  );

  const checklist = values?.filter((check) =>
    filterHouses.length > 0 ? filterHouses.includes(check.houseId) : true,
  );

  const renderItem = ({item}) => (
    <CheckItem
      key={item.id}
      check={item}
      onPress={() =>
        openScreenWithPush(CHECK_STACK_KEY, {
          screen: CHECK_SCREEN_KEY,
          docId: item.id,
        })
      }
    />
  );

  const handleNewCheckList = () => {
    openScreenWithPush(NEW_CHECKLIST_SCREEN);
  };

  const noFoundMessage = (checklist) =>
    checklist?.filter((check) =>
      filterHouses.length > 0 ? filterHouses.includes(check.houseId) : true,
    ).length === 0;

  return (
    <React.Fragment>
      <View style={styles.addButton}>
        <TouchableOpacity onPress={() => handleNewCheckList()}>
          <AddButton iconName="add" />
        </TouchableOpacity>
      </View>
      <PageLayout
        titleLefSide={true}
        titleProps={{
          title: 'CheckList',
          subPage: false,
        }}>
        <View style={[Layout.fill]}>
          <View style={[Layout.fill, styles.filterWrapper]}>
            <View style={[Layout.fill, styles.checkListWrapper]}>
              <View
                style={[
                  styles.housesWrapper,
                  Gutters.tinyTMargin,
                  Gutters.regularBMargin,
                ]}>
                <HouseFilter
                  houses={filterHouses}
                  onClickHouse={(houses) => setFilterHouses(houses)}
                />
              </View>
              <Text style={{...defaultLabel, ...marginBottom(20)}}>
                CheckList
              </Text>
              {noFoundMessage(values) && (
                <View style={[Layout.rowCenter]}>
                  <Text style={[Fonts.textSmall]}>
                    No hay ningún checklist con esta selección de casas
                  </Text>
                </View>
              )}
              {loading ? (
                <ItemListSkeleton />
              ) : (
                <View style={[Layout.fill]}>
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    data={checklist}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </PageLayout>
    </React.Fragment>
  );
};

export default CheckListScreen;
