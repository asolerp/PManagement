import React, {useMemo} from 'react';

import firestore from '@react-native-firebase/firestore';
import {useDocumentData} from 'react-firebase-hooks/firestore';

// UI
import ChatButtonWithMessagesCounter from '../../components/ChatButtonWithMessagesCounter';
import {Info} from '../../components/Job';
import Icon from 'react-native-vector-icons/MaterialIcons';

import PageLayout from '../../components/PageLayout';
import CustomButton from '../../components/Elements/CustomButton';
import updateJobStatus from '../../Services/updateJobStatus';
import {JOBS} from '../../utils/firebaseKeys';
import {TouchableWithoutFeedback, View} from 'react-native';
import {openScreenWithPush} from '../../Router/utils/actions';
import {
  JOBS_SCREEN_KEY,
  PAGE_OPTIONS_SCREEN_KEY,
} from '../../Router/utils/routerKeys';
import {Colors} from '../../Theme/Variables';
import {useTheme} from '../../Theme';

const JobScreen = ({route}) => {
  const {Gutters} = useTheme();
  const {jobId} = route.params;
  const query = useMemo(() => {
    return firestore().collection(JOBS).doc(jobId);
  }, [jobId]);

  const [job] = useDocumentData(query, {
    idField: 'id',
  });

  const onSubmit = () => {
    updateJobStatus(jobId, {done: !job?.done});
  };

  return (
    <React.Fragment>
      <ChatButtonWithMessagesCounter collection={JOBS} docId={jobId} />
      <PageLayout
        safe
        backButton
        titleProps={{
          subPage: true,
          title: `Trabajos en ${job?.house && job?.house[0]?.houseName}`,
          subtitle: job?.task?.desc,
          color: 'white',
        }}
        titleRightSide={
          <TouchableWithoutFeedback
            onPress={() => {
              openScreenWithPush(PAGE_OPTIONS_SCREEN_KEY, {
                backScreen: JOBS_SCREEN_KEY,
                collection: JOBS,
                docId: jobId,
                showDelete: true,
                duplicate: true,
              });
            }}>
            <View>
              <Icon name="settings" size={25} color={Colors.white} />
            </View>
          </TouchableWithoutFeedback>
        }
        footer={
          <CustomButton
            styled="rounded"
            loading={false}
            title={job?.done ? 'No está terminada' : 'Finalizar'}
            onPress={onSubmit}
          />
        }>
        <View style={[Gutters.smallTMargin]}>
          <Info />
        </View>
      </PageLayout>
    </React.Fragment>
  );
};

export default JobScreen;
