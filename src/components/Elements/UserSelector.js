import React from 'react';

import {View, Text, Image, StyleSheet} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

const UserSelector = ({label, onPress, user}) => {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.selector}>
          {user && (
            <React.Fragment>
              <View style={styles.avatarWrapper}>
                <Image
                  style={styles.avatar}
                  source={{
                    uri: user?.profileImage,
                  }}
                />
              </View>
              <View style={styles.infoWrapper}>
                <Text style={styles.name}>{user.firstName}</Text>
              </View>
            </React.Fragment>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  selector: {
    height: 50,
    borderRadius: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  label: {
    color: 'black',
    marginBottom: 10,
    fontSize: 15,
  },
  avatarWrapper: {
    flex: 1,
  },
  infoWrapper: {
    flex: 5,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 100,
    resizeMode: 'cover',
  },
  name: {
    fontSize: 15,
  },
});

export default UserSelector;
