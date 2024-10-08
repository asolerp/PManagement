import React, { useContext, useRef, useState } from 'react';

import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';

import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';

import { StyleSheet, Text, View } from 'react-native';

// UI
import ImageLoader from '../../Elements/ImageLoader';
import { Spacer } from '../../Elements/Spacer';
import CustomInput from '../../Elements/CustomInput';
import DynamicSelectorList from '../../DynamicSelectorList';
import CustomButton from '../../Elements/CustomButton';

// Firebase
import { newHouse } from '../../../firebase/uploadNewHouse';

// Utils

import { error } from '../../../lib/logging';
import { LoadingModalContext } from '../../../context/loadinModalContext';
import { BottomModal } from '../../Modals/BottomModal';
import { useCameraOrLibrary } from '../../../hooks/useCamerOrLibrary';
import { imageActions } from '../../../utils/imageActions';
import { TextInputController } from '../TextInputController';
import theme from '../../../Theme/Theme';
import useUploadImageCheck from '../../../hooks/useUploadImage';
import { HOUSES } from '../../../utils/firebaseKeys';

const LIBRARY_ACTION = 'library';

const NewFormHome = () => {
  const navigation = useNavigation();

  const [owner, setOwner] = useState([]);
  const { uploadImages } = useUploadImageCheck(HOUSES);

  const [modalVisible, setModalVisible] = useState(false);
  const { setVisible } = useContext(LoadingModalContext);

  const houseNameRef = useRef(null);
  const streetRef = useRef(null);
  const municipioRef = useRef(null);
  const cpRef = useRef(null);
  const phoneRef = useRef(null);

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      houseName: ''
    }
  });

  const [houseImage, setHouseImage] = useState();
  const [loading, setLoading] = useState(false);

  const { onImagePress } = useCameraOrLibrary();

  React.useEffect(() => {
    register(houseNameRef.current, { required: true });
    register(streetRef.current, { required: true });
    register(municipioRef.current, { required: true });
    register(cpRef.current, { required: true });
    register(phoneRef.current, { required: true });
  }, [register]);

  const handlePress = type => {
    onImagePress({
      type,
      options: { ...imageActions[type], selectionLimit: 1 },
      callback: async imgs => {
        setHouseImage(
          imgs.map((image, i) => ({
            fileBase64: image?.base64,
            fileName: image?.fileName || `image-${i}`,
            fileUri: image?.uri,
            fileType: image?.type
          }))
        );
      }
    });
  };

  const onSubmit = async data => {
    setLoading(true);
    setVisible(true);
    try {
      const houseId = await newHouse({ ...data, owner: owner[0] });
      await uploadImages(houseImage, null, houseId);
      reset();
      setHouseImage(null);
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true
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
        isFixedBottom={false}
        isVisible={modalVisible}
        swipeDirection={null}
        onClose={() => {
          setModalVisible(false);
        }}
      >
        <DynamicSelectorList
          order={{ field: 'firstName' }}
          collection="users"
          where={[
            {
              label: 'role',
              operator: '==',
              condition: 'owner'
            }
          ]}
          store="jobForm"
          searchBy="firstName"
          schema={{
            img: 'profileImage',
            name: 'firstName',
            lastname: 'lastName'
          }}
          get={owner}
          set={owners => {
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
          ref={houseNameRef}
          setValue={setValue}
          errors={errors}
          name="houseName"
          placeholder="Nombre de la casa"
        />
        <Spacer space={4} />
        <TextInputController
          ref={streetRef}
          setValue={setValue}
          errors={errors}
          name="street"
          placeholder="Dirección"
        />
        <Spacer space={4} />
        <TextInputController
          ref={municipioRef}
          setValue={setValue}
          errors={errors}
          name="municipio"
          placeholder="Municipio"
        />
        <Spacer space={4} />
        <View style={styles.multipleLineInputs}>
          <View style={styles.multiLineElementLeft}>
            <TextInputController
              ref={cpRef}
              setValue={setValue}
              errors={errors}
              name="cp"
              placeholder="Código postal"
            />
          </View>
          <View style={styles.multiLineElementRight}>
            <TextInputController
              ref={phoneRef}
              setValue={setValue}
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
              <View style={theme.flexRow}>
                <View style={theme.flexRow}>
                  <Text style={styles.subtitle}>
                    {owner[0]?.firstName} {owner[0]?.lastName}
                  </Text>
                </View>
              </View>
            )
          }
          iconProps={{ name: 'person', color: '#55A5AD' }}
          onPress={() => setModalVisible(true)}
        />
      </KeyboardAwareScrollView>
      <View
        style={{
          flexGrow: 1,
          justifyContent: 'flex-end'
        }}
      >
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
  multiLineElementLeft: {
    flex: 1,
    marginRight: 10
  },
  multiLineElementRight: {
    flex: 1,
    marginLeft: 10
  },
  multipleLineInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  newHomeInput: {
    backgroundColor: 'white',
    color: 'black'
  },
  newHomeLabel: {
    color: 'black'
  },
  subtitle: {
    color: '#2A7BA5'
  },
  titleStyle: {
    color: '#284748',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  }
});

export default NewFormHome;
