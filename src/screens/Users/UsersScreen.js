import React from 'react';

// UI
import AddButton from '../../components/Elements/AddButton';
import Container from './Container';
import PageLayout from '../../components/PageLayout';

const UsersScreen = () => {
  return (
    <React.Fragment>
      {/* <AddButton iconName="add" /> */}
      <PageLayout
        titleProps={{
          subPage: false,
          title: 'Usuarios',
          color: 'white',
        }}>
        <Container />
      </PageLayout>
    </React.Fragment>
  );
};

export default UsersScreen;
