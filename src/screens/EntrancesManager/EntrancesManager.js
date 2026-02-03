import React, { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  FlatList,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useEntrancesManager } from './hooks/useEntrancesManager';
import { EntranceListItem } from './components/EntranceListItem';
import { DateSelector } from './components/DateSelector';
import theme from '../../Theme/Theme';
import PageLayout from '../../components/PageLayout';
import { useTheme } from '../../Theme';
import { openScreenWithPush } from '../../Router/utils/actions';
import { ENTRANCE_DETAIL_SCREEN_KEY } from '../../Router/utils/routerKeys';

const EntrancesManager = () => {
  const { Gutters, Layout, Fonts } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const {
    refetch,
    loading,
    entrances,
    selectedDate,
    goBackOneDay,
    goForwardOneDay
  } = useEntrancesManager();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handlePressEntrance = entrance => {
    openScreenWithPush(ENTRANCE_DETAIL_SCREEN_KEY, {
      entrance
    });
  };

  // Ordenar entradas por fecha descendente por fecha
  const sortedEntrances = useMemo(() => {
    if (!entrances) return [];
    return [...entrances].sort((a, b) => {
      const dateA = a.date?.seconds || 0;
      const dateB = b.date?.seconds || 0;
      return dateB - dateA; // Más recientes primero
    });
  }, [entrances]);

  const renderItem = ({ item }) => (
    <EntranceListItem item={item} onPress={handlePressEntrance} />
  );

  const renderEmpty = () => (
    <View
      style={[
        Layout.fill,
        Layout.colCenter,
        Layout.justifyCenter,
        Gutters.regularVPadding
      ]}
    >
      <Icon name="event-busy" size={64} color={theme.colors?.gray400} />
      <Text
        style={[
          Fonts.textRegular,
          theme.textGray600,
          Gutters.regularTMargin,
          theme.textCenter
        ]}
      >
        No hay entradas registradas para esta fecha
      </Text>
    </View>
  );

  return (
    <PageLayout safe withTitle={false} withPadding={false}>
      <View style={[Layout.fill, theme.bgGray100]}>
        <DateSelector
          goBackOneDay={goBackOneDay}
          goForwardOneDay={goForwardOneDay}
          selectedDate={selectedDate}
        />
        {loading && !refreshing ? (
          <View style={[Layout.fill, Layout.colCenter, Layout.justifyCenter]}>
            <ActivityIndicator size="large" color={theme.colors?.pm} />
          </View>
        ) : (
          <FlatList
            data={sortedEntrances}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              Gutters.regularVPadding,
              Gutters.smallTPadding,
              sortedEntrances.length === 0 ? Layout.fill : {}
            ]}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </PageLayout>
  );
};

export default EntrancesManager;
