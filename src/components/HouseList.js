import React, {useContext} from 'react';

import {View, Text, Image, StyleSheet} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {NewHouseFormContext} from '../context/newHouseFormContext';

const HouseList = ({house}) => {
  const {users, handleUsers} = useContext(NewHouseFormContext);

  const findUserID = (uid) => {
    return users?.find((u) => u.id === uid);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <Image
          style={styles.avatar}
          source={{
            uri: house?.houseImage,
          }}
        />
      </View>
      <View style={styles.infoWrapper}>
        <Text style={styles.name}>{house.houseName}</Text>
      </View>
      <View style={styles.checkboxWrapper}>
        <CheckBox
          disabled={false}
          value={findUserID(house.id) ? true : false}
          onValueChange={(newValue) => {
            if (!newValue) {
              handleUsers(users?.filter((u) => u.id !== house.id));
            } else {
              handleUsers([...users, house]);
            }
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
  },
  avatarWrapper: {
    flex: 1,
  },
  infoWrapper: {
    flex: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 100,
    resizeMode: 'cover',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default HouseList;
