import React, {useCallback, useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

// UI
import PageLayout from '../../components/PageLayout';
import InputGroup from '../../components/Elements/InputGroup';
import CustomButton from '../../components/Elements/CustomButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageBlurLoading from 'react-native-image-blur-loading';

//Redux
import {useSelector, shallowEqual, useDispatch} from 'react-redux';

//Firebase
import {useGetDocFirebase} from '../../hooks/useGetDocFIrebase';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import {useUploadCloudinaryImage} from '../../hooks/useUploadCloudinaryImage';
import auth from '@react-native-firebase/auth';

//Utils
import {launchImage} from '../../utils/imageFunctions';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {logout, userSelector} from '../../Store/User/userSlice';
import {error} from '../../lib/logging';

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  avatarContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  avatarWrapper: {
    width: 150,
    height: 150,
    borderRadius: 100,
  },
  iconContainer: {
    position: 'absolute',
    right: 20,
    top: 0,
    backgroundColor: '#ED7A7A',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    padding: 5,
  },
  comonTextStyle: {
    fontSize: 20,
    color: '#284748',
    fontWeight: 'bold',
    marginTop: 10,
  },
  titleStyle: {
    fontSize: 20,
    color: '#284748',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  formContainer: {
    flex: 3,
    justifyContent: 'flex-start',
  },
  inputLabel: {
    fontSize: 15,
    marginBottom: 10,
    color: '#284748',
  },
});

const ProfileScreen = ({route}) => {
  const {userId} = route.params;
  const [newImage, setNewImage] = useState();
  const [infoProfile, setInfoProfile] = useState();
  const [editLoading, setEditLoading] = useState(false);
  const dispatch = useDispatch();

  const logOutUser = useCallback((user) => dispatch(logout()), [dispatch]);

  const user = useSelector(userSelector, shallowEqual);

  const {updateFirebase} = useUpdateFirebase('users');
  const {upload} = useUploadCloudinaryImage();

  const {document: userLoggedIn} = useGetDocFirebase(
    'users',
    userId || user.uid,
  );

  const handleEdit = async () => {
    try {
      setEditLoading(true);
      if (newImage) {
        const uploadImage = await upload(
          newImage,
          `/PortManagement/Users/${user.uid}/Photos`,
        );
        await updateFirebase(user.uid, {
          ...infoProfile,
          profileImage: uploadImage,
        });
      } else {
        await updateFirebase(user.uid, {...infoProfile});
      }
      setInfoProfile(null);
      setNewImage(null);
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    } finally {
      setEditLoading(false);
    }
  };

  const logOut = async () => {
    try {
      logOutUser();
      await auth().signOut();
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    }
  };

  return (
    <PageLayout
      safe
      footer={
        (userId === user.uid || !userId) && (
          <CustomButton
            styled="rounded"
            title="Desconectarse"
            onPress={() => logOut()}
          />
        )
      }
      titleLefSide={true}
      backButton={user?.role === 'admin'}
      titleProps={{
        title: 'Perfil',
        subPage: true,
      }}>
      <View style={styles.pageContainer}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={() => launchImage(setNewImage)}>
            {newImage && (
              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => setNewImage(null)}>
                  <Icon name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
            <ImageBlurLoading
              withIndicator
              thumbnailSource={{
                uri: newImage?.fileUri || userLoggedIn?.profileImage,
              }}
              source={{uri: newImage?.fileUri || userLoggedIn?.profileImage}}
              style={styles.avatarWrapper}
            />
            {/* <Avatar
              uri={newImage?.fileUri || userLoggedIn?.profileImage}
              size="xxl"
            /> */}
          </TouchableOpacity>
          <Text style={styles.comonTextStyle}>
            {userLoggedIn?.firstName} {userLoggedIn?.lastName}
          </Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.titleStyle}>💻 Datos Personales</Text>
          <Text style={styles.inputLabel}>Teléfono de contacto:</Text>
          <InputGroup>
            <TextInput
              editable={userId ? userId === user.uid : true}
              style={{height: 40}}
              placeholder="Teléfono"
              onChangeText={(text) =>
                setInfoProfile({...infoProfile, phone: text})
              }
              value={infoProfile?.phone || userLoggedIn?.phone}
            />
          </InputGroup>
          <Text style={styles.inputLabel}>Email:</Text>
          <InputGroup>
            <TextInput
              editable={userId ? userId === user.uid : true}
              style={{height: 40}}
              placeholder="Email"
              onChangeText={(text) =>
                setInfoProfile({...infoProfile, email: text})
              }
              value={infoProfile?.email || userLoggedIn?.email}
            />
          </InputGroup>
          {(infoProfile || newImage) && (
            <View style={{flex: 1}}>
              <CustomButton
                loading={editLoading}
                title="Editar perfil"
                styled="rounded"
                onPress={() => handleEdit()}
              />
            </View>
          )}
        </View>
      </View>
    </PageLayout>
  );
};

export default ProfileScreen;
