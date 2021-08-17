import React from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';

import useUploadImageCheck from '../../hooks/useUploadImage';

import ItemCheck from '../../components/ItemCheck';
import {openScreenWithPush} from '../../Router/utils/actions';
import {CHECK_PHOTO_SCREEN_KEY} from '../../Router/utils/routerKeys';

import {CHECKLISTS} from '../../utils/firebaseKeys';

import {useTheme} from '../../Theme';
import {useTranslation} from 'react-i18next';

const ListOfChecks = ({checkId, disabled, checks}) => {
  const {Layout, Fonts, Gutters} = useTheme();
  const {t} = useTranslation();

  const {
    loading: loadingUploadImage,
    idCheckLoading,
    uploadImages,
  } = useUploadImageCheck(CHECKLISTS, checkId);

  const renderItem = ({item}) => (
    <ItemCheck
      disabled={disabled}
      key={item.id}
      check={item}
      checklistId={checkId}
      imageHandler={(imgs) => uploadImages(imgs, item)}
      loading={loadingUploadImage && item.id === idCheckLoading}
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
