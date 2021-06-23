import React from 'react';
import {Button, View} from 'react-native';
import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';

const Container = ({showDelete, onDelete, duplicate, onDuplicate}) => {
  const {Gutters} = useTheme();

  return (
    <View style={[Gutters.regularTMargin]}>
      <View
        style={{
          height: 40,
          borderBottomWidth: 1,
          borderBottomColor: Colors.lowGrey,
        }}>
        {duplicate && (
          <Button title={'Duplicar'} onPress={onDuplicate} color={Colors.pm} />
        )}
        {showDelete && (
          <Button
            title={'Eliminar'}
            onPress={async () => await onDelete()}
            color={Colors.danger}
          />
        )}
      </View>
    </View>
  );
};

export default Container;
