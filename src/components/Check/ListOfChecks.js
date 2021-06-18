import React, {useMemo} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';

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
import {defaultLabel, marginBottom} from '../../styles/common';
import {DARK_BLUE} from '../../styles/colors';
import {CHECKLISTS} from '../../utils/firebaseKeys';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

const ListOfChecks = ({checkId}) => {
  const queryChecklist = useMemo(() => {
    return firestore().collection(CHECKLISTS).doc(checkId);
  }, [checkId]);

  const [checklist] = useDocumentData(queryChecklist, {
    idField: 'id',
  });

  const query = useMemo(() => {
    return firestore()
      .collection('checklists')
      .doc(checkId)
      .collection('checks');
  }, [checkId]);

  const [checks, loadingChecklistChecks] = useCollectionData(query, {
    idField: 'id',
  });

  const {updateFirebase} = useUpdateFirebase('checklists');

  const {
    loading: loadingUploadImage,
    idCheckLoading,
    uploadImages,
  } = useUploadImageCheck(checkId);

  const user = useSelector(userSelector, shallowEqual);

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
        handleCheck={() => handleCheck(item, !item?.done)}
        imageHandler={(imgs) => uploadImages(imgs, item)}
        loading={loadingUploadImage && item.id === idCheckLoading}
      />
    </TouchableWithoutFeedback>
  );

  const handleCheck = async (check, state) => {
    try {
      await updateFirebase(`${checkId}`, {
        done: state
          ? firebase.firestore.FieldValue.increment(1)
          : firebase.firestore.FieldValue.increment(-1),
      });
      await updateFirebase(`${checkId}/checks/${check?.id}`, {
        ...check,
        date: !state ? null : new Date(),
        done: state,
        worker: state ? user : null,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View>
      <View style={styles.labelWrapper}>
        <Text style={{...defaultLabel, ...marginBottom(10)}}>
          Listado de checks
        </Text>
        <Text style={styles.counter}>
          {checklist?.done}/{checklist?.total}
        </Text>
      </View>
      {!loadingChecklistChecks && (
        <FlatList
          data={checks}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  labelWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  counter: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_BLUE,
  },
});

export default ListOfChecks;
