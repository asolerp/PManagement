import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { openScreenWithPush } from '../../Router/utils/actions';

import {
  NEW_CHECKLIST_SCREEN,
  NEW_INCIDENCE_SCREEN_KEY
} from '../../Router/utils/routerKeys';
import { userSelector } from '../../Store/User/userSlice';
import { Colors } from '../../Theme/Variables';

export const ActionButtons = () => {
  const user = useSelector(userSelector);
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      tension: 40,
      useNativeDriver: true
    }).start();
    setIsOpen(!isOpen);
  };

  const handlePress = screen => {
    toggleMenu();
    setTimeout(() => {
      openScreenWithPush(screen);
    }, 300);
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  const checklistTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -140]
  });

  const incidenceTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -70]
  });

  const buttonScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  return (
    <View style={styles.container}>
      {/* Botón de Incidencia */}
      <Animated.View
        style={[
          styles.secondaryButton,
          {
            transform: [
              { scale: buttonScale },
              { translateY: incidenceTranslateY }
            ],
            opacity: animation
          }
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={[styles.button, styles.incidenceButton]}
          onPress={() => handlePress(NEW_INCIDENCE_SCREEN_KEY)}
          activeOpacity={0.8}
        >
          <Icon name="warning" color={Colors.white} size={24} />
        </TouchableOpacity>
      </Animated.View>

      {/* Botón de Checklist (solo para admin) */}
      {user.role === 'admin' && (
        <Animated.View
          style={[
            styles.secondaryButton,
            {
              transform: [
                { scale: buttonScale },
                { translateY: checklistTranslateY }
              ],
              opacity: animation
            }
          ]}
          pointerEvents={isOpen ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={[styles.button, styles.checklistButton]}
            onPress={() => handlePress(NEW_CHECKLIST_SCREEN)}
            activeOpacity={0.8}
          >
            <Icon name="check" color={Colors.white} size={24} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Botón principal */}
      <TouchableOpacity
        style={[styles.button, styles.mainButton]}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Icon name="add" color={Colors.white} size={28} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 28,
    elevation: 5,
    height: 56,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 56
  },
  checklistButton: {
    backgroundColor: Colors.rightGreen
  },
  container: {
    alignItems: 'center',
    bottom: 30,
    position: 'absolute',
    right: 20,
    zIndex: 10
  },
  incidenceButton: {
    backgroundColor: Colors.warning
  },
  mainButton: {
    backgroundColor: Colors.danger,
    height: 56,
    width: 56
  },
  secondaryButton: {
    bottom: 0,
    position: 'absolute'
  }
});
