import * as React from 'react';
import {View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonComponent from './src/components/Button';
import HomeScreen from './src/screens/admin/Home';
import DrawerNavigation from './src/navigations/DrawerNavigation';
import Splash from './src/components/Splash';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import Forgetpassword from './src/screens/ForgetPassword';
import MenuItems from './src/screens/admin/MenuItems';
import ApprovedUser from './src/screens/admin/Users/ApprovedUsers';
import PendingUsers from './src/screens/admin/Users/PendingUsers';
import Activity from './src/screens/admin/activity/Activity';
import AddActivity from './src/screens/admin/activity/AddActivity';
import AddApiMaster from './src/screens/admin/apimaster/AddApiMaster';
import Services from './src/screens/admin/Services/Services';
import AddService from './src/screens/admin/Services/AddService';
import UnitofSales from './src/screens/admin/unitofsales/UnitofSales';
import AddUnitofSales from './src/screens/admin/unitofsales/AddUnitofSales';
import Category from './src/screens/admin/category/Category';
import AddCategory from './src/screens/admin/category/Addcategory';
import ProductScreen from './src/screens/admin/Master/ProductScreen';
import AddProductScreen from './src/screens/admin/Master/AddItems/AddProductScreen';
import ApiMaster from './src/screens/admin/apimaster/ApiMaster';
import ServiceProductScreen from './src/screens/admin/Master/ServiceProductScreen';
import AddServiceProductScreen from './src/screens/admin/Master/AddItems/AddServiceProductScreen';
import DepartmentScreen from './src/screens/admin/Master/DepartmentScreen';
import AddDepartmentScreen from './src/screens/admin/Master/AddItems/AddDepartmentScreen';
import LocationTypeScreen from './src/screens/admin/Master/LocationTypeScreen';
import AddLocationTypeScreen from './src/screens/admin/Master/AddItems/AddLocationTypeScreen';
import DesignationScreen from './src/screens/admin/Master/DesignationScreen';
import AddDesignationScreen from './src/screens/admin/Master/AddItems/AddDesignationScreen';
import EWayBillScreen from './src/screens/admin/Master/EWayBillScreen';
import AddEWayBillScreen from './src/screens/admin/Master/AddItems/AddEWayBillScreen';
import SetupScreen from './src/screens/admin/Master/Setup';
import AddSetupScreen from './src/screens/admin/Master/AddItems/AddSetup';
import CategoryNameScreen from './src/screens/admin/PocketDairyMaster/CategoryName';
import AddCategoryNameScreen from './src/screens/admin/PocketDairyMaster/AddCategoryName';
import AddSubCategoryNameScreen from './src/screens/admin/PocketDairyMaster/AddSubCategoryName';
import SubCategoryNameScreen from './src/screens/admin/PocketDairyMaster/SubCategoryName';
import ABrandConversationValue from './src/screens/admin/ProductionUnitMaster/BrandConversationValue';
import AddBrandConversationValue from './src/screens/admin/ProductionUnitMaster/AddItems/AddBrandConversationValue';
import WidthOfGpCoil from './src/screens/admin/ProductionUnitMaster/WidthOfGPCoil';
import AddWidthOfGpCoil from './src/screens/admin/ProductionUnitMaster/AddItems/AddWidthOfGpCoil';
import AddMassOfZincCoating from './src/screens/admin/ProductionUnitMaster/AddItems/AddMassOfZincCoating';
import MassOfZincCoating from './src/screens/admin/ProductionUnitMaster/MassOfZincCoating';
import DeclinedUserScreen from './src/screens/admin/Users/DeclinedUsers';
import WorkFloorScreen from './src/screens/admin/ServiceCatalogue/WorkFloorScreen';
import AddWorkFloorScreen from './src/screens/admin/ServiceCatalogue/AddItems/AddWorkFloorScreen';
import WorkLocationScreen from './src/screens/admin/ServiceCatalogue/WorkLocationScreen';
import AddWorkLocationScreen from './src/screens/admin/ServiceCatalogue/AddItems/AddWorkLocationScreen';
import DesignTypeScreen from './src/screens/admin/ServiceCatalogue/DesignTypeScreen';
import AddDesignTypeScreen from './src/screens/admin/ServiceCatalogue/AddItems/AddDesignTypeScreen';
import MaterialSetupScreen from './src/screens/admin/ServiceCatalogue/MaterialSetupScreen';
import AddMaterialSetupScreen from './src/screens/admin/ServiceCatalogue/AddItems/AddMaterialSetupScreen';
import PostNewDesignScreen from './src/screens/admin/ServiceCatalogue/PostNewDesignScreen';
import AddPostNewDesignScreen from './src/screens/admin/ServiceCatalogue/AddItems/AddPostNewDesignScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="ForgetPassword" component={Forgetpassword} />
    </Stack.Navigator>
  );
}

