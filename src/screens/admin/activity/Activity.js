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
import {Styles} from '../../../styles/styles';
import {theme} from '../../../theme/apptheme';
import {FlatList} from 'react-native';
import {
  ActivityIndicator,
  Button,
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

function Activity({route, navigation}) {
  //   const data = route.params.data;

  const [isLoading, setIsLoading] = useState(true);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);
  const [companyDetails, setCompanyDetails] = useState('');
  const [company, setCompanyName] = useState('');
  const [mobile, setMobileNo] = useState('');
  const [groupname, setGroupName] = useState('');
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [selectedID, setSelectedID] = useState(0);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);


  useEffect(() => {
    GetUserID();
  }, []);

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      FetchData();
    }
  };

  const FetchData = from => {
    if (from === 'approve' || from === 'decline') {
      setSnackbarText(
        'User ' +
          (from === 'approve' ? 'approved' : 'declined') +
          ' successfully',
      );
      setSnackbarColor(theme.colors.success);
      setSnackbarVisible(true);
    }
    let params = {
      data: {
        Sess_UserRefno: userID,
        group_refno: 'all',
      },
    };
    Provider.createDFAdmin('getuserpendinglist/', params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            const lisData = [...response.data.data];
            lisData.map((k, i) => {
              k.key = (parseInt(i) + 1).toString();
            });
            console.log(response.data.data);
            setListData(response.data.data);
            setListSearchData(response.data.data);
          }
        } else {
          setListData([]);
          setSnackbarText('No data found');
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
        }
        setIsLoading(false);
        setRefreshing(false);
      })
      .catch(e => {
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        setRefreshing(false);
      });
  };

          const ValidateData = () => {
            let isValid = true;
            if (executiveName.length === 0) {
              setExError(true);
              isValid = false;
            }
            if (isValid) {
              setIsButtonLoading(true);
              FetchData();
            }
          };
 

 
  const RenderItems = data => {
    return (
      <Pressable
        style={[
          Styles.backgroundColor,
          Styles.paddingHorizontal16,
          Styles.bordergray,
          {
            borderRadius: 10,
            paddingVertical:7,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#d3d3d3',
            elevation: 2,
            marginHorizontal: 15,
            marginTop: 10,
            shadowColor: theme.colors.textDark,
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.03,
            shadowRadius: 1,
          },
        ]}>
        <View
          style={{
            padding: 15,
            width: 60,
            height: 60,
            backgroundColor: '#f5f5f5',
            borderRadius: 50,
          }}>
          <Icon
            name="person"
            size={28}
            type="ionicon"
            color={theme.colors.primary}
          />
        </View>
        <View
          style={{
            width: '80%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderColor: '#d5d5d5',
            marginHorizontal: 15,
          }}>
          <View>
            <Text
              style={[
                Styles.fontSize16,
                {
                  fontWeight: '500',
                  color: '#000',
                },
              ]}>
              {data.firstname}
            </Text>
            <Text
              style={[
                Styles.textSecondaryColor,
                Styles.fontSize12,
                Styles.marginTop2,
              ]}
              selectable={true}>
              Display: Yes
            </Text>
            
          </View>
          <Pressable>
            <Icon name='edit' size={20} />
          </Pressable>
          {/* <Title
            style={[
              Styles.padding24,
              Styles.fontBold,
              Styles.fontSize14,
              Styles.textCenter,
              {
                color: theme.colors.primaryLight,
              },
            ]}>
            View
          </Title> */}
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View
        style={[
          Styles.flex1,
          Styles.flexJustifyCenter,
          Styles.flexAlignCenter,
        ]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (listData.length == 0) {
    <NoItems
      icon="format-list-bulleted"
      text="No records found for your query"
    />;
  }
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
          Activity Roles
        </Text>
      </TouchableOpacity>
      <Search
        query={route?.params ? route?.params?.role : ''}
        data={listData}
        setData={setListSearchData}
        filterFunction={[
          'company_name',
          'departmentname',
          'designationname',
          'approve_status',
          'firstname',
          'group_name',
          'mobile_no',
          'password',
          'user_name',
        ]}
      />
      <FlatList
        data={listSearchData}
        renderItem={({item}) => RenderItems(item)}
        keyExtractor={item => item.id}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
        navigation.navigate('AddActivity')
        }}>
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: snackbarColor}}></Snackbar>
    </SafeAreaView>
  );
}

export default Activity;

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
  closeButton: {
    position: 'absolute', // Position the close button absolutely within the container
    top: 10, // Adjust the top distance as needed
    right: 10, // Adjust the right distance as needed
    backgroundColor: 'red', // Background color for the close button
    borderRadius: 20, // Adjust the border radius to make the button circular
    padding: 5, // Add padding for better touch area
  },
  popupContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '95%',
  },
  popupButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  popupButton: {
    padding: 10,
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Add elevation for shadow effect
  },
});
