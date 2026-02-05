import React, { useState, useCallback, useEffect } from 'react';
import { Text, View, TextInput, StyleSheet, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/es';
import * as Localization from 'expo-localization';
import Icon from 'react-native-vector-icons/MaterialIcons';

// UI
import DynamicSelectorList from '../../DynamicSelectorList';
import DateSelector from '../Jobs/DateSelector';
import { BottomModal } from '../../Modals/BottomModal';

// Firebase
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs
} from '@react-native-firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Redux
import {
  houseSelector,
  observationsSelector,
  workersSelector,
  setForm,
  setEditableForm,
  checksSelector,
  setCheck,
  setEditableChecks,
  setAllChecks,
  dateSelector
} from '../../../Store/CheckList/checkListSlice';

// Utils
import { CHECKLISTS } from '../../../utils/firebaseKeys';

// Componente para un campo de selección moderno
const SelectField = ({ icon, title, subtitle, onPress, isEmpty }) => (
  <Pressable
    style={[styles.selectField, isEmpty && styles.selectFieldEmpty]}
    onPress={onPress}
  >
    <View style={styles.selectFieldContent}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={20} color="#55A5AD" />
      </View>
      <View style={styles.selectFieldText}>
        <Text style={styles.selectFieldTitle}>{title}</Text>
        {subtitle ? (
          <View style={styles.subtitleContainer}>{subtitle}</View>
        ) : (
          <Text style={styles.selectFieldPlaceholder}>Seleccionar...</Text>
        )}
      </View>
    </View>
    <Icon name="chevron-right" size={24} color="#CBD5E0" />
  </Pressable>
);

// Componente para el campo de observaciones
const ObservationsField = ({ value, onChange, t }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.iconContainer}>
        <Icon name="chat-bubble-outline" size={18} color="#55A5AD" />
      </View>
      <View>
        <Text style={styles.sectionTitle}>{t('common.observations')}</Text>
        <Text style={styles.sectionSubtitle}>Opcional</Text>
      </View>
    </View>
    <TextInput
      multiline
      numberOfLines={6}
      style={styles.textArea}
      placeholder="Añade cualquier observación o nota adicional sobre este checklist..."
      placeholderTextColor="#9CA3AF"
      onChangeText={onChange}
      value={value}
    />
  </View>
);

// Componente de checkbox nativo
const NativeCheckbox = ({ checked, onToggle }) => (
  <Pressable
    style={[styles.checkbox, checked && styles.checkboxChecked]}
    onPress={onToggle}
  >
    {checked && <Icon name="check" size={16} color="#FFFFFF" />}
  </Pressable>
);

// Componente para un item de check individual
const CheckItemComponent = ({ item, isChecked, onToggle }) => {
  const checkText =
    item?.locale?.[Localization.getLocales()[0]?.languageCode || 'en'] ||
    item?.locale?.en;

  return (
    <Pressable
      style={[styles.checkItem, isChecked && styles.checkItemSelected]}
      onPress={() => onToggle({ ...item, originalId: item.id }, !isChecked)}
    >
      <NativeCheckbox
        checked={isChecked}
        onToggle={() => onToggle({ ...item, originalId: item.id }, !isChecked)}
      />
      <Text style={[styles.checkText, isChecked && styles.checkTextSelected]}>
        {checkText}
      </Text>
    </Pressable>
  );
};