function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);
  const [appReady, setAppReady] = React.useState(false);

  React.useEffect(() => {
    // Check if the user is logged in during app startup
    checkUserLoggedIn();
  }, []);

  React.useEffect(() => {
    setTimeout(() => {
      setAppReady(true);
    }, 1000);
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        // User is logged in, navigate to home screen
        setIsUserLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking user login status:', error);
    }
  };

  const loginUser = () => {
    setIsUserLoggedIn(!isUserLoggedIn);
  };

  if (!appReady) {
    return <Splash />;
  }

  return (
    <>
      {!isUserLoggedIn ? (
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
            }}>
            <>
              <Stack.Screen
                name="Login"
                component={props => <Login {...props} loginUser={loginUser} />}
              />
              <Stack.Screen
                name="Signup"
                component={Signup}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="ForgetPassword"
                component={Forgetpassword}
                options={{headerShown: false}}
              />
            </>
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
            }}>
            <>
              <Stack.Screen name="Home" component={DrawerNavigation} />
              <Stack.Screen name="Menu" component={MenuItems} />
              <Stack.Screen name="Approved" component={ApprovedUser} />
              <Stack.Screen name="Pending" component={PendingUsers} />
              <Stack.Screen name="Declined" component={DeclinedUserScreen} />
              <Stack.Screen name="Activity" component={Activity} />
              <Stack.Screen name="AddActivity" component={AddActivity} />
              <Stack.Screen name="ApiMaster" component={ApiMaster} />
              <Stack.Screen name="AddApiMaster" component={AddApiMaster} />
              <Stack.Screen name="Service" component={Services} />
              <Stack.Screen name="AddService" component={AddService} />
              <Stack.Screen name="Unit of Sales" component={UnitofSales} />
              <Stack.Screen name="AddUnitofSales" component={AddUnitofSales} />
              <Stack.Screen name="Category" component={Category} />
              <Stack.Screen name="AddCategory" component={AddCategory} />
              <Stack.Screen name="Products" component={ProductScreen} />
              <Stack.Screen
                name="AddProductScreen"
                component={AddProductScreen}
              />
              <Stack.Screen
                name="Service Product"
                component={ServiceProductScreen}
              />
              <Stack.Screen
                name="AddServiceProductScreen"
                component={AddServiceProductScreen}
              />
              <Stack.Screen name="Department" component={DepartmentScreen} />
              <Stack.Screen
                name="AddDepartmentScreen"
                component={AddDepartmentScreen}
              />
              <Stack.Screen
                name="Location Type"
                component={LocationTypeScreen}
              />
              <Stack.Screen
                name="AddLocationTypeScreen"
                component={AddLocationTypeScreen}
              />
              <Stack.Screen name="Designation" component={DesignationScreen} />
              <Stack.Screen
                name="AddDesignationScreen"
                component={AddDesignationScreen}
              />
              <Stack.Screen name="E-Way Bill" component={EWayBillScreen} />
              <Stack.Screen
                name="AddEWayBillScreen"
                component={AddEWayBillScreen}
              />
              <Stack.Screen name="Setup" component={SetupScreen} />
              <Stack.Screen name="AddSetupScreen" component={AddSetupScreen} />
              <Stack.Screen
                name="Category Name"
                component={CategoryNameScreen}
              />
              <Stack.Screen
                name="AddCategoryNameScreen"
                component={AddCategoryNameScreen}
              />
              <Stack.Screen
                name="Sub Category Name"
                component={SubCategoryNameScreen}
              />
              <Stack.Screen
                name="AddSubCategoryNameScreen"
                component={AddSubCategoryNameScreen}
              />
              <Stack.Screen
                name="Brand Conversion Value"
                component={ABrandConversationValue}
              />
              <Stack.Screen
                name="AddBrandConversationValue"
                component={AddBrandConversationValue}
              />
              <Stack.Screen name="Width of GP Coil" component={WidthOfGpCoil} />
              <Stack.Screen
                name="AddWidthOfGpCoil"
                component={AddWidthOfGpCoil}
              />
              <Stack.Screen
                name="Mass of Zinc Coating"
                component={MassOfZincCoating}
              />
              <Stack.Screen
                name="AddMassOfZincCoating"
                component={AddMassOfZincCoating}
              />
              <Stack.Screen name="Work Floor" component={WorkFloorScreen} />
              <Stack.Screen
                name="AddWorkFloorScreen"
                component={AddWorkFloorScreen}
              />
              <Stack.Screen
                name="Work Location"
                component={WorkLocationScreen}
              />
              <Stack.Screen
                name="AddWorkLocationScreen"
                component={AddWorkLocationScreen}
              />
              <Stack.Screen name="Design Type" component={DesignTypeScreen} />
              <Stack.Screen
                name="AddDesignTypeScreen"
                component={AddDesignTypeScreen}
              />

              <Stack.Screen
                name="Materials Setup"
                component={MaterialSetupScreen}
              />
              <Stack.Screen
                name="AddMaterialSetupScreen"
                component={AddMaterialSetupScreen}
              />
              <Stack.Screen
                name="Post New Design"
                component={PostNewDesignScreen}
              />
              <Stack.Screen
                name="AddPostNewDesignScreen"
                component={AddPostNewDesignScreen}
              />
            </>
          </Stack.Navigator>
        </NavigationContainer>
        // <DrawerNavigation loginUser={loginUser} />
      )}
    </>
  );
}

export default App;
