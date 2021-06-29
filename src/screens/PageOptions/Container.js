import React from 'react';
import {Button, View} from 'react-native';
import {Divider} from 'react-native-elements';
import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';

const Container = ({
  showDelete,
  onDelete,
  duplicate,
  onDuplicate,
  editable = true,
  onEdit = () => {},
}) => {
  const {Gutters} = useTheme();

  return (
    <View style={[Gutters.regularTMargin]}>
      <Divider />
      {editable && (
        <Button title={'Editar'} onPress={onEdit} color={Colors.pm} />
      )}
      <Divider />
      {duplicate && (
        <Button title={'Duplicar'} onPress={onDuplicate} color={Colors.pm} />
      )}
      <Divider />
      {showDelete && (
        <Button
          title={'Eliminar'}
          onPress={async () => await onDelete()}
          color={Colors.danger}
        />
      )}
      <Divider />
    </View>
  );
};

export default Container;
