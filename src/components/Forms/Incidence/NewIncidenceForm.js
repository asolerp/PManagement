import React, {useState, useCallback} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

import InputGroup from '../../../components/Elements/InputGroup';
import DynamicSelectorList from '../../../components/DynamicSelectorList';
import CustomInput from '../../Elements/CustomInput';
import {BottomModal, ModalTitle, ModalContent} from 'react-native-modals';

// Redux
import {useDispatch, useSelector, shallowEqual} from 'react-redux';
import {setInputForm} from '../../../Store/IncidenceForm/incidenceFormSlice';
import {userSelector} from '../../../Store/User/userSlice';

const styles = StyleSheet.create({
  subtitle: {
    color: '#2A7BA5',
  },
});

const NewIncidenceForm = () => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [modalContent, setModalContent] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  const {incidence} = useSelector(
    ({incidenceForm: {incidence}}) => ({incidence}),
    shallowEqual,
  );

  const user = useSelector(userSelector);

  const setInputFormAction = useCallback(
    (label, value) => dispatch(setInputForm({label, value})),
    [dispatch],
  );

  return (
    <View>
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
          {modalContent}
        </ModalContent>
      </BottomModal>
      <InputGroup>
        <TextInput
          style={{height: 40}}
          placeholder={t('newIncidence.form.title')}
          onChangeText={(text) => setInputFormAction('title', text)}
          value={incidence?.title}
        />
      </InputGroup>
      <InputGroup>
        <TextInput
          multiline
          numberOfLines={10}
          textAlignVertical="top"
          style={{height: 120}}
          placeholder={t('newIncidence.form.incidence')}
          onChangeText={(text) => setInputFormAction('incidence', text)}
          value={incidence?.incidence}
        />
      </InputGroup>
      {user.role !== 'owner' && (
        <InputGroup>
          <CustomInput
            title={t('common.house')}
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
              setModalContent(
                <DynamicSelectorList
                  collection="houses"
                  store="jobForm"
                  searchBy="houseName"
                  schema={{img: 'houseImage', name: 'houseName'}}
                  get={incidence?.house?.value || []}
                  set={(house) =>
                    setInputFormAction('house', {
                      ...incidence.house,
                      value: house,
                    })
                  }
                  closeModal={() => setModalVisible(false)}
                />,
              );
              setModalVisible(true);
            }}
          />
        </InputGroup>
      )}
    </View>
  );
};

export default NewIncidenceForm;
