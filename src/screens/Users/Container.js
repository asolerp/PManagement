import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SectionList,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { SearchBar } from 'react-native-elements';

import { getFirestore, collection } from '@react-native-firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import Avatar from '../../components/Avatar';
import { parseRoleName } from './utils/parsers';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../../components/Layout/ScreenHeader';
import { openScreenWithPush } from '../../Router/utils/actions';
import { PROFILE_SCREEN_KEY } from '../../Router/utils/routerKeys';
import { DEFAULT_IMAGE } from '../../constants/general';

// Helper para obtener el icono de cada rol
const getRoleIcon = role => {
  const icons = {
    admin: 'admin-panel-settings',
    owner: 'home',
    worker: 'engineering'
  };
  return icons[role] || 'person';
};

// Helper para obtener el color de cada rol
const getRoleColor = role => {
  const colors = {
    admin: '#EF4444',
    owner: '#55A5AD',
    worker: '#F59E0B'
  };
  return colors[role] || '#6B7280';
};

// Componente para el header de sección
const SectionHeader = ({ title, role, count }) => (
  <View style={styles.sectionHeader}>
    <View
      style={[
        styles.sectionIconWrapper,
        { backgroundColor: `${getRoleColor(role)}20` }
      ]}
    >
      <Icon name={getRoleIcon(role)} size={20} color={getRoleColor(role)} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
    {count > 0 && (
      <View
        style={[styles.countBadge, { backgroundColor: getRoleColor(role) }]}
      >
        <Text style={styles.countText}>{count}</Text>
      </View>
    )}
  </View>
);

