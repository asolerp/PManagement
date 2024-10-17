import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { useEntrancesManager } from './hooks/useEntrancesManager';
import Avatar from '../../components/Avatar';
import { ListOfWorkers } from './components/ListOfWorkers';
import { EntranceInfo } from './components/EntranceInfo';

import { DateSelector } from './components/DateSelector';
import { DEFAULT_IMAGE } from '../../constants/general';
import { TouchableOpacity } from 'react-native-gesture-handler';
import theme from '../../Theme/Theme';

const DEFAULT_COORDINATES = [2.3969, 39.5743];

Mapbox.setWellKnownTileServer('Mapbox');
Mapbox.setAccessToken(
  'sk.eyJ1IjoiYXNvbGVycCIsImEiOiJjbHc3a2lqN24yMXJvMmpvY2FqeWYwZ2hlIn0.E7uBdBgJGlMxLamWXp66hw'
);

const EntrancesManager = () => {
  const [cameraSettings, setCameraSettings] = useState({
    centerCoordinate: DEFAULT_COORDINATES, // Initial center coordinate
    zoomLevel: 10 // Initial zoom level
  });

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
  const updateCamera = (zoom, newCoordinates) => {
    setCameraSettings({
      zoomLevel: zoom,
      centerCoordinate: newCoordinates
    });
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
        <Mapbox.MapView style={styles.map}>
          <Mapbox.Camera
            zoomLevel={cameraSettings.zoomLevel}
            centerCoordinate={cameraSettings.centerCoordinate}
          />
          {entrances &&
            entrances.map(entrance => (
              <Mapbox.PointAnnotation
                key={entrance.id}
                id={entrance.id}
                coordinate={[
                  entrance.location.longitude,
                  entrance.location.latitude
                ]}
              >
                <View style={styles.customMarkerStyle}>
                  <Avatar uri={DEFAULT_IMAGE} size="medium" />
                </View>
              </Mapbox.PointAnnotation>
            ))}
        </Mapbox.MapView>
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
