import React from 'react';
import {View, Text, FlatList} from 'react-native';

import useUploadImageCheck from '../../hooks/useUploadImage';

import ItemCheck from '../../components/ItemCheck';

import {CHECKLISTS} from '../../utils/firebaseKeys';

import {useTheme} from '../../Theme';
import {useTranslation} from 'react-i18next';

const ListOfChecks = ({checkId, disabled, checks}) => {
  const {Layout, Fonts, Gutters} = useTheme();
  const {t} = useTranslation();

  const {loading: loadingUploadImage, uploadImages} = useUploadImageCheck(
    CHECKLISTS,
    checkId,
  );

  const renderItem = ({item}) => (
    <ItemCheck
      disabled={disabled}
      key={item.id}
      check={item}
      checklistId={checkId}
      imageHandler={(imgs) => uploadImages(imgs, item)}
      loading={loadingUploadImage}
    />
  );

  return (
    <View style={[Layout.fill]}>
      <Text style={[Fonts.textTitle, Gutters.smallBPadding]}>
        {t('checklists.checkPage.jobs')}
      </Text>
      <FlatList
        data={checks}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default ListOfChecks;
