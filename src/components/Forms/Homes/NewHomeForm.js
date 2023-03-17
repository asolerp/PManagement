import React, {useContext, useState} from 'react';

import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';

import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';

import {StyleSheet, Text, View} from 'react-native';

// UI
import ImageLoader from '../../Elements/ImageLoader';
import {Spacer} from '../../Elements/Spacer';
import CustomInput from '../../Elements/CustomInput';
import DynamicSelectorList from '../../DynamicSelectorList';
import CustomButton from '../../Elements/CustomButton';

// Firebase
import {newHouse} from '../../../firebase/uploadNewHouse';

// Utils

import {error} from '../../../lib/logging';
import {LoadingModalContext} from '../../../context/loadinModalContext';
import {BottomModal} from '../../Modals/BottomModal';
import {useCameraOrLibrary} from '../../../hooks/useCamerOrLibrary';
import {imageActions} from '../../../utils/imageActions';
import {TextInputController} from '../TextInputController';
import theme from '../../../Theme/Theme';

const LIBRARY_ACTION = 'library';

const NewFormHome = () => {
  const navigation = useNavigation();

  const [owner, setOwner] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const {setVisible} = useContext(LoadingModalContext);

  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm({
    defaultValues: {
      houseName: '',
    },
  });
  const [houseImage, setHouseImage] = useState();
  const [loading, setLoading] = useState(false);

  const {onImagePress} = useCameraOrLibrary();

  const handlePress = (type) => {
    onImagePress({
      type,
      options: {...imageActions[type], selectionLimit: 1},
      callback: async (imgs) => {
        setHouseImage(
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

  const onSubmit = async (data) => {
    setLoading(true);
    setVisible(true);
    try {
      await newHouse({...data, owner: owner[0]}, houseImage?.[0]);
      reset();
      setHouseImage(null);
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    } finally {
      setLoading(false);
      setVisible(false);
      navigation.goBack();
    }
  };

  return (
    <React.Fragment>
      <BottomModal
        isVisible={modalVisible}
        swipeDirection={null}
        onClose={() => {
          setModalVisible(false);
        }}>
        <DynamicSelectorList
          order={{field: 'firstName', type: 'asc'}}
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
          get={owner}
          set={(owners) => {
            setOwner(owners);
          }}
          closeModal={() => setModalVisible(false)}
        />
      </BottomModal>
      <KeyboardAwareScrollView>
        <ImageLoader
          onPress={() => handlePress(LIBRARY_ACTION)}
          image={houseImage}
        />
        <TextInputController
          control={control}
          errors={errors}
          name="houseName"
          placeholder="Nombre de la casa"
        />
        <Spacer space={4} />
        <TextInputController
          control={control}
          errors={errors}
          name="street"
          placeholder="Dirección"
        />
        <Spacer space={4} />
        <TextInputController
          control={control}
          errors={errors}
          name="municipio"
          placeholder="Municipio"
        />
        <Spacer space={4} />
        <View style={styles.multipleLineInputs}>
          <View style={styles.multiLineElementLeft}>
            <TextInputController
              control={control}
              errors={errors}
              name="cp"
              placeholder="Código postal"
            />
          </View>
          <View style={styles.multiLineElementRight}>
            <TextInputController
              control={control}
              errors={errors}
              name="phone"
              placeholder="Teléfono"
            />
          </View>
        </View>
        <Spacer space={4} />
        <Text style={styles.titleStyle}>Propietario</Text>
        <CustomInput
          title="Propietario"
          subtitle={
            owner?.length > 0 && (
              <View style={[theme.flexRow]}>
                <View style={[theme.flexRow]}>
                  <Text style={styles.subtitle}>
                    {owner[0]?.firstName} {owner[0]?.lastName}
                  </Text>
                </View>
              </View>
            )
          }
          iconProps={{name: 'person', color: '#55A5AD'}}
          onPress={() => setModalVisible(true)}
        />
      </KeyboardAwareScrollView>
      <View
        style={{
          flexGrow: 1,
          justifyContent: 'flex-end',
        }}>
        <CustomButton
          loading={loading}
          title="Crear casa"
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  multipleLineInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  multiLineElementLeft: {
    flex: 1,
    marginRight: 10,
  },
  multiLineElementRight: {
    flex: 1,
    marginLeft: 10,
  },
  newHomeInput: {
    backgroundColor: 'white',
    color: 'black',
  },
  newHomeLabel: {
    color: 'black',
  },
  titleStyle: {
    fontSize: 20,
    color: '#284748',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    color: '#2A7BA5',
  },
});

export default NewFormHome;
