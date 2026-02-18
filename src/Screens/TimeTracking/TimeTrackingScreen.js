import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SectionList,
  ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PageLayout from '../../components/PageLayout';
import theme from '../../Theme/Theme';
import { Colors, Spacing, BorderRadius, Shadows } from '../../Theme/Variables';
import { useTimeTracking } from './hooks/useTimeTracking';
import { TimeTrackingCard } from '../../components/TimeTracking/TimeTrackingCard';
import { DateRangePicker } from '../../components/TimeTracking/DateRangePicker';
import { WorkerSearch } from '../../components/TimeTracking/WorkerSearch';
import CustomButton from '../../components/Elements/CustomButton';
import Modal from 'react-native-modal';
import Avatar from '../../components/Avatar';
import { DEFAULT_IMAGE } from '../../constants/general';
import Badge from '../../components/Elements/Badge';
import { useTheme } from '../../Theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Opciones de periodo
const PERIOD_OPTIONS = [
  { id: 'today', label: 'Hoy', icon: 'today' },
  { id: 'week', label: 'Semana', icon: 'date-range' },
  { id: 'month', label: 'Mes', icon: 'calendar-month' }
];

// Opciones de estado
const STATUS_OPTIONS = [
  { id: 'all', label: 'Todos' },
  { id: 'completed', label: 'Completos' },
  { id: 'pending', label: 'Pendientes' }
];

