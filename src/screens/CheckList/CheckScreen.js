import React, {useState} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';

// Redux
import {useSelector, shallowEqual} from 'react-redux';

//Firebase
import {useGetFirebase} from '../../hooks/useGetFirebase';
import {useGetDocFirebase} from '../../hooks/useGetDocFIrebase';
import {useUploadCloudinaryImage} from '../../hooks/useUploadCloudinaryImage';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import {useAddFirebase} from '../../hooks/useAddFirebase';

// UI
import PagetLayout from '../../components/PageLayout';

import CustomButton from '../../components/Elements/CustomButton';

// styles
import {defaultLabel, marginBottom} from '../../styles/common';
import {DARK_BLUE, GREY_1, LOW_GREY, PM_COLOR} from '../../styles/colors';

// utils
import moment from 'moment';
import TextWrapper from '../../components/TextWrapper';

import {Platform} from 'react-native';
import ItemCheck from '../../components/ItemCheck';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {userSelector} from '../../Store/User/userSlice';

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

const CheckScreen = ({route, navigation}) => {
  const {checkId} = route.params;
  const {document: checklist} = useGetDocFirebase('checklists', checkId);
  const {list: checks} = useGetFirebase(`checklists/${checkId}/checks`);

  const {updateFirebase} = useUpdateFirebase('checklists');
  const {addFirebase: addPhoto} = useAddFirebase();

  const [idCheckLoading, setIdCheckLoading] = useState();
  const [loading, setLoading] = useState(false);

  const {upload} = useUploadCloudinaryImage();

  const uploadImages = async (imgs, item) => {
    setLoading(true);
    setIdCheckLoading(item.id);
    try {
      if (imgs?.length > 0) {
        const uploadImages = imgs
          .map((img, i) => ({
            fileName: img.filename || `image-${i}`,
            fileUri: Platform.OS === 'android' ? img.path : img.sourceURL,
            fileType: img.mime,
          }))
          .map((file) =>
            upload(file, `/PortManagement/CheckLists/${checkId}/Photos`),
          );

        const imagesURLs = await Promise.all(uploadImages);

        await updateFirebase(`${checkId}/checks/${item.id}`, {
          numberOfPhotos: item.numberOfPhotos + imagesURLs.length,
        });
        await Promise.all(
          imagesURLs.map((url) => {
            const urlWithTransformation = url.split('/upload/');
            const name = url.split('/');
            let nameWithoutExtension = name[name.length - 1].split('.');
            nameWithoutExtension.splice(-1, 1);
            return addPhoto(`checklists/${checkId}/checks/${item.id}/photos`, {
              name: name[name.length - 1],
              ref: `PortManagement/CheckLists/${checkId}/Photos/${nameWithoutExtension.join(
                '.',
              )}`,
              url: urlWithTransformation.join(
                '/upload/f_auto,q_auto,w_500,dpr_2.0,c_limit/',
              ),
            });
          }),
        );
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setIdCheckLoading(null);
    }
  };

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
    <PagetLayout
      backButton
      titleProps={{
        subPage: true,
        title: `Check list en ${
          checklist?.house && checklist?.house[0]?.houseName
        }`,
        color: 'white',
      }}
      footer={
        checklist?.done === checklist?.total &&
        user.role === 'admin' && (
          <CustomButton
            loading={false}
            title="Finalizar y enviar al propietario"
            onPress={() => {}}
          />
        )
      }>
      <View style={styles.checklistContainer}>
        <View style={{marginBottom: 20}}>
          <Text style={styles.date}>
            {moment(checklist?.date?.toDate()).format('LL')}
          </Text>
          <Text style={{...defaultLabel, ...marginBottom(10)}}>
            Observaciones
          </Text>
          <TextWrapper>
            <Text style={styles.observationsStyle}>
              {checklist?.observations}
            </Text>
          </TextWrapper>
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
    </PagetLayout>
  );
};

export default CheckScreen;
