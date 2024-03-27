import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Pressable} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import Login from '../screens/Login';
import { Image } from 'react-native';
import { theme } from '../theme/apptheme';
import { Icon } from 'react-native-elements';
import { Styles } from '../styles/styles';
import ButtonComponent from '../components/Button';
import MenuItems from '../screens/admin/MenuItems';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApprovedUser from '../screens/admin/Users/ApprovedUsers';
import PendingUsers from '../screens/admin/Users/PendingUsers';
import Activity from '../screens/admin/activity/Activity';
import AddActivity from '../screens/admin/activity/AddActivity';
import ApiMaster from '../screens/admin/apimaster/ApiMaster';
import AddApiMaster from '../screens/admin/apimaster/AddApiMaster';
import Services from '../screens/admin/Services/Services';
import AddService from '../screens/admin/Services/AddService';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UnitofSales from '../screens/admin/unitofsales/UnitofSales';
import AddUnitofSales from '../screens/admin/unitofsales/AddUnitofSales';
import Category from '../screens/admin/category/Category';
import AddCategory from '../screens/admin/category/Addcategory';
import HomeScreen from '../screens/admin/Home';
import Provider from '../api/Provider';


// CustomDrawerContent component
function CustomDrawerContent({navigation,loginUser,name,role,data,profileIcon, ...rest}) {
  return (
    <DrawerContentScrollView {...rest}>
      <View style={{}}>
        <View style={style.header}>
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <View>
              <Image
                src={
                  profileIcon
                    ? profileIcon
                    : 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D'
                }
                style={{width: 100, height: 100, borderRadius: 50}}
              />
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 50,
                  padding: 2,
                  width: 25,
                  height: 25,
                  justifyContent: 'center',
                  position: 'absolute',
                  bottom: 5,
                  right: 2,
                }}>
                <Icon
                  name="camera-outline"
                  type="ionicon"
                  color={'#000'}
                  size={18}
                />
              </View>
            </View>
            <View style={[Styles.marginHorizontal12, {alignItems: 'center'}]}>
              <Text
                style={[
                  Styles.fontBold,
                  Styles.fontSize20,
                  Styles.primaryColor,
                ]}>
                {name}
              </Text>
              <Text style={[Styles.fontSize14, Styles.textColorDark]}>
                {role}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            borderWidth: 1,
            borderColor: '#d3d3d3',
            borderRadius: 15,
            marginHorizontal: 10,
            paddingVertical: 7,
          }}>
          {data.map((item, index) => (
            <Pressable
              onPress={() => {
                if (item.items) {
                  navigation.navigate('Menu', {
                    data: item.items,
                    title: item.title,
                  });
                } else {
                  navigation.navigate(item.navigation);
                }
              }}
              style={{
                flexDirection: 'row',
                paddingVertical: 7,
                marginTop: 10,
                alignItems: 'center',
                paddingHorizontal: 10,
                color: '#000',
                borderBottomWidth: 1,
                borderColor: '#d5d5d5',
              }}>
              <Image
                resizeMode="contain"
                source={{
                  uri: item.icon
                    ? item.icon
                    : 'https://cdn-icons-png.flaticon.com/512/2951/2951372.png',
                }}
                style={{width: 35, height: 30, borderRadius: 8}}
              />
              <View
                style={{
                  width: '85%',
                  marginHorizontal: 12,
                }}>
                <Text
                  style={[
                    Styles.fontSize14,
                    // Styles.marginHorizontal12,
                    {
                      color: '#000',
                      fontWeight: '500',
                    },
                  ]}>
                  {item.title}
                </Text>
              </View>
            </Pressable>
          ))}

          <View style={{alignItems: 'center'}}>
            <ButtonComponent
              onPress={() => {
                AsyncStorage.removeItem('user'), loginUser();
              }}
              light={true}
              text={'Logout'}
            />
            <Text
              style={[
                Styles.fontSize14,
                Styles.textColorDark,
                Styles.marginTop4,
              ]}>
              V 10.9.0(22578)
            </Text>
          </View>
        </View>
      </View>

      {/* Drawer items */}
      {/* <DrawerItemList {...rest} /> */}

      {/* Your custom footer or any other components can be added here */}
    </DrawerContentScrollView>
  );
}

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

export default function DrawerNavigation({loginUser}) {
  const [isStackVisible, setIsStackVisible] = React.useState(false);
  const [name, setName] = React.useState(''); // Initialize name state
  const [role, setRole] = React.useState(''); // Initialize name state
  const userDetails = React.useState(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuData, setMenuData] = useState([]);
  const [profileIcon, setProfileIcon] = useState(null);

  React.useEffect(() => {
    checkUserLoggedIn();
    getMenuList();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const ud = JSON.parse(userData); 
      userDetails[1](ud);
      const pic = await AsyncStorage.getItem('profilePic');
      setProfileIcon(pic);
      if (userData) {
        setIsStackVisible(true);
      }
      const userName = await AsyncStorage.getItem('userName'); // Retrieve userName
      setName(userName); // Set the retrieved userName to the name state
      const userRole = await AsyncStorage.getItem('userRole'); // Retrieve userName
      setRole(userRole); // Set the retrieved userName to the name state
    } catch (error) {
      console.error('Error checking user login status:', error);
    }
  };

    const getMenuList = async () => {
      const data = JSON.parse(await AsyncStorage.getItem('user'));
      Sess_UserRefno = data.UserID;
      Sess_group_refno = data.Sess_group_refno;
      Sess_group_refno_extra_1 = data.Sess_group_refno_extra_1;
      Sess_locationtype_refno = data.Sess_locationtype_refno;
      Sess_menu_refno_list = data.Sess_menu_refno_list;
      const params = {
        data: {
          Sess_UserRefno: Sess_UserRefno,
          Sess_group_refno: Sess_group_refno,
          Sess_group_refno_extra_1: Sess_group_refno_extra_1,
          Sess_locationtype_refno: Sess_locationtype_refno,
          Sess_menu_refno_list: Sess_menu_refno_list,
        },
      };
      console.log('params--->', params);
      Provider.createDFCommon(Provider.API_URLS.get_leftside_menulist, params)
        .then(response => {
          if (response.data && response.data.code === 200) {
            setMenuData(response.data.data);
          } else if (response.data.code === 304) {
            //  setSnackbarText(communication.AlreadyExists);
            //  setIsSnackbarVisible(true);
          } else {
            //  setSnackbarText(communication.NoData);
            //  setIsSnackbarVisible(true);
          }
          setMenuLoading(false);
        })
        .catch(e => {
          //  setSnackbarText(e.message);
          //  setIsSnackbarVisible(true);
          setMenuLoading(false);
        });
    };
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
      drawerContent={props => (
        <CustomDrawerContent
          {...props}
          loginUser={loginUser}
          name={name}
          role={role}
          data={menuData}
          profileIcon={profileIcon}
        />
      )}>
      <Drawer.Screen
        name="Home"
        component={props => (
          <HomeScreen {...props} loginUser={loginUser} />
        )}
        initialParams={{userDetails: userDetails}}
      />
    </Drawer.Navigator>
  );
}

const style = StyleSheet.create({
    header:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        paddingVertical:20,
        paddingHorizontal:20
    },
})