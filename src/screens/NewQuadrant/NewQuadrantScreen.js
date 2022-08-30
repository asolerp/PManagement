import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';

// UI
import PageLayout from '../../components/PageLayout';
import theme from '../../Theme/Theme';
import CustomButton from '../../components/Elements/CustomButton';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';

import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';

import {DateSelectorModal} from '../../components/Forms/DateSelectorModal';
import {Text, View} from 'react-native';

export const NewQuadrantScreen = ({route}) => {
  const [date, setDate] = useState();
  const docId = route?.params?.docId;

  return (
    <PageLayout
      safe
      backButton
      footer={
        <CustomButton
          styled="rounded"
          title={docId ? 'Editar cuadrante' : 'Nuevo cuadrante'}
        />
      }>
      <>
        <ScreenHeader title={docId ? 'Editar cuadrante' : 'Nuevo cuadrante'} />
        <View style={[theme.mT10]} />
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <DateSelectorModal date={date} setter={(date) => setDate(date)} />
          <View style={[theme.mT6]} />
          <Text style={[theme.fontSans, theme.textXl]}>
            Asignar trabajadordes
          </Text>
        </KeyboardAwareScrollView>
      </>
    </PageLayout>
  );
};
