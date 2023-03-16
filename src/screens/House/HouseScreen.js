import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

// UI
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomInput from '../../components/Elements/CustomInput';
import InputGroup from '../../components/Elements/InputGroup';
import PageLayout from '../../components/PageLayout';

import DynamicSelectorList from '../../components/DynamicSelectorList';
import CustomButton from '../../components/Elements/CustomButton';

// Firebase
import firestore from '@react-native-firebase/firestore';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';

//Utils

import useAuth from '../../utils/useAuth';
import {useTranslation} from 'react-i18next';
import {error} from '../../lib/logging';
import {BottomModal} from '../../components/Modals/BottomModal';
import {useCameraOrLibrary} from '../../hooks/useCamerOrLibrary';
import {imageActions} from '../../utils/imageActions';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';
import {useTheme} from '../../Theme';
import PageOptionsScreen from '../PageOptions/PageOptions';
import {LoadingModalContext} from '../../context/loadinModalContext';
import {Spacer} from '../../components/Elements/Spacer';
import {useDocumentData} from 'react-firebase-hooks/firestore';
import {DEFAULT_IMAGE} from '../../constants/general';
import FastImage from 'react-native-fast-image';
import {firebase} from '@react-native-firebase/firestore';

const styles = StyleSheet.create({
  pageWrapper: {
    marginTop: 0,
  },
  infoWrapper: {
    marginVertical: 20,
  },
  houseImageContainer: {
    height: 170,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  iconContainer: {
    position: 'absolute',
    right: 0,
    top: -10,
    backgroundColor: '#ED7A7A',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    padding: 5,
  },
  houseImage: {
    width: '100%',
    height: 170,
    borderRadius: 10,
  },
  titleStyle: {
    fontSize: 20,
    color: '#284748',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoStyle: {
    fontSize: 15,
    marginBottom: 20,
    color: '#284748',
  },
  subtitle: {
    color: '#2A7BA5',
  },
  inputLabel: {
    fontSize: 15,
    marginBottom: 10,
    color: '#284748',
    fontWeight: 'bold',
  },
});

const HouseScreen = ({route}) => {
  const {Gutters} = useTheme();
  const [infoHouse, setInfoHouse] = useState();
  const [newImage, setNewImage] = useState();
  const {isAdmin} = useAuth();
  const {t} = useTranslation();
  const {houseId} = route.params;

  const houseQuery = firestore().collection('houses').doc(houseId);

  const {setVisible} = useContext(LoadingModalContext);
  const [house] = useDocumentData(houseQuery, {idField: 'id'});
  const {updateFirebase} = useUpdateFirebase('houses');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const {onImagePress} = useCameraOrLibrary();
  const uploadHousePhoto = firebase
    .functions()
    .httpsCallable('uploadHousePhoto');

  const handlePressImage = (type) => {
    onImagePress({
      type,
      options: {...imageActions[type], selectionLimit: 1},
      callback: async (imgs) => {
        setNewImage(
          imgs.map((image, i) => ({
            fileBase64: image?.base64,
            fileName: image?.fileName || `image-${i}`,
            fileUri: image?.uri,
            fileType: image?.type,
          })),
        );
      },
    });
  };

  const handleEdit = async () => {
    setVisible(true);
    try {
      if (infoHouse) {
        await updateFirebase(houseId, {
          ...infoHouse,
        });
      }
      if (newImage) {
        await uploadHousePhoto({
          houseId,
          imageBase64: newImage[0],
        });
      }
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    } finally {
      setNewImage(null);
      setVisible(false);
    }
  };

  useEffect(() => {
    if (house) {
      setInfoHouse(house);
    }
  }, [house]);

  return (
    <React.Fragment>
      <BottomModal
        isVisible={modalVisible}
        onClose={(event) => {
          setModalVisible(false);
        }}
        swipeDirection={null}>
        <DynamicSelectorList
          collection="users"
          where={[
            {
              label: 'role',
              operator: '==',
              condition: 'owner',
            },
          ]}
          store="jobForm"
          searchBy="firstName"
          schema={{
            img: 'profileImage',
            name: 'firstName',
            lastname: 'lastName',
          }}
          get={[infoHouse?.owner || house?.owner]}
          set={(owners) => setInfoHouse({...infoHouse, owner: owners[0]})}
          closeModal={() => setModalVisible(false)}
        />
      </BottomModal>
      <PageLayout
        safe
        backButton
        titleRightSide={
          <PageOptionsScreen
            editable={false}
            collection={'houses'}
            docId={houseId}
            showDelete={true}
            duplicate={false}
          />
        }>
        {house ? (
          <KeyboardAwareScrollView
            style={styles.pageWrapper}
            showsVerticalScrollIndicator={false}>
            <View style={[Gutters.regularBMargin]}>
              <ScreenHeader title={house?.houseName} />
            </View>
            <TouchableOpacity
              onPress={() => isAdmin && handlePressImage('library')}>
              {newImage && (
                <View style={styles.iconContainer}>
                  <TouchableOpacity onPress={() => setNewImage(null)}>
                    <Icon name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.houseImageContainer}>
                {!newImage?.[0]?.fileUri && !infoHouse?.houseImage?.original ? (
                  <React.Fragment>
                    <Icon name="home" size={40} color="black" />
                    <Text>Selecciona una foto</Text>
                  </React.Fragment>
                ) : (
                  <FastImage
                    style={styles.houseImage}
                    source={{
                      uri:
                        newImage?.[0]?.fileUri ||
                        infoHouse?.houseImage?.original ||
                        DEFAULT_IMAGE,
                      priority: FastImage.priority.normal,
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.infoWrapper}>
              <Text style={styles.titleStyle}>{t('houses.house_data')}</Text>
              <Text style={styles.inputLabel}>
                {t('houses.house_name') + ':'}
              </Text>
              <InputGroup>
                <TextInput
                  editable={isAdmin}
                  style={{height: 40}}
                  placeholder={t('houses.house_name')}
                  onChangeText={(text) =>
                    setInfoHouse({...infoHouse, houseName: text})
                  }
                  value={infoHouse?.houseName}
                />
              </InputGroup>
              <Spacer space={4} />
              <Text style={styles.inputLabel}>
                {t('houses.house_address') + ':'}
              </Text>
              <InputGroup>
                <TextInput
                  editable={isAdmin}
                  style={{height: 40}}
                  placeholder={t('houses.house_address')}
                  onChangeText={(text) =>
                    setInfoHouse({...infoHouse, street: text})
                  }
                  value={infoHouse?.street}
                />
              </InputGroup>
              <Spacer space={4} />
              <Text style={styles.inputLabel}>
                {t('houses.house_municipality') + ':'}
              </Text>
              <InputGroup>
                <TextInput
                  editable={isAdmin}
                  style={{height: 40}}
                  placeholder={t('houses.house_municipality')}
                  onChangeText={(text) =>
                    setInfoHouse({...infoHouse, municipio: text})
                  }
                  value={infoHouse?.municipio}
                />
              </InputGroup>
              <Spacer space={4} />
              <View>
                <Text style={styles.titleStyle}>{t('common.owner')}</Text>

                <CustomInput
                  title="Propietario"
                  subtitle={
                    <View style={{flexDirection: 'row'}}>
                      {[infoHouse?.owner || house?.owner].map((owner, i) => (
                        <View
                          key={owner?.id || i}
                          style={{flexDirection: 'row'}}>
                          <Text style={styles.subtitle}>
                            {owner?.firstName} {owner?.lastName}
                          </Text>
                        </View>
                      ))}
                    </View>
                  }
                  iconProps={{name: 'person', color: '#55A5AD'}}
                  onPress={() => {
                    isAdmin && setModalVisible(true);
                  }}
                />
                <Spacer space={4} />
                <Text style={styles.inputLabel}>
                  {t('houses.owner_name') + ':'}
                </Text>
                <Text style={styles.infoStyle}>
                  {infoHouse?.owner?.firstName} {infoHouse?.owner?.lastName}
                </Text>
                <Text style={styles.inputLabel}>
                  {t('houses.owner_phone') + ':'}
                </Text>
                <Text style={styles.infoStyle}>{infoHouse?.owner?.phone}</Text>
              </View>
              {(infoHouse || newImage) && (
                <View style={{flex: 1}}>
                  <CustomButton
                    title="Editar perfil"
                    onPress={() => handleEdit()}
                  />
                </View>
              )}
            </View>
          </KeyboardAwareScrollView>
        ) : (
          <View />
        )}
      </PageLayout>
    </React.Fragment>
  );
};

export default HouseScreen;
