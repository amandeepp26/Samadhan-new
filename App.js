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
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from './src/theme/apptheme';
import GeneralUserDrawer from './src/navigations/GeneralUserDrawer';
import ImageGalleryScreen from './src/screens/GeneralUser/EstimateAndEnquiries/ImageGalleryScreen';
import YourEstimationsScreen from './src/screens/GeneralUser/EstimateAndEnquiries/YourEstimationsScreen';
import MaterialCalculatorScreen from './src/screens/Common/MaterialCalculator/MaterialCalculatorScreen';
import Design from './src/screens/Design Your Dream/Categories';
import ImageGalleryWorkLocationScreen from './src/screens/GeneralUser/EstimateAndEnquiries/ImageGalleryWorkLocationScreen';
import UserProfile from './src/screens/Common/Profile Update/UserProfile';
import EstimationPreviewScreen from './src/screens/GeneralUser/EstimateAndEnquiries/EstimationPreviewScreen';
import GetEstimationScreen from './src/screens/GeneralUser/EstimateAndEnquiries/GetEstimationScreen';
import DesignyourdreamForm from './src/screens/Design Your Dream/Form';
import DealerDrawer from './src/navigations/DealerDrawer';
import DealerBuyerCategoryScreen from './src/screens/Dealer/Brand/BuyerCategoryScreen';
import DealerBrandMasterScreen from './src/screens/Dealer/Brand/BrandMasterScreen';
import DealerBrandSetupScreen from './src/screens/Dealer/Brand/BrandSetupScreen';
import AddDealerBuyerCategoryScreen from './src/screens/Dealer/Brand/AddItem/AddBuyerCategoryScreen';
import AddDealerBrandSetupScreen from './src/screens/Dealer/Brand/AddItem/AddBrandSetupScreen';
import AddDealerBrandMasterScreen from './src/screens/Dealer/Brand/AddItem/AddBrandMasterScreen';
import DealerBasicDetailsScreen from './src/screens/Dealer/CompanyProfile/BasicDetailsScreen';
import DealerMyServicesScreen from './src/screens/Dealer/CompanyProfile/MyServicesScreen';
import DealerPresentationScreen from './src/screens/Dealer/CompanyProfile/PresentationScreen';
import AddDealerMyServicesScreen from './src/screens/Dealer/CompanyProfile/AddItem/AddMyServicesScreen';
import AddDealerDepartmentScreen from './src/screens/Dealer/Organization/AddItem/AddDepartmentScreen';
import AddDealerDesignationScreen from './src/screens/Dealer/Organization/AddItem/AddDesignationScreen';
import SearchEmployee from './src/screens/Common/Employee/AddItems/SearchEmployee';
import AddEmployee from './src/screens/Common/Employee/AddItems/AddEmployee';
import EmployeeListScreen from './src/screens/Common/Employee/EmployeeList';
import RateCardSetup from './src/screens/Contractor/RateCard/RateCardSetup';
import AddRateCard from './src/screens/Contractor/RateCard/AddRateCard';
import SendRateCard from './src/screens/Contractor/RateCard/SendRateCard/sendRateCard';
import AddSendRateCard from './src/screens/Contractor/RateCard/SendRateCard/AddSendRateCard';
import BudgetSetup from './src/screens/Common/PocketDairy/Setting/BudgetSetup';
import EmployeeAttendanceReport from './src/screens/Common/EmployeeAttendance/EmployeeAttendanceReport';
import DesignWiseScreen from './src/screens/Contractor/QuotationAndEstimation/DesignWiseScreen';
import QuotationWiseScreen from './src/screens/Contractor/QuotationAndEstimation/QuotationWiseScreen';
import EnquiryWise from './src/screens/Contractor/Enquiries/Enquiry_Wise';
import ConsultantBoq from './src/screens/Contractor/Enquiries/Consultant_Boq';
import ProjectYetStart from './src/screens/Contractor/Projects/Yet to Start';
import OnGoingProject from './src/screens/Contractor/Projects/On Going';
import OnGoingProjectDetails from './src/screens/Contractor/Projects/On Going/Details';
import ActivityRolesScreen from './src/screens/admin/Master/ActivityRolesScreen';
import AddActivityRolesScreen from './src/screens/admin/Master/AddItems/AddActivityRolesScreen';
import AddServicesScreen from './src/screens/admin/Master/AddItems/AddServicesScreen';
import UnitOfSalesScreen from './src/screens/admin/Master/UnitOfSalesScreen';
import AddCategoryScreen from './src/screens/admin/Master/AddItems/AddCategoryScreen';
import AttendanceListScreen from './src/screens/Common/EmployeeAttendance/AttendanceList';
import MarkAttendanceScreen from './src/screens/Common/EmployeeAttendance/MarkAttendance';
import AdminAttendanceReport from './src/screens/Common/EmployeeAttendance/AdminAttendanceReport';
import SingleEmployeeAttendanceReport from './src/screens/Common/EmployeeAttendance/SingleEmployeeAttendanceSalaryReport';
import DailyActivityReport from './src/screens/Marketing/EmployeeActivity/DailyActivityReport';
import ActivityReport from './src/screens/Marketing/EmployeeActivity/ActivityReport';
import CustomerList from './src/screens/Marketing/EmployeeActivity/CustomerList';
import AddExpensesList from './src/screens/Common/PocketDairy/AddExpensesList';
import AddCompany from './src/screens/Common/PocketDairy/AddItems/AddCompany';
import MyServicesScreen from './src/screens/Common/CompanyProfile/MyServicesScreen';
import DealerProductScreen from './src/screens/Dealer/Product/ProductScreen';
import BranchListScreen from './src/screens/Common/Organization/BranchScreen';
import BankListScreen from './src/screens/Common/Organization/BankScreen';
import TransportationScreen from './src/screens/Common/Organization/TransportationScreen';
import ClientScreen from './src/screens/Common/Client/ClientScreen';
import ProductPriceList from './src/screens/Dealer/PriceList/ProductPriceList';
import PocketDiaryScreen from './src/screens/PocketDiaryScreen';
import GMyContactsScreen from './src/screens/Common/PocketDairy/Setting/GMyContacts';
import AddSourceList from './src/screens/Common/PocketDairy/AddSourceList';
import VerifyCompanySource from './src/screens/Common/PocketDairy/VerifyCompanySource';
import VerifyCompanyExpense from './src/screens/Common/PocketDairy/VerifyCompanyExpense';
import PocketDiaryInbox from './src/screens/Common/PocketDairy/Setting/PocketDiaryInbox';
import Dashboard from './src/screens/Marketing/Dashboard';
import GeneralUserHomeScreen from './src/screens/Home';
import MarketingDrawer from './src/navigations/MarketingDrawer';
import LogoutActivityForm from './src/screens/Marketing/EmployeeActivity/forms/LogoutActivity';
import EmployeeCustomerForm from './src/screens/Marketing/EmployeeActivity/forms/EmployeeCustomerForm';
import EditCompanyForm from './src/screens/Marketing/EmployeeActivity/forms/EditCompany';
import AddExpensesMarketing from './src/screens/Common/PocketDairy/AddItems/AddExpensesMarketing';

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
  const [userRole, setUserRole] = React.useState('');

  React.useEffect(() => {
    // Check if the user is logged in during app startup
    checkUserLoggedIn();
  }, []);

  React.useEffect(() => {
    setTimeout(() => {
      setAppReady(true);
    }, 1000);
  }, []);

  React.useEffect(()=>{
    checkuserData();
  },[isUserLoggedIn,appReady]);

  const checkuserData = async () => {
   const userRole = await AsyncStorage.getItem('userRole')
    if (userRole) {
      setUserRole(userRole);
    }
  };

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

  const loginUser = async () => {
    // const user = await AsyncStorage.getItem('user');
    const userRole = await AsyncStorage.getItem('userRole');
    console.warn('user is---->', userRole);
    setIsUserLoggedIn(!isUserLoggedIn);
  };

  if (!appReady) {
    return <Splash />;
  }

  return (
    <>
      <PaperProvider theme={theme}>
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
                  component={props => (
                    <Login {...props} loginUser={loginUser} />
                  )}
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
                {userRole === 'App Admin' || userRole === 'Admin' ? (
                  <Stack.Screen
                    name="Home"
                    component={props => (
                      <DrawerNavigation {...props} loginUser={loginUser} />
                    )}
                  />
                ) : userRole === 'General User' ? (
                  <>
                    <Stack.Screen
                      name="Home"
                      component={props => (
                        <GeneralUserDrawer {...props} loginUser={loginUser} />
                      )}
                    />
                  </>
                ) : userRole === 'Dealer' ? (
                  <>
                    <Stack.Screen
                      name="Home"
                      component={props => (
                        <DealerDrawer {...props} loginUser={loginUser} />
                      )}
                    />
                  </>
                ) : (
                  <>
                    <Stack.Screen
                      name="HomeScreen"
                      // component={GeneralUserHomeScreen}
                      component={props => (
                        <MarketingDrawer {...props} loginUser={loginUser} />
                      )}
                      // component={props => (
                      //   <DealerDrawer {...props} loginUser={loginUser} />
                      // )}
                    />
                  </>
                )}
                {/* <Stack.Screen
                  name="Home"
                  component={props => (
                    <DrawerNavigation {...props} loginUser={loginUser} />
                  )}
                /> */}
                <Stack.Screen
                  name="Add Department"
                  component={AddDealerDepartmentScreen}
                />
                <Stack.Screen
                  name="EmployeeListScreen"
                  component={EmployeeListScreen}
                />
                <Stack.Screen name="Client" component={ClientScreen} />
                <Stack.Screen
                  name="Attendance Edit"
                  component={EmployeeAttendanceReport}
                />
                <Stack.Screen
                  name="EmployeeAttendanceReport"
                  component={EmployeeAttendanceReport}
                />
                <Stack.Screen
                  name="MarkAttendanceScreen"
                  component={MarkAttendanceScreen}
                />
                <Stack.Screen
                  name="SingleEmployeeReport"
                  component={SingleEmployeeAttendanceReport}
                />
                <Stack.Screen
                  name="EmployeeCustomerForm"
                  component={EmployeeCustomerForm}
                />
                <Stack.Screen
                  name="EditCompanyForm"
                  component={EditCompanyForm}
                />
                <Stack.Screen
                  name="DailyActivityReport"
                  component={DailyActivityReport}
                />
                <Stack.Screen
                  name="Daily Activity Report"
                  component={DailyActivityReport}
                />
                <Stack.Screen
                  name="ActivityReport"
                  component={ActivityReport}
                />
                <Stack.Screen
                  name="AddExpensesMarketing"
                  component={AddExpensesMarketing}
                />
                <Stack.Screen
                  name="Overall Activity Report"
                  component={ActivityReport}
                />
                <Stack.Screen
                  name="LogoutActivityForm"
                  component={LogoutActivityForm}
                />
                <Stack.Screen
                  name="Attendance Report"
                  component={AdminAttendanceReport}
                />
                <Stack.Screen
                  name="Branch wise"
                  component={AdminAttendanceReport}
                />
                <Stack.Screen name="My Budgets" component={BudgetSetup} />
                <Stack.Screen
                  name="Rate Card Setup"
                  component={RateCardSetup}
                />
                <Stack.Screen name="AddRateCard" component={AddRateCard} />
                <Stack.Screen name="Send Rate Card" component={SendRateCard} />
                <Stack.Screen
                  name="AddSendRateCard"
                  component={AddSendRateCard}
                />

                <Stack.Screen
                  name="SearchEmployee"
                  component={SearchEmployee}
                />
                <Stack.Screen name="AddEmployee" component={AddEmployee} />
                <Stack.Screen
                  name="Add Designation"
                  component={AddDealerDesignationScreen}
                />
                <Stack.Screen
                  name="DealerBuyerCategoryScreen"
                  component={DealerBuyerCategoryScreen}
                />
                <Stack.Screen
                  name="AddDealerBuyerCategoryScreen"
                  component={AddDealerBuyerCategoryScreen}
                />
                <Stack.Screen
                  name="DealerProductScreen"
                  component={DealerProductScreen}
                />
                <Stack.Screen
                  name="CommonDepartmentScreen"
                  component={DepartmentScreen}
                />
                <Stack.Screen
                  name="ProductPriceList"
                  component={ProductPriceList}
                />
                <Stack.Screen
                  name="PocketDiaryScreen"
                  component={PocketDiaryScreen}
                />
                <Stack.Screen
                  name="DealerBrandMasterScreen"
                  component={DealerBrandMasterScreen}
                />
                <Stack.Screen
                  name="AddDealerBrandMasterScreen"
                  component={AddDealerBrandMasterScreen}
                />
                <Stack.Screen
                  name="DealerBrandSetupScreen"
                  component={DealerBrandSetupScreen}
                />
                <Stack.Screen
                  name="AddDealerBrandSetupScreen"
                  component={AddDealerBrandSetupScreen}
                />
                <Stack.Screen
                  name="Basic Details"
                  component={DealerBasicDetailsScreen}
                />
                <Stack.Screen
                  name="My Services"
                  component={DealerMyServicesScreen}
                />
                <Stack.Screen
                  name="MyServicesScreen"
                  component={MyServicesScreen}
                />
                <Stack.Screen
                  name="AddDealerMyServicesScreen"
                  component={AddDealerMyServicesScreen}
                />
                <Stack.Screen
                  name="Presentation"
                  component={DealerPresentationScreen}
                />
                <Stack.Screen
                  name="Image Gallery"
                  component={ImageGalleryScreen}
                />
                <Stack.Screen name="Design Wise" component={DesignWiseScreen} />
                <Stack.Screen
                  name="Quotation Wise"
                  component={QuotationWiseScreen}
                />
                <Stack.Screen
                  name="App User Enquiry Wise"
                  component={EnquiryWise}
                />
                <Stack.Screen
                  name="Architect & Consultant-Boq"
                  component={ConsultantBoq}
                />
                <Stack.Screen name="Yet to start" component={ProjectYetStart} />
                <Stack.Screen name="On going" component={OnGoingProject} />

                <Stack.Screen
                  name="On Going Project Details"
                  component={OnGoingProjectDetails}
                />
                <Stack.Screen
                  name="My Estimations"
                  component={YourEstimationsScreen}
                />
                <Stack.Screen
                  name="MaterialCalculatorScreen"
                  component={MaterialCalculatorScreen}
                />
                <Stack.Screen
                  name="DesignYourDreamCategories"
                  component={Design}
                />
                <Stack.Screen
                  name="ImageGalleryWorkLocationScreen"
                  component={ImageGalleryWorkLocationScreen}
                />
                <Stack.Screen name="UserProfile" component={UserProfile} />
                <Stack.Screen
                  name="EstimationPreviewScreen"
                  component={EstimationPreviewScreen}
                />
                <Stack.Screen
                  name="GetEstimationScreen"
                  component={GetEstimationScreen}
                />
                <Stack.Screen
                  name="DesignYourDreamForm"
                  component={DesignyourdreamForm}
                />
                <Stack.Screen name="Menu" component={MenuItems} />
                <Stack.Screen
                  name="ApprovedUserScreen"
                  component={ApprovedUser}
                />
                <Stack.Screen
                  name="PendingUserScreen"
                  component={PendingUsers}
                />
                <Stack.Screen
                  name="DeclinedUserScreen"
                  component={DeclinedUserScreen}
                />
                <Stack.Screen
                  name="ActivityRolesScreen"
                  component={ActivityRolesScreen}
                />
                <Stack.Screen
                  name="AddActivityRolesScreen"
                  component={AddActivityRolesScreen}
                />
                <Stack.Screen name="ApiMaster" component={ApiMaster} />
                <Stack.Screen name="AddApiMaster" component={AddApiMaster} />
                <Stack.Screen name="ServicesScreen" component={Services} />
                <Stack.Screen name="AddService" component={AddServicesScreen} />
                <Stack.Screen
                  name="UnitOfSalesScreen"
                  component={UnitOfSalesScreen}
                />
                <Stack.Screen
                  name="AddUnitofSales"
                  component={AddUnitofSales}
                />
                <Stack.Screen name="CategoryScreen" component={Category} />
                <Stack.Screen
                  name="AddCategoryScreen"
                  component={AddCategoryScreen}
                />
                <Stack.Screen name="ProductScreen" component={ProductScreen} />
                <Stack.Screen
                  name="AddProductScreen"
                  component={AddProductScreen}
                />
                <Stack.Screen
                  name="ServiceProductScreen"
                  component={ServiceProductScreen}
                />
                <Stack.Screen
                  name="AddServiceProductScreen"
                  component={AddServiceProductScreen}
                />
                <Stack.Screen
                  name="DepartmentScreen"
                  component={DepartmentScreen}
                />
                <Stack.Screen
                  name="AddDepartmentScreen"
                  component={AddDepartmentScreen}
                />
                <Stack.Screen
                  name="LocationTypeScreen"
                  component={LocationTypeScreen}
                />
                <Stack.Screen
                  name="AddLocationTypeScreen"
                  component={AddLocationTypeScreen}
                />
                <Stack.Screen
                  name="CommonDesignationScreen"
                  component={DesignationScreen}
                />
                <Stack.Screen
                  name="DesignationScreen"
                  component={DesignationScreen}
                />

                <Stack.Screen
                  name="BranchListScreen"
                  component={BranchListScreen}
                />
                <Stack.Screen
                  name="BankListScreen"
                  component={BankListScreen}
                />
                <Stack.Screen
                  name="TransportationScreen"
                  component={TransportationScreen}
                />
                <Stack.Screen
                  name="AddDesignationScreen"
                  component={AddDesignationScreen}
                />
                <Stack.Screen
                  name="EWayBillScreen"
                  component={EWayBillScreen}
                />
                <Stack.Screen
                  name="AddEWayBillScreen"
                  component={AddEWayBillScreen}
                />
                <Stack.Screen name="SetupScreen" component={SetupScreen} />
                <Stack.Screen
                  name="AddSetupScreen"
                  component={AddSetupScreen}
                />
                <Stack.Screen
                  name="CategoryNameScreen"
                  component={CategoryNameScreen}
                />
                <Stack.Screen
                  name="GCategoryNameScreen"
                  component={CategoryNameScreen}
                />
                <Stack.Screen
                  name="AddCategoryNameScreen"
                  component={AddCategoryNameScreen}
                />
                <Stack.Screen
                  name="SubCategoryNameScreen"
                  component={SubCategoryNameScreen}
                />
                <Stack.Screen
                  name="GMyContactsScreen"
                  component={GMyContactsScreen}
                />
                <Stack.Screen
                  name="GSubCategoryNameScreen"
                  component={SubCategoryNameScreen}
                />
                <Stack.Screen
                  name="AddSubCategoryNameScreen"
                  component={AddSubCategoryNameScreen}
                />
                <Stack.Screen name="AddSourceList" component={AddSourceList} />
                <Stack.Screen
                  name="VerifyCompanySource"
                  component={VerifyCompanySource}
                />
                <Stack.Screen
                  name="VerifyCompanyExpense"
                  component={VerifyCompanyExpense}
                />
                <Stack.Screen
                  name="PocketDiaryInbox"
                  component={PocketDiaryInbox}
                />
                <Stack.Screen
                  name="ABrandConversationValue"
                  component={ABrandConversationValue}
                />
                <Stack.Screen
                  name="AddBrandConversationValue"
                  component={AddBrandConversationValue}
                />
                <Stack.Screen name="WidthOfGpCoil" component={WidthOfGpCoil} />
                <Stack.Screen
                  name="AddWidthOfGpCoil"
                  component={AddWidthOfGpCoil}
                />
                <Stack.Screen
                  name="MassOfZincCoating"
                  component={MassOfZincCoating}
                />
                <Stack.Screen
                  name="AddMassOfZincCoating"
                  component={AddMassOfZincCoating}
                />
                <Stack.Screen
                  name="WorkFloorScreen"
                  component={WorkFloorScreen}
                />
                <Stack.Screen
                  name="AddWorkFloorScreen"
                  component={AddWorkFloorScreen}
                />
                <Stack.Screen
                  name="WorkLocationScreen"
                  component={WorkLocationScreen}
                />
                <Stack.Screen
                  name="AddWorkLocationScreen"
                  component={AddWorkLocationScreen}
                />
                <Stack.Screen
                  name="DesignTypeScreen"
                  component={DesignTypeScreen}
                />
                <Stack.Screen
                  name="AddDesignTypeScreen"
                  component={AddDesignTypeScreen}
                />

                <Stack.Screen
                  name="MaterialSetupScreen"
                  component={MaterialSetupScreen}
                />
                <Stack.Screen
                  name="AddMaterialSetupScreen"
                  component={AddMaterialSetupScreen}
                />
                <Stack.Screen
                  name="PostNewDesignScreen"
                  component={PostNewDesignScreen}
                />
                <Stack.Screen
                  name="AddPostNewDesignScreen"
                  component={AddPostNewDesignScreen}
                />
                <Stack.Screen name="CustomerList" component={CustomerList} />
                <Stack.Screen
                  name="AddExpensesList"
                  component={AddExpensesList}
                />
                <Stack.Screen name="AddCompany" component={AddCompany} />
              </>
            </Stack.Navigator>
          </NavigationContainer>
          // <DrawerNavigation loginUser={loginUser} />
        )}
      </PaperProvider>
    </>
  );
}

export default App;
