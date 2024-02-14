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

function ApiMaster({route, navigation}) {
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

  //#region Functions
  const FetchData = from => {
    if (from === 'add' || from === 'update') {
      setSnackbarText(
        'Item ' + (from === 'add' ? 'added' : 'updated') + ' successfully',
      );
      setSnackbarColor(theme.colors.success);
      setSnackbarVisible(true);
    }

    const params = {
      data: {
        api_id: 'all',
      },
    };
    Provider.createDFAPI(Provider.API_URLS.APIURL, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            const lisData = [...response.data.data];
            lisData.map((k, i) => {
              k.key = (parseInt(i) + 1).toString();
            });
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

  useEffect(() => {
    FetchData();
  }, []);

    const showPopup = user => {
      setSelectedUser(user);
      setIsPopupVisible(true);
    };

    const hidePopup = () => {
      setIsPopupVisible(false);
      setSelectedUser(null);
    };

  const RenderItems = data => {
    return (
      <Pressable
        style={[
          Styles.backgroundColor,
          Styles.paddingHorizontal16,
          {
            paddingVertical: 2,
            width: '95%',
            alignSelf: 'center',
            paddingHorizontal: 5,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderColor: '#d3d3d3',
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
            width: 50,
            justifyContent: 'center',
            alignItems: 'center',
            height: 50,
            backgroundColor: '#f5f5f5',
            borderRadius: 50,
          }}>
          <Image
            source={require('../../../../assets/api.png')}
            style={{width: 27, height: 27}}
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
          <View style={{width: '85%'}}>
            <Text
              style={[
                Styles.fontSize16,
                {
                  fontWeight: '500',
                  color: '#000',
                },
              ]}>
              {data.api_name}
            </Text>
            <Text
              style={[
                Styles.textSecondaryColor,
                Styles.fontSize11,
                Styles.marginTop2,
              ]}
              selectable={true}>
              {data.api_post_url}
            </Text>
          </View>
          <Pressable style={{marginLeft: 10}} onPress={() => showPopup(data)}>
            <Image
              source={require('../../../../assets/eye.png')}
              style={{width: 25, height: 25, marginTop: 5}}
            />
            <Title
              style={[
                Styles.fontSize12,
                Styles.textCenter,
                {
                  color: theme.colors.primaryLight,
                },
              ]}>
              View
            </Title>
          </Pressable>
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
          API master
        </Text>
      </TouchableOpacity>
      <Search
        data={listData}
        setData={setListSearchData}
        filterFunction={['api_name', 'api_post', 'api_base_name']}
      />
      <FlatList
        data={listSearchData}
        renderItem={({item}) => RenderItems(item)}
        keyExtractor={item => item.id}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          navigation.navigate('AddApiMaster',{type:'add'});
        }}>
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
      {selectedUser && (
        <View style={styles.popupContainer}>
          <View style={styles.popupContent}>
            <TouchableOpacity style={styles.closeButton} onPress={hidePopup}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Title
              style={[Styles.fontBold, Styles.fontSize18, Styles.textCenter]}>
              {selectedUser.api_name}
            </Title>
            <View style={styles.row}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize14,
                ]}
                selectable={true}>
                API Name
              </Text>
              <Text
                style={[
                  Styles.fontSize14,
                  {
                    color: theme.colors.primaryLight,
                    width: '75%',
                    textAlign: 'right',
                  },
                ]}
                selectable={true}>
                {selectedUser.api_name}
              </Text>
            </View>
            <View style={styles.row}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize14,
                ]}
                selectable={true}>
                API Base Name
              </Text>
              <Text
                style={[
                  Styles.fontSize14,
                  {
                    color: theme.colors.primaryLight,
                    width: '72%',
                    textAlign: 'right',
                  },
                ]}
                selectable={true}>
                {selectedUser.api_base_name}
              </Text>
            </View>

            <View style={styles.row}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize14,
                ]}
                selectable={true}>
                API Post Url
              </Text>
              <Text
                style={[
                  Styles.fontSize14,
                  {
                    color: theme.colors.primaryLight,
                    width: '75%',
                    textAlign: 'right',
                  },
                ]}
                selectable={true}>
                {selectedUser.api_post_url}
              </Text>
            </View>

            <View style={styles.row}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize14,
                ]}
                selectable={true}>
                API Get Url
              </Text>
              <Text
                style={[
                  Styles.fontSize14,
                  {
                    color: theme.colors.primaryLight,
                    width: '75%',
                    textAlign: 'right',
                  },
                ]}
                selectable={true}>
                {selectedUser.api_get_url}
              </Text>
            </View>
          </View>
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

export default ApiMaster;

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
    top: -32, // Adjust the top distance as needed
    right: 0, // Adjust the right distance as needed
    backgroundColor: 'red', // Background color for the close button
    borderRadius: 20, // Adjust the border radius to make the button circular
    // padding: 2, // Add padding for better touch area
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
