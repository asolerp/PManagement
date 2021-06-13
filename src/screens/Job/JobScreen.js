import React, {useState, useMemo} from 'react';

import firestore from '@react-native-firebase/firestore';
import {useDocumentData} from 'react-firebase-hooks/firestore';

// UI
import {Text, StyleSheet, Dimensions} from 'react-native';
import {Info, Messages, Photos} from '../../components/Job';
import {TabView, TabBar, SceneMap} from 'react-native-tab-view';
import PageLayout from '../../components/PageLayout';
import CustomButton from '../../components/Elements/CustomButton';
import updateJobStatus from '../../Services/updateJobStatus';

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: 'transparent',
    color: 'black',
  },
  tabBarLabelStyle: {color: '#284748', fontWeight: 'bold', fontSize: 18},
  tabIndicator: {
    backgroundColor: '#2A7BA5',
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

export const JOB_SCREEN_KEY = 'jobScreen';

const JobScreen = ({route, navigation}) => {
  const {jobId} = route.params;

  const query = useMemo(() => {
    return firestore().collection('jobs').doc(jobId);
  }, [jobId]);

  const [job] = useDocumentData(query, {
    idField: 'id',
  });

  const [index, setIndex] = React.useState(0);
  const [routes] = useState([
    {key: 'info', title: 'Info'},
    {key: 'messages', title: 'Mensajes'},
    {key: 'photos', title: 'Fotos'},
  ]);

  const initialLayout = {
    width: Dimensions.get('window').width,
  };

  const renderScene = SceneMap({
    info: FirstRoute,
    messages: SecondRoute,
    photos: ThirdRoute,
  });

  const onSubmit = () => {
    updateJobStatus(jobId, {done: !job?.done});
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      renderLabel={({route, focused, color}) => (
        <Text style={styles.tabBarLabelStyle}>{route.title}</Text>
      )}
      indicatorStyle={[
        styles.tabIndicator,
        {left: Dimensions.get('window').width / (routes.length * 2) - 5},
      ]}
      style={styles.tabBarStyle}
    />
  );
  return (
    <PageLayout
      backButton
      titleProps={{
        subPage: true,
        title: `Trabajos en ${job?.house && job?.house[0]?.houseName}`,
        subtitle: job?.task?.desc,
        color: 'white',
      }}
      footer={
        <CustomButton
          styled="rounded"
          loading={false}
          title={job?.done ? 'No está terminada' : 'Finalizar'}
          onPress={onSubmit}
        />
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

export default JobScreen;
