import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';

import { openScreenWithPush } from '../Router/utils/actions';
import { PROFILE_SCREEN_KEY } from '../Router/utils/routerKeys';
import theme from '../Theme/Theme';

const styles = StyleSheet.create({
  ownerImage: {
    borderColor: 'white',
    borderRadius: 100,
    borderWidth: 2,
    height: 25,
    overflow: 'hidden',
    width: 25
  },
  ownerWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  }
});

const Avatar = ({
  id,
  uri,
  name,
  overlap,
  position,
  disabled = false,
  horizontal = false,
  enabled = true,
  size = 'small',
  index,
  style
}) => {
  const parseSize = sizeImage => {
    switch (sizeImage) {
      case 'xxl': {
        return 150;
      }
      case 'xl': {
        return 60;
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
      <View style={horizontal && theme.itemsCenter}>
        <View
          style={[
            theme.roundedFull,
            theme.border0_5,
            theme.borderGray300,
            horizontal && theme.mB1
          ]}
        >
          {disabled && (
            <View
              style={[
                theme.bgError,
                theme.opacity70,
                theme.wFull,
                theme.hFull,
                theme.roundedFull,
                theme.absolute,
                theme.z10
              ]}
            />
          )}
          <FastImage
            style={[
              styles.ownerImage,
              { width: parseSize(size), height: parseSize(size) },
              { marginLeft: index > 0 && overlap ? -10 : 0 },
              { marginRight: name && !horizontal ? 15 : 0 }
            ]}
            source={{
              uri: uri
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
        {name && <Text style={theme.textBlack}>{name}</Text>}
      </View>
    );
  };

  if (id) {
    return (
      <TouchableOpacity
        key={id}
        onPress={() =>
          enabled &&
          openScreenWithPush(PROFILE_SCREEN_KEY, {
            userId: id
          })
        }
        style={[
          styles.ownerWrapper,
          { backgroundColor: 'transparent' },
          { flexDirection: name ? 'column' : 'row', zIndex: position },
          style
        ]}
      >
        <ProfileContainer />
      </TouchableOpacity>
    );
  }

  return <ProfileContainer />;
};

export default Avatar;
