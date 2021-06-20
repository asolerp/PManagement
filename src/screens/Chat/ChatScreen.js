import React from 'react';
import {TouchableWithoutFeedback, View, Text} from 'react-native';
import PageLayout from '../../components/PageLayout';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Chat from '../../components/Chat/Chat';
import {Colors} from '../../Theme/Variables';
import {popScreen} from '../../Router/utils/actions';

import firestore from '@react-native-firebase/firestore';
import {useDocumentDataOnce} from 'react-firebase-hooks/firestore';
import Avatar from '../../components/Avatar';

const ChatScreen = ({route}) => {
  const {collection, docId} = route.params;

  const [values] = useDocumentDataOnce(
    firestore().collection(collection).doc(docId),
    {
      idField: 'id',
    },
  );

  console.log('VALUES', values);

  return (
    <PageLayout
      safe
      titleLefSide={
        values?.user && (
          <Avatar
            id={values?.user.id}
            key={values?.user.id}
            uri={values?.user.profileImage}
            size="medium"
          />
        )
      }
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
        title: 'Chat',
        subPage: true,
      }}>
      <Chat collection={collection} docId={docId} />
    </PageLayout>
  );
};

export default ChatScreen;
