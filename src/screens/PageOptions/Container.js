import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../Theme';
import {useTranslation} from 'react-i18next';
import {MenuItem} from '../../components/UI/MenuItem';
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
  const {t} = useTranslation();

  return (
    <View style={[]}>
      {editable && (
        <MenuItem
          iconName="ios-pencil"
          title={t('options.edit')}
          onPress={onEdit}
        />
      )}

      {duplicate && (
        <MenuItem
          iconName="ios-duplicate"
          title={t('options.duplicate')}
          onPress={onDuplicate}
        />
      )}

      {showDelete && (
        <MenuItem
          textStyle={{color: Colors.danger}}
          iconColor={Colors.danger}
          iconName="ios-trash"
          title={t('options.delete')}
          onPress={onDelete}
        />
      )}
    </View>
  );
};

export default Container;