const TimeTrackingScreen = () => {
  const { Gutters, Layout, Fonts } = useTheme();
  const {
    entrances,
    loading,
    loadingMore,
    hasMore,
    workers,
    totalStats,
    startDate,
    endDate,
    selectedWorkerId,
    setStartDate,
    setEndDate,
    setSelectedWorkerId,
    setToday,
    setThisWeek,
    setThisMonth,
    loadMore,
    refresh
  } = useTimeTracking();

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showWorkerPicker, setShowWorkerPicker] = useState(false);

  // Manejar cambio de periodo
  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId);
    switch (periodId) {
      case 'today':
        setToday();
        break;
      case 'week':
        setThisWeek();
        break;
      case 'month':
        setThisMonth();
        break;
    }
  };

  // Filtrar entradas por estado
  const filteredEntrances = useMemo(() => {
    if (!entrances) return [];
    if (selectedStatus === 'all') return entrances;
    if (selectedStatus === 'completed') return entrances.filter(e => e.exitDate);
    if (selectedStatus === 'pending') return entrances.filter(e => !e.exitDate);
    return entrances;
  }, [entrances, selectedStatus]);

  // Obtener nombre del trabajador seleccionado
  const selectedWorkerName = useMemo(() => {
    if (!selectedWorkerId) return 'Todos';
    const worker = workers?.find(w => w.id === selectedWorkerId);
    if (worker) {
      return `${worker.firstName || ''} ${worker.secondName || ''}`.trim() || worker.email;
    }
    return 'Todos';
  }, [selectedWorkerId, workers]);

  // Get summary statistics from totalStats (all records, not just loaded ones)
  const totalRecords = totalStats?.totalCount || 0;
  const completedRecords = totalStats?.completedCount || 0;
  const pendingRecords = totalStats?.pendingCount || 0;
  const totalHours = totalStats?.totalHours || 0;

  // Calculate statistics by worker
  const workerStats = useMemo(() => {
    if (!entrances || !workers) return [];

    const statsMap = {};
    const STANDARD_HOURS_PER_DAY = 8; // Horas estándar según normativa

    entrances.forEach(entrance => {
      const workerId = entrance.worker?.id;
      if (!workerId) return;

      if (!statsMap[workerId]) {
        statsMap[workerId] = {
          worker: entrance.worker,
          totalRecords: 0,
          completedRecords: 0,
          pendingRecords: 0,
          totalHours: 0,
          overtimeHours: 0,
          daysWorked: new Set(),
          incompleteDays: []
        };
      }

      statsMap[workerId].totalRecords++;

      if (entrance.exitDate) {
        statsMap[workerId].completedRecords++;
        const entryMs =
          entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000;
        const exitMs =
          entrance.exitDate.seconds * 1000 +
          entrance.exitDate.nanoseconds / 1000000;
        const diffMs = exitMs - entryMs;
        const hours = diffMs / (1000 * 60 * 60);
        statsMap[workerId].totalHours += hours;

        // Count unique days
        const entryDate = new Date(entryMs);
        const dateKey = `${entryDate.getFullYear()}-${entryDate.getMonth()}-${entryDate.getDate()}`;
        statsMap[workerId].daysWorked.add(dateKey);

        // Calculate overtime (hours over 8 per day)
        if (hours > STANDARD_HOURS_PER_DAY) {
          statsMap[workerId].overtimeHours += hours - STANDARD_HOURS_PER_DAY;
        }
      } else {
        statsMap[workerId].pendingRecords++;
        const entryDate = new Date(
          entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000
        );
        statsMap[workerId].incompleteDays.push(entryDate);
      }
    });

    return Object.values(statsMap).map(stat => ({
      ...stat,
      daysWorked: stat.daysWorked.size,
      avgHoursPerDay:
        stat.daysWorked.size > 0 ? stat.totalHours / stat.daysWorked.size : 0
    }));
  }, [entrances, workers]);

  // Group entrances by date and then by worker
  const groupedEntrances = useMemo(() => {
    if (!filteredEntrances || filteredEntrances.length === 0) return [];

    const groups = {};

    filteredEntrances.forEach(entrance => {
      const entryDate = new Date(
        entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000
      );
      const dateKey = format(entryDate, 'yyyy-MM-dd');

      if (!groups[dateKey]) {
        groups[dateKey] = {
          title: format(entryDate, "EEEE, d 'de' MMMM", { locale: es }),
          date: entryDate,
          data: []
        };
      }

      groups[dateKey].data.push(entrance);
    });

    // Sort by date (most recent first) and within each date, group by worker and sort
    return Object.values(groups)
      .sort((a, b) => a.date - b.date) // Oldest first
      .map(group => {
        // Group by worker within each date
        const workerGroups = {};
        group.data.forEach(entrance => {
          const workerId = entrance.worker?.id || 'unknown';
          if (!workerGroups[workerId]) {
            workerGroups[workerId] = [];
          }
          workerGroups[workerId].push(entrance);
        });

        // Flatten back to array, sorted by worker name
        const sortedWorkers = Object.keys(workerGroups).sort((a, b) => {
          const getWorkerName = worker => {
            if (worker?.firstName && worker?.secondName) {
              return `${worker.firstName} ${worker.secondName}`;
            }
            if (worker?.firstName) {
              return worker.firstName;
            }
            if (worker?.secondName) {
              return worker.secondName;
            }
            if (worker?.name) {
              return worker.name;
            }
            return '';
          };
          const workerA = getWorkerName(workerGroups[a][0]?.worker);
          const workerB = getWorkerName(workerGroups[b][0]?.worker);
          return workerA.localeCompare(workerB);
        });

        const flattenedData = [];
        sortedWorkers.forEach(workerId => {
          flattenedData.push(...workerGroups[workerId]);
        });

        return {
          ...group,
          data: flattenedData
        };
      });
  }, [filteredEntrances]);

  const renderItem = ({ item, index, section }) => {
    // Check if this is the first entrance of a worker group
    const currentWorkerId = item.worker?.id || 'unknown';
    const prevWorkerId =
      index > 0 ? section.data[index - 1]?.worker?.id || 'unknown' : null;
    const isFirstOfWorker = index === 0 || prevWorkerId !== currentWorkerId;

    // Get worker info from the current item
    const getWorkerName = worker => {
      if (worker?.firstName && worker?.secondName) {
        return `${worker.firstName} ${worker.secondName}`;
      }
      if (worker?.firstName) {
        return worker.firstName;
      }
      if (worker?.secondName) {
        return worker.secondName;
      }
      if (worker?.name) {
        return worker.name;
      }
      return 'Trabajador desconocido';
    };
    const workerName = getWorkerName(item.worker);

    // Count how many entrances this worker has in this section
    const workerCount = section.data.filter(
      e => (e.worker?.id || 'unknown') === currentWorkerId
    ).length;

    return (
      <View>
        {isFirstOfWorker && (
          <View style={styles.workerGroupHeader}>
            <View style={styles.workerGroupHeaderContent}>
              <Avatar
                uri={item.worker?.profileImage?.small || DEFAULT_IMAGE}
                size="small"
              />
              <Text style={styles.workerGroupHeaderText}>{workerName}</Text>
              <Badge
                variant="pm"
                type="outline"
                text={`${workerCount} registro${workerCount !== 1 ? 's' : ''}`}
              />
            </View>
          </View>
        )}
        <View style={Gutters.smallBMargin}>
          <TimeTrackingCard entrance={item} onUpdate={refresh} />
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.dateSectionHeaderNew}>
      <View style={styles.dateSectionDateContainer}>
        <Icon name="event" size={14} color={Colors.white} />
      </View>
      <Text style={styles.dateSectionHeaderTextNew}>{section.title}</Text>
      <View style={styles.dateSectionBadge}>
        <Text style={styles.dateSectionBadgeText}>
          {section.data.length}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={[theme.textGray600, theme.textCenter]}>
          No hay registros para el período seleccionado
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.footerLoaderText}>Cargando más registros...</Text>
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasMore && !loadingMore && !loading) {
      loadMore();
    }
  };

  const renderListHeader = () => (
    <>
      {/* Filtros de Periodo */}
      <View style={styles.periodFilters}>
        {PERIOD_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.periodButton,
              selectedPeriod === option.id && styles.periodButtonActive
            ]}
            onPress={() => handlePeriodChange(option.id)}
            activeOpacity={0.7}
          >
            <Icon 
              name={option.icon} 
              size={16} 
              color={selectedPeriod === option.id ? Colors.white : Colors.primary} 
            />
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === option.id && styles.periodButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.moreFiltersButton}
          onPress={() => setShowFiltersModal(true)}
          activeOpacity={0.7}
        >
          <Icon name="tune" size={18} color={Colors.gray600} />
        </TouchableOpacity>
      </View>

      {/* Filtros de Estado + Trabajador */}
      <View style={styles.secondaryFilters}>
        {/* Status Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statusFiltersScroll}
          contentContainerStyle={styles.statusFiltersContent}
        >
          {STATUS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.statusChip,
                selectedStatus === option.id && styles.statusChipActive
              ]}
              onPress={() => setSelectedStatus(option.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.statusChipText,
                selectedStatus === option.id && styles.statusChipTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Worker Filter Chip */}
        <TouchableOpacity
          style={[
            styles.workerChip,
            selectedWorkerId && styles.workerChipActive
          ]}
          onPress={() => setShowWorkerPicker(true)}
          activeOpacity={0.7}
        >
          <Icon 
            name="person" 
            size={14} 
            color={selectedWorkerId ? Colors.white : Colors.gray600} 
          />
          <Text 
            style={[
              styles.workerChipText,
              selectedWorkerId && styles.workerChipTextActive
            ]}
            numberOfLines={1}
          >
            {selectedWorkerName}
          </Text>
          {selectedWorkerId && (
            <TouchableOpacity
              onPress={() => setSelectedWorkerId(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={14} color={Colors.white} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {/* Summary Statistics - Gradient Card */}
      <LinearGradient
        colors={['#126D9B', '#3B8D7A', '#67B26F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statsGradient}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItemNew}>
            <View style={styles.statIconContainer}>
              <Icon name="event-note" size={20} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.statValueNew}>{totalRecords}</Text>
            <Text style={styles.statLabelNew}>Registros</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItemNew}>
            <View style={styles.statIconContainer}>
              <Icon name="check-circle" size={20} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.statValueNew}>{completedRecords}</Text>
            <Text style={styles.statLabelNew}>Completos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItemNew}>
            <View style={styles.statIconContainer}>
              <Icon name="schedule" size={20} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.statValueNew}>{pendingRecords}</Text>
            <Text style={styles.statLabelNew}>Pendientes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItemNew}>
            <View style={styles.statIconContainer}>
              <Icon name="access-time" size={20} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.statValueNew}>{Math.round(totalHours)}h</Text>
            <Text style={styles.statLabelNew}>Total</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Alert for incomplete records */}
      {pendingRecords > 0 && selectedStatus !== 'completed' && (
        <View style={styles.alertCardNew}>
          <View style={styles.alertIconContainer}>
            <Icon name="warning" size={18} color={Colors.warning} />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>
              {pendingRecords} registro(s) sin salida
            </Text>
            <Text style={styles.alertText}>
              Todos los registros deben tener entrada y salida completas.
            </Text>
          </View>
        </View>
      )}

      {/* Worker Summary Section - Compact List */}
      {!selectedWorkerId && workerStats.length > 0 && (
        <View style={styles.summarySection}>
          <View style={styles.sectionHeaderNew}>
            <Icon name="people" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitleNew}>Resumen por Trabajador</Text>
          </View>

          <View style={styles.workerList}>
            {workerStats.map((stat, index) => (
              <TouchableOpacity
                key={stat.worker?.id || index}
                style={styles.workerListItem}
                onPress={() => setSelectedWorkerId(stat.worker?.id)}
                activeOpacity={0.7}
              >
                <View style={styles.workerListLeft}>
                  <Avatar
                    uri={stat.worker?.profileImage?.small || DEFAULT_IMAGE}
                    size="small"
                  />
                  <View style={styles.workerListInfo}>
                    <Text style={styles.workerListName} numberOfLines={1}>
                      {stat.worker?.firstName} {stat.worker?.secondName}
                    </Text>
                    <Text style={styles.workerListMeta}>
                      {stat.daysWorked} días • {stat.avgHoursPerDay.toFixed(1)}h/día
                    </Text>
                  </View>
                </View>
                <View style={styles.workerListRight}>
                  <Text style={styles.workerListHours}>
                    {Math.round(stat.totalHours)}h
                  </Text>
                  {stat.pendingRecords > 0 && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>{stat.pendingRecords}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </>
  );

  return (
    <>
      <PageLayout
        safe
        backButton={false}
        titleProps={{
          subPage: true,
          title: 'Registro de Jornada'
        }}
        titleRightSide={
          <TouchableOpacity
            onPress={() => setShowFiltersModal(true)}
            style={styles.filterButton}
          >
            <Icon name="filter-list" size={24} color={Colors.primary} />
            {selectedWorkerId && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        }
      >
        <SectionList
          sections={groupedEntrances}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            Gutters.regularBPadding,
            groupedEntrances?.length === 0 && styles.emptyListContent
          ]}
          style={theme.flex1}
          stickySectionHeadersEnabled={false}
        />
      </PageLayout>

      {/* Filters Modal - Full Screen */}
      <Modal
        isVisible={showFiltersModal}
        onBackButtonPress={() => setShowFiltersModal(false)}
        style={styles.modal}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        coverScreen={true}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowFiltersModal(false)}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color={Colors.gray900} />
            </TouchableOpacity>
            <View style={styles.modalHeaderCenter}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <Text style={styles.modalSubtitle}>Personaliza tu búsqueda</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Date Range Picker */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <Icon name="calendar-today" size={20} color={Colors.gray700} />
                <Text style={styles.sectionTitle}>Período de tiempo</Text>
              </View>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onToday={setToday}
                onThisWeek={setThisWeek}
                onThisMonth={setThisMonth}
              />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Worker Filter */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <Icon name="people" size={20} color={Colors.gray700} />
                <Text style={styles.sectionTitle}>Trabajador</Text>
              </View>
              <WorkerSearch
                workers={workers}
                selectedWorkerId={selectedWorkerId}
                onSelectWorker={setSelectedWorkerId}
              />
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedWorkerId(null);
                setToday();
              }}
              activeOpacity={0.7}
            >
              <Icon name="refresh" size={20} color={Colors.gray700} />
              <Text style={styles.clearButtonText}>Limpiar todo</Text>
            </TouchableOpacity>
            <View style={styles.applyButtonContainer}>
              <CustomButton
                styled="rounded"
                title="Aplicar Filtros"
                onPress={() => setShowFiltersModal(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Worker Picker Modal */}
      <Modal
        isVisible={showWorkerPicker}
        onBackdropPress={() => setShowWorkerPicker(false)}
        onBackButtonPress={() => setShowWorkerPicker(false)}
        style={styles.workerModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={true}
      >
        <View style={styles.workerModalContent}>
          <View style={styles.workerModalHeader}>
            <Text style={styles.workerModalTitle}>Seleccionar Trabajador</Text>
            <TouchableOpacity
              onPress={() => setShowWorkerPicker(false)}
              style={styles.workerModalClose}
            >
              <Icon name="close" size={24} color={Colors.gray600} />
            </TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.workerModalList}
            showsVerticalScrollIndicator={false}
          >
            {/* All workers option */}
            <TouchableOpacity
              style={[
                styles.workerModalItem,
                !selectedWorkerId && styles.workerModalItemActive
              ]}
              onPress={() => {
                setSelectedWorkerId(null);
                setShowWorkerPicker(false);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.workerModalItemLeft}>
                <View style={styles.workerModalAllIcon}>
                  <Icon name="groups" size={20} color={Colors.white} />
                </View>
                <Text style={styles.workerModalItemName}>Todos los trabajadores</Text>
              </View>
              {!selectedWorkerId && (
                <Icon name="check" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>

            {workers?.map((worker) => (
              <TouchableOpacity
                key={worker.id}
                style={[
                  styles.workerModalItem,
                  selectedWorkerId === worker.id && styles.workerModalItemActive
                ]}
                onPress={() => {
                  setSelectedWorkerId(worker.id);
                  setShowWorkerPicker(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.workerModalItemLeft}>
                  <Avatar
                    uri={worker.profileImage?.small || DEFAULT_IMAGE}
                    size="small"
                  />
                  <Text style={styles.workerModalItemName}>
                    {worker.firstName} {worker.secondName}
                  </Text>
                </View>
                {selectedWorkerId === worker.id && (
                  <Icon name="check" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 44,
    justifyContent: 'center',
    width: 44
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold'
  },
  alertCard: {
    backgroundColor: Colors.warning + '15',
    borderColor: Colors.warning,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12
  },
  alertCardNew: {
    alignItems: 'flex-start',
    backgroundColor: Colors.warning + '10',
    borderLeftColor: Colors.warning,
    borderLeftWidth: 3,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.sm
  },
  alertContent: {
    flex: 1
  },
  alertIconContainer: {
    marginTop: 2
  },
  alertText: {
    color: Colors.gray600,
    fontSize: 12,
    marginTop: 2
  },
  alertTitle: {
    color: Colors.warning,
    fontSize: 13,
    fontWeight: '600'
  },
  applyButtonContainer: {
    flex: 1
  },
  backButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginRight: 12,
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  clearButtonText: {
    color: Colors.gray700,
    fontSize: 15,
    fontWeight: '600'
  },
  dateSectionBadge: {
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    minWidth: 24,
    paddingHorizontal: 8
  },
  dateSectionBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700'
  },
  dateSectionDateContainer: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 6,
    height: 24,
    justifyContent: 'center',
    width: 24
  },
  dateSectionHeader: {
    backgroundColor: Colors.white,
    borderBottomColor: Colors.grey,
    borderBottomWidth: 1,
    marginBottom: 8,
    marginTop: 16,
    paddingBottom: 8,
    paddingTop: 4
  },
  dateSectionHeaderContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8
  },
  dateSectionHeaderNew: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs
  },
  dateSectionHeaderText: {
    color: Colors.gray900,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  dateSectionHeaderTextNew: {
    color: Colors.gray800,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  divider: {
    backgroundColor: Colors.grey,
    height: 1,
    marginVertical: 24
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40
  },
  emptyListContent: {
    flexGrow: 1
  },
  filterBadge: {
    backgroundColor: Colors.error,
    borderRadius: 4,
    height: 8,
    position: 'absolute',
    right: 8,
    top: 8,
    width: 8
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    width: 40
  },
  filterSection: {
    marginBottom: 0
  },
  footerLoader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 20
  },
  footerLoaderText: {
    color: Colors.gray600,
    fontSize: 14
  },
  headerSpacer: {
    width: 40
  },
  modal: {
    margin: 0
  },
  modalContent: {
    backgroundColor: Colors.white,
    flex: 1,
    paddingBottom: 20,
    paddingTop: 0
  },
  modalFooter: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderTopColor: Colors.grey,
    borderTopWidth: 1,
    elevation: 8,
    flexDirection: 'row',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  modalHeader: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomColor: Colors.grey,
    borderBottomWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  modalHeaderCenter: {
    alignItems: 'center',
    flex: 1
  },
  modalSubtitle: {
    color: Colors.gray600,
    fontSize: 13,
    marginTop: 2
  },
  modalTitle: {
    color: Colors.gray900,
    fontSize: 20,
    fontWeight: '700'
  },
  pendingBadge: {
    alignItems: 'center',
    backgroundColor: Colors.warning,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    marginLeft: Spacing.xs,
    minWidth: 20,
    paddingHorizontal: 6
  },
  pendingBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700'
  },
  scrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 20
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  sectionHeaderNew: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm
  },
  sectionTitle: {
    color: Colors.gray800,
    fontSize: 15,
    fontWeight: '600'
  },
  sectionTitleNew: {
    color: Colors.gray800,
    fontSize: 14,
    fontWeight: '600'
  },
  statDivider: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 40,
    width: 1
  },
  statIconContainer: {
    marginBottom: 4
  },
  statItem: {
    alignItems: 'center'
  },
  statItemNew: {
    alignItems: 'center',
    flex: 1
  },
  statLabel: {
    color: Colors.gray600,
    fontSize: 12,
    marginTop: 4
  },
  statLabelNew: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 2
  },
  statValue: {
    color: Colors.gray900,
    fontSize: 24,
    fontWeight: 'bold'
  },
  statValueNew: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700'
  },
  statsCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.grey,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  statsGradient: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    ...Shadows.medium
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.grey,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  summarySection: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    ...Shadows.small
  },
  workerGroupHeader: {
    backgroundColor: Colors.gray50,
    borderBottomColor: Colors.grey,
    borderBottomWidth: 1,
    marginBottom: 8,
    marginTop: 8,
    paddingBottom: 8,
    paddingTop: 8
  },
  workerGroupHeaderContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4
  },
  workerGroupHeaderText: {
    color: Colors.gray900,
    flex: 1,
    fontSize: 14,
    fontWeight: '600'
  },
  workerList: {
    gap: Spacing.xs
  },
  workerListHours: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700'
  },
  workerListInfo: {
    flex: 1,
    marginLeft: Spacing.sm
  },
  workerListItem: {
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm
  },
  workerListLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row'
  },
  workerListMeta: {
    color: Colors.gray500,
    fontSize: 11,
    marginTop: 2
  },
  workerListName: {
    color: Colors.gray900,
    fontSize: 13,
    fontWeight: '600'
  },
  workerListRight: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  workerName: {
    color: Colors.gray900
  },
  workerStatCard: {
    backgroundColor: Colors.gray50,
    borderColor: Colors.grey,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
    minWidth: 200,
    padding: 12
  },
  workerStatDetails: {
    gap: 8
  },
  workerStatHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12
  },
  workerStatInfo: {
    flex: 1,
    marginLeft: 8
  },
  workerStatLabel: {
    color: Colors.gray600,
    fontSize: 12
  },
  workerStatRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  workerStatValue: {
    color: Colors.gray900,
    fontSize: 12,
    fontWeight: '600'
  },
  workerStatsScroll: {
    marginTop: 12
  },
  // New Filter Styles
  periodFilters: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm
  },
  periodButton: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.primary + '40',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  periodButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600'
  },
  periodButtonTextActive: {
    color: Colors.white
  },
  moreFiltersButton: {
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  secondaryFilters: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm
  },
  statusFiltersScroll: {
    flex: 1
  },
  statusFiltersContent: {
    flexDirection: 'row',
    gap: Spacing.xs
  },
  statusChip: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs
  },
  statusChipActive: {
    backgroundColor: Colors.secondary
  },
  statusChipText: {
    color: Colors.gray600,
    fontSize: 12,
    fontWeight: '500'
  },
  statusChipTextActive: {
    color: Colors.white
  },
  workerChip: {
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    gap: 4,
    maxWidth: 140,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs
  },
  workerChipActive: {
    backgroundColor: Colors.primary
  },
  workerChipText: {
    color: Colors.gray600,
    fontSize: 12,
    fontWeight: '500'
  },
  workerChipTextActive: {
    color: Colors.white
  },
  // Worker Picker Modal Styles
  workerModal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  workerModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '70%',
    paddingBottom: Spacing.xl
  },
  workerModalHeader: {
    alignItems: 'center',
    borderBottomColor: Colors.gray200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md
  },
  workerModalTitle: {
    color: Colors.gray900,
    fontSize: 18,
    fontWeight: '600'
  },
  workerModalClose: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32
  },
  workerModalList: {
    paddingHorizontal: Spacing.sm
  },
  workerModalItem: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md
  },
  workerModalItemActive: {
    backgroundColor: Colors.primary + '10'
  },
  workerModalItemLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.sm
  },
  workerModalItemName: {
    color: Colors.gray900,
    fontSize: 15,
    fontWeight: '500'
  },
  workerModalAllIcon: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36
  }
});

export default TimeTrackingScreen;
