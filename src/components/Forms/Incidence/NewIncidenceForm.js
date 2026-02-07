import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

// Components
import DynamicSelectorList from '../../DynamicSelectorList';
import CustomInput from '../../Elements/CustomInput';
import { BottomModal } from '../../Modals/BottomModal';

// Store
import { setInputForm } from '../../../Store/IncidenceForm/incidenceFormSlice';
import { userSelector } from '../../../Store/User/userSlice';

// Theme
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius
} from '../../../Theme/Variables';

const NewIncidenceForm = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [modalContent, setModalContent] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  const { incidence } = useSelector(
    ({ incidenceForm: { incidence } }) => ({ incidence }),
    shallowEqual
  );

  const user = useSelector(userSelector);

  const setInputFormAction = useCallback(
    (label, value) => dispatch(setInputForm({ label, value })),
    [dispatch]
  );

  return (
    <View style={styles.container}>
      <BottomModal
        isFixedBottom={false}
        isVisible={modalVisible}
        swipeDirection={null}
        onClose={() => setModalVisible(false)}
      >
        {modalContent}
      </BottomModal>

      {/* Título */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('newIncidence.form.title')}</Text>
        <TextInput
          placeholder={t('newIncidence.form.title_placeholder')}
          placeholderTextColor={Colors.gray400}
          onChangeText={text => setInputFormAction('title', text)}
          value={incidence?.title}
          style={styles.input}
        />
      </View>

      {/* Descripción */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('newIncidence.form.incidence')}</Text>
        <TextInput
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={[styles.input, styles.textArea]}
          placeholderTextColor={Colors.gray400}
          placeholder={t('newIncidence.form.incidence_placeholder')}
          onChangeText={text => setInputFormAction('incidence', text)}
          value={incidence?.incidence}
        />
      </View>

      {/* Selector de casa (solo para no-owners) */}
      {user.role !== 'owner' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('common.house')}</Text>
          <CustomInput
            subtitle={
              incidence?.house?.value && (
                <View style={styles.houseList}>
                  {incidence?.house?.value.map((house, i) => (
                    <Text key={house.id || i} style={styles.houseText}>
                      {house.houseName}
                      {incidence?.house?.value?.length - 1 !== i && ' & '}
                    </Text>
                  ))}
                </View>
              )
            }
            iconProps={{ name: 'house', color: Colors.primary }}
            onPress={() => {
              setModalContent(
                <DynamicSelectorList
                  collection="houses"
                  store="jobForm"
                  searchBy="houseName"
                  order={{ field: 'houseName', type: 'asc' }}
                  schema={{ img: 'houseImage', name: 'houseName' }}
                  get={incidence?.house?.value || []}
                  set={house =>
                    setInputFormAction('house', {
                      ...incidence?.house,
                      value: house
                    })
                  }
                  closeModal={() => setModalVisible(false)}
                />
              );
              setModalVisible(true);
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md
  },
  houseList: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  houseText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium
  },
  input: {
    backgroundColor: Colors.gray50,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    color: Colors.gray800,
    fontSize: FontSize.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md
  },
  inputGroup: {
    gap: Spacing.xs
  },
  label: {
    color: Colors.gray700,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginLeft: Spacing.xs
  },
  textArea: {
    height: 120,
    paddingTop: Spacing.md
  }
});

export default NewIncidenceForm;
