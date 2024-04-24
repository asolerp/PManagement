import moment from 'moment';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native';

import CustomInput from '../Elements/CustomInput';
import {BottomModal} from '../Modals/BottomModal';
import DateSelector from './Jobs/DateSelector';

export const DateSelectorModal = ({date, setter}) => {
  const [visible, setIsVisible] = useState();
  const {t} = useTranslation();
  
  return (
    <>
      <BottomModal
        swipeDirection={null}
        onClose={() => setIsVisible(false)}
        isVisible={visible}>
        <DateSelector
          get={date || null}
          set={(d) => setter(d)}
          closeModal={() => setIsVisible(false)}
        />
      </BottomModal>
      <CustomInput
        title={t('common.date')}
        subtitle={date && <Text>{moment(date).format('LL')}</Text>}
        iconProps={{name: 'alarm', color: '#55A5AD'}}
        onPress={() => {
          setIsVisible(true);
        }}
      />
    </>
  );
};
