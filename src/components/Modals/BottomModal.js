import React from 'react';
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  StatusBar
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const BottomModal = ({
  onClose,
  children,
  isVisible,
  isFixedBottom = false,
  swipeDirection = ['down']
}) => {
  const insets = useSafeAreaInsets();

  // Solo aplicar paddingTop en modo full (no en fixed bottom)
  const statusBarHeight =
    Platform.OS === 'ios'
      ? StatusBar.currentHeight || 0
      : StatusBar.currentHeight || 0;
  const topPadding = Math.max(insets.top, statusBarHeight);

  return (
    <Modal
      testID={'modal'}
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={swipeDirection}
      style={isFixedBottom ? styles.modalFixed : styles.modalFull}
      backdropOpacity={0.5}
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      propagateSwipe
      avoidKeyboard
      statusBarTranslucent
    >
      <View
        style={[
          isFixedBottom ? styles.modalContainerFixed : styles.modalContainer,
          isFixedBottom
            ? { paddingBottom: Math.max(insets.bottom, 20) }
            : { paddingTop: topPadding, paddingBottom: insets.bottom }
        ]}
      >
        {/* Header con slider y botón de cerrar */}
        <View style={styles.headerContainer}>
          {isFixedBottom && (
            <View style={styles.sliderContainer}>
              <View style={styles.topSlider} />
            </View>
          )}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={26} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Contenido del modal */}
        <View
          style={
            isFixedBottom
              ? styles.childrenContainerFixed
              : styles.childrenContainer
          }
        >
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  childrenContainer: {
    flex: 1
  },
  childrenContainerFixed: {
    // No flex para que se ajuste al contenido
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    elevation: 2,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: 12,
    width: 44,
    zIndex: 100
  },
  headerContainer: {
    marginBottom: 12,
    minHeight: 40,
    position: 'relative',
    width: '100%'
  },
  modalContainer: {
    backgroundColor: 'white',
    flex: 1
  },
  modalContainerFixed: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Dimensions.get('window').height * 0.85,
    overflow: 'hidden'
  },
  modalFixed: {
    justifyContent: 'flex-end',
    margin: 0
  },
  modalFull: {
    justifyContent: 'flex-start',
    margin: 0
  },
  sliderContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%'
  },
  topSlider: {
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
    height: 4,
    width: 40
  }
});
