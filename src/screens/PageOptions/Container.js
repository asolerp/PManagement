import React from 'react';
import {Button, View} from 'react-native';
import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';

const Container = ({options}) => {
  const {Gutters} = useTheme();

  return (
    <View style={[Gutters.regularTMargin]}>
      {Object.entries(options)?.map(([key, value]) => {
        return (
          <View
            key={key}
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
