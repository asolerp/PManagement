import React from 'react';
import { View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { MenuItem } from '../../components/UI/MenuItem';
import { Colors } from '../../Theme/Variables';

const Container = ({
  showDelete,
  onDelete,
  duplicate,
  showRestorePassword,
  onRestorePassword,
  onDuplicate,
  editable = true,
  onEdit = () => {}
}) => {
  const { t } = useTranslation();

  return (
    <View style={[]}>
      {editable && (
        <MenuItem
          iconName="pencil"
          title={t('options.edit')}
          onPress={onEdit}
        />
      )}

      {duplicate && (
        <MenuItem
          iconName="duplicate"
          title={t('options.duplicate')}
          onPress={onDuplicate}
        />
      )}

      {showRestorePassword && (
        <MenuItem
          textStyle={{ color: Colors.black }}
          iconName="key"
          title={t('options.restorePassword')}
          onPress={onRestorePassword}
        />
      )}

      {showDelete && (
        <MenuItem
          textStyle={{ color: Colors.danger }}
          iconColor={Colors.danger}
          iconName="trash"
          title={t('options.delete')}
          onPress={onDelete}
        />
      )}
    </View>
  );
};

export default Container;
