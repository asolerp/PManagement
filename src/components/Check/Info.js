import React, {useState} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';

// Redux
import {useSelector, shallowEqual} from 'react-redux';

//Firebase
import {useGetFirebase} from '../../hooks/useGetFirebase';
import {useGetDocFirebase} from '../../hooks/useGetDocFIrebase';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';

// styles
import {defaultLabel, marginBottom} from '../../styles/common';
import {DARK_BLUE, GREY_1, LOW_GREY, PM_COLOR} from '../../styles/colors';

// utils
import moment from 'moment';
import TextWrapper from '../../components/TextWrapper';

import EditableInput from '../Elements/EditableInput';
import ItemCheck from '../../components/ItemCheck';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {userSelector} from '../../Store/User/userSlice';
import useUploadImageCheck from '../../hooks/useUploadImage';
import {useNavigation, useRoute} from '@react-navigation/core';
import updateChecklistInput from '../../Services/updateChecklistInput';

const styles = StyleSheet.create({
  checklistContainer: {
    flex: 1,
    backgroundColor: LOW_GREY,
    borderTopRightRadius: 50,
    marginTop: 10,
    // height: '100%',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: GREY_1,
    borderRadius: 10,
  },
  observationsStyle: {
    fontSize: 15,
  },
  checkboxWrapper: {
    flexDirection: 'row',
  },
  labelWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoWrapper: {
    flex: 6,
    marginLeft: 0,
    paddingRight: 20,
  },
  name: {
    fontSize: 15,
  },
  dateStyle: {
    color: '#2A7BA5',
  },
  date: {
    fontSize: 18,
    marginBottom: 20,
    marginVertical: 10,
    color: '#3DB6BA',
  },
  counter: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_BLUE,
  },
  buttonStyle: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PM_COLOR,
    borderRadius: 100,
    marginRight: 10,
  },
});

const Info = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {checkId} = route.params;
  const {document: checklist} = useGetDocFirebase('checklists', checkId);
  const {list: checks} = useGetFirebase(`checklists/${checkId}/checks`);

  const {updateFirebase} = useUpdateFirebase('checklists');

  const {loading, idCheckLoading, uploadImages} = useUploadImageCheck(checkId);

  const user = useSelector(userSelector, shallowEqual);

  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={
        item.numberOfPhotos > 0
          ? () =>
              navigation.navigate('CheckPhotos', {
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
        handleCheck={() => handleCheck(checklist, item, !item.done)}
        imageHandler={(imgs) => uploadImages(imgs, item)}
        loading={loading && item.id === idCheckLoading}
      />
    </TouchableOpacity>
  );

  const handleCheck = async (checklist, check, state) => {
    try {
      await updateFirebase(`${checklist.id}`, {
        ...checklist,
        done: state ? checklist.done + 1 : checklist.done - 1,
      });
      await updateFirebase(`${checklist.id}/checks/${check.id}`, {
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
    <View style={styles.checklistContainer}>
      <View style={{marginBottom: 20}}>
        <Text style={styles.date}>
          {moment(checklist?.date?.toDate()).format('LL')}
        </Text>
        <View>
          <Text style={{...defaultLabel, ...marginBottom(10)}}>
            Observaciones
          </Text>
          <EditableInput
            value={checklist?.observations}
            onPressAccept={(change) =>
              updateChecklistInput(checkId, {observations: change})
            }
          />
        </View>
      </View>
      <View style={styles.labelWrapper}>
        <Text style={{...defaultLabel, ...marginBottom(10)}}>
          Listado de checks
        </Text>
        <Text style={styles.counter}>
          {checklist.done}/{checklist.total}
        </Text>
      </View>
      <FlatList
        data={checks}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default Info;
