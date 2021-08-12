import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
} from 'react-native';

// UI
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomInput from '../../components/Elements/CustomInput';
import InputGroup from '../../components/Elements/InputGroup';
import PageLayout from '../../components/PageLayout';
import {BottomModal, ModalContent} from 'react-native-modals';
import DynamicSelectorList from '../../components/DynamicSelectorList';
import CustomButton from '../../components/Elements/CustomButton';

// Firebase
import {useGetDocFirebase} from '../../hooks/useGetDocFIrebase';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import {useUploadCloudinaryImage} from '../../hooks/useUploadCloudinaryImage';

//Utils
import {launchImage} from '../../utils/imageFunctions';
import {ScrollView} from 'react-native';
import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';
import useAuth from '../../utils/useAuth';
import {useTranslation} from 'react-i18next';
import {error} from '../../lib/logging';

const styles = StyleSheet.create({
  pageWrapper: {
    marginTop: 20,
  },
  infoWrapper: {
    marginVertical: 20,
  },
  iconContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#ED7A7A',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    padding: 5,
  },
  houseImage: {
    width: '100%',
    height: 150,
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
  const [infoHouse, setInfoHouse] = useState();
  const [newImage, setNewImage] = useState();
  const {isAdmin} = useAuth();
  const {t} = useTranslation();
  const {houseId} = route.params;
  const {document: house} = useGetDocFirebase('houses', houseId);
  const {updateFirebase} = useUpdateFirebase('houses');
  const {upload} = useUploadCloudinaryImage();
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);

  const handleEdit = async () => {
    try {
      if (newImage) {
        const uploadImage = await upload(
          newImage,
          `/PortManagement/Houses/${houseId}/Photos`,
        );
        await updateFirebase(houseId, {
          ...infoHouse,
          profileImage: uploadImage,
        });
      } else {
        await updateFirebase(houseId, {...infoHouse});
      }
      setInfoHouse(null);
      setNewImage(null);
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    }
  };

  return (
    <React.Fragment>
      <BottomModal
        modalStyle={{borderRadius: 30}}
        height={0.5}
        visible={modalVisible}
        onSwipeOut={(event) => {
          setModalVisible(false);
        }}
        onTouchOutside={() => {
          setModalVisible(false);
        }}>
        <ModalContent style={{flex: 1, alignItems: 'center'}}>
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
            schema={{img: 'profileImage', name: 'firstName'}}
            get={[infoHouse?.owner || house?.owner]}
            set={(owners) => setInfoHouse({...infoHouse, owner: owners[0]})}
            closeModal={() => setModalVisible(false)}
          />
        </ModalContent>
      </BottomModal>
      <PageLayout
        backButton
        titleProps={{
          subPage: true,
          title: house?.houseName,
          color: 'white',
        }}>
        {house ? (
          <ScrollView
            style={styles.pageWrapper}
            showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => isAdmin && launchImage(setNewImage)}>
              {newImage && (
                <View style={styles.iconContainer}>
                  <TouchableOpacity onPress={() => setNewImage(null)}>
                    <Icon name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              )}
              <ImageBackground
                source={{uri: newImage?.fileUri || house?.houseImage}}
                imageStyle={{borderRadius: 10, borderTopRightRadius: 40}}
                style={styles.houseImage}
              />
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
                    setInfoHouse({...infoHouse, phone: text})
                  }
                  value={infoHouse?.houseName || house?.houseName}
                />
              </InputGroup>
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
                  value={infoHouse?.street || house?.street}
                />
              </InputGroup>
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
                  value={infoHouse?.municipio || house?.municipio}
                />
              </InputGroup>
              <View>
                <Text style={styles.titleStyle}>{t('common.owner')}</Text>
                <InputGroup>
                  <CustomInput
                    title="Propietario"
                    subtitle={
                      <View style={{flexDirection: 'row'}}>
                        {[infoHouse?.owner || house?.owner].map((owner, i) => (
                          <View
                            key={owner?.id || i}
                            style={{flexDirection: 'row'}}>
                            <Text style={styles.subtitle}>
                              {owner?.firstName}
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
                </InputGroup>
                <Text style={styles.inputLabel}>
                  {t('houses.owner_name') + ':'}
                </Text>
                <Text style={styles.infoStyle}>
                  {infoHouse?.owner?.firstName || house?.owner?.firstName}
                </Text>
                <Text style={styles.inputLabel}>
                  {t('houses.owner_phone') + ':'}
                </Text>
                <Text style={styles.infoStyle}>
                  {infoHouse?.owner?.phone || house?.owner?.phone}
                </Text>
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
          </ScrollView>
        ) : (
          <View />
        )}
      </PageLayout>
    </React.Fragment>
  );
};

export default HouseScreen;
