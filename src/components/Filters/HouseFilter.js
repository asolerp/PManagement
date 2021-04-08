import React from 'react';
import {View, Image, StyleSheet, Text, FlatList} from 'react-native';

import {useGetFirebase} from '../../hooks/useGetFirebase';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';

import {DARK_BLUE} from '../../styles/colors';

const heightFilter = 120;
const widthFilter = 90;

const styles = StyleSheet.create({
  filterWrapper: {
    marginTop: 10,
  },
  container: {
    width: '100%',
    marginTop: 10,
    paddingLeft: 0,
  },
  titleFilter: {
    color: DARK_BLUE,
    fontSize: 25,
    fontWeight: 'bold',
  },
  housesWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
  },
  houseFilter: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: widthFilter,
    height: 120,
  },
  avatarContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    width: '100%',
    height: heightFilter,
    zIndex: 1,
  },
  maskContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  activeFilter: {
    width: 98,
    borderWidth: 4,
    borderColor: '#EB5B28',
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  textWrapper: {
    justifyContent: 'flex-end',
    padding: 10,
    position: 'absolute',
    borderRadius: 20,
    width: '100%',
    height: heightFilter,
    zIndex: 3,
  },
  maskWrapper: {
    position: 'absolute',
    backgroundColor: '#54A3AC',
    opacity: 0.56,
    borderRadius: 20,
    width: '100%',
    height: heightFilter,
    zIndex: 2,
  },
  textStyle: {
    textAlign: 'left',
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
});

const HouseFilter = ({houses, addHouse}) => {
  const {list} = useGetFirebase('houses');

  const isInArray = (id) => {
    return houses?.find((idHouse) => idHouse === id);
  };

  const handleSetHouse = (house) => {
    if (isInArray(house.id)) {
      const housesWithoutID = houses?.filter((id) => {
        return id !== house.id;
      });
      addHouse(housesWithoutID);
    } else {
      addHouse([...(houses || []), house.id]);
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleSetHouse(item)}
      style={[
        isInArray(item.id) && styles.activeFilter,
        {marginHorizontal: 10},
      ]}>
      <View style={[styles.houseFilter]}>
        <View style={[styles.avatarContainer]}>
          <Image
            style={[
              styles.ownerImage,
              {width: 90, height: 120, borderRadius: 20},
            ]}
            source={{
              uri: item.houseImage,
            }}
          />
        </View>
        <View style={styles.maskWrapper} />
        <View style={styles.textWrapper}>
          <Text style={styles.textStyle}>{item.houseName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.filterWrapper}>
      <Text style={styles.titleFilter}>Las Casas</Text>
      <View style={styles.container}>
        <View style={styles.housesWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={list}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </View>
    </View>
  );
};

export default HouseFilter;
