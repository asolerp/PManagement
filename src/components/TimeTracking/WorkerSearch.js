import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Colors } from '../../Theme/Variables';
import Avatar from '../Avatar';
import { DEFAULT_IMAGE } from '../../constants/general';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const WorkerSearch = ({ workers, selectedWorkerId, onSelectWorker }) => {
  const [searchText, setSearchText] = useState('');

  // Filter workers based on search text
  const filteredWorkers = useMemo(() => {
    if (!workers) return [];

    let result = [...workers];

    // Filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(worker => {
        const fullName =
          `${worker.firstName || ''} ${worker.secondName || ''}`.toLowerCase();
        const email = (worker.email || '').toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    // Sort alphabetically by firstName
    result.sort((a, b) => {
      const nameA = (a.firstName || '').toLowerCase();
      const nameB = (b.firstName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return result;
  }, [workers, searchText]);

  const renderWorkerItem = item => {
    const isSelected = selectedWorkerId === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.workerItem, isSelected && styles.workerItemSelected]}
        onPress={() => onSelectWorker(isSelected ? null : item.id)}
        activeOpacity={0.7}
      >
        <Avatar uri={item.profileImage?.small || DEFAULT_IMAGE} size="medium" />
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>
            {item.firstName} {item.secondName}
          </Text>
          {item.email && <Text style={styles.workerEmail}>{item.email}</Text>}
        </View>
        {isSelected && <Icon name="check-circle" size={24} color={Colors.pm} />}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search-off" size={48} color={Colors.gray400} />
      <Text style={styles.emptyText}>No se encontraron trabajadores</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={Colors.gray500} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar trabajador..."
          placeholderTextColor={Colors.gray500}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Icon name="close" size={20} color={Colors.gray500} />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Worker Badge */}
      {selectedWorkerId && (
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>
            Filtro activo:{' '}
            {workers?.find(w => w.id === selectedWorkerId)?.firstName ||
              'Trabajador'}
          </Text>
          <TouchableOpacity
            onPress={() => onSelectWorker(null)}
            style={styles.clearButtonInline}
          >
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Workers List */}
      <View style={styles.workersList}>
        {filteredWorkers.length > 0
          ? filteredWorkers.map(renderWorkerItem)
          : renderEmpty()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  clearButtonInline: {
    backgroundColor: Colors.pm + '20',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  clearButtonText: {
    color: Colors.pm,
    fontSize: 12,
    fontWeight: '600'
  },
  container: {
    width: '100%'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  emptyText: {
    color: Colors.gray500,
    fontSize: 14,
    marginTop: 12
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderColor: Colors.grey,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  searchInput: {
    color: Colors.gray900,
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    padding: 0
  },
  selectedBadge: {
    alignItems: 'center',
    backgroundColor: Colors.pm + '15',
    borderColor: Colors.grey,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  selectedBadgeText: {
    color: Colors.pm,
    flex: 1,
    fontSize: 12,
    fontWeight: '600'
  },
  workerEmail: {
    color: Colors.gray600,
    fontSize: 12,
    marginTop: 2
  },
  workerInfo: {
    flex: 1,
    marginLeft: 12
  },
  workerItem: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.grey,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 12
  },
  workerItemSelected: {
    backgroundColor: Colors.pm + '10',
    borderColor: Colors.grey,
    borderWidth: 2
  },
  workerName: {
    color: Colors.gray900,
    fontSize: 14,
    fontWeight: '600'
  },
  workersList: {
    width: '100%'
  }
});
