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
import { FlatList } from 'react-native';
import { ActivityIndicator, Divider, Snackbar, Subheading } from 'react-native-paper';
import Provider from '../../../api/Provider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { color } from 'react-native-elements/dist/helpers';
import Search from '../../../components/Search';

function ApprovedUser({route, navigation}) {
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
const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
];

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
    if (from === 'add' || from === 'decline') {
      setSnackbarText(
        'User ' + (from === 'add' ? 'added' : 'decline') + ' successfully',
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
    Provider.createDFAdmin(Provider.API_URLS.getuserapprovelist, params)
      .then(response => {
        console.log('response is------>',response.data.data)
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
 const RenderItems = data => {
   return (
     <View
       style={[
         Styles.backgroundColor,
         Styles.flexJustifyCenter,
         Styles.paddingHorizontal16,
         Styles.flex1,
         Styles.bordergray,
         Styles.padding8,
         Styles.margin8,
         {
           borderRadius: 10,
           //    borderWidth: 1,
           elevation: 2,
           marginHorizontal: 15,
           marginTop: 10,
           shadowColor: theme.colors.textDark,
           shadowOffset: {
             width: 0, // Keep the width at 0
             height: 5, // Adjust the height to control the shadow position
           },
           shadowOpacity: 0.03,
           shadowRadius: 1,
         },
       ]}>
       <View style={[]}>
         <View style={styles.row}>
           <Text
             style={[Styles.textColorDarkSecondary, Styles.fontSize18]}
             selectable={true}>
             {data.firstname}
           </Text>
           <Text
             style={[Styles.fontSize14, {color: theme.colors.primaryLight}]}
             selectable={true}>
             {data.mobile_no}
           </Text>
         </View>
         <View style={styles.row}>
           <Text
             style={[Styles.textSecondaryColor, Styles.fontSize16]}
             selectable={true}>
             Company Name
           </Text>
           <Text
             style={[Styles.fontSize16, {color: theme.colors.primaryLight}]}
             selectable={true}>
             {data.company_name}
           </Text>
         </View>
         <View style={styles.row}>
           <Text
             style={[Styles.textSecondaryColor, Styles.fontSize16]}
             selectable={true}>
             Activity Role
           </Text>
           <Text
             style={[Styles.fontSize16, {color: theme.colors.primaryLight}]}
             selectable={true}>
             {data.group_name}
           </Text>
         </View>

         <View style={styles.row}>
           <Text
             style={[Styles.textSecondaryColor, Styles.fontSize16]}
             selectable={true}>
             Department
           </Text>
           <Text
             style={[Styles.fontSize16, {color: theme.colors.primaryLight}]}
             selectable={true}>
             {data.departmentname}
           </Text>
         </View>

         <View style={styles.row}>
           <Text
             style={[Styles.textSecondaryColor, Styles.fontSize16]}
             selectable={true}>
             Username
           </Text>
           <Text
             style={[Styles.fontSize16, {color: theme.colors.primaryLight}]}
             selectable={true}>
             {data.user_name}
           </Text>
         </View>

         <View style={[styles.row,{borderBottomWidth:0}]}>
           <Text
             style={[Styles.textSecondaryColor, Styles.fontSize16]}
             selectable={true}>
             Password
           </Text>
           <Text
             style={[Styles.fontSize16, {color: theme.colors.primaryLight}]}
             selectable={true}>
             {data.password}
           </Text>
         </View>
       </View>
     </View>
   );
 };

    if(isLoading){
        return(
        <View
          style={[
            Styles.flex1,
            Styles.flexJustifyCenter,
            Styles.flexAlignCenter,
          ]}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )
    }

    if(listData.length ==0){
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
          Approved Users
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
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: snackbarColor}}></Snackbar>
    </SafeAreaView>
  );
}

export default ApprovedUser;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  row:{flexDirection: 'row',
  paddingVertical:10,
          alignItems: 'center',
          justifyContent:'space-between',
          borderBottomWidth:1,borderColor:'#d5d5d5'},
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});
