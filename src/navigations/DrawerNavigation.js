import * as React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Pressable} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import HomeScreen from '../screens/admin/Home';
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

// CustomDrawerContent component
function CustomDrawerContent({navigation,loginUser,name,role, ...rest}) {
  console.warn('name---->',name)
  return (
    <DrawerContentScrollView {...rest}>
      <View style={{}}>
        <View style={style.header}>
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <View>
              <Image
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"
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
                Hey {name}
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
          <Pressable
            style={{
              flexDirection: 'row',
              paddingVertical: 7,
              marginTop: 10,
              alignItems: 'center',
              paddingHorizontal: 10,
              color: '#000',
            }}>
              <View style={{marginBottom:10}}>
            <Icon name="grid-outline" type="ionicon" size={22} />
            </View>
            <View style={{borderBottomWidth: 1, width: '85%',
                    borderColor: '#d5d5d5',marginHorizontal:12,paddingBottom:10}}>
              <Text
                style={[
                  Styles.fontSize14,
                  // Styles.marginHorizontal12,
                  {
                    color: '#000',
                    fontWeight: '500',
                  },
                ]}>
                Dashboard
              </Text>
            </View>
          </Pressable>
          <Pressable
            style={{
              flexDirection: 'row',
              paddingVertical: 7,
              marginTop: 10,
              alignItems: 'center',
              paddingHorizontal: 10,
            }}>
            
              <View style={{marginBottom:10}} >
            <Icon name="person-circle-outline" size={22} type="ionicon" />
          </View>
            <View style={{borderBottomWidth: 1, width: '85%',
                    borderColor: '#d5d5d5',marginHorizontal:12,paddingBottom:10}}>
            <Text
              style={[
                Styles.fontSize14,
                {
                  fontWeight: '500',
                  color: '#000',
                },
              ]}>
              User Profile
            </Text>
            </View>
          </Pressable>
          <Pressable
            style={{
              flexDirection: 'row',
              paddingVertical: 7,
              marginTop: 10,
              alignItems: 'center',
              paddingHorizontal: 10,
            }}>

              <View style={{marginBottom:10}} >
            <Icon name="person-circle-outline" size={22} type="ionicon" />
            </View>
            <View style={{borderBottomWidth: 1, width: '85%',
                    borderColor: '#d5d5d5',marginHorizontal:12,paddingBottom:10}}>
            <Text
              style={[
                Styles.fontSize14,
                {
                  fontWeight: '500',
                  color: '#000',
                },
              ]}>
              Control User Access
            </Text>
            </View>
          </Pressable>
          <Pressable
            style={{
              flexDirection: 'row',
              paddingVertical: 7,
              marginTop: 10,
              alignItems: 'center',
              paddingHorizontal: 10,
            }}>
            
              <View style={{marginBottom:10}} >
            <Icon name="create-outline" size={22} type="ionicon" />
            </View>
            <View style={{borderBottomWidth: 1, width: '85%',
                    borderColor: '#d5d5d5',marginHorizontal:12,paddingBottom:10}}>
            <Text
              style={[
                Styles.fontSize14,
                {
                  fontWeight: '500',
                  color: '#000',
                },
              ]}>
              Pocket Diary
            </Text>
            </View>
          </Pressable>
          <Pressable
            style={{
              flexDirection: 'row',
              paddingVertical: 7,
              marginTop: 10,
              alignItems: 'center',
              paddingHorizontal: 10,
            }}>

              <View style={{marginBottom:10}} >
            <Icon name="people-outline" size={22} type="ionicon" />
            </View>
            <View style={{borderBottomWidth: 1, width: '85%',
                    borderColor: '#d5d5d5',marginHorizontal:12,paddingBottom:10}}>
            <Text
              style={[
                Styles.fontSize14,
                {
                  fontWeight: '500',
                  color: '#000',
                },
              ]}>
              Refer and win
            </Text>
            </View>
          </Pressable>
          <Pressable
            style={{
              flexDirection: 'row',
              paddingVertical: 7,
              marginTop: 10,
              alignItems: 'center',
              paddingHorizontal: 10,
            }}>
              <View style={{marginBottom:10}} >
            <Icon name="headset-outline" size={22} type="ionicon" />
            </View>
            <View style={{borderBottomWidth: 1, width: '85%',
                    borderColor: '#d5d5d5',marginHorizontal:12,paddingBottom:10}}>
            <Text
              style={[
                Styles.fontSize14,
                {
                  fontWeight: '500',
                  color: '#000',
                },
              ]}>
              Help and Support
            </Text>
            </View>
          </Pressable>
          <Pressable
            style={{
              flexDirection: 'row',
              paddingVertical: 7,
              marginTop: 10,
              alignItems: 'center',
              paddingHorizontal: 10,
            }}>
              <View style={{marginBottom:10}} >
            <Icon name="chatbox-ellipses-outline" size={22} type="ionicon" />
            </View>
            <View style={{borderBottomWidth: 1, width: '85%',
                    borderColor: '#d5d5d5',marginHorizontal:12,paddingBottom:10}}>
            <Text
              style={[
                Styles.fontSize14,
                {
                  fontWeight: '500',
                  color: '#000',
                },
              ]}>
              Enquiry and status
            </Text>
            </View>
          </Pressable>

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
  React.useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
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
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
      drawerContent={props => (
        <CustomDrawerContent {...props} loginUser={loginUser} name={name} role={role} />
      )}>
      <Drawer.Screen name="Home" component={HomeScreen} />
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