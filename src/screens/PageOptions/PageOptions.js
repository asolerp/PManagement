import React from 'react';
import {
  ActivityIndicator,
  TouchableWithoutFeedback,
  View,
  Text,
} from 'react-native';
import PageLayout from '../../components/PageLayout';
import {openScreenWithPush, popScreen} from '../../Router/utils/actions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../Theme/Variables';
import Container from './Container';
import useRecursiveDelete from '../../utils/useRecursiveDelete';
import duplicateCheckList from '../../Services/duplicateCheckList';
import {CHECKLISTS, JOBS} from '../../utils/firebaseKeys';
import duplicateJob from '../../Services/duplicateJob';
import {
  HOME_ADMIN_STACK_KEY,
  NEW_CHECKLIST_SCREEN,
  NEW_JOB_STACK_KEY,
} from '../../Router/utils/routerKeys';
import {useTheme} from '../../Theme';

const PageOptionsScreen = ({route}) => {
  const {Layout, Fonts} = useTheme();
  const {showDelete, duplicate, collection, docId, backScreen} = route.params;
  const {loading, recursiveDelete} = useRecursiveDelete({
    path: `${collection}/${docId}`,
    collection,
    backScreen,
  });

  const handleDuplicate = async () => {
    if (collection === CHECKLISTS) {
      return await duplicateCheckList(docId);
    }
    return await duplicateJob(docId);
  };

  const parseScreenByCollection = {
    [CHECKLISTS]: NEW_CHECKLIST_SCREEN,
    [JOBS]: NEW_JOB_STACK_KEY,
  };

  return (
    <PageLayout
      safe
      titleRightSide={
        <TouchableWithoutFeedback
          onPress={() => {
            popScreen();
          }}>
          <View>
            <Icon name="close" size={25} color={Colors.white} />
          </View>
        </TouchableWithoutFeedback>
      }
      titleProps={{
        title: 'Opciones',
        subPage: true,
      }}>
      {loading ? (
        <View style={[Layout.fill, Layout.colCenter]}>
          <Text>Eliminando..</Text>
          <ActivityIndicator color={Colors.pm} size={40} />
        </View>
      ) : (
        <Container
          collection={collection}
          docId={docId}
          showDelete={showDelete}
          onEdit={() => {
            openScreenWithPush(parseScreenByCollection[collection], {
              edit: true,
              docId,
            });
          }}
          onDelete={recursiveDelete}
          duplicate={duplicate}
          onDuplicate={async () => {
            await handleDuplicate();
            openScreenWithPush(HOME_ADMIN_STACK_KEY, {
              screen: backScreen,
            });
          }}
        />
      )}
    </PageLayout>
  );
};
export default PageOptionsScreen;
