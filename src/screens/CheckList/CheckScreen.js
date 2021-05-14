import React, {useState} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';

import {Info, Messages, Options, Photos} from '../../components/Check';

import {TabView, TabBar, SceneMap} from 'react-native-tab-view';

import {useGetDocFirebase} from '../../hooks/useGetDocFIrebase';
import {useTheme} from '../../Theme';

// UI
import PagetLayout from '../../components/PageLayout';
import CustomButton from '../../components/Elements/CustomButton';
import {shallowEqual, useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../Theme/Variables';
import {sendOwnerChecklist} from '../../components/Alerts/checklist';
import finishAndSendChecklist from '../../Services/finshAndSendChecklist';

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
const ThirdRoute = () => <Photos />;
const FourthRoute = () => <Options />;

const CheckScreen = ({route}) => {
  const {checkId} = route.params;
  const {document: checklist} = useGetDocFirebase('checklists', checkId);
  const user = useSelector(userSelector, shallowEqual);
  const {Layout, Gutters} = useTheme();

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

  const renderScene = SceneMap({
    info: FirstRoute,
    messages: SecondRoute,
    photos: ThirdRoute,
    options: FourthRoute,
  });

  const handleFinishAndSend = () => {
    finishAndSendChecklist(checkId);
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
        {left: Dimensions.get('window').width / (routes.length * 2) - 10},
      ]}
      style={styles.tabBarStyle}
    />
  );
  return (
    <PagetLayout
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
    </PagetLayout>
  );
};

export default CheckScreen;
