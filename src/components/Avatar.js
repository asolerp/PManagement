import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Text, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';

import {openScreenWithPush} from '../Router/utils/actions';
import {PROFILE_SCREEN_KEY} from '../Router/utils/routerKeys';
import theme from '../Theme/Theme';

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

const Avatar = ({
  id,
  uri,
  name,
  overlap,
  position,
  enabled = true,
  size = 'small',
  index,
  style,
}) => {
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

  const ProfileContainer = () => {
    return (
      <React.Fragment>
        <FastImage
          style={[
            styles.ownerImage,
            {width: parseSize(size), height: parseSize(size)},
            {marginLeft: index > 0 && overlap ? -10 : 0},
            {marginRight: name ? 15 : 0},
          ]}
          source={{
            uri: uri,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
        {name && <Text style={[theme.textBlack]}>{name}</Text>}
      </React.Fragment>
    );
  };

  if (id) {
    return (
      <TouchableOpacity
        key={id}
        onPress={() =>
          enabled &&
          openScreenWithPush(PROFILE_SCREEN_KEY, {
            userId: id,
          })
        }
        style={[
          styles.ownerWrapper,
          {backgroundColor: 'transparent'},
          {flexDirection: name ? 'column' : 'row', zIndex: position},
          style,
        ]}>
        <ProfileContainer />
      </TouchableOpacity>
    );
  }

  return <ProfileContainer />;
};

export default Avatar;
