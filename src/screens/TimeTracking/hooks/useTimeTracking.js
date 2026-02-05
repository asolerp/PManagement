import { useState, useMemo, useCallback, useEffect } from 'react';
import { getFirestore, collection, query, where, Timestamp, limit, startAfter, getDocs } from '@react-native-firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const PAGE_SIZE = 20; // Number of records per page

export const useTimeTracking = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  });

  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [entrances, setEntrances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [queryError, setQueryError] = useState(null);
  const [totalStats, setTotalStats] = useState({
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    totalHours: 0
  });

  // Query base for entrances
  const getBaseQuery = useCallback(() => {
    const db = getFirestore();
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    let baseQuery = query(
      collection(db, 'entrances'),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp)
    );

    if (selectedWorkerId) {
      baseQuery = query(baseQuery, where('worker.id', '==', selectedWorkerId));
    }

    return baseQuery;
  }, [startDate, endDate, selectedWorkerId]);

  const loadTotalStats = useCallback(async () => {
    try {
      const queryRef = getBaseQuery();
      const snapshot = await getDocs(queryRef);

      let totalCount = 0;
      let completedCount = 0;
      let pendingCount = 0;
      let totalHours = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalCount++;

        if (data.exitDate) {
          completedCount++;
          // Calculate hours
          const entryMs =
            data.date.seconds * 1000 + data.date.nanoseconds / 1000000;
          const exitMs =
            data.exitDate.seconds * 1000 + data.exitDate.nanoseconds / 1000000;
          const diffMs = exitMs - entryMs;
          totalHours += diffMs / (1000 * 60 * 60);
        } else {
          pendingCount++;
        }
      });

      setTotalStats({
        totalCount,
        completedCount,
        pendingCount,
        totalHours
      });
    } catch (error) {
      console.error('Error loading total stats:', error);
    }
  }, [getBaseQuery]);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setQueryError(null);
      setHasMore(true);

      // Load stats and data in parallel
      const statsPromise = loadTotalStats();
      const dataQuery = query(getBaseQuery(), limit(PAGE_SIZE));
      const snapshot = await getDocs(dataQuery);
      await statsPromise;

      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setEntrances(docs);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(docs.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setQueryError(error);
    } finally {
      setLoading(false);
    }
  }, [getBaseQuery, loadTotalStats]);

  // Load more data (infinity scroll)
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;

    try {
      setLoadingMore(true);

      const moreQuery = query(getBaseQuery(), startAfter(lastDoc), limit(PAGE_SIZE));

      const snapshot = await getDocs(moreQuery);

      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setEntrances(prev => [...prev, ...docs]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(docs.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [getBaseQuery, lastDoc, hasMore, loadingMore, loading]);

  // Reload data when filters change
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Query for all workers
  const db = getFirestore();
  const workersQuery = useMemo(
    () => query(collection(db, 'users'), where('role', '==', 'worker')),
    [db]
  );

  const [workers, workersLoading] = useCollectionData(workersQuery, {
    idField: 'id'
  });

  // Mock data for development/demo purposes
  const mockWorkers = useMemo(() => {
    return [
      {
        id: 'mock-worker-1',
        name: 'Juan Pérez',
        firstName: 'Juan',
        secondName: 'Pérez',
        email: 'juan.perez@example.com',
        role: 'worker',
        profileImage: {
          small: 'https://i.pravatar.cc/150?img=1',
          thumbnail: 'https://i.pravatar.cc/150?img=1'
        }
      },
      {
        id: 'mock-worker-2',
        name: 'María García',
        firstName: 'María',
        secondName: 'García',
        email: 'maria.garcia@example.com',
        role: 'worker',
        profileImage: {
          small: 'https://i.pravatar.cc/150?img=5',
          thumbnail: 'https://i.pravatar.cc/150?img=5'
        }
      },
      {
        id: 'mock-worker-3',
        name: 'Carlos López',
        firstName: 'Carlos',
        secondName: 'López',
        email: 'carlos.lopez@example.com',
        role: 'worker',
        profileImage: {
          small: 'https://i.pravatar.cc/150?img=12',
          thumbnail: 'https://i.pravatar.cc/150?img=12'
        }
      }
    ];
  }, []);

  const mockEntrances = useMemo(() => {
    const now = new Date();
    const entrances = [];

    // Worker 1: Juan Pérez - Registros completos con horas extra
    for (let i = 0; i < 5; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(8, 0, 0, 0); // Entrada a las 8:00

      const exitDate = new Date(date);
      exitDate.setHours(18, 30, 0, 0); // Salida a las 18:30 (10.5 horas - tiene horas extra)

      entrances.push({
        id: `mock-entrance-1-${i}`,
        action: 'enter',
        worker: mockWorkers[0],
        date: Timestamp.fromDate(date),
        exitDate: Timestamp.fromDate(exitDate),
        location: {
          latitude: 40.4168 + Math.random() * 0.01,
          longitude: -3.7038 + Math.random() * 0.01
        },
        exitLocation: {
          latitude: 40.4168 + Math.random() * 0.01,
          longitude: -3.7038 + Math.random() * 0.01
        },
        images: [
          {
            url: 'https://picsum.photos/400/300?random=' + i * 2
          },
          {
            url: 'https://picsum.photos/400/300?random=' + (i * 2 + 1)
          }
        ]
      });
    }

    // Worker 2: María García - Registros completos normales y algunos pendientes
    for (let i = 0; i < 4; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(9, 0, 0, 0); // Entrada a las 9:00

      const exitDate = new Date(date);
      exitDate.setHours(17, 0, 0, 0); // Salida a las 17:00 (8 horas - normal)

      entrances.push({
        id: `mock-entrance-2-${i}`,
        action: 'enter',
        worker: mockWorkers[1],
        date: Timestamp.fromDate(date),
        exitDate: Timestamp.fromDate(exitDate),
        location: {
          latitude: 40.4168 + Math.random() * 0.01,
          longitude: -3.7038 + Math.random() * 0.01
        },
        exitLocation: {
          latitude: 40.4168 + Math.random() * 0.01,
          longitude: -3.7038 + Math.random() * 0.01
        },
        images: [
          {
            url: 'https://picsum.photos/400/300?random=' + (i + 10) * 2
          },
          {
            url: 'https://picsum.photos/400/300?random=' + (i + 10) * 2 + 1
          }
        ]
      });
    }

    // Worker 2: María García - Registro pendiente (sin salida)
    const pendingDate = new Date(now);
    pendingDate.setDate(pendingDate.getDate() - 1);
    pendingDate.setHours(9, 0, 0, 0);
    entrances.push({
      id: 'mock-entrance-2-pending',
      action: 'enter',
      worker: mockWorkers[1],
      date: Timestamp.fromDate(pendingDate),
      exitDate: null,
      location: {
        latitude: 40.4168 + Math.random() * 0.01,
        longitude: -3.7038 + Math.random() * 0.01
      },
      images: [
        {
          url: 'https://picsum.photos/400/300?random=99'
        }
      ]
    });

    // Worker 3: Carlos López - Registros completos y pendientes
    for (let i = 0; i < 3; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(7, 30, 0, 0); // Entrada a las 7:30

      const exitDate = new Date(date);
      exitDate.setHours(16, 0, 0, 0); // Salida a las 16:00 (8.5 horas)

      entrances.push({
        id: `mock-entrance-3-${i}`,
        action: 'enter',
        worker: mockWorkers[2],
        date: Timestamp.fromDate(date),
        exitDate: Timestamp.fromDate(exitDate),
        location: {
          latitude: 40.4168 + Math.random() * 0.01,
          longitude: -3.7038 + Math.random() * 0.01
        },
        exitLocation: {
          latitude: 40.4168 + Math.random() * 0.01,
          longitude: -3.7038 + Math.random() * 0.01
        },
        images: [
          {
            url: 'https://picsum.photos/400/300?random=' + (i + 20) * 2
          },
          {
            url: 'https://picsum.photos/400/300?random=' + (i + 20) * 2 + 1
          }
        ]
      });
    }

    // Worker 3: Carlos López - Registro pendiente (sin salida)
    const pendingDate2 = new Date(now);
    pendingDate2.setHours(7, 30, 0, 0);
    entrances.push({
      id: 'mock-entrance-3-pending',
      action: 'enter',
      worker: mockWorkers[2],
      date: Timestamp.fromDate(pendingDate2),
      exitDate: null,
      location: {
        latitude: 40.4168 + Math.random() * 0.01,
        longitude: -3.7038 + Math.random() * 0.01
      },
      images: [
        {
          url: 'https://picsum.photos/400/300?random=100'
        }
      ]
    });

    return entrances.sort((a, b) => {
      const dateA = a.date.seconds;
      const dateB = b.date.seconds;
      return dateB - dateA; // Más recientes primero
    });
  }, [mockWorkers]);

  // Use mock data in development mode to showcase all features
  // Set USE_MOCK_DATA to true to always show mock data, or false to use real data when available
  const USE_MOCK_DATA = false; // Cambiado a false para usar datos reales de Firestore

  // Filter mock entrances by date range and worker (for pagination simulation)
  const filteredMockEntrances = useMemo(() => {
    if (!USE_MOCK_DATA) return [];
    if (!mockEntrances || mockEntrances.length === 0) return [];

    let filtered = mockEntrances;

    // Filter by date range
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    filtered = filtered.filter(entrance => {
      const entranceDate = new Date(
        entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000
      ).getTime();
      return entranceDate >= startTimestamp && entranceDate <= endTimestamp;
    });

    // Filter by worker
    if (selectedWorkerId) {
      filtered = filtered.filter(
        entrance => entrance.worker?.id === selectedWorkerId
      );
    }

    return filtered;
  }, [USE_MOCK_DATA, mockEntrances, startDate, endDate, selectedWorkerId]);

  // Calculate mock total stats
  const mockTotalStats = useMemo(() => {
    if (!USE_MOCK_DATA) return null;

    let totalCount = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let totalHours = 0;

    filteredMockEntrances.forEach(entrance => {
      totalCount++;
      if (entrance.exitDate) {
        completedCount++;
        const entryMs =
          entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000;
        const exitMs =
          entrance.exitDate.seconds * 1000 +
          entrance.exitDate.nanoseconds / 1000000;
        const diffMs = exitMs - entryMs;
        totalHours += diffMs / (1000 * 60 * 60);
      } else {
        pendingCount++;
      }
    });

    return { totalCount, completedCount, pendingCount, totalHours };
  }, [USE_MOCK_DATA, filteredMockEntrances]);

  const finalEntrances = USE_MOCK_DATA ? filteredMockEntrances : entrances;
  const finalWorkers = USE_MOCK_DATA ? mockWorkers : workers || [];
  const finalLoading = USE_MOCK_DATA ? false : loading || workersLoading;
  const finalTotalStats = USE_MOCK_DATA ? mockTotalStats : totalStats;

  // Set predefined date ranges
  const setToday = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setStartDate(today);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    setEndDate(endOfDay);
  }, []);

  const setThisWeek = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Monday start

    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setStartDate(monday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    setEndDate(sunday);
  }, []);

  const setThisMonth = useCallback(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
    setStartDate(firstDay);

    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    setEndDate(lastDay);
  }, []);

  return {
    entrances: finalEntrances,
    loading: finalLoading,
    loadingMore: USE_MOCK_DATA ? false : loadingMore,
    hasMore: USE_MOCK_DATA ? false : hasMore,
    error: queryError,
    workers: finalWorkers,
    totalStats: finalTotalStats,
    startDate,
    endDate,
    selectedWorkerId,
    setStartDate,
    setEndDate,
    setSelectedWorkerId,
    setToday,
    setThisWeek,
    setThisMonth,
    loadMore: USE_MOCK_DATA ? () => {} : loadMore,
    refresh: loadInitialData
  };
};
