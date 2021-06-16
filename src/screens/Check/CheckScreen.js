import React, {useState, useMemo} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';

import {Info, Messages, Options} from '../../components/Check';

import {TabView, TabBar, SceneMap} from 'react-native-tab-view';

import {useTheme} from '../../Theme';

// UI
import PageLayout from '../../components/PageLayout';
import CustomButton from '../../components/Elements/CustomButton';
import {shallowEqual, useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../Theme/Variables';
import {sendOwnerChecklist} from '../../components/Alerts/checklist';
import finishAndSendChecklist from '../../Services/finshAndSendChecklist';

import firestore from '@react-native-firebase/firestore';
import {useDocumentData} from 'react-firebase-hooks/firestore';

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
});

const FirstRoute = () => <Info />;
const SecondRoute = () => <Messages />;
const ThirdRoute = () => <Options />;

const screensByRole = (role) => {
  if (role === 'owner') {
    return [
      {key: 'info', title: 'Info', icon: 'info'},
      {key: 'messages', title: 'Mensajes', icon: 'message'},
    ];
  }
  return [
    {key: 'info', title: 'Info', icon: 'info'},
    {key: 'messages', title: 'Mensajes', icon: 'message'},
    {key: 'options', title: 'Opciones', icon: 'settings'},
  ];
};

const CheckScreen = ({route}) => {
  const {docId} = route.params;

  const query = useMemo(() => {
    return firestore().collection('checklists').doc(docId);
  }, [docId]);

  const [checklist] = useDocumentData(query, {
    idField: 'id',
  });

  const user = useSelector(userSelector, shallowEqual);
  const {Layout, Gutters} = useTheme();

  const [index, setIndex] = React.useState(0);
  const [routes] = useState(screensByRole(user.role));

  const initialLayout = {
    width: Dimensions.get('window').width,
  };

  const renderScene = SceneMap({
    info: FirstRoute,
    messages: SecondRoute,
    options: ThirdRoute,
  });

  const handleFinishAndSend = () => {
    finishAndSendChecklist(docId);
  };

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
        {left: Dimensions.get('window').width / (routes.length * 2) - 15},
      ]}
      style={styles.tabBarStyle}
    />
  );
  return (
    <PageLayout
      safe
      backButton
      titleProps={{
        subPage: true,
        title: `Checklist en ${
          checklist?.house && checklist?.house[0]?.houseName
        }`,
        color: 'white',
      }}
      footer={
        checklist?.done === checklist?.total &&
        user.role === 'admin' && (
          <CustomButton
            styled="rounded"
            loading={false}
            title="Finalizar y enviar al propietario"
            onPress={() => sendOwnerChecklist(() => handleFinishAndSend())}
          />
        )
      }>
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        style={{height: Dimensions.get('window').height - 100}}
      />
    </PageLayout>
  );
};

export default CheckScreen;
