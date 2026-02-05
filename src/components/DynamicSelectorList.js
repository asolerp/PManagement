import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Text,
  Pressable,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Firebase
import { useGetFirebase } from '../hooks/useGetFirebase';

// Components
import ItemList from './ItemList';
import CustomButton from './Elements/CustomButton';

// Utils
import { error } from '../lib/logging';

// Componente de búsqueda moderno
const ModernSearchBar = ({ value, onChangeText, placeholder }) => (
  <View style={styles.searchContainer}>
    <View style={styles.searchIconContainer}>
      <Icon name="search" size={20} color="#9CA3AF" />
    </View>
    <TextInput
      style={styles.searchInput}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      autoCorrect={false}
    />
    {value && (
      <Pressable
        style={styles.clearButton}
        onPress={() => onChangeText('')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="close" size={20} color="#9CA3AF" />
      </Pressable>
    )}
  </View>
);

// Componente de header
const ListHeader = ({ title, subtitle, count }) => (
  <View style={styles.header}>
    <View>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
    {count > 0 && (
      <View style={styles.countBadge}>
        <Text style={styles.countBadgeText}>{count}</Text>
      </View>
    )}
  </View>
);

// Componente de estado vacío
const EmptyState = ({ searchValue, t }) => (
  <View style={styles.emptyState}>
    <Icon name="search-off" size={48} color="#CBD5E0" />
    <Text style={styles.emptyStateTitle}>
      {searchValue ? t('common.no_results') : 'No hay elementos'}
    </Text>
    <Text style={styles.emptyStateSubtitle}>
      {searchValue
        ? 'Intenta con otra búsqueda'
        : 'No se encontraron elementos en la lista'}
    </Text>
  </View>
);

// Componente de loading
const LoadingState = () => (
  <View style={styles.loadingState}>
    <ActivityIndicator size="large" color="#55A5AD" />
    <Text style={styles.loadingText}>Cargando...</Text>
  </View>
);

const DynamicSelectorList = ({
  collection,
  searchBy,
  onSave,
  order,
  where,
  schema,
  set,
  get,
  multiple = false,
  closeModal,
  title,
  subtitle
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const { list, loading } = useGetFirebase(collection, where);
  const [selected, setSelected] = useState(get || []);
  const [loadingOnSave, setLoadingOnSave] = useState(false);

  // Memoizar el filtrado y ordenamiento para mejor performance
  const filteredList = useMemo(() => {
    if (!list) return [];

    let result = [...list];

    // Ordenar si se especifica
    if (order?.field) {
      result.sort((a, b) => {
        const aValue = a[order.field] || '';
        const bValue = b[order.field] || '';
        return order.type === 'desc'
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      });
    }

    // Filtrar por búsqueda
    if (search && searchBy) {
      result = result.filter(item => {
        const searchValue = item[searchBy];
        return searchValue?.toLowerCase().includes(search.toLowerCase());
      });
    }

    return result;
  }, [list, search, searchBy, order]);

  const onSubmit = useCallback(async () => {
    set(selected);
    if (onSave) {
      try {
        setLoadingOnSave(true);
        await onSave(selected);
      } catch (err) {
        error({
          message: err.message,
          track: true,
          asToast: true
        });
      } finally {
        setLoadingOnSave(false);
        closeModal();
      }
    } else {
      closeModal();
    }
  }, [selected, set, onSave, closeModal]);

  const handleItemChange = useCallback(
    (item, newValue) => {
      if (!multiple) {
        setSelected(newValue ? [item] : []);
      } else {
        if (!newValue) {
          setSelected(prev =>
            prev.filter(i => (i?.id || i?.uid) !== (item?.id || item?.uid))
          );
        } else {
          setSelected(prev => [...prev, item]);
        }
      }
    },
    [multiple]
  );

  const renderItem = useCallback(
    ({ item }) => {
      const isSelected = selected?.some(
        i => (i?.id || i?.uid) === (item?.id || item?.uid)
      );

      return (
        <ItemList
          item={item}
          schema={schema}
          setter={set}
          handleChange={newValue => handleItemChange(item, newValue)}
          active={isSelected}
          multiple={multiple}
        />
      );
    },
    [selected, schema, set, multiple, handleItemChange]
  );

  const keyExtractor = useCallback(
    item => item.id || item.uid || String(Math.random()),
    []
  );

  // Optimización: getItemLayout para mejor scrolling performance
  const getItemLayout = useCallback(
    (data, index) => ({
      length: 70, // altura aproximada de cada item
      offset: 70 * index,
      index
    }),
    []
  );

  const ListHeaderComponent = useMemo(
    () => (
      <ListHeader
        title={title || t('common.select')}
        subtitle={subtitle}
        count={selected?.length || 0}
      />
    ),
    [title, subtitle, selected, t]
  );

  const ListEmptyComponent = useMemo(
    () => <EmptyState searchValue={search} t={t} />,
    [search, t]
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingState />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.content}>
        {/* Search Bar */}
        <ModernSearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('common.search_name')}
        />

        {/* List */}
        <FlatList
          data={filteredList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
        />

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <CustomButton
            loading={loadingOnSave}
            styled="rounded"
            title={t('common.save')}
            onPress={onSubmit}
            disabled={!multiple && selected?.length === 0}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  clearButton: {
    padding: 8
  },
  container: {
    flex: 1
  },
  content: {
    flex: 1
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: '#55A5AD',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    minWidth: 24,
    paddingHorizontal: 8
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyStateSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center'
  },
  emptyStateTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center'
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  headerSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2
  },
  headerTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700'
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20
  },
  loadingState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 60
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 12
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 12
  },
  searchIconContainer: {
    marginRight: 8
  },
  searchInput: {
    color: '#111827',
    flex: 1,
    fontSize: 15,
    paddingVertical: 12
  },
  separator: {
    backgroundColor: '#F3F4F6',
    height: 1,
    marginHorizontal: 20
  }
});

export default DynamicSelectorList;
