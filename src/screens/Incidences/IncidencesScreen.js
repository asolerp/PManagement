import React from 'react';

import PageLayout from '../../components/PageLayout';

import AddButton from '../../components/Elements/AddButton';

import {openScreenWithPush} from '../../Router/utils/actions';
import {NEW_INCIDENCE_SCREEN_KEY} from '../../Router/utils/routerKeys';
import Container from './Container';

const IncidencesScreen = () => {
  return (
    <React.Fragment>
      <AddButton
        iconName="warning"
        onPress={() => openScreenWithPush(NEW_INCIDENCE_SCREEN_KEY)}
      />
      <PageLayout
        titleLefSide={true}
        titleProps={{
          title: 'Incidencias',
          subPage: false,
        }}>
        <Container />
      </PageLayout>
    </React.Fragment>
  );
};

export default IncidencesScreen;
