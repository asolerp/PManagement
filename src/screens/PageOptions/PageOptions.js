import React from 'react';
import {TouchableWithoutFeedback, View} from 'react-native';
import PageLayout from '../../components/PageLayout';
import {popScreen} from '../../Router/utils/actions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../Theme/Variables';
import {Options} from '../../components/Incidence';

const PageOptionsScreen = () => {
  return (
    <PageLayout
      safe
      titleRightSide={
        <TouchableWithoutFeedback
          onPress={() => {
            popScreen();
          }}>
          <View>
            <Icon name="close" size={25} color={Colors.white} />
          </View>
        </TouchableWithoutFeedback>
      }
      titleProps={{
        title: 'Opciones',
        subPage: true,
      }}>
      <Options />
    </PageLayout>
  );
};
export default PageOptionsScreen;