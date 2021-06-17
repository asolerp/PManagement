import React from 'react';
import {View, StyleSheet} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

import Icon from 'react-native-vector-icons/MaterialIcons';
import {IconWithBadge} from '../../Stacks/HomeAdmin';
import {Colors} from '../../Theme/Variables';

const AddButton = ({
  badgeCount,
  iconName,
  bottom = 30,
  backColor = Colors.pm,
  onPress,
}) => {
  return (
    <View
      style={{...styles.container, ...{backgroundColor: backColor, bottom}}}>
      <TouchableWithoutFeedback onPress={onPress}>
        {badgeCount ? (
          <IconWithBadge badgeCount={badgeCount}>
            <Icon name={iconName} size={30} color={'white'} />
          </IconWithBadge>
        ) : (
          <Icon name={iconName} size={30} color={'white'} />
        )}
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 30,
    width: 50,
    elevation: 3,
    height: 50,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

export default AddButton;
