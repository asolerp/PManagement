import React, {useState, useCallback} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

import InputGroup from '../../../components/Elements/InputGroup';
import DynamicSelectorList from '../../../components/DynamicSelectorList';
import CustomInput from '../../Elements/CustomInput';
import {BottomModal} from '../../Modals/BottomModal';

// Redux
import {useDispatch, useSelector, shallowEqual} from 'react-redux';
import {setInputForm} from '../../../Store/IncidenceForm/incidenceFormSlice';
import {userSelector} from '../../../Store/User/userSlice';
import {Colors} from '../../../Theme/Variables';
import {commonStyles} from '../../../styles/input';
import {Spacer} from '../../Elements/Spacer';

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
        isVisible={modalVisible}
        swipeDirection={null}
        onClose={() => {
          setModalVisible(false);
        }}>
        {modalContent}
      </BottomModal>

      <TextInput
        placeholder={t('newIncidence.form.title')}
        placeholderTextColor={Colors.darkGrey}
        onChangeText={(text) => setInputFormAction('title', text)}
        value={incidence?.title}
        style={[commonStyles.input]}
      />
      <Spacer space={4} />
      <TextInput
        multiline
        numberOfLines={10}
        textAlignVertical="top"
        style={[commonStyles.input, {height: 120}]}
        placeholderTextColor={Colors.darkGrey}
        placeholder={t('newIncidence.form.incidence')}
        onChangeText={(text) => setInputFormAction('incidence', text)}
        value={incidence?.incidence}
      />
      <Spacer space={4} />
      {user.role !== 'owner' && (
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
      )}
    </View>
  );
};

export default NewIncidenceForm;
