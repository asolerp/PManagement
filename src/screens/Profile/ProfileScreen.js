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
import {useTranslation} from 'react-i18next';
import {ScrollView} from 'react-native';
import {Button} from 'react-native';
import {useTheme} from '../../Theme';
import {ActivityIndicator} from 'react-native';
import {Colors} from '../../Theme/Variables';

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  avatarContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
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
    flex: 5,
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
  const {Layout} = useTheme();
  const logOutUser = useCallback((user) => dispatch(logout()), [dispatch]);

  const user = useSelector(userSelector, shallowEqual);
  const {t} = useTranslation();
  const {updateFirebase} = useUpdateFirebase('users');
  const {upload} = useUploadCloudinaryImage();

  const defaultImg =
    'https://res.cloudinary.com/enalbis/image/upload/v1629876203/PortManagement/varios/avatar-1577909_1280_gcinj5.png';

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
      console.log(err);
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
            title={t('profile.logout')}
            onPress={() => logOut()}
          />
        )
      }
      titleLefSide={true}
      backButton={user?.role === 'admin'}
      titleProps={{
        title: t('profile.title'),
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
              source={{
                uri:
                  newImage?.fileUri || userLoggedIn?.profileImage || defaultImg,
              }}
              style={styles.avatarWrapper}
            />
          </TouchableOpacity>
          <Text style={styles.comonTextStyle}>
            {userLoggedIn?.firstName} {userLoggedIn?.lastName}
          </Text>
        </View>
        <View style={styles.formContainer}>
          <View style={[Layout.row, Layout.justifyContentSpaceBetween]}>
            <Text style={styles.titleStyle}>{t('profile.personal_data')}</Text>
            {(infoProfile || newImage) && (
              <React.Fragment>
                {editLoading ? (
                  <ActivityIndicator color={Colors.pm} size="small" />
                ) : (
                  <Button
                    title={t('common.edit')}
                    onPress={() => handleEdit()}
                  />
                )}
              </React.Fragment>
            )}
          </View>
          <ScrollView>
            <Text style={styles.inputLabel}>{t('profile.name') + ': '}</Text>
            <InputGroup>
              <TextInput
                editable={userId ? userId === user.uid : true}
                style={{height: 40}}
                placeholder={t('profile.name')}
                onChangeText={(text) =>
                  setInfoProfile({...infoProfile, firstName: text})
                }
                value={infoProfile?.firstName || userLoggedIn?.firstName}
              />
            </InputGroup>
            <Text style={styles.inputLabel}>
              {t('profile.last_name') + ': '}
            </Text>
            <InputGroup>
              <TextInput
                editable={userId ? userId === user.uid : true}
                style={{height: 40}}
                placeholder={t('profile.last_name')}
                onChangeText={(text) =>
                  setInfoProfile({...infoProfile, lastName: text})
                }
                value={infoProfile?.lastName || userLoggedIn?.lastName}
              />
            </InputGroup>
            <Text style={styles.inputLabel}>{t('profile.phone') + ': '}</Text>
            <InputGroup>
              <TextInput
                editable={userId ? userId === user.uid : true}
                style={{height: 40}}
                placeholder={t('profile.phone')}
                onChangeText={(text) =>
                  setInfoProfile({...infoProfile, phone: text})
                }
                value={infoProfile?.phone || userLoggedIn?.phone}
              />
            </InputGroup>
            <Text style={styles.inputLabel}>{t('profile.email') + ': '}</Text>
            <InputGroup>
              <TextInput
                editable={userId ? userId === user.uid : true}
                style={{height: 40}}
                placeholder={t('profile.email')}
                onChangeText={(text) =>
                  setInfoProfile({...infoProfile, email: text})
                }
                value={infoProfile?.email || userLoggedIn?.email}
              />
            </InputGroup>
          </ScrollView>
        </View>
      </View>
    </PageLayout>
  );
};

export default ProfileScreen;
