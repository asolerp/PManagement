import React from 'react';
import {StyleSheet, Pressable} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import {IconWithBadge} from '../../Stacks/HomeAdmin';
import {Colors} from '../../Theme/Variables';

const AddButton = ({
  badgeCount,
  iconName,
  bottom = 30,
  backColor = Colors.primary,
  containerStyle,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {backgroundColor: backColor, bottom},
        containerStyle,
      ]}>
      {badgeCount ? (
        <IconWithBadge badgeCount={badgeCount}>
          <Icon name={iconName} size={30} color={'white'} />
        </IconWithBadge>
      ) : (
        <Icon name={iconName} size={20} color={'white'} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 30,
    width: 55,
    height: 55,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default AddButton;
