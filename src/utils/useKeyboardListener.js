import {useState, useEffect} from 'react';
import {Keyboard} from 'react-native';

export const useKeyboardListener = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
    };
  }, []);

  const _keyboardDidShow = () => {
    setIsOpen(true);
  };

  const _keyboardDidHide = () => {
    setIsOpen(false);
  };

  return {
    keyboardIsClosed: !isOpen,
  };
};
