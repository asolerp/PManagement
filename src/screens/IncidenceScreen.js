import React, {useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {View, StyleSheet, TouchableOpacity} from 'react-native';

import {Info, Messages, Options, Photos} from '../components/Incidence';
import {TabView, TabBar, SceneMap} from 'react-native-tab-view';

// UI
import CustomButton from '../components/Elements/CustomButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Firebase
import {useUpdateFirebase} from '../hooks/useUpdateFirebase';
import firestore from '@react-native-firebase/firestore';
import {useDocument, useDocumentOnce} from 'react-firebase-hooks/firestore';

// Utils
import PagetLayout from '../components/PageLayout';

import {finishIncidence, openIncidence} from '../components/Alerts/incidences';

import {firebase} from '@react-native-firebase/firestore';

import {Dimensions} from 'react-native';
import {useTheme} from '../Theme';
import {Colors} from '../Theme/Variables';

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: 'transparent',
    color: 'black',
    justifyContent: 'space-evenly',
  },
  tabBarLabelStyle: {
    color: '#284748',
    fontWeight: 'bold',
    fontSize: 14,
    width: 80,
    textAlign: 'center',
  },
  tabIndicator: {
    backgroundColor: Colors.pm,
    width: 10,
    height: 10,
    borderRadius: 100,
  },
  jobBackScreen: {
    flex: 1,
  },
  jobScreen: {
    flex: 1,
    backgroundColor: 'white',
    borderTopRightRadius: 50,
    // height: '100%',
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const FirstRoute = () => <Info />;
const SecondRoute = () => <Messages />;
const ThirdRoute = () => <Photos />;
const FourthRoute = () => <Options />;

const IncidenceScreen = () => {
  const {Layout, Gutters} = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const [index, setIndex] = React.useState(0);
  const [routes] = useState([
    {key: 'info', title: 'Info', icon: 'info'},
    {key: 'messages', title: 'Mensajes', icon: 'message'},
    {key: 'photos', title: 'Fotos', icon: 'photo'},
    {key: 'options', title: 'Opciones', icon: 'settings'},
  ]);

  const initialLayout = {
    width: Dimensions.get('window').width,
  };

  const {incidenceId} = route.params;
  const [value, loading, error] = useDocumentOnce(
    firestore().doc(`incidences/${incidenceId}`),
    {
      snapshotListenOptions: {includeMetadataChanges: true},
    },
  );

  const {updateFirebase} = useUpdateFirebase('incidences');

  const handleFinishTask = async (status) => {
    try {
      if (status) {
        await updateFirebase('stats', {
          count: firebase.firestore.FieldValue.increment(-1),
        });
      } else {
        await updateFirebase('stats', {
          count: firebase.firestore.FieldValue.increment(1),
        });
      }
      await updateFirebase(`${incidenceId}`, {
        done: status,
      });
    } catch (err) {
      console.log(err);
    } finally {
      navigation.goBack();
    }
  };

  const renderScene = SceneMap({
    info: FirstRoute,
    messages: SecondRoute,
    photos: ThirdRoute,
    options: FourthRoute,
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      renderLabel={({route}) => (
        <View style={[Layout.fill, Layout.colCenter]}>
          <Icon
            name={route.icon}
            size={45}
            color={Colors.pm}
            style={[styles.icon, Gutters.tinyBMargin]}
          />
        </View>
      )}
      indicatorStyle={[
        styles.tabIndicator,
        {left: Dimensions.get('window').width / (routes.length * 2) - 10},
      ]}
      style={styles.tabBarStyle}
    />
  );

  return (
    <PagetLayout
      titleLefSide={
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <View style={styles.iconWrapper}>
            <Icon name="arrow-back" size={25} color="#5090A5" />
          </View>
        </TouchableOpacity>
      }
      footer={
        <CustomButton
          loading={false}
          styled="rounded"
          title={
            value?.data().done ? 'Incidencia resuelta' : 'Resolver incidencia'
          }
          onPress={() => {
            if (value?.data().done) {
              openIncidence(() => handleFinishTask(false));
            } else {
              finishIncidence(() => handleFinishTask(true));
            }
          }}
        />
      }
      titleProps={{
        title: 'Incidencia',
        subPage: true,
      }}>
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        style={{height: Dimensions.get('window').height - 100}}
      />
    </PagetLayout>
  );
};

export default React.memo(IncidenceScreen);
