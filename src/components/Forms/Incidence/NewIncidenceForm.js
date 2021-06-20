import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

import InputGroup from '../../../components/Elements/InputGroup';
import DynamicSelectorList from '../../../components/DynamicSelectorList';
import CustomInput from '../../Elements/CustomInput';
import {BottomModal, ModalTitle, ModalContent} from 'react-native-modals';

// Redux
import {useSelector} from 'react-redux';

import {userSelector} from '../../../Store/User/userSlice';

const styles = StyleSheet.create({
  container: {},
});

const NewIncidenceForm = () => {
  const {t} = useTranslation();
  const [modalContent, setModalContent] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState();
  const [incidence, setIncidence] = useState();
  const [house, setHouse] = useState();

  const user = useSelector(userSelector);

  return (
    <View>
      <BottomModal
        modalStyle={{borderRadius: 30}}
        height={0.9}
        visible={modalVisible}
        onSwipeOut={(event) => {
          setModalVisible(false);
        }}
        modalTitle={
          <ModalTitle title="🏡 Las casas 🏡" textStyle={{fontSize: 20}} />
        }
        onTouchOutside={() => {
          setModalVisible(false);
        }}>
        <ModalContent style={{flex: 1, alignItems: 'center'}}>
          {modalContent}
        </ModalContent>
      </BottomModal>
      <InputGroup>
        <TextInput
          style={{height: 40}}
          placeholder={t('newIncidence.form.title')}
          onChangeText={setTitle}
          value={title}
        />
      </InputGroup>
      <InputGroup>
        <TextInput
          multiline
          numberOfLines={10}
          textAlignVertical="top"
          style={{height: 120}}
          placeholder={t('newIncidence.form.incidence')}
          onChangeText={setIncidence}
          value={incidence}
        />
      </InputGroup>
      {user.role !== 'owner' && (
        <InputGroup>
          <CustomInput
            title="Casa"
            subtitle={
              <View style={{flexDirection: 'row'}}>
                {incidence?.house?.value.map((house, i) => (
                  <View key={i}>
                    <Text style={styles.subtitle}>{house.houseName}</Text>
                    {incidence?.house?.value?.length - 1 !== i && (
                      <Text style={styles.subtitle}> & </Text>
                    )}
                  </View>
                ))}
              </View>
            }
            iconProps={{name: 'house', color: '#55A5AD'}}
            onPress={() => {
              <DynamicSelectorList
                collection="houses"
                store="jobForm"
                searchBy="houseName"
                schema={{img: 'houseImage', name: 'houseName'}}
                get={house || []}
                set={(house) => setHouse(house)}
                closeModal={() => setModalVisible(false)}
              />;
              setModalVisible(true);
            }}
          />
        </InputGroup>
      )}
    </View>
  );
};

export default NewIncidenceForm;
