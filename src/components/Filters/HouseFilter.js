import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import {Colors} from '../../Theme/Variables';

import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

const heightFilter = 80;
const heightImage = 75;
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
    color: Colors.darkBlue,
    fontSize: 25,
    fontWeight: 'bold',
  },
  houseFilter: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: widthFilter,
    height: heightFilter,
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
    height: heightFilter,
  },
  activeFilter: {
    width: 94,
    borderWidth: 2,
    borderColor: Colors.success,
    borderRadius: 15,
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
    borderRadius: 10,
    width: 85,
    height: heightImage,
    zIndex: 2,
  },
  textStyle: {
    textAlign: 'left',
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
});

const HouseFilter = ({houses, onClickHouse}) => {
  const [values] = useCollectionData(firestore().collection('houses'), {
    idField: 'id',
  });
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

  const renderItem = ({item}) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleSetHouse(item)}
      style={[
        isInArray(item.id) && styles.activeFilter,
        {marginHorizontal: 5},
      ]}>
      <View style={[styles.houseFilter]}>
        <View style={[styles.avatarContainer]}>
          <Image
            style={[
              styles.ownerImage,
              {width: 85, height: heightImage, borderRadius: 10},
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
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={values}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};

export default HouseFilter;
