import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Image,
  TextInput,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {theme} from '../../../theme/apptheme';
import {FlatList} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Divider,
  Snackbar,
  Subheading,
  Title,
} from 'react-native-paper';
import Provider from '../../../api/Provider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {color} from 'react-native-elements/dist/helpers';
import Search from '../../../components/Search';
import {communication} from '../../../utils/communication';
import ButtonComponent from '../../../components/Button';
import { Styles } from '../../../styles/styles';

function AddActivity({route, navigation}) {
  //   const data = route.params.data;

  const [isLoading, setIsLoading] = useState(true);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);
  const [activity, setActivity] = useState('');
  const [displayChecked, setDisplayChecked] = useState(false); // State for checkbox

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}
        style={{
          padding: 12,
          paddingVertical: 20,
          alignItems: 'center',
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderColor: '#d3d3d3',
          backgroundColor: '#fff',
        }}>
        <Icon name="arrow-back-outline" type="ionicon" color="#000" />
        <Text
          style={[
            Styles.fontBold,
            Styles.fontSize20,
            Styles.primaryColor,
            {marginLeft: 20},
          ]}>
          Add Activity Roles
        </Text>
      </TouchableOpacity>
      <TextInput
        underlineColor="transparent"
        placeholderTextColor={theme.colors.textColorDark}
        style={Styles.textinput}
        dense
        placeholder="Activity"
        value={activity}
        onChangeText={e => setActivity(e)}
      />
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={displayChecked ? 'checked' : 'unchecked'}
          onPress={() => setDisplayChecked(!displayChecked)}
          color={theme.colors.primary}
        />
        <Text style={styles.checkboxLabel}>Display</Text>
      </View>
      <View style={{position: 'absolute', width: '100%', bottom: 50}}>
        <ButtonComponent light={true} text={'Submit'} />
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: snackbarColor}}></Snackbar>
    </SafeAreaView>
  );
}

export default AddActivity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#d5d5d5',
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal:20
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
});
