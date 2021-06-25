import React, {useMemo} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';

// Redux
import {useSelector, shallowEqual} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';

//Firebase
import firestore, {firebase} from '@react-native-firebase/firestore';
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import useUploadImageCheck from '../../hooks/useUploadImage';

import ItemCheck from '../../components/ItemCheck';
import {openScreenWithPush} from '../../Router/utils/actions';
import {CHECK_PHOTO_SCREEN_KEY} from '../../Router/utils/routerKeys';

import {DARK_BLUE} from '../../styles/colors';
import {CHECKLISTS} from '../../utils/firebaseKeys';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {useTheme} from '../../Theme';

const ListOfChecks = ({checkId, checks}) => {
  const {Layout, Fonts} = useTheme();

  const {
    loading: loadingUploadImage,
    idCheckLoading,
    uploadImages,
  } = useUploadImageCheck(CHECKLISTS, checkId);

  const renderItem = ({item}) => (
    <TouchableWithoutFeedback
      onPress={
        item.numberOfPhotos > 0
          ? () =>
              openScreenWithPush(CHECK_PHOTO_SCREEN_KEY, {
                checkId: checkId,
                checkItemId: item.id,
                title: item.title,
                date: item.date,
              })
          : null
      }>
      <ItemCheck
        key={item.id}
        check={item}
        checklistId={checkId}
        imageHandler={(imgs) => uploadImages(imgs, item)}
        loading={loadingUploadImage && item.id === idCheckLoading}
      />
    </TouchableWithoutFeedback>
  );

  return (
    <View style={[Layout.fill]}>
      <Text style={[Fonts.textTitle]}>Tareas</Text>
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
