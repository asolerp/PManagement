import React from 'react';
import {Button, View, StyleSheet, Text} from 'react-native';
import {Divider} from 'react-native-elements';
import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

const Container = ({
  showDelete,
  onDelete,
  duplicate,
  onDuplicate,
  editable = true,
  onEdit = () => {},
}) => {
  const {Gutters, Layout} = useTheme();

  const Option = ({onPress, title, textColor = Colors.pm}) => {
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View
          style={[
            Layout.row,
            Layout.justifyContentSpaceBetween,
            Layout.alignItemsCenter,
            Gutters.smallVPadding,
          ]}>
          <Text style={[styles.normalOption, {color: textColor}]}>{title}</Text>
          <Icon name="arrow-forward-ios" color={Colors.darkGrey} size={20} />
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={[Gutters.regularTMargin]}>
      {editable && <Option onPress={onEdit} title="Editar" />}
      <Divider />
      {duplicate && <Option onPress={onDuplicate} title="Duplicar" />}
      <Divider />
      {showDelete && (
        <Option onPress={onDelete} title="Eliminar" textColor={Colors.danger} />
      )}
      <Divider />
    </View>
  );
};

const styles = StyleSheet.create({
  normalOption: {
    fontSize: 18,
  },
});

export default Container;
