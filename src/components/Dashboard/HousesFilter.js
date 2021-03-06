import React from 'react';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {View, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useTheme} from '../../Theme';
import theme from '../../Theme/Theme';

import {Colors} from '../../Theme/Variables';
import FastImage from 'react-native-fast-image';
import {HousesSkeleton} from './HousesSkeleton';

export const HousesFilter = ({houses, onClickHouse}) => {
  const [values, loading] = useCollectionData(
    firestore().collection('houses'),
    {
      idField: 'id',
    },
  );
  const {Gutters} = useTheme();

  const isInArray = (id) => {
    return houses?.find((idHouse) => idHouse === id);
  };

  const handleSetHouse = (house) => {
    if (isInArray(house.id)) {
      const housesWithoutID = houses?.filter((id) => {
        return id !== house.id;
      });
      onClickHouse(housesWithoutID);
    } else {
      onClickHouse([...(houses || []), house.id]);
    }
  };

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleSetHouse(item)}
        style={[
          isInArray(item.id) && styles.activeFilter,
          Gutters.tinyHMargin,
        ]}>
        <FastImage
          style={[{width: 60, height: 60, borderRadius: 100}]}
          source={{
            uri: item.houseImage,
            headers: {Authorization: 'someAuthToken'},
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[theme.mT2]}>
      {loading ? (
        <HousesSkeleton />
      ) : (
        <FlatList
          lo
          horizontal
          showsHorizontalScrollIndicator={false}
          data={values}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activeFilter: {
    borderWidth: 3,
    borderColor: Colors.success,
    borderRadius: 100,
    backgroundColor: 'transparent',
  },
});
