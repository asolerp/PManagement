import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { openScreenWithPush } from '../Router/utils/actions';
import { PROFILE_SCREEN_KEY } from '../Router/utils/routerKeys';
import theme from '../Theme/Theme';

const DEFAULT_AVATAR =
  'https://firebasestorage.googleapis.com/v0/b/port-management-9bd53.appspot.com/o/other%2Fport.png?alt=media&token=41156ea7-76a2-4a28-8625-27f779433b78';

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
  },
  placeholderContainer: {
    alignItems: 'center',
    backgroundColor: '#E6F7F8',
    borderRadius: 100,
    justifyContent: 'center',
    overflow: 'hidden'
  },
  placeholderText: {
    color: '#55A5AD',
    fontWeight: '700'
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
  style,
  showName = true
}) => {
  const [imageError, setImageError] = useState(false);

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

  const getInitials = fullName => {
    if (!fullName) return '?';
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0]?.toUpperCase() || '?';
  };

  const getFontSize = sizeImage => {
    const baseSize = parseSize(sizeImage);
    return Math.floor(baseSize * 0.4);
  };

  const imageSize = parseSize(size);
  const fontSize = getFontSize(size);

  // Validar si la URI es válida
  const isValidUri =
    uri && uri.trim() !== '' && uri !== 'null' && uri !== 'undefined';

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

          {!isValidUri || imageError ? (
            // Mostrar placeholder con iniciales o icono
            <View
              style={[
                styles.placeholderContainer,
                {
                  width: imageSize,
                  height: imageSize,
                  marginLeft: index > 0 && overlap ? -10 : 0,
                  marginRight: name && !horizontal ? 15 : 0
                }
              ]}
            >
              {name ? (
                <Text style={[styles.placeholderText, { fontSize }]}>
                  {getInitials(name)}
                </Text>
              ) : (
                <Icon name="person" size={fontSize * 1.5} color="#55A5AD" />
              )}
            </View>
          ) : (
            // Mostrar imagen
            <FastImage
              style={[
                styles.ownerImage,
                { width: imageSize, height: imageSize },
                { marginLeft: index > 0 && overlap ? -10 : 0 },
                { marginRight: name && !horizontal ? 15 : 0 }
              ]}
              source={{
                uri: uri || DEFAULT_AVATAR,
                priority: FastImage.priority.normal
              }}
              resizeMode={FastImage.resizeMode.cover}
              onError={() => setImageError(true)}
            />
          )}
        </View>
        {name && showName && <Text style={theme.textBlack}>{name}</Text>}
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