// Componente para cada usuario
const UserItem = ({ item, onPress }) => {
  const hasAdditionalEmails =
    item.aditionalEmail && item.aditionalEmail.length > 0;
  const additionalEmailsList = hasAdditionalEmails
    ? item.aditionalEmail.split(',')
    : [];

  const roleColor = getRoleColor(item.role);

  return (
    <Pressable style={styles.userCard} onPress={onPress} activeOpacity={0.7}>
      {/* Barra de color lateral según el rol */}
      <View style={[styles.roleIndicator, { backgroundColor: roleColor }]} />

      <View style={styles.userContent}>
        {/* Avatar con badge de rol */}
        <View style={styles.avatarContainer}>
          <Avatar
            uri={item.profileImage?.small || DEFAULT_IMAGE}
            name={`${item.firstName} ${item.lastName}`}
            size="big"
            showName={false}
          />
          <View style={[styles.roleBadge, { backgroundColor: roleColor }]}>
            <Icon name={getRoleIcon(item.role)} size={14} color="white" />
          </View>
        </View>

        <View style={styles.userInfo}>
          {/* Nombre y teléfono */}
          <View style={styles.userHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.firstName} {item.lastName}
            </Text>
          </View>

          {/* Email principal */}
          <View style={styles.contactRow}>
            <Icon name="email" size={14} color="#718096" />
            <Text style={styles.emailText} numberOfLines={1}>
              {item.email}
            </Text>
          </View>

          {/* Teléfono */}
          {item?.phone && (
            <View style={styles.contactRow}>
              <Icon name="phone" size={14} color="#718096" />
              <Text style={styles.phoneContactText}>{item.phone}</Text>
            </View>
          )}

          {/* Emails adicionales */}
          {hasAdditionalEmails && (
            <View style={styles.additionalEmailsContainer}>
              {additionalEmailsList.map((email, index) => (
                <View key={index} style={styles.additionalEmailBadge}>
                  <Icon name="alternate-email" size={10} color="#F59E0B" />
                  <Text style={styles.additionalEmailText} numberOfLines={1}>
                    {email.trim()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Icon name="chevron-right" size={24} color="#CBD5E0" />
      </View>
    </Pressable>
  );
};

// Estado de carga
const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#55A5AD" />
    <Text style={styles.loadingText}>Cargando usuarios...</Text>
  </View>
);

// Estado vacío
const EmptyState = ({ searchQuery }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconWrapper}>
      <Icon
        name={searchQuery ? 'search-off' : 'people-outline'}
        size={64}
        color="#CBD5E0"
      />
    </View>
    <Text style={styles.emptyTitle}>
      {searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios'}
    </Text>
    <Text style={styles.emptyDescription}>
      {searchQuery
        ? `No hay usuarios que coincidan con "${searchQuery}"`
        : 'Aún no se han registrado usuarios en el sistema'}
    </Text>
  </View>
);

const Container = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const db = getFirestore();
  const usersCollection = collection(db, 'users');
  const [users, loading] = useCollectionData(usersCollection, {
    idField: 'id'
  });

  // Función para ordenar usuarios alfabéticamente
  const sortUsers = useCallback(userList => {
    return userList.sort((a, b) => {
      const nameA = (a.firstName || '').toLowerCase();
      const nameB = (b.firstName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, []);

  // Función para filtrar usuarios por búsqueda
  const filterUsersBySearch = useCallback(
    user => {
      if (!searchQuery) return true;
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      return (
        fullName.includes(query) || user.email?.toLowerCase().includes(query)
      );
    },
    [searchQuery]
  );

  // Crear secciones de usuarios con memoización
  const sections = useMemo(() => {
    if (!users) return [];

    const roles = ['admin', 'owner', 'worker'];

    return roles
      .map(role => {
        const roleUsers = users
          .filter(user => user.role === role)
          .filter(filterUsersBySearch);

        return {
          role,
          title: parseRoleName(role),
          data: sortUsers(roleUsers),
          count: roleUsers.length
        };
      })
      .filter(section => section.data.length > 0); // Solo mostrar secciones con usuarios
  }, [users, filterUsersBySearch, sortUsers]);

  // Handler para abrir perfil
  const handleUserPress = useCallback(user => {
    openScreenWithPush(PROFILE_SCREEN_KEY, {
      user,
      mode: 'admin'
    });
  }, []);

  // Renderizar item
  const renderItem = useCallback(
    ({ item }) => (
      <UserItem item={item} onPress={() => handleUserPress(item)} />
    ),
    [handleUserPress]
  );

  // Renderizar header de sección
  const renderSectionHeader = useCallback(
    ({ section }) => (
      <SectionHeader
        title={t(section.title)}
        role={section.role}
        count={section.count}
      />
    ),
    [t]
  );

  // Mostrar estado de carga
  if (loading) {
    return (
      <>
        <ScreenHeader title={t('users.title')} />
        <LoadingState />
      </>
    );
  }

  // Mostrar estado vacío si no hay usuarios después de la búsqueda
  const hasResults = sections.length > 0;

  return (
    <>
      <ScreenHeader title={t('users.title')} />

      <SearchBar
        round
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={styles.searchInput}
        placeholder={t('common.search_name')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        searchIcon={{ name: 'search', color: '#9CA3AF' }}
        clearIcon={{ name: 'close', color: '#9CA3AF' }}
        placeholderTextColor="#9CA3AF"
      />

      {!hasResults ? (
        <EmptyState searchQuery={searchQuery} />
      ) : (
        <View style={styles.listContainer}>
          <SectionList
            sections={sections}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            SectionSeparatorComponent={() => (
              <View style={styles.sectionSeparator} />
            )}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // Search Bar
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 8
  },
  searchInputContainer: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12
  },
  searchInput: {
    color: '#2D3748',
    fontSize: 15
  },
  // List Container
  listContainer: {
    flex: 1,
    marginTop: 8
  },
  listContent: {
    paddingBottom: 24
  },
  // Section Header
  sectionHeader: {
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  sectionIconWrapper: {
    alignItems: 'center',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36
  },
  sectionTitle: {
    color: '#2D3748',
    flex: 1,
    fontSize: 16,
    fontWeight: '700'
  },
  countBadge: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    minWidth: 24,
    paddingHorizontal: 8
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700'
  },
  // User Card
  userCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative'
  },
  roleIndicator: {
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: 4
  },
  userContent: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 14
  },
  avatarContainer: {
    position: 'relative'
  },
  roleBadge: {
    alignItems: 'center',
    borderColor: 'white',
    borderRadius: 10,
    borderWidth: 2,
    bottom: -2,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 20
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8
  },
  userHeader: {
    marginBottom: 6
  },
  userName: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '600'
  },
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4
  },
  emailText: {
    color: '#4A5568',
    flex: 1,
    fontSize: 13
  },
  phoneContactText: {
    color: '#4A5568',
    fontSize: 13
  },
  additionalEmailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6
  },
  additionalEmailBadge: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    flexDirection: 'row',
    gap: 4,
    maxWidth: '100%',
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  additionalEmailText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '500',
    maxWidth: 200
  },
  // Separators
  itemSeparator: {
    height: 8
  },
  sectionSeparator: {
    height: 16
  },
  // Loading State
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 100
  },
  loadingText: {
    color: '#718096',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 16
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60
  },
  emptyIconWrapper: {
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    marginBottom: 24,
    width: 120
  },
  emptyTitle: {
    color: '#2D3748',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center'
  },
  emptyDescription: {
    color: '#718096',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center'
  }
});

export default Container;
