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
import {useGetDocFirebase} from '../hooks/useGetDocFIrebase';

// Utils
import PagetLayout from '../components/PageLayout';

import {finishIncidence, openIncidence} from '../components/Alerts/incidences';

import {firebase} from '@react-native-firebase/firestore';

import {DARK_BLUE} from '../styles/colors';
import {Dimensions} from 'react-native';
import {useTheme} from '../Theme';

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flex: 1,
  },
  infoWrapper: {
    width: '30%',
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonWrapper: {},
  date: {
    fontSize: 18,
    marginVertical: 10,
    color: '#3DB6BA',
  },
  label: {
    fontSize: 20,
    width: '90%',
    color: '#284748',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  houseName: {
    textAlign: 'left',
    fontSize: 25,
    width: '90%',
    color: '#284748',
    fontWeight: 'bold',
  },
  title: {
    textAlign: 'left',
    fontSize: 20,
    width: '90%',
    color: DARK_BLUE,
    marginTop: 10,
    marginBottom: 30,
  },
  observations: {
    fontSize: 18,
    width: '90%',
    color: '#284748',
    marginBottom: 30,
  },
  houseItems: {
    fontSize: 18,
    width: '90%',
    color: '#284748',
  },
  houseImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    marginVertical: 10,
    borderRadius: 10,
  },
  workers: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  photosWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  incidenceImage: {
    width: 80,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
});

const FirstRoute = () => <Info />;
// const SecondRoute = () => <Messages />;
// const ThirdRoute = () => <Photos />;
// const FourthRoute = () => <Options />;

const IncidenceScreen = () => {
  const {Layout, Gutters, Colors} = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const [index, setIndex] = React.useState(0);
  const [routes] = useState([
    {key: 'info', title: 'Info', icon: 'info'},
    // {key: 'messages', title: 'Mensajes', icon: 'message'},
    // {key: 'photos', title: 'Fotos', icon: 'photo'},
    // {key: 'options', title: 'Opciones', icon: 'settings'},
  ]);

  const initialLayout = {
    width: Dimensions.get('window').width,
  };

  const {incidenceId} = route.params;
  const {document: incidence} = useGetDocFirebase('incidences', incidenceId);

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
    // messages: SecondRoute,
    // photos: ThirdRoute,
    // options: FourthRoute,
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
            incidence?.done ? 'Incidencia resuelta' : 'Resolver incidencia'
          }
          onPress={() => {
            if (incidence?.done) {
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