const CheckListForm = ({ edit, docId }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const db = getFirestore();
  const checksCollection = collection(db, 'checks');
  const [list] = useCollectionData(checksCollection, {
    idField: 'id'
  });

  const house = useSelector(houseSelector);
  const workers = useSelector(workersSelector);
  const observations = useSelector(observationsSelector);
  const checks = useSelector(checksSelector);
  const date = useSelector(dateSelector);

  const setInputFormAction = useCallback(
    (label, value) => dispatch(setForm({ label, value })),
    [dispatch]
  );

  const setInputFormEditable = useCallback(
    form => dispatch(setEditableForm(form)),
    [dispatch]
  );

  const setChecksEditable = useCallback(
    checkEditableList => dispatch(setEditableChecks(checkEditableList)),
    [dispatch]
  );

  const setToggleCheckBox = useCallback(
    (item, newValue) => {
      dispatch(setCheck({ check: item, checkState: newValue }));
    },
    [dispatch]
  );

  const allChecks = list?.reduce(
    (acc, check) => ({
      ...acc,
      [check.id]: { ...check, check: true, originalId: check.id }
    }),
    {}
  );

  const setAllChecksActions = useCallback(() => {
    dispatch(setAllChecks({ checks: allChecks }));
  }, [dispatch, allChecks]);

  const removeAllChecksActions = useCallback(() => {
    dispatch(setAllChecks({ checks: {} }));
  }, [dispatch]);

  // Form State
  const [modalContent, setModalContent] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const getDocument = async () => {
      const db = getFirestore();
      const checklistRef = doc(collection(db, CHECKLISTS), docId);
      const checkToEdit = await getDoc(checklistRef);

      const checksCollection = collection(checklistRef, 'checks');
      const checks = await getDocs(checksCollection);

      const checksDocs = checks.docs
        .map(docSnap => docSnap.data())
        .map(check => ({
          originalId: check.originalId,
          check: true,
          done: check.done,
          id: check.id,
          locale: check.locale,
          photos: check.photos
        }))
        .reduce((acc, checkDoc) => {
          return {
            ...acc,
            [checkDoc.originalId]: checkDoc
          };
        }, {});

      const { date, house, workers, observations } = checkToEdit.data();

      setInputFormEditable({
        date: date.toDate(),
        house: {
          value: house
        },
        workers: {
          value: workers
        },
        observations
      });
      setChecksEditable({ checks: checksDocs });
    };
    if (edit) {
      getDocument();
    }
  }, [edit, docId, setInputFormEditable, setChecksEditable]);

  const modalSwitcher = modal => {
    switch (modal) {
      case 'houses': {
        return ListDynamicHouse();
      }
      case 'worker': {
        return ListDynamicWorkers();
      }
      case 'date': {
        return DateTimeSelector();
      }
      default: {
        return ListDynamicHouse();
      }
    }
  };

  const DateTimeSelector = () => (
    <DateSelector
      get={date || null}
      set={date => setInputFormAction('date', date)}
      closeModal={() => setModalVisible(false)}
    />
  );

  const ListDynamicHouse = () => (
    <DynamicSelectorList
      collection="houses"
      store="jobForm"
      searchBy="houseName"
      order={{ field: 'houseName', type: 'asc' }}
      schema={{ img: 'houseImage', name: 'houseName' }}
      get={house?.value || []}
      set={house => {
        setInputFormAction('house', { ...house, value: house });
        setModalVisible(false);
      }}
      closeModal={() => setModalVisible(false)}
    />
  );

  const ListDynamicWorkers = () => (
    <DynamicSelectorList
      collection="users"
      store="jobForm"
      where={[
        {
          label: 'role',
          operator: '==',
          condition: 'worker'
        }
      ]}
      searchBy="firstName"
      schema={{ img: 'profileImage', name: 'firstName' }}
      get={workers?.value}
      set={ws => {
        setInputFormAction('workers', { ...workers, value: ws });
        setModalVisible(false);
      }}
      multiple={true}
      closeModal={() => setModalVisible(false)}
    />
  );

  const selectedCount = Object.values(checks || {}).filter(c => c.check).length;
  const totalCount = list?.length || 0;

  return (
    <View style={styles.container}>
      <BottomModal
        isFixedBottom={modalContent === 'date'}
        swipeDirection={null}
        onClose={() => setModalVisible(false)}
        isVisible={modalVisible}
      >
        {modalContent && modalSwitcher(modalContent)}
      </BottomModal>

      {/* Fecha */}
      <SelectField
        icon="event"
        title={t('common.date')}
        subtitle={
          date && (
            <Text style={styles.selectedValue}>
              {moment(date).format('LL')}
            </Text>
          )
        }
        isEmpty={!date}
        onPress={() => {
          setModalContent('date');
          setModalVisible(true);
        }}
      />

      {/* Casa */}
      <SelectField
        icon="home"
        title={t('common.house')}
        subtitle={
          house?.value && (
            <View style={styles.multiValueContainer}>
              {house?.value?.map((h, i) => (
                <Text key={h.id} style={styles.selectedValue}>
                  {h.houseName}
                  {i < house?.value?.length - 1 && ' & '}
                </Text>
              ))}
            </View>
          )
        }
        isEmpty={!house?.value || house?.value?.length === 0}
        onPress={() => {
          setModalContent('houses');
          setModalVisible(true);
        }}
      />

      {/* Trabajadores */}
      <SelectField
        icon="people"
        title={t('common.worker')}
        subtitle={
          workers?.value &&
          workers?.value.length > 0 && (
            <View style={styles.multiValueContainer}>
              {workers?.value?.map((worker, i) => (
                <Text key={worker.id} style={styles.selectedValue}>
                  {worker.firstName}
                  {i < workers?.value?.length - 1 && ' & '}
                </Text>
              ))}
            </View>
          )
        }
        isEmpty={!workers?.value || workers?.value?.length === 0}
        onPress={() => {
          setModalContent('worker');
          setModalVisible(true);
        }}
      />

      {/* Observaciones */}
      <ObservationsField
        value={observations}
        onChange={text => setInputFormAction('observations', text)}
        t={t}
      />

      {/* Lista de checks */}
      <View style={styles.checksSection}>
        <View style={styles.checksSectionHeader}>
          <View>
            <Text style={styles.checksSectionTitle}>
              {t('new_checklist.check_list')}
            </Text>
            <Text style={styles.checksSectionSubtitle}>
              {selectedCount} de {totalCount} seleccionados
            </Text>
          </View>
          <View style={styles.checksActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => setAllChecksActions()}
            >
              <Icon name="check-circle" size={18} color="#55A5AD" />
              <Text style={styles.actionButtonText}>{t('common.all')}</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={() => removeAllChecksActions()}
            >
              <Icon name="cancel" size={18} color="#EF4444" />
              <Text
                style={[styles.actionButtonText, styles.actionButtonDangerText]}
              >
                {t('common.neither')}
              </Text>
            </Pressable>
          </View>
        </View>

        {list?.map(check => (
          <CheckItemComponent
            key={check.id}
            item={check}
            isChecked={checks?.[check.id]?.check || false}
            onToggle={setToggleCheckBox}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  actionButtonDanger: {
    backgroundColor: '#FEF2F2'
  },
  actionButtonDangerText: {
    color: '#EF4444'
  },
  actionButtonText: {
    color: '#55A5AD',
    fontSize: 13,
    fontWeight: '600'
  },
  checkItem: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    padding: 14
  },
  checkItemSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#55A5AD'
  },
  checkText: {
    color: '#6B7280',
    flex: 1,
    fontSize: 15,
    lineHeight: 20
  },
  checkTextSelected: {
    color: '#374151',
    fontWeight: '500'
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E0',
    borderRadius: 6,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24
  },
  checkboxChecked: {
    backgroundColor: '#55A5AD',
    borderColor: '#55A5AD'
  },
  checksActions: {
    flexDirection: 'row',
    gap: 8
  },
  checksScroll: {
    maxHeight: 400
  },
  checksSection: {
    marginTop: 24
  },
  checksSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  checksSectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2
  },
  checksSectionTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700'
  },
  container: {
    flex: 1
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  multiValueContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  section: {
    marginTop: 16
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700'
  },
  selectField: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 14
  },
  selectFieldContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12
  },
  selectFieldEmpty: {
    backgroundColor: '#F9FAFB'
  },
  selectFieldPlaceholder: {
    color: '#9CA3AF',
    fontSize: 14
  },
  selectFieldText: {
    flex: 1
  },
  selectFieldTitle: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2
  },
  selectedValue: {
    color: '#55A5AD',
    fontSize: 14,
    fontWeight: '500'
  },
  subtitleContainer: {
    marginTop: 2
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
    padding: 14,
    textAlignVertical: 'top'
  }
});

export default CheckListForm;
