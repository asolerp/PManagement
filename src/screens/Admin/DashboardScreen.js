import React from 'react';
import {View, StyleSheet, Text} from 'react-native';

// Components
import ProfileBar from '../../components/ProfileBar';
import TitlePage from '../../components/TitlePage';
import IncidencesList from '../../components/Lists/IncidencesList';

// UI
import LinearGradient from 'react-native-linear-gradient';

// Utils
import moment from 'moment';
import {ScrollView} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {Colors} from '../../Theme/Variables';
import {useTheme} from '../../Theme';
import ChecklistList from '../../components/Lists/ChecklistList';

const DashboardScreen = ({navigation}) => {
  const {Layout, Gutters, Fonts} = useTheme();

  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);

  return (
    <React.Fragment>
      <View style={{backgroundColor: Colors.lowGrey}}>
        <TitlePage>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <ProfileBar />
          </TouchableOpacity>
        </TitlePage>
      </View>
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        colors={[Colors.leftBlue, Colors.rightGreen]}
        style={[Layout.fill]}>
        <ScrollView style={[Layout.fill, styles.container]} nestedScrollEnabled>
          <View style={styles.home}>
            <View style={[Gutters.mediumHPadding]}>
              <Text style={[Fonts.textTitle, Gutters.mediumVMargin]}>
                Hoy es {date.join(' ')} ☀️
              </Text>
              <ChecklistList />
              <IncidencesList />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lowGrey,
    borderTopRightRadius: 50,
  },
  home: {
    backgroundColor: Colors.lowGrey,
    flex: 5,
  },
});

export default DashboardScreen;
