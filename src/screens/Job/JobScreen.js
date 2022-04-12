import React, {useMemo} from 'react';

import firestore from '@react-native-firebase/firestore';
import {useDocumentData} from 'react-firebase-hooks/firestore';

// UI
import ChatButtonWithMessagesCounter from '../../components/ChatButtonWithMessagesCounter';
import {Info} from '../../components/Job';

import PageLayout from '../../components/PageLayout';
import CustomButton from '../../components/Elements/CustomButton';
import updateJobStatus from '../../Services/updateJobStatus';
import {JOBS} from '../../utils/firebaseKeys';
import {View} from 'react-native';
import {popScreen} from '../../Router/utils/actions';
import {JOBS_SCREEN_KEY} from '../../Router/utils/routerKeys';

import {useTheme} from '../../Theme';

import {finishJob, openJob} from '../../components/Alerts/jobs';
import {useTranslation} from 'react-i18next';
import {PageOptionsScreen} from '../PageOptions';

const JobScreen = ({route}) => {
  const {Gutters} = useTheme();
  const {t} = useTranslation();

  const {jobId} = route.params;
  const query = useMemo(() => {
    return firestore().collection(JOBS).doc(jobId);
  }, [jobId]);

  const [job] = useDocumentData(query, {
    idField: 'id',
  });

  const onSubmit = () => {
    updateJobStatus(jobId, {done: !job?.done});
    popScreen();
  };

  return (
    <React.Fragment>
      <ChatButtonWithMessagesCounter collection={JOBS} docId={jobId} />
      <PageLayout
        safe
        backButton
        titleProps={{
          subPage: true,
        }}
        titleRightSide={
          <PageOptionsScreen
            backScreen={JOBS_SCREEN_KEY}
            collection={JOBS}
            docId={jobId}
            edit={true}
            showDelete={true}
            duplicate={true}
          />
        }
        footer={
          <CustomButton
            styled="rounded"
            loading={false}
            title={job?.done ? t('job.done') : t('job.no_done')}
            onPress={() =>
              job?.done ? openJob(onSubmit) : finishJob(onSubmit)
            }
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
