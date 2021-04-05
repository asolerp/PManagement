import React, {useCallback, useState} from 'react';
import {BottomModal, ModalContent} from 'react-native-modals';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {useSelector, shallowEqual} from 'react-redux';

import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';

import {TextInput, StyleSheet, Text, Alert, View} from 'react-native';

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
import {launchImage} from '../../../utils/imageFunctions';

const NewFormHome = () => {
  const navigation = useNavigation();

  const {users} = useSelector(
    ({houseForm: {users}}) => ({users}),
    shallowEqual,
  );

  const [owner, setOwner] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);

  const {control, handleSubmit, errors, reset} = useForm();
  const [houseImage, setHouseImage] = useState();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await newHouse({...data, owner: owner[0]}, houseImage);
      reset();
      setHouseImage(null);
      Alert.alert(
        'Nueva casa registrada',
        'Se ha registrado una nueva casa :)!',
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      navigation.goBack();
    }
  };

  return (
    <React.Fragment>
      <BottomModal
        modalStyle={{borderRadius: 30}}
        height={0.9}
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
            get={owner}
            set={(owners) => setOwner(owners)}
          />
        </ModalContent>
      </BottomModal>
      <KeyboardAwareScrollView>
        <ImageLoader
          onPress={() => launchImage(setHouseImage)}
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
        <Text style={styles.titleStyle}>🔑 Propietario</Text>
        <InputGroup>
          <CustomInput
            title="Propietario"
            subtitle={
              owner.length > 0 && (
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
        <CustomButton
          loading={loading}
          title="Crear casa"
          onPress={handleSubmit(onSubmit)}
        />
      </KeyboardAwareScrollView>
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
