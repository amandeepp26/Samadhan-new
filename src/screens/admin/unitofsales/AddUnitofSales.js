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
  HelperText,
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
import {Styles} from '../../../styles/styles';
import Header from '../../../components/Header';

function AddUnitofSales({route, navigation}) {
  //   const data = route.params.data;

  const [isLoading, setIsLoading] = useState(true);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);
  const [displayChecked, setDisplayChecked] = useState(false); // State for checkbox
  const [error, setError] = React.useState(false);
  const [errorC, setCError] = React.useState(false);
  const [name, setName] = React.useState(
    route.params.type === 'edit' ? route.params.data.displayUnit : '',
  );
  const [conversion, setConversion] = React.useState(
    route.params.type === 'edit' ? route.params.data.convertUnitName : '',
  );
  
  const [checked, setChecked] = React.useState(
    route.params.type === 'edit'
      ? route.params.data.display === 1
        ? true
        : false
      : false,
  );

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
 
    const InsertData = () => {
      Provider.createDFAdmin(Provider.API_URLS.UnitNameCreate, {
        data: {
          Sess_UserRefno: '2',
          unit_name: name,
          convert_unit_name: conversion,
          view_status: checked ? 1 : 0,
        },
      })
        .then(response => {
          setIsButtonLoading(false);
          if (response.data && response.data.code === 200) {
            route.params.fetchData('add');
            navigation.goBack();
          } else if (response.data.code === 304) {
            setSnackbarText(communication.AlreadyExists);
            setSnackbarVisible(true);
          } else {
            setSnackbarText(communication.InsertError);
            setSnackbarVisible(true);
          }
        })
        .catch(e => {
          setIsButtonLoading(false);
          setSnackbarText(communication.NetworkError);
          setSnackbarVisible(true);
        });
    };

    const UpdateData = () => {
      Provider.createDFAdmin(Provider.API_URLS.UnitNameUpdate, {
        data: {
          Sess_UserRefno: '2',
          unit_category_refno: route.params.data.id,
          unit_name: name,
          convert_unit_name: conversion,
          view_status: checked ? 1 : 0,
        },
      })
        .then(response => {
          setIsButtonLoading(false);
          if (
            response.data &&
            (response.data.code === 200 || response.data.code === 204)
          ) {
            route.params.fetchData('update');
            navigation.goBack();
          } else if (response.data.code === 304) {
            setSnackbarText(communication.AlreadyExists);
            setSnackbarVisible(true);
          } else {
            setSnackbarText(communication.UpdateError);
            setSnackbarVisible(true);
          }
        })
        .catch(e => {
          console.log(e);
          setIsButtonLoading(false);
          setSnackbarText(communication.NetworkError);
          setSnackbarVisible(true);
        });
    };

    const ValidateData = () => {
      let isValid = true;
      if (name.length === 0) {
        setError(true);
        isValid = false;
      }
      if (conversion.length === 0) {
        setCError(true);
        isValid = false;
      }
      if (isValid) {
        setIsButtonLoading(true);
        if (route.params.type === 'edit') {
          UpdateData();
        } else {
          InsertData();
        }
      }
    };
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <Header navigation={navigation} title={'Add Unit of Sales'} />
      <TextInput
        underlineColor="transparent"
        placeholderTextColor={theme.colors.textColorDark}
        style={Styles.textinput}
        dense
        placeholder="Unit Name"
        value={name}
        onChangeText={e => {setName(e),setError(false)}}
      />
      {error &&
      <HelperText style={{marginLeft: 10}} type="error" visible={error}>
        {communication.InvalidUnitName}
      </HelperText>
    }
      <TextInput
        underlineColor="transparent"
        placeholderTextColor={theme.colors.textColorDark}
        style={Styles.textinput}
        dense
        placeholder="Conversion Unit"
        value={conversion}
        onChangeText={e => {setConversion(e),setCError(false)}}
      />
      {errorC &&
      <HelperText style={{marginLeft: 10}} type="error" visible={errorC}>
        {communication.InvalidUnitConversionUnit}
      </HelperText>
    }
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={displayChecked ? 'checked' : 'unchecked'}
          onPress={() => setDisplayChecked(!displayChecked)}
          color={theme.colors.primary}
        />
        <Text style={styles.checkboxLabel}>Display</Text>
      </View>
      <View style={{position: 'absolute', width: '100%', bottom: 50}}>
        <ButtonComponent light={true} text={'Submit'} onPress={ValidateData} />
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: snackbarColor}}></Snackbar>
    </SafeAreaView>
  );
}

export default AddUnitofSales;

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
    marginHorizontal: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
});
