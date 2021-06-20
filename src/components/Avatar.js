import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {openScreenWithPush} from '../Router/utils/actions';
import {PROFILE_SCREEN_KEY} from '../Router/utils/routerKeys';

const styles = StyleSheet.create({
  ownerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  withBorder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4DAABF',
    borderRadius: 100,
    padding: 5,
  },
  ownerImage: {
    width: 25,
    height: 25,
    borderRadius: 100,
  },
});

const Avatar = ({id, uri, name, overlap, position, size = 'small'}) => {
  const parseSize = (sizeImage) => {
    switch (sizeImage) {
      case 'xxl': {
        return 150;
      }
      case 'small': {
        return 25;
      }
      case 'medium': {
        return 35;
      }
      case 'big': {
        return 45;
      }
      default: {
        return 25;
      }
    }
  };
  return (
    <TouchableWithoutFeedback
      onPress={() =>
        id &&
        openScreenWithPush(PROFILE_SCREEN_KEY, {
          userId: id,
        })
      }
      style={[
        styles.ownerWrapper,
        {flexDirection: name ? 'column' : 'row', zIndex: position},
      ]}>
      <View>
        <Image
          style={[
            styles.ownerImage,
            {width: parseSize(size), height: parseSize(size)},
            {marginLeft: overlap ? -10 : 0},
            {marginRight: name ? 15 : 0},
          ]}
          source={{
            uri: uri,
          }}
        />
        {name && <Text>{name}</Text>}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Avatar;
