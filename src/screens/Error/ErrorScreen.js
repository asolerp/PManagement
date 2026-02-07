import React from 'react';
import {View, Text} from 'react-native';
import CustomButton from '../../components/Elements/CustomButton';
import RNRestart from 'react-native-restart';

import {useTheme} from '../../Theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../Theme/Variables';

const ErrorScreen = () => {
  const {Layout, Gutters, Fonts} = useTheme();

  return (
    <View style={[Layout.fill, Layout.colCenter]}>
      <Icon
        name="sentiment-very-dissatisfied"
        size={100}
        color={Colors.primary}
        style={[Gutters.regularBMargin]}
      />
      <Text
        style={[Gutters.regularBMargin, Fonts.textTitle, Fonts.alignCenter]}>
        Lo sentimos ha ocurrido un error, vuélvelo a interar más tarde.
      </Text>
      <View>
        <CustomButton
          title="Volver"
          onPress={() => {
            RNRestart.Restart();
          }}
        />
      </View>
    </View>
  );
};

export default ErrorScreen;
