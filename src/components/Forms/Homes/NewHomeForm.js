import React, {useContext, useState} from 'react';

import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';

import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';

import {StyleSheet, Text, View} from 'react-native';

// UI
import ImageLoader from '../../Elements/ImageLoader';
import Input from '../../Elements/Input';
import InputGroup from '../../Elements/InputGroup';
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

const LIBRARY_ACTION = 'library';

const NewFormHome = () => {
  const navigation = useNavigation();

  const [owner, setOwner] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const {setVisible} = useContext(LoadingModalContext);

  const {control, handleSubmit, errors, reset} = useForm();
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
          get={owner}
          set={(owners) => {
            setOwner(owners);
          }}
          closeModal={() => setModalVisible(false)}
        />
      </BottomModal>
      <KeyboardAwareScrollView contentContainerStyle={{flexGrow: 1}}>
        <ImageLoader
          onPress={() => handlePress(LIBRARY_ACTION)}
          image={houseImage}
        />
        <Controller
          control={control}
          render={({onChange, onBlur, value}) => (
            <Input
              onBlur={onBlur}
              onChangeText={(v) => onChange(v)}
              value={value}
              placeholder="Nombre de la casa"
              name="houseName"
              inputStyles={styles.newHomeInput}
              labelStyle={styles.newHomeLabel}
              error={errors.houseName}
            />
          )}
          name="houseName"
          rules={{required: true}}
          defaultValue=""
        />
        <Controller
          control={control}
          render={({onChange, onBlur, value}) => (
            <Input
              onBlur={onBlur}
              onChangeText={(v) => onChange(v)}
              value={value}
              placeholder="Dirección"
              name="street"
              inputStyles={styles.newHomeInput}
              labelStyle={styles.newHomeLabel}
              error={errors.street}
            />
          )}
          name="street"
          rules={{required: true}}
          defaultValue=""
        />
        <Controller
          control={control}
          render={({onChange, onBlur, value}) => (
            <Input
              onBlur={onBlur}
              onChangeText={(v) => onChange(v)}
              value={value}
              placeholder="Municipio"
              name="municipio"
              inputStyles={styles.newHomeInput}
              labelStyle={styles.newHomeLabel}
              error={errors.municipio}
            />
          )}
          name="municipio"
          rules={{required: true}}
          defaultValue=""
        />
        <View style={styles.multipleLineInputs}>
          <View style={styles.multiLineElementLeft}>
            <Controller
              control={control}
              render={({onChange, onBlur, value}) => (
                <Input
                  onBlur={onBlur}
                  onChangeText={(v) => onChange(v)}
                  value={value}
                  placeholder="Código postal"
                  name="cp"
                  inputStyles={styles.newHomeInput}
                  labelStyle={styles.newHomeLabel}
                  error={errors.cp}
                />
              )}
              name="cp"
              rules={{required: true}}
              defaultValue=""
            />
          </View>
          <View style={styles.multiLineElementRight}>
            <Controller
              control={control}
              render={({onChange, onBlur, value}) => (
                <Input
                  onBlur={onBlur}
                  onChangeText={(v) => onChange(v)}
                  value={value}
                  placeholder="Teléfono"
                  name="phone"
                  inputStyles={styles.newHomeInput}
                  labelStyle={styles.newHomeLabel}
                  error={errors.phone}
                />
              )}
              name="phone"
              rules={{required: true}}
              defaultValue=""
            />
          </View>
        </View>
        <Text style={styles.titleStyle}>Propietario</Text>
        <InputGroup>
          <CustomInput
            title="Propietario"
            subtitle={
              owner?.length > 0 && (
                <View style={{flexDirection: 'row'}}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={styles.subtitle}>{owner[0]?.firstName}</Text>
                  </View>
                </View>
              )
            }
            iconProps={{name: 'person', color: '#55A5AD'}}
            onPress={() => setModalVisible(true)}
          />
        </InputGroup>
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
