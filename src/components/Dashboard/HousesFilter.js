import React from 'react';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {View, FlatList, TouchableOpacity, StyleSheet, Text} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useTheme} from '../../Theme';
import theme from '../../Theme/Theme';

import {Colors} from '../../Theme/Variables';
import FastImage from 'react-native-fast-image';
import {HousesSkeleton} from './HousesSkeleton';
import {DEFAULT_IMAGE} from '../../constants/general';

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
      <View style={[theme.itemsCenter]}>
        <TouchableOpacity
          key={item.id}
          onPress={() => handleSetHouse(item)}
          style={[
            isInArray(item.id) && styles.activeFilter,
            Gutters.tinyHMargin,
          ]}>
          <FastImage
            style={[{width: 70, height: 70, borderRadius: 100}]}
            source={{
              uri: item?.houseImage?.small || DEFAULT_IMAGE,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[theme.maxW16, theme.textXs, theme.textGray700, theme.mT2]}>
          {item?.houseName}
        </Text>
      </View>
    );
  };

  return (
    <View style={[theme.mT2]}>
      {loading ? (
        <HousesSkeleton />
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={values}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[theme.pX4]}
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
