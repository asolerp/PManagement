import React from 'react';
import {TouchableOpacity} from 'react-native';
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
  ownerImage: {
    width: 25,
    height: 25,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
});

const Avatar = ({id, uri, name, overlap, position, size = 'small', index}) => {
  const parseSize = (sizeImage) => {
    switch (sizeImage) {
      case 'xxl': {
        return 150;
      }
      case 'tiny': {
        return 25;
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
    <TouchableOpacity
      key={id}
      onPress={() =>
        id &&
        openScreenWithPush(PROFILE_SCREEN_KEY, {
          userId: id,
        })
      }
      style={[
        styles.ownerWrapper,
        {backgroundColor: 'transparent'},
        {flexDirection: name ? 'column' : 'row', zIndex: position},
      ]}>
      <React.Fragment>
        <Image
          resizeMode={'cover'}
          style={[
            styles.ownerImage,
            {width: parseSize(size), height: parseSize(size)},
            {marginLeft: index > 0 && overlap ? -10 : 0},
            {marginRight: name ? 15 : 0},
          ]}
          source={{
            uri: uri,
          }}
        />
        {name && <Text>{name}</Text>}
      </React.Fragment>
    </TouchableOpacity>
  );
};

export default Avatar;
