import React from 'react';
import {ImageBackground} from 'react-native';

import {View, Text, Image, StyleSheet} from 'react-native';
import ImageBlurLoading from 'react-native-image-blur-loading';

const Owner = ({owner}) => {
  return (
    <View style={styles.ownerWrapper}>
      <Image
        style={styles.ownerImage}
        source={{
          uri: owner?.profileImage,
        }}
      />
    </View>
  );
};

const HouseItemList = ({house}) => {
  return (
    <View style={styles.container}>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <ImageBlurLoading
          withIndicator
          thumbnailSource={{uri: house?.thumbail}}
          source={{uri: house?.houseImage}}
          style={styles.avatarWrapper}
        />
        <View style={styles.leftTop}>
          <Text style={styles.name}>{house?.houseName}</Text>
          <Text style={styles.ownerTitle}>{house?.owner?.firstName}</Text>
          <Text style={styles.street}>{house?.street}</Text>
          <Text style={styles.ownerTitle}>{house?.owner?.phone}</Text>
        </View>
        <View style={styles.left} />
        <View style={styles.right}>
          <Owner owner={house.owner} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 180,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignSelf: 'stretch',
    marginTop: 10,
    marginBottom: 10,
  },
  avatarWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: 180,
    borderRadius: 20,
    position: 'absolute',
  },
  ownerWrapper: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  leftTop: {
    position: 'absolute',
    width: '50%',
    height: 180,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: 'rgba(79,138, 163, .5)',
    paddingLeft: 10,
    paddingTop: 10,
  },
  left: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    zIndex: 1,
  },
  right: {
    flex: 1,
    justifyContent: 'space-around',
    alignSelf: 'stretch',
  },
  ownerTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    color: 'white',
  },
  ownerImage: {
    width: 60,
    height: 60,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: 'white',
    zIndex: 10,
  },
  street: {
    color: 'white',
  },
  avatar: {
    flex: 1,
    height: 150,
    resizeMode: 'cover',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 25,
    color: 'white',
  },
});

export default HouseItemList;
