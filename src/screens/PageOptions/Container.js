import React from 'react';
import {Button, View} from 'react-native';
import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';

const Container = () => {
  const {Layout, Gutters} = useTheme();
  const options = {
    duplicate: {
      title: 'Duplicar',
      mode: 'normal',
      action: () => console.log('duplicar'),
    },
    delete: {
      title: 'Eliminar',
      mode: 'danger',
      action: () => console.log('eliminar'),
    },
  };

  return (
    <View style={[Gutters.regularTMargin]}>
      {Object.entries(options)?.map(([key, value]) => {
        return (
          <View
            style={{
              height: 40,
              borderBottomWidth: 1,
              borderBottomColor: Colors.lowGrey,
            }}>
            <Button
              title={value.title}
              onPress={value.action}
              color={value.mode === 'normal' ? Colors.pm : Colors.danger}
            />
          </View>
        );
      })}
    </View>
  );
};

export default Container;
