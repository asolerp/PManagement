import React, {useCallback} from 'react';

// Redux
import {useSelector, useDispatch, shallowEqual} from 'react-redux';
import {changeState} from '../store/modalActions';

import {BottomModal, ModalContent} from 'react-native-modals';

const Modal = () => {
  const dispatch = useDispatch();
  const {open, content} = useSelector(
    ({modal: {open, content}}) => ({open, content}),
    shallowEqual,
  );

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
