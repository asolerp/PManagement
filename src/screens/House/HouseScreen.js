import React from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';

// UI
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomInput from '../../components/Elements/CustomInput';
import InputGroup from '../../components/Elements/InputGroup';
import PageLayout from '../../components/PageLayout';

import DynamicSelectorList from '../../components/DynamicSelectorList';
import CustomButton from '../../components/Elements/CustomButton';

//Utils

import {useTranslation} from 'react-i18next';
import {BottomModal} from '../../components/Modals/BottomModal';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';
import PageOptionsScreen from '../PageOptions/PageOptions';
import {Spacer} from '../../components/Elements/Spacer';

import {DEFAULT_IMAGE} from '../../constants/general';
import FastImage from 'react-native-fast-image';

import {styles} from './styles';
import {useHouseScreen} from './useHouseScreen';

const HouseScreen = ({route}) => {
  const {t} = useTranslation();
  const {
    house,
    isAdmin,
    houseId,
    Gutters,
    newImage,
    infoHouse,
    handleEdit,
    setInfoHouse,
    modalVisible,
    setModalVisible,
    handlePressImage,
  } = useHouseScreen({route});

  return (
    <React.Fragment>
      <BottomModal
        isFixedBottom={false}
        isVisible={modalVisible}
        onClose={(event) => {
          setModalVisible(false);
        }}
        swipeDirection={null}>
        <DynamicSelectorList
          collection="users"
          order={{field: 'firstName'}}
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
                  <CustomButton title="Guardar" onPress={() => handleEdit()} />
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
