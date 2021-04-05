import React, {useState} from 'react';
import {View, FlatList, Text, StyleSheet, TouchableOpacity} from 'react-native';
import CheckItem from '../../components/CheckItem';
import AddButton from '../../components/Elements/AddButton';
import PagetLayout from '../../components/PageLayout';

//Firebase
import {useGetFirebase} from '../../hooks/useGetFirebase';

const styles = StyleSheet.create({
  filterWrapper: {
    marginVertical: 20,
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 40,
    zIndex: 10,
  },
  todayStyle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  checkListWrapper: {
    marginTop: 20,
  },
});

const CheckListScreen = ({navigation}) => {
  const renderItem = ({item}) => (
    <CheckItem
      key={item.id}
      check={item}
      onPress={() =>
        navigation.navigate('Check', {
          checkId: item.id,
        })
      }
    />
  );

  const {list: checkLists, loading, error} = useGetFirebase('checklists');
  const [state, setState] = useState(false);

  console.log(checkLists);

  const handleNewCheckList = () => {
    navigation.navigate('NewCheckList');
  };

  if (loading) {
    return null;
  }

  return (
    <React.Fragment>
      <View style={styles.addButton}>
        <TouchableOpacity onPress={() => handleNewCheckList()}>
          <AddButton iconName="add" />
        </TouchableOpacity>
      </View>
      <PagetLayout
        titleLefSide={true}
        titleProps={{
          title: 'CheckList',
          subPage: false,
        }}>
        <View>
          <View style={styles.filterWrapper}>
            <Text style={{...styles.todayStyle}}>✅ CheckList</Text>
            <View style={styles.checkListWrapper}>
              <FlatList
                data={checkLists}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
              />
            </View>
          </View>
        </View>
      </PagetLayout>
    </React.Fragment>
  );
};

export default CheckListScreen;
