import React from 'react';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {Filter} from '../components/Filters/StatusTaskFilter';
import {userSelector} from '../Store/User/userSlice';
import {useTheme} from '../Theme';

import firestore from '@react-native-firebase/firestore';
import {useTranslation} from 'react-i18next';
import {error} from '../lib/logging';

const SituationIncidence = ({incidence}) => {
  const {Layout, Gutters, Colors, Fonts} = useTheme();
  const user = useSelector(userSelector);
  const {t} = useTranslation();
  const handleStateIncidence = async (stateIncidence) => {
    try {
      if (user.role === 'admin' || incidence.workersId.includes(user.uid)) {
        await firestore()
          .doc(`incidences/${incidence.id}`)
          .update({state: stateIncidence});
      }
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    }
  };

  return (
    <View style={[Gutters.regularTMargin]}>
      <Text style={[Fonts.textTitle]}>{t('incidence.status.title')}</Text>
      <View
        style={[
          Layout.fill,
          Layout.rowCenter,
          Layout.justifyContentStart,
          Gutters.smallTMargin,
          Gutters.regularBMargin,
        ]}>
        <Filter
          text={t('incidence.status.ini')}
          color={Colors.warning}
          active={incidence?.state === 'initiate'}
          onPress={() => handleStateIncidence('initiate')}
        />
        <Filter
          text={t('incidence.status.process')}
          color={Colors.leftBlue}
          active={incidence?.state === 'process'}
          onPress={() => handleStateIncidence('process')}
        />
        <Filter
          text={t('incidence.status.done')}
          color={Colors.rightGreen}
          active={incidence?.state === 'done'}
          onPress={() => handleStateIncidence('done')}
        />
      </View>
    </View>
  );
};

export default SituationIncidence;
