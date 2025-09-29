import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useEntrancesManager } from './hooks/useEntrancesManager';
import Avatar from '../../components/Avatar';
import { ListOfWorkers } from './components/ListOfWorkers';
import { EntranceInfo } from './components/EntranceInfo';

import { DateSelector } from './components/DateSelector';
import { DEFAULT_IMAGE } from '../../constants/general';
import { TouchableOpacity } from 'react-native-gesture-handler';
import theme from '../../Theme/Theme';

const DEFAULT_COORDINATES = {
  latitude: 39.5743,
  longitude: 2.3969,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01
};

const EntrancesManager = () => {
  const [cameraSettings, setCameraSettings] = useState(DEFAULT_COORDINATES);

  const [isModalInfoOpened, setIsModalInfoOpened] = useState();
  const [entranceInfo, setEntranceInfo] = useState();
  const {
    refetch,
    loading,
    entrances,
    selectedDate,
    goBackOneDay,
    activeWorkers,
    goForwardOneDay
  } = useEntrancesManager();

  // Function to update camera settings
  const updateCamera = (zoom, coordinates) => {
    const latitudeDelta = zoom === 16 ? 0.005 : 0.01;
    const longitudeDelta = zoom === 16 ? 0.005 : 0.01;

    if (Array.isArray(coordinates)) {
      // Convert from [longitude, latitude] to {latitude, longitude}
      setCameraSettings({
        latitude: coordinates[1],
        longitude: coordinates[0],
        latitudeDelta,
        longitudeDelta
      });
    } else {
      setCameraSettings({
        ...coordinates,
        latitudeDelta,
        longitudeDelta
      });
    }
  };

  const handlePressWorkerFromList = workerId => {
    const worker = entrances?.find(entrance => entrance.worker.id === workerId);
    const workerEntrances = entrances?.filter(
      entrance => entrance.worker.id === workerId
    );
    if (worker) {
      setIsModalInfoOpened(true);
      setEntranceInfo(workerEntrances);
      updateCamera(16, [worker.location.longitude, worker.location.latitude]);
    } else {
      updateCamera(10, DEFAULT_COORDINATES);
    }
  };

  return (
    <View style={styles.page}>
      <DateSelector
        goBackOneDay={goBackOneDay}
        goForwardOneDay={goForwardOneDay}
        selectedDate={selectedDate}
      />
      <ListOfWorkers
        workers={activeWorkers}
        onPressWorker={handlePressWorkerFromList}
      />
      <EntranceInfo
        entranceInfo={entranceInfo}
        isModalInfoOpened={isModalInfoOpened}
        closeModal={() => setIsModalInfoOpened(false)}
      />
      <View style={styles.container}>
        <View style={[theme.absolute, theme.top16, theme.right5, theme.z50]}>
          <TouchableOpacity
            onPress={refetch}
            style={[theme.bgPrimary, theme.p2, theme.roundedLg]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={theme.textWhite}>Refrescar</Text>
            )}
          </TouchableOpacity>
        </View>
        <MapView
          style={styles.map}
          region={cameraSettings}
          onRegionChangeComplete={setCameraSettings}
        >
          {entrances &&
            entrances.map(entrance => (
              <Marker
                key={entrance.id}
                coordinate={{
                  latitude: entrance.location.latitude,
                  longitude: entrance.location.longitude
                }}
              >
                <View style={styles.customMarkerStyle}>
                  <Avatar uri={DEFAULT_IMAGE} size="medium" />
                </View>
              </Marker>
            ))}
        </MapView>
      </View>
    </View>
  );
};

export default EntrancesManager;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%'
  },
  customMarkerStyle: {
    // your custom styles
  },
  map: {
    flex: 1
  },
  page: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
});
