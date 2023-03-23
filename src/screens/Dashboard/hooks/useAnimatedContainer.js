/* eslint-disable immutable/no-mutation */

import {useState} from 'react';
import {Platform} from 'react-native';
import {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SCROLL_LIMIT = 111;

const timingOptions = {
  duration: 300,
};

const springOptions = {
  damping: 20,
  mass: 1,
  stiffness: 100,
};

export const useAnimatedContainer = () => {
  const [isReminderPopupVisible, setIsReminderPopupVisible] = useState(true);
  const [isScrollActive, setIsScrollActive] = useState(false);
  const containerMarginTop = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleScroll = (state) => {
    setIsScrollActive(state);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      console.log('translateY.value', translateY.value);
      ctx.offsetY = translateY.value;
    },
    onActive: (event, ctx) => {
      if (
        ctx.offsetY + event.translationY > -SCROLL_LIMIT &&
        ctx.offsetY + event.translationY < 0
      ) {
        translateY.value = ctx.offsetY + event.translationY;
      }
    },
    onEnd: (event, ctx) => {
      if (ctx.offsetY + event.translationY <= -SCROLL_LIMIT) {
        runOnJS(handleScroll)(true);
      }
      if (ctx.offsetY + event.translationY > 0) {
        runOnJS(handleScroll)(false);
      }
      if (
        ctx.offsetY + event.translationY > -SCROLL_LIMIT &&
        ctx.offsetY + event.translationY < -SCROLL_LIMIT / 2
      ) {
        translateY.value = withTiming(-SCROLL_LIMIT, timingOptions);
        runOnJS(handleScroll)(true);
      }
      if (
        ctx.offsetY + event.translationY > -SCROLL_LIMIT / 2 &&
        ctx.offsetY + event.translationY < 0
      ) {
        translateY.value = withTiming(0, timingOptions);
        runOnJS(handleScroll)(false);
      }
    },
  });

  const handleSetCurrentScroll = (scroll) => {
    if (Platform.OS === 'android') {
      if (scroll < 0) {
        return;
      }
      if (scroll < SCROLL_LIMIT && scroll > 0 && translateY.value > -170) {
        translateY.value = withSpring(-scroll, springOptions);
      } else if (scroll === 0 && translateY.value < -170) {
        translateY.value = withSpring(scroll, springOptions);
      }
    } else {
      scroll <= 0 && setIsScrollActive(false);
    }
  };

  const containerStyles = useAnimatedStyle(() => {
    return {
      marginTop: containerMarginTop.value,
      marginBottom: 0,
      transform: [{translateY: translateY.value}],
    };
  });

  return {
    setIsReminderPopupVisible,
    handleSetCurrentScroll,
    isReminderPopupVisible,
    containerStyles,
    isScrollActive,
    gestureHandler,
  };
};
