import React, {useCallback} from 'react';

// Redux
import {useSelector, useDispatch} from 'react-redux';

import {BottomModal, ModalContent} from 'react-native-modals';
import {
  contentSelector,
  openSelector,
  changeState,
} from '../Store/Modal/modalSlice';

const Modal = () => {
  const dispatch = useDispatch();

  const open = useSelector(openSelector);
  const content = useSelector(contentSelector);

  const changeStateModalAction = useCallback(
    (state) => dispatch(changeState(state)),
    [dispatch],
  );

  return (
    <BottomModal
      modalStyle={{borderRadius: 30}}
      height={0.5}
      visible={open}
      onSwipeOut={(event) => {
        changeStateModalAction(false);
      }}
      onTouchOutside={() => {
        changeStateModalAction(false);
      }}>
      <ModalContent style={{flex: 1, alignItems: 'center'}}>
        {content}
      </ModalContent>
    </BottomModal>
  );
};

export default Modal;
