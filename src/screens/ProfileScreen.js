import React, {useState} from 'react';
import {Button, View, Text, TextInput, StyleSheet} from 'react-native';

// UI
import PagetLayout from '../components/PageLayout';
import Avatar from '../components/Avatar';
import InputGroup from '../components/Elements/InputGroup';
import CustomButton from '../components/Elements/CustomButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageBlurLoading from 'react-native-image-blur-loading';

//Redux
import {useSelector, shallowEqual} from 'react-redux';

//Firebase
import {useGetDocFirebase} from '../hooks/useGetDocFIrebase';
import {useUpdateFirebase} from '../hooks/useUpdateFirebase';
import {useUploadCloudinaryImage} from '../hooks/useUploadCloudinaryImage';
import auth from '@react-native-firebase/auth';

//Utils
import {launchImage} from '../utils/imageFunctions';
import {TouchableOpacity} from 'react-native-gesture-handler';

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

const ProfileScreen = () => {
  const [newImage, setNewImage] = useState();
  const [infoProfile, setInfoProfile] = useState();
  const [editLoading, setEditLoading] = useState(false);

  const {user} = useSelector(
    ({userLoggedIn: {user}}) => ({user}),
    shallowEqual,
  );

  const {updateFirebase} = useUpdateFirebase('users');

  const {upload} = useUploadCloudinaryImage();

  const {document: userLoggedIn} = useGetDocFirebase('users', user.uid);

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
      console.log(err);
    } finally {
      setEditLoading(false);
    }
  };

  const logOut = async () => {
    try {
      await auth().signOut();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PagetLayout
      footer={<CustomButton title="Desconectarse" onPress={() => logOut()} />}
      titleLefSide={true}
      backButton
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
                type="clear"
                onPress={() => handleEdit()}
              />
            </View>
          )}
        </View>
      </View>
    </PagetLayout>
  );
};

export default ProfileScreen;
