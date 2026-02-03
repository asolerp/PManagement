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
import PageLayout from '../../components/PageLayout';
import theme from '../../Theme/Theme';
import { Colors } from '../../Theme/Variables';
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
    if (!entrances || entrances.length === 0) return [];

    const groups = {};

    entrances.forEach(entrance => {
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
      .sort((a, b) => b.date - a.date)
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
  }, [entrances]);

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
    <View style={styles.dateSectionHeader}>
      <View style={styles.dateSectionHeaderContent}>
        <Icon name="calendar-today" size={16} color={Colors.pm} />
        <Text style={styles.dateSectionHeaderText}>{section.title}</Text>
        <Badge
          variant="pm"
          type="outline"
          text={`${section.data.length} registro${section.data.length !== 1 ? 's' : ''}`}
        />
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.pm} />
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
        <ActivityIndicator size="small" color={Colors.pm} />
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
      {/* Summary Statistics */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalRecords}</Text>
          <Text style={styles.statLabel}>Total Registros</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.success }]}>
            {completedRecords}
          </Text>
          <Text style={styles.statLabel}>Completos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.warning }]}>
            {pendingRecords}
          </Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.pm }]}>
            {Math.round(totalHours)}h
          </Text>
          <Text style={styles.statLabel}>Total Horas</Text>
        </View>
      </View>

      {/* Alert for incomplete records */}
      {pendingRecords > 0 && (
        <View style={styles.alertCard}>
          <View style={[Layout.row, Layout.itemsCenter]}>
            <Icon name="warning" size={20} color={Colors.warning} />
            <Text
              style={[
                Fonts.textBold,
                Fonts.textSmall,
                Gutters.smallLMargin,
                { color: Colors.warning }
              ]}
            >
              Atención: {pendingRecords} registro(s) sin salida registrada
            </Text>
          </View>
          <Text
            style={[
              Fonts.textRegular,
              Fonts.textSmall,
              Gutters.smallTMargin,
              { color: Colors.gray700 }
            ]}
          >
            Según la normativa de seguridad social, todos los registros deben
            tener entrada y salida completas.
          </Text>
        </View>
      )}

      {/* Worker Summary Section */}
      {!selectedWorkerId && workerStats.length > 0 && (
        <View style={styles.summaryCard}>
          <Text
            style={[
              Fonts.textBold,
              Fonts.textRegular,
              Gutters.smallBMargin,
              styles.sectionTitle
            ]}
          >
            Resumen por Trabajador
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.workerStatsScroll}
          >
            {workerStats.map((stat, index) => (
              <View
                key={stat.worker?.id || index}
                style={styles.workerStatCard}
              >
                <View style={styles.workerStatHeader}>
                  <Avatar
                    uri={stat.worker?.profileImage?.small || DEFAULT_IMAGE}
                    size="medium"
                  />
                  <View style={styles.workerStatInfo}>
                    <Text
                      style={[
                        Fonts.textBold,
                        Fonts.textSmall,
                        styles.workerName
                      ]}
                      numberOfLines={1}
                    >
                      {stat.worker?.firstName} {stat.worker?.secondName}
                    </Text>
                  </View>
                </View>

                <View style={styles.workerStatDetails}>
                  <View style={styles.workerStatRow}>
                    <Text style={styles.workerStatLabel}>Horas totales:</Text>
                    <Text style={styles.workerStatValue}>
                      {Math.round(stat.totalHours)}h
                    </Text>
                  </View>
                  <View style={styles.workerStatRow}>
                    <Text style={styles.workerStatLabel}>Días trabajados:</Text>
                    <Text style={styles.workerStatValue}>
                      {stat.daysWorked}
                    </Text>
                  </View>
                  <View style={styles.workerStatRow}>
                    <Text style={styles.workerStatLabel}>Promedio/día:</Text>
                    <Text style={styles.workerStatValue}>
                      {stat.avgHoursPerDay.toFixed(1)}h
                    </Text>
                  </View>
                  {stat.overtimeHours > 0 && (
                    <View style={styles.workerStatRow}>
                      <Text style={styles.workerStatLabel}>Horas extra:</Text>
                      <Badge
                        variant="warning"
                        type="outline"
                        text={`${Math.round(stat.overtimeHours)}h`}
                      />
                    </View>
                  )}
                  {stat.pendingRecords > 0 && (
                    <View style={styles.workerStatRow}>
                      <Text style={styles.workerStatLabel}>Pendientes:</Text>
                      <Badge
                        variant="danger"
                        type="outline"
                        text={stat.pendingRecords}
                      />
                    </View>
                  )}
                  <View style={styles.workerStatRow}>
                    <Text style={styles.workerStatLabel}>Completos:</Text>
                    <Badge
                      variant={
                        stat.completedRecords === stat.totalRecords
                          ? 'success'
                          : 'warning'
                      }
                      type="outline"
                      text={`${stat.completedRecords}/${stat.totalRecords}`}
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
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
            <Icon name="filter-list" size={24} color={Colors.pm} />
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
    </>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: Colors.pm,
    borderRadius: 6,
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
  applyButtonContainer: {
    flex: 1
  },
  backButton: {
    alignItems: 'center',
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
  dateSectionHeaderText: {
    color: Colors.gray900,
    flex: 1,
    fontSize: 15,
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
  sectionTitle: {
    color: Colors.gray800,
    fontSize: 15,
    fontWeight: '600'
  },
  statItem: {
    alignItems: 'center'
  },
  statLabel: {
    color: Colors.gray600,
    fontSize: 12,
    marginTop: 4
  },
  statValue: {
    color: Colors.gray900,
    fontSize: 24,
    fontWeight: 'bold'
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
  }
});

export default TimeTrackingScreen;
