import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import {useEntrancesManager} from './hooks/useEntrancesManager';
import Avatar from '../../components/Avatar';
import {ListOfWorkers} from './components/ListOfWorkers';
import {EntranceInfo} from './components/EntranceInfo';

import {DateSelector} from './components/DateSelector';
import { DEFAULT_IMAGE } from '../../constants/general';

const DEFAULT_COORDINATES = [2.3969, 39.5743];

Mapbox.setWellKnownTileServer('Mapbox');
Mapbox.setAccessToken(
  'sk.eyJ1IjoiYXNvbGVycCIsImEiOiJjbHc3a2lqN24yMXJvMmpvY2FqeWYwZ2hlIn0.E7uBdBgJGlMxLamWXp66hw',
);

const EntrancesManager = () => {
  const [cameraSettings, setCameraSettings] = useState({
    centerCoordinate: DEFAULT_COORDINATES, // Initial center coordinate
    zoomLevel: 10, // Initial zoom level
  });

  const [isModalInfoOpened, setIsModalInfoOpened] = useState();
  const [entranceInfo, setEntranceInfo] = useState();
  const {
    entrances,
    activeWorkers,
    selectedDate,
    goBackOneDay,
    goForwardOneDay,
  } = useEntrancesManager();

  // Function to update camera settings
  const updateCamera = (zoom, newCoordinates) => {
    setCameraSettings({
      zoomLevel: zoom,
      centerCoordinate: newCoordinates,
    });
  };

  const handlePressWorkerFromList = (workerId) => {
    const worker = entrances?.find(
      (entrance) => entrance.worker.id === workerId,
    );
    const workerEntrances = entrances?.filter(
      (entrance) => entrance.worker.id === workerId,
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
        <Mapbox.MapView style={styles.map}>
          <Mapbox.Camera
            zoomLevel={cameraSettings.zoomLevel}
            centerCoordinate={cameraSettings.centerCoordinate}
          />
          {entrances &&
            entrances.map((entrance) => (
              <Mapbox.PointAnnotation
                key={entrance.id}
                id={entrance.id}
                coordinate={[
                  entrance.location.longitude,
                  entrance.location.latitude,
                ]}>
                <View style={styles.customMarkerStyle}>
                  <Avatar
                    uri={entrance?.worker?.profileImage?.small || DEFAULT_IMAGE}
                    size="medium"
                  />
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
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customMarkerStyle: {
    // your custom styles
  },
  container: {
    height: '100%',
    width: '100%',
  },
  map: {
    flex: 1,
  },
});
