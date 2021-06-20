import React from 'react';

// UI
import AddButton from '../../components/Elements/AddButton';
import PageLayout from '../../components/PageLayout';

// Utils
import {openScreenWithPush} from '../../Router/utils/actions';
import {NEW_JOB_STACK_KEY} from '../../Router/utils/routerKeys';
import Container from './Container';

const JobsScreen = () => {
  const handleNewJob = () => {
    openScreenWithPush(NEW_JOB_STACK_KEY);
  };

  return (
    <React.Fragment>
      <AddButton iconName="add" onPress={() => handleNewJob()} />
      <PageLayout
        titleLefSide={true}
        titleProps={{
          title: 'Trabajos',
          subPage: false,
        }}>
        <Container />
      </PageLayout>
    </React.Fragment>
  );
};

export default JobsScreen;
