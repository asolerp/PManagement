import React from 'react';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {Filter} from '../components/Filters/StatusTaskFilter';
import {userSelector} from '../Store/User/userSlice';
import {useTheme} from '../Theme';

import {useUpdateFirebase} from '../hooks/useUpdateFirebase';
import firestore from '@react-native-firebase/firestore';

const SituationIncidence = ({incidence}) => {
  const {Layout, Gutters, Colors, Fonts} = useTheme();
  const user = useSelector(userSelector);
  const {updateFirebase} = useUpdateFirebase('incidences');

  const handleStateIncidence = async (stateIncidence) => {
    try {
      if (user.role === 'admin') {
        await firestore()
          .doc(`incidences/${incidence.id}`)
          .update({state: stateIncidence});
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={[Gutters.tinyVMargin]}>
      <Text style={[Fonts.textTitle]}>Estado de la incidencia</Text>
      <View
        style={[
          Layout.fill,
          Layout.rowCenter,
          Layout.justifyContentStart,
          Gutters.smallTMargin,
          Gutters.regularBMargin,
        ]}>
        <Filter
          text="Iniciada"
          color={Colors.warning}
          active={incidence?.state === 'iniciada'}
          onPress={() => handleStateIncidence('iniciada')}
        />
        <Filter
          text="En trámite"
          color={Colors.leftBlue}
          active={incidence?.state === 'tramite'}
          onPress={() => handleStateIncidence('tramite')}
        />
        <Filter
          text="Finalizada"
          color={Colors.rightGreen}
          active={incidence?.state === 'finalizada'}
          onPress={() => handleStateIncidence('finalizada')}
        />
      </View>
    </View>
  );
};

export default SituationIncidence;
