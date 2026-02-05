import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity
} from 'react-native';

import { Colors } from '../../Theme/Variables';

import {
  getFirestore,
  collection,
  query,
  where
} from '@react-native-firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useTheme } from '../../Theme';

const heightFilter = 60;
const widthFilter = 60;

const styles = StyleSheet.create({
  filterWrapper: {
    marginTop: 10
  },
  container: {
    width: '100%',
    marginTop: 10,
    paddingLeft: 0
  },
  titleFilter: {
    color: Colors.darkBlue,
    fontSize: 25,
    fontWeight: 'bold'
  },
  houseFilter: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: widthFilter,
    height: 60
  },
  avatarContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    width: '100%',
    height: heightFilter,
    zIndex: 1
  },
  maskContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60
  },
  activeFilter: {
    width: 64,
    borderWidth: 2,
    borderColor: Colors.success,
    borderRadius: 100,
    backgroundColor: 'transparent'
  },
  textWrapper: {
    justifyContent: 'flex-end',
    padding: 10,
    position: 'absolute',
    borderRadius: 100,
    width: '100%',
    height: heightFilter,
    zIndex: 3
  },
  maskWrapper: {
    position: 'absolute',
    opacity: 0.56,
    borderRadius: 100,
    width: '100%',
    height: heightFilter,
    zIndex: 2
  },
  textStyle: {
    textAlign: 'left',
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold'
  }
});

const WorkersFilter = ({ workers, onClickWorker }) => {
  const { Gutters, Layout, Fonts } = useTheme();
  const db = getFirestore();
  const workersQuery = query(
    collection(db, 'users'),
    where('role', '==', 'worker')
  );
  const [values] = useCollectionData(workersQuery, {
    idField: 'id'
  });
  const isInArray = id => {
    return workers?.find(idHouse => idHouse === id);
  };

  const handleSetWorker = house => {
    if (isInArray(house.id)) {
      const housesWithoutID = workers?.filter(id => {
        return id !== house.id;
      });
      onClickWorker(housesWithoutID);
    } else {
      onClickWorker([...(workers || []), house.id]);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[Layout.colCenter, Layout.justifyContentCenter]}>
      <TouchableOpacity
        key={item.id}
        onPress={() => handleSetWorker(item)}
        style={[
          Layout.colCenter,
          Layout.justifyContentCenter,
          isInArray(item.id) && styles.activeFilter,
          { marginHorizontal: 5 }
        ]}
      >
        <View style={[styles.houseFilter]}>
          <View style={[styles.avatarContainer]}>
            <Image
              style={[
                styles.ownerImage,
                { width: 55, height: 55, borderRadius: 100 }
              ]}
              source={{
                uri: item.profileImage?.small
              }}
            />
          </View>
        </View>
      </TouchableOpacity>
      <Text style={[Fonts.textTiny, Gutters.tinyTMargin]}>
        {item?.firstName}
      </Text>
    </View>
  );

  return (
    <View style={[Gutters.smallTMargin]}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={values}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default WorkersFilter;
