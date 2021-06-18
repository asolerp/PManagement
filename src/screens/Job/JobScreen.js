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

const JobScreen = ({route}) => {
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
        footer={
          <CustomButton
            styled="rounded"
            loading={false}
            title={job?.done ? 'No está terminada' : 'Finalizar'}
            onPress={onSubmit}
          />
        }>
        <Info />
      </PageLayout>
    </React.Fragment>
  );
};

export default JobScreen;
