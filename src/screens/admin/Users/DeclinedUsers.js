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
import Header from '../../../components/Header';
import NoItems from '../../../components/NoItems';

function DeclinedUsers({route, navigation}) {
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
    if (from === 'add' || from === 'update') {
      setSnackbarText(
        'User ' + (from === 'add' ? 'added' : 'approved') + ' successfully',
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
    Provider.createDFAdmin('getuserdeclinedlist/', params)
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

  const showPopup = user => {
    setSelectedUser(user);
    setIsPopupVisible(true);
  };

  const hidePopup = () => {
    setIsPopupVisible(false);
    setSelectedUser(null);
  };

  const approveUserStatus = () => {
    hidePopup();
    setIsButtonLoading(true);
    const params = {
      data: {
        Sess_UserRefno: userID,
        user_refno: selectedID,
      },
    };
    Provider.createDFAdmin('userapprovestatus/', params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          FetchData('approve');
        } else {
          setSnackbarText(communication.NoData);
          setSnackbarVisible(true);
        }
        setIsButtonLoading(false);
      })
      .catch(e => {
        setSnackbarText(e.message);
        setSnackbarVisible(true);
        setIsButtonLoading(false);
      });
  };

  const declineUserStatus = () => {
    hidePopup();
    setIsButtonLoading(true);
    const params = {
      data: {
        Sess_UserRefno: userID,
        user_refno: selectedID,
      },
    };
    Provider.createDFAdmin('userdeclinestatus/', params)
      .then(response => {
        console.warn('--->', response);
        if (response.data && response.data.code === 200) {
          FetchData('decline');
        } else {
          setSnackbarText(communication.NoData);
          setSnackbarVisible(true);
        }
        setIsButtonLoading(false);
      })
      .catch(e => {
        setSnackbarText(e.message);
        setSnackbarVisible(true);
        setIsButtonLoading(false);
      });
  };
  const RenderItems = data => {
    return (
      <Pressable
        onPress={() => showPopup(data)}
        style={[
          Styles.backgroundColor,
          Styles.paddingHorizontal16,
          Styles.bordergray,
          {
            borderRadius: 10,
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
              Acticity Role: {data.group_name}
            </Text>
            <Text
              style={[
                Styles.textSecondaryColor,
                Styles.fontSize12,
                Styles.marginTop2,
              ]}
              selectable={true}>
              Comapany Name: {data.company_name}
            </Text>
          </View>
          <Title
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
          </Title>
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
     <Header title="Declined Users"  navigation={navigation} />
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
      {/* Popup component */}
      {selectedUser && (
        <View style={styles.popupContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={hidePopup}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.popupContent}>
            <Title
              style={[Styles.fontBold, Styles.fontSize18, Styles.textCenter]}>
              {selectedUser.firstname}
            </Title>
            <View style={styles.row}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize16,
                ]}
                selectable={true}>
                Activity Role
              </Text>
              <Text
                style={[Styles.fontSize16, {color: theme.colors.primaryLight}]}
                selectable={true}>
                {selectedUser.group_name}
              </Text>
            </View>
            <View style={styles.row}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize16,
                ]}
                selectable={true}>
                Company
              </Text>
              <Text
                style={[Styles.fontSize16, {color: theme.colors.primaryLight}]}
                selectable={true}>
                {selectedUser.company_name}
              </Text>
            </View>

            <View style={styles.row}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize16,
                ]}
                selectable={true}>
                Mobile No.
              </Text>
              <Text
                style={[Styles.fontSize16, {color: theme.colors.primaryLight}]}
                selectable={true}>
                {selectedUser.mobile_no}
              </Text>
            </View>

            <View style={styles.popupButtonsContainer}>
              <View style={{width: '40%'}}>
                <ButtonComponent
                  onPress={() => {
                    approveUserStatus();
                  }}
                  light={true}
                  text={'Approve'}
                />
              </View>
              <View style={{width: '40%'}}>
                <Button
                  mode="contained"
                  style={[
                    Styles.marginTop16,
                    {
                      borderRadius: 10,
                      width: '85%',

                      alignSelf: 'center',
                      backgroundColor: 'red',
                    },
                  ]}
                  loading={isButtonLoading}
                  disabled={isButtonLoading}
                  onPress={() => declineUserStatus()}>
                  Decline
                </Button>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={hidePopup}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: snackbarColor}}></Snackbar>
    </SafeAreaView>
  );
}

export default DeclinedUsers;

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
});
