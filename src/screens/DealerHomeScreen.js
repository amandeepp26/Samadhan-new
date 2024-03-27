import React,{useEffect} from 'react';
import {
  ScrollView,
  TouchableNativeFeedback,
  View,
  Modal,
  Image,
  ImageBackground,
  LogBox,
  Alert,
  Share,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Dimensions,
  Linking,
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Caption,
  Dialog,
  Paragraph,
  Portal,
  Snackbar,
  Text,
  Title,
  Divider,
  TextInput,
  Checkbox,
} from 'react-native-paper';
import {
  createNavigationContainerRef,
  StackActions,
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';
import {ImageSlider} from 'react-native-image-slider-banner';
import {communication} from '../utils/communication';
import ImageViewer from 'react-native-image-zoom-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FadeCarousel from 'rn-fade-carousel';
import {APIConverter} from '../utils/apiconverter';

import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  projectFixedDesignations,
  projectFixedLocationTypes,
  projectLoginTypes,
} from '../utils/credentials';

import {useCallback, useState} from 'react';
// import * as Location from "expo-location";
import Geolocation from 'react-native-geolocation-service';
import moment from 'moment';
import {check, PERMISSIONS, request} from 'react-native-permissions';
import Geocoder from 'react-native-geocoding';
import Provider from '../api/Provider';
import CreateSCCards from '../components/SCCards';
import FormInput from './Marketing/EmployeeActivity/common/Input';
import {theme} from '../theme/apptheme';
import {Styles} from '../styles/styles';
import {Icon} from 'react-native-elements';

export const navigationRef = createNavigationContainerRef();
let roleID = 0,
  userID = 0,
  groupRefNo = 0,
  groupRefExtraNo = 0,
  designID = 0,
  companyID = 0,
  companyAdminGroupID = 0,
  branchID = 0,
  locationType = 0,
  redirectToProfileFlag = 0,
  profileAddressFlag = 0;

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Material-UI: The `css` function is deprecated. Use the `styleFunctionSx` instead',
]);

const DealerHomeScreen = ({route,loginUser, navigation}) => {
  //#region Variables
  const [snackbarText, setSnackbarText] = useState('');
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState('');
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [userRoleName, setUserRoleName] = useState('');
  const [userName, setUserName] = useState('');
  // const [userRoleName, setUserRoleName] = useState(
  //   route.params.userDetails[0].RoleName
  // );
  const [userRoleID, setUserRoleID] = useState('');
    const screenWidth = Dimensions.get('window').width;

    const itemWidth = (screenWidth - 10) / 5;


  const [imageGalleryData, setImageGalleryData] = useState([]);
  const [catalogueCategoryImages, setCatalogueCategoryImages] = useState([]);
  const [catalogueImagesZoom, setCatalogueImagesZoom] = useState([]);
  const [catalogueImagesZoomVisible, setCatalogueImagesZoomVisible] =
    useState(false);
  const [catalogueImages, setCatalogueImages] = useState([]);

  const [userCountData, setUserCountData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [roleName, setRoleName] = useState('');
  const [switchRoleNames, setSwitchRoleNames] = useState([]);
  const [userRoleData, setUserRoleData] = useState([]);
  const [errorRole, setErrorRole] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isDialogVisible2, setIsDialogVisible2] = useState(false);
  const [isProfileDialogVisible, setIsProfileDialogVisible] = useState(false);

  const [availableRawMaterialKg, setAvailableRawMaterialKg] = useState('');
  const [availableRawMaterialNo, setAvailableRawMaterialNo] = useState('');
  const [productionDoneKg, setProductionDoneKg] = useState('');
  const [productionDoneNo, setProductionDoneNo] = useState('');
  const [scrapWastage, setScrapWastage] = useState('');

  const [singleLoad, setSingleLoad] = useState(0);

  // employee activity dashboard
  const [locationGranted, setLocationGranted] = React.useState(false);
  const [location, setLocation] = React.useState();
  const [markActivityModalVisible, setMarkActivityModalVisible] =
    React.useState(false);
  const [activity, setActivity] = React.useState();
  const [lastActivityData, setLastActivityData] = React.useState();
  const [distance, setDistance] = React.useState();
  const isFocused = useIsFocused();
  const [activityType, setActivityType] = React.useState([]);
  const [activityRefNo, setActivityRefNo] = React.useState();
  const [isPolling, setIsPolling] = React.useState(false);
  const [lastTracked, setLastTracked] = React.useState();
  const [liveLocation, setLiveLocation] = React.useState();
  const [errorMsg, setErrorMsg] = React.useState();
  const [isLoginProcessing, setIsLoginProcessing] = React.useState(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isMarkingActivityInProcess, setIsMarkingActivityInProcess] =
    React.useState(false);

  const [isActivityCreating, setIsActivityCreating] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [profileIcon, setProfileIcon] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [menuLoading, setMenuLoading] = useState(true);
  const itemsToShow = showAll ? menuData : menuData.slice(0, 7);

  //#endregion
  //#region Functions
useEffect(() => {
  AsyncStorage.setItem('profilePic', profileIcon);
}, [isFocused]);

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: 'https://samadhanerp.com/apk/diamond-samadhan-testkit.apk',
        title: 'Diamond Samadhan Test Kit',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (e) {
      Alert.alert(e.message);
    }
  };

  const slidesTwo = [
    {
      img: 'https://media.designcafe.com/wp-content/uploads/2022/03/29183837/inspirational-interior-design-quotes-with-beautiful-carvings.jpg',
    },
    {
      img: 'https://www.dkorinteriors.com/wp-content/uploads/2017/10/Before-and-After_-Contemporary-Coral-Gables-Dream-Home4.jpg',
    },
    {
      img: 'https://miro.medium.com/v2/resize:fit:1000/1*6TEV3okMjlmin8O6jPrCAw.jpeg',
    },

    // <Image
    //   source={require('../../assets/dreamone.jpg')}
    //   style={Styles.flex1}
    //   resizeMode="cover"
    // />,
    // <Image
    //   source={require('../../assets/dreamtwo.jpg')}
    //   style={Styles.flex1}
    //   resizeMode="cover"
    // />,
    // <Image
    //   source={require('../../assets/dreamthree.jpg')}
    //   style={Styles.flex1}
    //   resizeMode="cover"
    // />,
    // <Image
    //   source={require('../../assets/dreamfour.jpg')}
    //   style={Styles.flex1}
    //   resizeMode="cover"
    // />,
  ];

  const LogoutUser = async () => {
    Alert.alert('Are you sure?', 'Do you want to logout', [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await AsyncStorage.setItem('user', '{}');
            navigationRef.dispatch(StackActions.replace('Login'));
          } catch (error) {
            console.log(error);
          }
        },
      },
    ]);
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
  const FetchImageGalleryData = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupRefNo,
      },
    };
    Provider.createDFDashboard(
      Provider.API_URLS.GetdashboardServicecatalogue,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            // response.data.data = APIConverter(response.data.data);
            setImageGalleryData(response.data.data);
          }
        } else {
          setImageGalleryData([]);
        }
        setIsLoading(false);
      })
      .catch(e => {
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setIsSnackbarVisible(true);
      });
  };

  const GetServiceCatalogue = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupRefNo,
      },
    };
    Provider.createDFDashboard(
      Provider.API_URLS.GetdashboardServicecatalogue,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
         if (response && response.length > 0) {
           const categoryImageData = [];
           const sliderImageData = [];
           const sliderImageZoomData = [];
           response.forEach(data => {
             categoryImageData.push({
               image: data.design_image_url,
               text: data.designtype_name,
             });
             sliderImageData.push({
               img: data.design_image_url,
             });
             sliderImageZoomData.push({
               url: data.design_image_url,
             });
           });
           setCatalogueCategoryImages(categoryImageData);
           setCatalogueImages(sliderImageData);
           setCatalogueImagesZoom(sliderImageZoomData);
         }

        }
        setIsLoading(false);
      })
      .catch(e => {
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setIsSnackbarVisible(true);
      });
  };

  const GetUserCount = (userID, groupRefNo) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupRefNo,
      },
    };
    Provider.createDFDashboard(Provider.API_URLS.GetdashboardTotaluser, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          setTotalUsers(response.data.data[0].TotalUsers);
          let usr_data = [
            {
              roleID: 0,
              roleName: 'Dealer',
              screen: '',
              roleCount: response.data.data[0].TotalDealer,
            },
            {
              roleID: 1,
              roleName: 'Contractor',
              screen: '',
              roleCount: response.data.data[0].TotalContractor,
            },
            {
              roleID: 2,
              roleName: 'General User',
              screen: 'General ',
              roleCount: response.data.data[0].TotalGeneralUser,
            },
            {
              roleID: 3,
              roleName: 'Architect',
              screen: '',
              roleCount: response.data.data[0].TotalArchitect,
            },
            {
              roleID: 4,
              roleName: 'Client',
              screen: '',
              roleCount: response.data.data[0].TotalClient,
            },
          ];

          _user_count = usr_data;
          setUserCountData(usr_data);
        }
        // setIsLoading(false);
      })
      .catch(e => {
        setIsLoading(false);
      });
  };

  const ActivityStatus = from => {
    if (from === 'logout_success') {
      const login = {
        isLogin: false,
      };
      StoreLoggedInUser(login);
      setLocation('');
      setIsLoggedIn(false);
      setIsLoggingOut(false);

      setSnackbarText('Logout Successfully');
      setSnackbarColor(theme.colors.success);
      setIsSnackbarVisible(true);
    } else if (from === 'activity_success') {
      setSnackbarText('Activity Created Successfully');
      setSnackbarColor(theme.colors.success);
      setIsSnackbarVisible(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const refreshScreen = () => {
        // Refresh the screen here
        if (singleLoad == 0) {
          GetUserData();
        }
      };
      refreshScreen();
      return () => {};
    }, [navigationRef]),
  );

  const GetUserData = async () => {
    const login = await AsyncStorage.getItem('loggedIn');
    if (login !== null) {
      const loginData = JSON.parse(login);
      if (loginData.isLogin) {
        setIsLoggedIn(true);
      }
    }

    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      setSingleLoad(1);
      const userDataParsed = JSON.parse(userData);
      GetUserProfileIcon(userDataParsed.UserID);
      roleID = userDataParsed.RoleID;
      userID = userDataParsed.UserID;
      groupRefNo = userDataParsed.Sess_group_refno;
      groupRefExtraNo = userDataParsed.Sess_group_refno_extra_1;
      designID = userDataParsed.Sess_designation_refno;
      companyAdminGroupID = userDataParsed.Sess_CompanyAdmin_group_refno;
      locationType = userDataParsed.Sess_locationtype_refno;
      companyID = userDataParsed.Sess_company_refno;
      branchID = userDataParsed.Sess_branch_refno;

      if (
        (userDataParsed.RoleID == projectLoginTypes.DEF_DEALER_GROUP_REFNO ||
          userDataParsed.RoleID ==
            projectLoginTypes.DEF_CONTRACTOR_GROUP_REFNO ||
          userDataParsed.RoleID ==
            projectLoginTypes.DEF_ARCHITECTCONSULTANT_GROUP_REFNO) &&
        userDataParsed.Sess_company_refno == 0
      ) {
        redirectToProfileFlag = 1;
      } else {
        redirectToProfileFlag = 0;
      }

      if (
        userDataParsed.RoleID == 3 &&
        userDataParsed.Sess_profile_address == 0
      ) {
        profileAddressFlag = 1;
      } else {
        profileAddressFlag = 0;
      }

      let roleName = '';
      switch (roleID) {
        case '1':
          roleName = 'Super Admin';
          break;
        case '2':
          roleName = 'Admin';
          break;
        case '3':
          roleName = 'General User';
          break;
        case '4':
          roleName = 'Dealer';
          break;
        case '5':
          roleName = 'Contractor';
          break;
        case '7':
          if (
            designID ==
            projectFixedDesignations.DEF_MARKETINGEXECUTIVE_DESIGNATION_REFNO
          ) {
            roleName = 'Marketing Executive';
          } else if (
            groupRefExtraNo == projectLoginTypes.DEF_MENUFACTURER_GROUP_REFNO
          ) {
            roleName = 'Menufacturer Incharge';
          } else if (
            designID ==
            projectFixedDesignations.DEF_PROJECTSUPERVISOR_DESIGNATION_REFNO
          ) {
            roleName = 'Supervisor';
          } else if (
            designID ==
            projectFixedDesignations.DEF_BRANCHADMIN_DESIGNATION_REFNO
          ) {
            roleName = 'Branch Admin';
          } else {
            roleName = 'General Employee';
          }
          break;
        case '8':
          roleName = 'Client';
          break;
        case '9':
          roleName = 'Architect And Consultant (PMC)';
          break;
        case '10':
          roleName = 'Project Supervisor';
          break;
        case '11':
          roleName = 'Contractor Branch Admin';
          break;
        case '12':
          roleName = 'Dealer Branch Admin';
          break;
        case '13':
          roleName = 'Supplier';
          break;
        case '14':
          roleName = 'Vendor';
          break;
      }
      setUserRoleID(roleID);
      setUserRoleName(roleName);
      // AsyncStorage.setItem('userRole', roleName);
      GetServiceCatalogue();
      FetchImageGalleryData();
      GetUserCount(userID, groupRefNo);
      if (roleID == 3) {
        FillUserRoles();
      } else if (roleID == 7) {
        FetchManufactoringData();
      }
    }
  };

    const openAppSettings = () => {
      Linking.openSettings();
    };
    
   const requestLocationPermission = async () => {
     try {
       if (Platform.OS === 'android') {
         const granted = await PermissionsAndroid.request(
           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
           {
             title: 'Location Permission',
             message: 'This app requires access to your location.',
             buttonNeutral: 'Ask Me Later',
             buttonNegative: 'Cancel',
             buttonPositive: 'OK',
           },
         );
         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
           setLocationGranted(true);
           // Permission granted, proceed with obtaining location
           getLocation();
         } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
           // Permission denied permanently, guide user to app settings
           Alert.alert(
             'Permission Denied',
             'Please enable location permission from app settings to use this feature.',
             [
               {
                 text: 'Cancel',
                 onPress: () => console.log('Cancel Pressed'),
                 style: 'cancel',
               },
               {text: 'Open Settings', onPress: openAppSettings},
             ],
           );
         } else {
           setLocationGranted(false);
           setErrorMsg('Permission to access location was denied');
         }
       } else {
         // For iOS, location permission is granted by default
         setLocationGranted(true);
         // Proceed with obtaining location
         getLocation();
       }
     } catch (err) {
       console.warn(err);
     }
   };
  // employee activity functions --start
  Geocoder.init('AIzaSyB_SCxCebFiFojXQFe_odsJQhbIrpO4Jwc');
  const getLocation = async log_text => {
    // const address = await Geolocation.reverseGeocodeAsync(locationGps?.coords);
    if(locationGranted){
    Geolocation.getCurrentPosition(
      async locationGps => {
        if (locationGps) {
          // const {latitude, longitude} = locationGps.coords;
          const address = await Geocoder.from(
            locationGps.coords.latitude,
            locationGps?.coords?.longitude,
          )
            .then(json => {
              var addressComponent = json;
              return addressComponent;
            })
            .catch(error => console.warn(error));
          setLocationGranted(true);
          const currLoc = {
            latitude: locationGps?.coords?.latitude,
            longitude: locationGps?.coords?.longitude,
            gprs_location_name: address.results[0].formatted_address,
            // gprs_location_name: `${address[0]?.street}, ${
            //   address[0]?.district
            // }, ${address[0]?.city}, ${
            //   address[0]?.region == ''
            //     ? address[0]?.subregion == ''
            //       ? ''
            //       : address[0]?.subregion
            //     : address[0]?.region
            // }, ${address[0]?.country}`,
          };
          setLocation(currLoc);

          if (log_text == 'login') {
            let params = {
              data: {
                Sess_UserRefno: userID,
                Sess_company_refno: companyID,
                Sess_branch_refno: branchID,
                Sess_group_refno: groupRefNo,
                Sess_designation_refno: designID,
                login_date_time: moment(new Date()).format(
                  'DD-MM-YYYY H:mm:ss',
                ),
                ...currLoc,
              },
            };
            await Provider.createDFEmployee(
              Provider.API_URLS.employee_gprs_login,
              params,
            )
              .then(res => {
                const login = {
                  isLogin: true,
                };
                StoreLoggedInUser(login);

                setSnackbarColor(theme.colors.success);
                setSnackbarText('Logged in successfully');
                setIsSnackbarVisible(true);

                setIsLoggedIn(true);
                setIsLoginProcessing(false);
                return;
              })
              .catch(error => {
                setSnackbarColor(theme.colors.error);
                setSnackbarText('Pls Try Again');
                setIsSnackbarVisible(true);

                setIsLoggedIn(false);
                setIsLoginProcessing(false);
                return;
              });
            setIsLoginProcessing(false);
          } else if (log_text == 'logout') {
            setIsLoggingOut(false);
            navigation.navigate('LogoutActivityForm', {
              activityStatus: ActivityStatus,
              data: {
                location: currLoc,
              },
            });
          } else if (log_text == 'mark_activity') {
            setIsMarkingActivityInProcess(false);
            navigation.navigate('DailyActivityForm', {
              activityStatus: ActivityStatus,
              data: {
                location: currLoc,
              },
            });
          }
        } else {
          setSnackbarColor(theme.colors.error);
          setSnackbarText('Pls Try Again');
          setIsSnackbarVisible(true);
        }
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
    }
    else{
      requestLocationPermission();
    }
  };

  const promptToEnableLocationFromSettings = async () => {
    const message =
      'Location permission is required for the app to function properly. Please enable location permissions from the app settings.';
    const settingsUrl = Platform.select({
      ios: 'app-settings:',
      android: 'com.samadhan', // Replace with your app's package name
    });

    // Prompt the user to open the app settings
    try {
      await Linking.openSettings();
      // You can provide additional feedback to the user if needed
    } catch (error) {
      console.error('Unable to open app settings:', error);
    }
  };

  React.useEffect(() => {}, [
    location,
    isLoginProcessing,
    isMarkingActivityInProcess,
  ]);

  React.useEffect(() => {}, [isLoggedIn, isLoginProcessing, isLoggingOut]);

  const getLiveLocation = async () => {
    let {status} = await Geolocation.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let locationGps = await Geolocation.getCurrentPositionAsync({});
    const address = await Geolocation.reverseGeocodeAsync(locationGps?.coords);

    setLiveLocation({
      latitude: locationGps?.coords?.latitude,
      longitude: locationGps?.coords?.longitude,
      login_date_time: moment(new Date())
        .format('DD-MM-YYYY H:mm:ss')
        .unix(locationGps?.timestamp)
        .format('DD-MM-yyyy HH:mm:ss'),
      logout_date_time: moment
        .unix(locationGps?.timestamp)
        .format('DD-MM-yyyy HH:mm:ss'),
      gprs_location_name: `${address[0]?.street}, ${address[0]?.district}, ${
        address[0]?.city
      }, ${
        address[0]?.region == ''
          ? address[0]?.subregion == ''
            ? ''
            : address[0]?.subregion
          : address[0]?.region
      }, ${address[0]?.country}`,
    });
  };

  const getLastTracked = async () => {
    await Provider.createDFEmployee(
      Provider.API_URLS.get_employee_last_livetracking_gprs_data,
      {
        data: {
          Sess_UserRefno: userID,
        },
      },
    )
      .then(res => {})
      .catch(error => {
        console.log(error);
      });
  };

  const trackUserLocation = async () => {
    await getLastTracked();
    // if (lastTracked) {
    await getLiveLocation();
    // }
  };

  const fetchActivityType = () => {
    navigation.navigate('AddExpensesList');
    // setIsMarkingActivityInProcess(true);
    // if (isLoggedIn) {
    //   getLocation("mark_activity");
    // }
    // else {
    //   setSnackbarColor(theme.colors.error);
    //   setSnackbarText("Please login before marking activity");
    //   setIsSnackbarVisible(true);
    // }
  };

  const createActivity = async () => {
    if (activityRefNo) {
      setIsActivityCreating(true);
      await getLocation('mark_activity');
    } else {
      setSnackbarColor(theme.colors.error);
      setSnackbarText('Activity Type is Required');
      setIsSnackbarVisible(true);
      setIsActivityCreating(false);
    }
  };

  const [list, setlist] = useState([]);
  const fetchUser = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('user'));
    Sess_UserRefno = data.UserID;
    Sess_company_refno = data.Sess_company_refno;
    Sess_branch_refno = data.Sess_branch_refno;
    Sess_group_refno = data.Sess_group_refno;
    Sess_designation_refno = data.Sess_designation_refno;

    Provider.createDFCommon(
      Provider.API_URLS.getservicenamedealermyserviceform,
      {data: {}},
    ).then(response => {
      if (response.data && response.data.data) {
        setlist(
          response.data.data.map(item => {
            return {
              ...item,
              checked: false,
            };
          }),
        );
      }
    });
  };

  React.useEffect(() => {
    if (isFocused) {
      userID = 0;
      groupRefNo = 0;
      groupRefExtraNo = 0;
      designID = 0;
      companyID = 0;
      companyAdminGroupID = 0;
      branchID = 0;
      locationType = 0;
      redirectToProfileFlag = 0;
      profileAddressFlag = 0;
      fetchUser();
      getMenuList();
      GetUserDetails();
    }
  }, [isFocused]);

  React.useEffect(() => {
    (async () => await getLocation())();
  }, []);

  // React.useEffect(() => {
  //   const timer = setInterval(() => {
  //     trackUserLocation();
  //   }, 15000);

  //   return () => clearInterval(timer);
  // }, []);

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    setDistance(d);
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
  const calcKm = (lat1, lon1, lat2, lon2) => {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a =
      0.5 -
      c((lat2 - lat1) * p) / 2 +
      (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    const km = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    setDistance(km.toFixed(4));
    return km.toFixed(4);
  };

  const loginMarketer = async () => {
    if (!isLoggedIn) {
      setIsLoginProcessing(true);
      await getLocation('login');
    } else {
      setSnackbarColor(theme.colors.error);
      setSnackbarText('Already Logged In');
      setIsSnackbarVisible(true);
    }
  };

  const logoutMarketer = async () => {
    if (isLoggedIn) {
      setIsLoggingOut(true);
      await getLocation('logout');
    } else {
      setSnackbarColor(theme.colors.error);
      setSnackbarText('Please login before logout');
      setIsSnackbarVisible(true);
    }
  };
  //employee activity functions -end

  const showDialog = () => setIsDialogVisible(true);
  const hideDialog = () => setIsDialogVisible(false);

  const showProfileDialog = () => setIsProfileDialogVisible(true);
  const hideProfileDialog = () => setIsProfileDialogVisible(false);

  const SingleCardClick = (headerTitle, categoryID, data) => {
    if (redirectToProfileFlag == 1) {
      showProfileDialog();
    } else {
      navigation.navigate('ImageGalleryWorkLocationScreen', {
        headerTitle: headerTitle,
        categoryID: categoryID,
        data: data,
        from: 'home',
        isContractor: userRoleName === 'Contractor' ? true : false,
      });
    }
  };

  const onRoleSelected = role => {
    setErrorRole(false);
    setRoleName(role);
  };

  const ValidateSwitchRole = () => {
    if (profileAddressFlag == 1) {
      showProfileDialog();
    } else {
      if (roleName.length === 0) {
        setErrorRole(true);
      } else {
        showDialog();
      }
    }
    if (roleName.length === 0) {
      setErrorRole(true);
    } else {
      showDialog();
    }
  };

  const StoreUserData = async user => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    route.params.setUserFunc();
  };

  const StoreLoggedInUser = async login => {
    try {
      await AsyncStorage.setItem('loggedIn', JSON.stringify(login));
    } catch (error) {}
  };

  const RedirectToProfile = () => {
    hideProfileDialog();
    navigation.navigate('UserProfile', {from: 'adm_profile'});
  };

  const UpdateUserRole = () => {
    hideDialog();
    //dialogue open here

    //only applicable to delar and contractor  - 2nd dialogue // 4 and 5 ref no

    const role_id = userRoleData.filter(el => {
      return el.roleName === roleName;
    })[0].roleID;
    if (role_id == 9) {
      SwitchRoleFunc();
    } else {
      setIsDialogVisible2(true);
    }
  };

  const SwitchRoleFunc = () => {
    setIsButtonLoading(true);
    const params = {
      data: {
        Sess_UserRefno: userID,
        switchto_group_refno: userRoleData.filter(el => {
          return el.roleName === roleName;
        })[0].roleID,
        service_refno: [],
      },
    };
    if (params.switchto_group_refno != 9) {
      let temp_list = [];
      list.map(item => {
        if (item.checked) {
          temp_list.push(item.service_refno);
        }
      });
      params.data.service_refno = temp_list;
    }

    console.log('params:**********', params, '*======================*');
    setIsDialogVisible2(false);
    Provider.createDFDashboard(
      Provider.API_URLS.Getdashboard_Userswitchto_Proceed,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          setUserRoleName(roleName);
          GetUserCount();
          //   GetUserDetails(userID);
        } else {
          setSnackbarColor(theme.colors.error);
          setSnackbarText(communication.NoData);
          setIsSnackbarVisible(true);
        }
        setIsButtonLoading(false);
      })
      .catch(e => {
        setSnackbarColor(theme.colors.error);
        setSnackbarText(e.message);
        setIsSnackbarVisible(true);
        setIsButtonLoading(false);
      });
  };
  const GetUserDetails = async () => {
    setIsButtonLoading(true);
    const data = JSON.parse(await AsyncStorage.getItem('user'));
    let params = {
      data: {
        user_refno: data.UserID,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.UserFromRefNo, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          setUserName(response.data.data.Sess_FName);
          AsyncStorage.setItem('userName', response.data.data.Sess_FName);
          const user = {
            UserID: data.UserID,
            FullName:
              response.data.data.Sess_FName === ''
                ? response.data.data.Sess_Username
                : '',
            RoleID: response.data.data.Sess_group_refno,
            RoleName: response.data.data.Sess_Username,
            Sess_FName: response.data.data.Sess_FName,
            Sess_MobileNo: response.data.data.Sess_MobileNo,
            Sess_Username: response.data.data.Sess_Username,
            Sess_role_refno: response.data.data.Sess_role_refno,
            Sess_group_refno: response.data.data.Sess_group_refno,
            Sess_designation_refno: response.data.data.Sess_designation_refno,
            Sess_locationtype_refno: response.data.data.Sess_locationtype_refno,
            Sess_group_refno_extra_1:
              response.data.data.Sess_group_refno_extra_1,
            Sess_User_All_GroupRefnos:
              response.data.data.Sess_User_All_GroupRefnos,
            Sess_branch_refno: response.data.data.Sess_branch_refno,
            Sess_company_refno: response.data.data.Sess_company_refno,
            Sess_CompanyAdmin_UserRefno:
              response.data.data.Sess_CompanyAdmin_UserRefno,
            Sess_CompanyAdmin_group_refno:
              response.data.data.Sess_CompanyAdmin_group_refno,
            Sess_RegionalOffice_Branch_Refno:
              response.data.data.Sess_RegionalOffice_Branch_Refno,
            Sess_menu_refno_list: response.data.data.Sess_menu_refno_list,
            Sess_empe_refno: response.data.data.Sess_empe_refno,
            Sess_profile_address: response.data.data.Sess_profile_address,
          };

          StoreUserData(user);
        } else {
          setSnackbarColor(theme.colors.error);
          setSnackbarText(communication.InvalidUserNotExists);
          setIsSnackbarVisible(true);
        }
        setIsButtonLoading(false);
      })
      .catch(e => {
        setSnackbarColor(theme.colors.error);
        setSnackbarText(e.message);
        setIsSnackbarVisible(true);
        setIsButtonLoading(false);
      });
  };

  const GetUserProfileIcon = user_refno => {
    let params = {
      data: {
        user_refno: user_refno,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.UserFromRefNo, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data.Sess_photo != '') {
            setProfileIcon(response.data.data.Sess_photo);
            AsyncStorage.setItem('profilePic', response.data.data.Sess_photo);
          } else {
            setProfileIcon(null);
          }
        }
      })
      .catch(e => {
        setSnackbarColor(theme.colors.error);
        setSnackbarText(e.message);
        setIsSnackbarVisible(true);
        setIsButtonLoading(false);
      });
  };

  const FillUserRoles = () => {
    const params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupRefNo,
      },
    };
    Provider.createDFDashboard(
      Provider.API_URLS.GetdashboardUserswitchto,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          let d = [],
            userRoleNames = [];
          for (var key in response.data.data[0]) {
            if (response.data.data[0].hasOwnProperty(key)) {
              d.push({
                roleID: key,
                roleName: response.data.data[0][key],
              });

              userRoleNames.push(response.data.data[0][key]);
            }
          }

          setUserRoleData(d);
          setSwitchRoleNames(userRoleNames);
        } else {
          setSnackbarColor(theme.colors.error);
          setSnackbarText(communication.NoData);
          setIsSnackbarVisible(true);
        }
        setIsButtonLoading(false);
      })
      .catch(e => {
        setSnackbarColor(theme.colors.error);
        setSnackbarText(e.message);
        setIsSnackbarVisible(true);
        setIsButtonLoading(false);
      });
  };

  const FetchManufactoringData = () => {
    const params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
      },
    };
    Provider.createDFManufacturer(
      Provider.API_URLS.summaryofmaterial_gridlist,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          setAvailableRawMaterialKg(
            parseFloat(
              parseFloat(response.data.data.Available_Raw_Materials_Kg_Total) +
                parseFloat(response.data.data.slitting_invoice_scrap_total),
            ).toFixed(3),
          );
          setAvailableRawMaterialNo(
            response.data.data.Available_Raw_Materials_Nos_Total,
          );
          setProductionDoneKg(response.data.data.Production_Done_Kg_Total);
          setProductionDoneNo(response.data.data.Production_Done_Nos_Total);
          setScrapWastage(response.data.data.net_scrab_wastage);
        } else {
          setSnackbarColor(theme.colors.error);
          setSnackbarText(communication.NoData);
          setIsSnackbarVisible(true);
        }
        setIsButtonLoading(false);
      })
      .catch(e => {
        setSnackbarColor(theme.colors.error);
        setSnackbarText(e.message);
        setIsSnackbarVisible(true);
        setIsButtonLoading(false);
      });
  };

  //#endregion

  return (
    <SafeAreaView style={[{flex: 1}]}>
      <View style={[Styles.flex1, Styles.backgroundColorFullWhite]}>
        <View style={[style.header, Styles.BottomShadow]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Image
                source={
                  profileIcon != null
                    ? {uri: profileIcon}
                    : require('../../assets/defaultIcon.png')
                }
                style={{width: 50, height: 50, borderRadius: 50}}
              />
              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: 50,
                  padding: 2,
                  width: 22,
                  height: 22,
                  justifyContent: 'center',
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                }}>
                <Icon
                  name="menu-outline"
                  type="ionicon"
                  color={'white'}
                  size={15}
                />
              </View>
            </TouchableOpacity>
            <View style={Styles.marginHorizontal12}>
              <Text
                style={[
                  Styles.fontBold,
                  Styles.fontSize20,
                  Styles.primaryColor,
                ]}>
                {userName}
              </Text>
              <Text>{userRoleName}</Text>
            </View>
          </View>
          <View style={[Styles.flexRow, Styles.SpaceEvenly]}>
            <Icon
              name="notifications"
              type="ionicon"
              size={27}
              color={'#FFDB58'}
            />
            <TouchableOpacity
              onPress={() => {
                AsyncStorage.removeItem('user'),
                  AsyncStorage.removeItem('profilePic'),
                  loginUser();
              }}
              style={{marginLeft: 10}}>
              <Icon
                name="log-out-outline"
                type="ionicon"
                size={27}
                color={'#000'}
              />
            </TouchableOpacity>
          </View>
        </View>
        {isLoading ? (
          <View
            style={[
              Styles.flex1,
              Styles.flexGrow,
              Styles.flexJustifyCenter,
              Styles.flexAlignCenter,
            ]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : (
          <ScrollView>
            {userRoleID === '2' ? (
              <View>
                <View
                  style={[
                    Styles.paddingTop16,
                    Styles.paddingHorizontal16,
                    Styles.paddingBottom24,
                  ]}>
                  <Text style={[Styles.HomeTitle]}>Enquiries and Status</Text>
                  <View
                    style={[
                      Styles.marginTop16,
                      Styles.flexSpaceBetween,
                      Styles.flexRow,
                    ]}>
                    <View
                      style={[
                        Styles.height80,
                        Styles.borderRadius8,
                        Styles.backgroundGreen,
                        Styles.padding14,
                        Styles.boxElevation,
                        {width: 156},
                      ]}>
                      <Icon
                        name="microsoft-xbox-controller-menu"
                        size={24}
                        color={theme.colors.textLight}
                      />
                      <Text
                        style={[
                          Styles.fontSize16,
                          {
                            color: '#fff',
                            width: '100%',
                            fontWeight: 'bold',
                            position: 'absolute',
                            bottom: 14,
                            left: 14,
                          },
                        ]}>
                        General Enquiry
                      </Text>
                    </View>
                    <View
                      style={[
                        Styles.height80,
                        Styles.borderRadius8,
                        Styles.backgroundGreen,
                        Styles.padding14,
                        Styles.boxElevation,
                        {width: 156},
                      ]}>
                      <Icon
                        name="clipboard-list"
                        size={24}
                        color={theme.colors.textLight}
                      />
                      <Text
                        style={[
                          Styles.fontSize16,
                          {
                            color: '#fff',
                            width: '100%',
                            fontWeight: 'bold',
                            position: 'absolute',
                            bottom: 14,
                            left: 14,
                          },
                        ]}>
                        BOQ Enquiry
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    Styles.width100per,
                    Styles.boxTopElevation,
                    Styles.borderTopRadius24,
                    Styles.paddingTop12,
                    Styles.paddingBottom16,
                  ]}>
                  <View style={[Styles.paddingHorizontal16]}>
                    <View
                      style={[
                        Styles.horizontalArrowLineBG,
                        Styles.flexAlignSelfCenter,
                        Styles.borderRadius16,
                        Styles.marginBottom16,
                        {width: '20%', height: 6},
                      ]}></View>
                    <View>
                      <Text style={[Styles.HomeTitle]}>Users</Text>
                    </View>
                    <View style={[Styles.paddingTop16]}>
                      <View
                        style={[
                          Styles.borderRadius8,
                          Styles.homeBox,
                          Styles.paddingHorizontal12,
                          Styles.paddingVertical8,
                          Styles.flexRow,
                          Styles.flexAlignCenter,
                          {height: 92},
                        ]}>
                        {userCountData?.map((user, index) => (
                          <>
                            <TouchableOpacity
                              key={user?.roleID}
                              style={[Styles.width70]}
                              onPress={() => {
                                navigation.navigate('ApprovedUserScreen', {
                                  type: 'add',
                                  role: user?.roleName,
                                });
                              }}>
                              <Text style={[Styles.userCount]}>
                                {user != null ? user?.roleCount : '0'}
                              </Text>
                              <Text
                                style={[
                                  Styles.userCountLabel,
                                  Styles.marginTop4,
                                ]}>
                                {user != null ? user?.roleName : ''}
                              </Text>
                            </TouchableOpacity>
                            {userCountData.length - 1 !== index && (
                              <View
                                key={user?.roleID}
                                style={[Styles.userCountDevider]}
                              />
                            )}
                          </>
                        ))}
                      </View>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('ApprovedUserScreen', {
                              type: 'add',
                            });
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.homeBox,
                            {width: 100, height: 56},
                          ]}>
                          <Icon
                            name="check-decagram"
                            size={22}
                            color={theme.colors.success}
                          />
                          <Text style={[Styles.buttonIconLabel]}>Approved</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('PendingUserScreen', {
                              type: 'add',
                            });
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.homeBox,
                            {width: 100, height: 56},
                          ]}>
                          <Icon
                            name="clock-alert"
                            size={22}
                            color={theme.colors.pendingIcon}
                          />
                          <Text style={[Styles.buttonIconLabel]}>Pending</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('DeclinedUserScreen', {
                              type: 'add',
                            });
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.homeBox,
                            {width: 100, height: 56},
                          ]}>
                          <Icon
                            name="close-circle"
                            size={22}
                            color={theme.colors.error}
                          />
                          <Text style={[Styles.buttonIconLabel]}>Decline</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={[
                        Styles.marginTop16,
                        Styles.borderRadius8,
                        Styles.homeBox,
                        {height: 140},
                      ]}>
                      <ImageBackground
                        source={require('../../assets/user-access.jpg')}
                        resizeMode="cover"
                        style={[{flex: 1, justifyContent: 'center'}]}
                        imageStyle={{borderRadius: 8}}>
                        <Text
                          style={[
                            Styles.positionAbsolute,
                            Styles.marginTop8,
                            Styles.marginStart16,
                            Styles.fontSize18,
                            Styles.textColorWhite,
                            Styles.fontBold,
                            {top: 8},
                          ]}>
                          Control User Access
                        </Text>
                      </ImageBackground>
                    </View>
                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>Service Catalogue</Text>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('WorkFloorScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.serviceCatelogueIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Work Floor
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('WorkLocationScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="map-marker-radius"
                            size={22}
                            color={theme.colors.serviceCatelogueIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Work Location
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('DesignTypeScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="drawing-box"
                            size={22}
                            color={theme.colors.serviceCatelogueIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Design Type
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('MaterialSetupScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.serviceCatelogueIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Materials Setup
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('PostNewDesignScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="home-city"
                            size={22}
                            color={theme.colors.serviceCatelogueIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Post New Design
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>Masters</Text>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('ActivityRolesScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>Activity</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('ServicesScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>Service</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('UnitOfSalesScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Unit of Sales
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('CategoryScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>Category</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('ProductScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>Product</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('ServiceProductScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Service Product
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('DepartmentScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Department
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('LocationTypeScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Location Type
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('DesignationScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Designation
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('EWayBillScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            E-Way Bill
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('SetupScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>Setup</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>
                        Production Unit Master
                      </Text>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('ABrandConversationValue');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {width: 100, height: 108},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.productionIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Brand Conversion Value
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('WidthOfGpCoil');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {width: 100, height: 108},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.productionIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Width of GP Coil
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('MassOfZincCoating');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {width: 100, height: 108},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.productionIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Mass of zinc coating
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>Pocket Diary</Text>
                      <View style={[Styles.marginTop16, Styles.flexRow]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('CategoryNameScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {width: 100, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.pocketDiaryIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>Category</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('SubCategoryNameScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {width: 100, height: 72, marginLeft: 16},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.pocketDiaryIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Sub-Category
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={[
                        Styles.paddingTop12,
                        Styles.marginTop24,
                        Styles.padding16,
                        Styles.width100per,
                        Styles.borderRadius8,
                        Styles.jobBG,
                        {height: 110, elevation: 5},
                      ]}>
                      <View style={[Styles.width100per, Styles.marginTop4]}>
                        <Text style={[Styles.fontSize20, {color: '#FAFAFA'}]}>
                          Job Updates
                        </Text>
                      </View>
                      <View
                        style={[
                          Styles.width100per,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                          Styles.marginTop12,
                        ]}>
                        <Button
                          onPress={() =>
                            navigation.navigate('LookingForAJobJobGroup')
                          }
                          mode="contained-tonal"
                          style={[
                            Styles.whiteColor,
                            {
                              backgroundColor: 'rgba(255, 255, 255, 0.7)',
                              buttonColor: '#FFF',
                            },
                          ]}>
                          Employer
                        </Button>
                        <Button
                          onPress={() =>
                            navigation.navigate('LookingForAJobJobGroup')
                          }
                          mode="contained-tonal"
                          style={[
                            {
                              backgroundColor: 'rgba(255, 255, 255, 0.7)',
                              buttonColor: '#FFF',
                            },
                          ]}>
                          Employee
                        </Button>
                      </View>
                    </View>
                    <View
                      style={[
                        Styles.marginTop24,
                        Styles.marginBottom24,
                        Styles.borderRadius8,
                        Styles.homeBox,
                        {height: 140},
                      ]}>
                      <ImageBackground
                        source={require('../../assets/referral-wallet-1.jpg')}
                        resizeMode="cover"
                        style={[{flex: 1, justifyContent: 'center'}]}
                        imageStyle={{borderRadius: 8}}>
                        <Text
                          style={[
                            Styles.positionAbsolute,
                            Styles.marginTop8,
                            Styles.marginStart16,
                            Styles.fontSize18,
                            Styles.textColorWhite,
                            Styles.fontBold,
                            {top: 8},
                          ]}>
                          Refer and Earn
                        </Text>
                      </ImageBackground>
                    </View>
                    {/* QR Code Start */}
                    <View style={[Styles.borderRadius8, Styles.homeBox]}>
                      <TouchableOpacity
                        onPress={onShare}
                        style={[
                          Styles.padding0,
                          Styles.width100per,
                          Styles.height150,
                          Styles.flexRow,
                          Styles.borderRadius8,
                        ]}>
                        <View
                          style={[
                            Styles.width100per,
                            Styles.height150,
                            Styles.flexRow,
                            Styles.borderRadius8,
                            {elevation: 4},
                          ]}>
                          <ImageBackground
                            source={require('../../assets/QR-code-bg-2.jpg')}
                            resizeMode="cover"
                            style={[{flex: 1, justifyContent: 'center'}]}
                            imageStyle={{borderRadius: 8}}>
                            <Text
                              style={[
                                Styles.positionAbsolute,
                                Styles.marginTop8,
                                Styles.marginStart16,
                                Styles.fontSize18,
                                Styles.textColorWhite,
                                Styles.fontBold,
                                {top: 8},
                              ]}>
                              Scan QR OR Click Here To Share
                            </Text>
                          </ImageBackground>
                        </View>
                      </TouchableOpacity>
                    </View>
                    {/* QR Code End */}
                  </View>
                </View>
              </View>
            ) : userRoleID == projectLoginTypes.DEF_EMPLOYEE_GROUP_REFNO &&
              designID ==
                projectFixedDesignations.DEF_BRANCHADMIN_DESIGNATION_REFNO &&
              companyAdminGroupID == 4 &&
              locationType ==
                projectFixedLocationTypes.DEF_PRODUCTIONUNIT_REFNO ? (
              <View>
                <View
                  style={[
                    Styles.paddingTop16,
                    Styles.paddingHorizontal16,
                    Styles.paddingBottom24,
                  ]}>
                  <View
                    style={[
                      Styles.padding16,
                      Styles.borderRadius8,
                      {backgroundColor: '#277BC0', elevation: 4},
                    ]}>
                    <View style={[Styles.flexRow, Styles.flexAlignCenter]}>
                      <View
                        style={[
                          Styles.borderRadius64,
                          {width: 48, height: 48, elevation: 10},
                        ]}>
                        <Image
                          source={require('../../assets/raw-material.png')}
                          style={(Styles.flex1, {width: 48, height: 48})}
                          resizeMode="cover"
                        />
                      </View>

                      <Text
                        style={[
                          Styles.HomeTitle,
                          Styles.marginStart8,
                          Styles.whiteColor,
                        ]}>
                        AVAILABLE RAW MATERIALS
                      </Text>
                    </View>
                    <View
                      style={[
                        Styles.flexRow,
                        Styles.flexAlignCenter,
                        Styles.marginTop8,
                        Styles.flexSpaceBetween,
                      ]}>
                      <View style={[Styles.flexColumn]}>
                        <Text
                          style={[
                            Styles.HomeTitle,
                            Styles.fontSize20,
                            Styles.whiteColor,
                          ]}>
                          Kg:
                        </Text>
                        <Text
                          style={[
                            Styles.fontSize14,
                            Styles.fontBold,
                            Styles.whiteColor,
                          ]}>
                          {availableRawMaterialKg}
                        </Text>
                      </View>
                      <View style={[Styles.flexColumn]}>
                        <Text
                          style={[
                            Styles.HomeTitle,
                            Styles.fontSize20,
                            Styles.whiteColor,
                          ]}>
                          No:
                        </Text>
                        <Text
                          style={[
                            Styles.fontSize14,
                            Styles.fontBold,
                            Styles.whiteColor,
                          ]}>
                          {availableRawMaterialNo}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={[
                      Styles.padding16,
                      Styles.borderRadius8,
                      Styles.marginTop8,
                      {backgroundColor: '#5F8D4E', elevation: 4},
                    ]}>
                    <View style={[Styles.flexRow, Styles.flexAlignCenter]}>
                      <View
                        style={[
                          Styles.borderRadius64,
                          {width: 48, height: 48, elevation: 10},
                        ]}>
                        <Image
                          source={require('../../assets/production-done.png')}
                          style={(Styles.flex1, {width: 48, height: 48})}
                          resizeMode="cover"
                        />
                      </View>

                      <Text
                        style={[
                          Styles.HomeTitle,
                          Styles.marginStart8,
                          Styles.whiteColor,
                        ]}>
                        PRODUCTION DONE
                      </Text>
                    </View>
                    <View
                      style={[
                        Styles.flexRow,
                        Styles.flexAlignCenter,
                        Styles.marginTop8,
                        Styles.flexSpaceBetween,
                      ]}>
                      <View style={[Styles.flexColumn]}>
                        <Text
                          style={[
                            Styles.HomeTitle,
                            Styles.fontSize20,
                            Styles.whiteColor,
                          ]}>
                          Kg:
                        </Text>
                        <Text
                          style={[
                            Styles.fontSize14,
                            Styles.fontBold,
                            Styles.whiteColor,
                          ]}>
                          {productionDoneKg}
                        </Text>
                      </View>
                      <View style={[Styles.flexColumn]}>
                        <Text
                          style={[
                            Styles.HomeTitle,
                            Styles.fontSize20,
                            Styles.whiteColor,
                          ]}>
                          No:
                        </Text>
                        <Text
                          style={[
                            Styles.fontSize14,
                            Styles.fontBold,
                            Styles.whiteColor,
                          ]}>
                          {productionDoneNo}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={[
                      Styles.padding16,
                      Styles.borderRadius8,
                      Styles.marginTop8,
                      {backgroundColor: '#B3005E', elevation: 4},
                    ]}>
                    <View style={[Styles.flexRow, Styles.flexAlignCenter]}>
                      <View
                        style={[
                          Styles.borderRadius64,
                          {width: 48, height: 48, elevation: 10},
                        ]}>
                        <Image
                          source={require('../../assets/scrap-waste.png')}
                          style={(Styles.flex1, {width: 48, height: 48})}
                          resizeMode="cover"
                        />
                      </View>

                      <Text
                        style={[
                          Styles.HomeTitle,
                          Styles.marginStart8,
                          Styles.whiteColor,
                        ]}>
                        SCRAP WASTAGE
                      </Text>
                    </View>
                    <View
                      style={[
                        Styles.flexRow,
                        Styles.flexAlignCenter,
                        Styles.marginTop8,
                        Styles.flexSpaceBetween,
                      ]}>
                      <View style={[Styles.flexColumn]}>
                        <Text
                          style={[
                            Styles.HomeTitle,
                            Styles.fontSize20,
                            Styles.whiteColor,
                          ]}>
                          Kg:
                        </Text>
                        <Text
                          style={[
                            Styles.fontSize14,
                            Styles.fontBold,
                            Styles.whiteColor,
                          ]}>
                          {scrapWastage}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    Styles.width100per,
                    Styles.boxTopElevation,
                    Styles.borderTopRadius24,
                    Styles.paddingTop12,
                    Styles.paddingBottom16,
                  ]}>
                  <View style={[Styles.paddingHorizontal16]}>
                    <View
                      style={[
                        Styles.horizontalArrowLineBG,
                        Styles.flexAlignSelfCenter,
                        Styles.borderRadius16,
                        Styles.marginBottom16,
                        {width: '20%', height: 6},
                      ]}></View>
                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>
                        Production Unit Master
                      </Text>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('BrandConversionValue');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {width: 100, height: 108},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.productionIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Brand Conversion Value
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('OpeningStockList');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {width: 100, height: 108},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.productionIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Opending Stock
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('OpeningStockScrap');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {width: 100, height: 108},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.productionIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Opending Stock Scrap
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>
                        Employee Management
                      </Text>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('EmployeeListScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Employee List
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          // onPress={() => {
                          //   navigation.navigate("PostNewDesignScreen");
                          // }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Employee Request
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          // onPress={() => {
                          //   navigation.navigate("MaterialSetupScreen");
                          // }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Mark Availability
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          // onPress={() => {
                          //   navigation.navigate("PostNewDesignScreen");
                          // }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Attendance
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('UserActivityScreen');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Employee Activity
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>Production</Text>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('ProductforProduction');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.pocketDiaryIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Product For Production
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('ProductionOrderList');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.pocketDiaryIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Purchase Order List
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>Vendor Order Form</Text>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('VendorOrderForm');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.containerBgGreen}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Vendor Order Form List
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('InvoiceReceiptList');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.containerBgGreen}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Invoice Receipt List
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>Production Status</Text>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('ProductionStatus');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.pocketDiaryIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Production Status
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('SummaryOfMaterials');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.pocketDiaryIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Summary Of Materials
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>Reports</Text>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('ProductionAchieved');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.serviceCatelogueIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Production Achieved
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('JobOrderForm');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.serviceCatelogueIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Job Order Form
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          // onPress={() => {
                          //   navigation.navigate("MaterialSetupScreen");
                          // }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.serviceCatelogueIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Invoice Receipt
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          // onPress={() => {
                          //   navigation.navigate("PostNewDesignScreen");
                          // }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.serviceCatelogueIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Available Stock
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>Activity</Text>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {
                              width: 100,
                              height: 108,
                              backgroundColor: isLoggedIn ? 'green' : '#fff',
                              // opacity: isLoginProcessing ? "0.5" : "1",
                            },
                          ]}
                          onPress={
                            !isLoginProcessing && !isLoggedIn && loginMarketer
                          }
                          disabled={true}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={
                              !isLoggedIn
                                ? theme.colors.productionIcons
                                : '#fff'
                            }
                          />
                          <Text
                            style={([Styles.buttonIconLabel], {color: '#000'})}>
                            {isLoginProcessing
                              ? 'Logging in...'
                              : isLoggedIn
                              ? 'Logged In'
                              : 'Log In'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {width: 100, height: 108},
                          ]}
                          onPress={() => {
                            fetchActivityType();
                          }}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.productionIcons}
                          />
                          <Text
                            style={[Styles.buttonIconLabel, Styles.textCenter]}>
                            {isMarkingActivityInProcess
                              ? 'wait...'
                              : 'Pocket Diary'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {width: 100, height: 108},
                          ]}
                          disabled={isLoggingOut}
                          onPress={logoutMarketer}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.productionIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            {isLoggingOut ? 'Logging Out...' : 'Log Out'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>Employee Activity</Text>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('CustomerList');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            My Client List
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('AdminAttendanceReport');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Attendance Branch-Wise Report
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('DailyActivityReport');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Daily Activity Report
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('ActivityReport');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Overall Activity Report
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {(userRoleID ==
                      projectLoginTypes.DEF_MENUFACTURER_GROUP_REFNO ||
                      userRoleID ==
                        projectLoginTypes.DEF_CONTRACTOR_BRANCHADMIN_GROUP_REFNO ||
                      userRoleID ==
                        projectLoginTypes.DEF_DEALER_BRANCHADMIN_GROUP_REFNO ||
                      designID ==
                        projectFixedDesignations.DEF_BRANCHADMIN_DESIGNATION_REFNO ||
                      groupRefExtraNo ==
                        projectLoginTypes.DEF_MENUFACTURER_GROUP_REFNO) && (
                      <View style={[Styles.paddingTop16]}>
                        <Text style={[Styles.HomeTitle]}>
                          Employee Attendance
                        </Text>
                        <View
                          style={[
                            Styles.marginTop16,
                            Styles.flexRow,
                            Styles.flexSpaceBetween,
                          ]}>
                          <TouchableOpacity
                            onPress={() => {
                              navigation.navigate('MarkAvailabilityListScreen');
                            }}
                            style={[
                              Styles.borderRadius8,
                              Styles.homeBox,
                              Styles.flexColumn,
                              Styles.flexJustifyCenter,
                              Styles.flexAlignCenter,
                              {width: 156, height: 72},
                            ]}>
                            <Icon
                              name="archive-arrow-down"
                              size={22}
                              color={theme.colors.masterIcons}
                            />
                            <Text style={[Styles.buttonIconLabel]}>
                              Mark Availability
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              navigation.navigate('AttendanceListScreen');
                            }}
                            style={[
                              Styles.borderRadius8,
                              Styles.homeBox,
                              Styles.flexColumn,
                              Styles.flexJustifyCenter,
                              Styles.flexAlignCenter,
                              {width: 156, height: 72},
                            ]}>
                            <Icon
                              name="archive-arrow-down"
                              size={22}
                              color={theme.colors.masterIcons}
                            />
                            <Text style={[Styles.buttonIconLabel]}>
                              Mark Attendance
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    {/* QR Code Start */}
                    <View
                      style={[
                        Styles.marginTop16,
                        Styles.borderRadius8,
                        Styles.homeBox,
                      ]}>
                      <TouchableOpacity
                        onPress={onShare}
                        style={[
                          Styles.padding0,
                          Styles.width100per,
                          Styles.height150,
                          Styles.flexRow,
                          Styles.borderRadius8,
                        ]}>
                        <View
                          style={[
                            Styles.width100per,
                            Styles.height150,
                            Styles.flexRow,
                            Styles.borderRadius8,
                            {elevation: 4},
                          ]}>
                          <ImageBackground
                            source={require('../../assets/QR-code-bg-2.jpg')}
                            resizeMode="cover"
                            style={[{flex: 1, justifyContent: 'center'}]}
                            imageStyle={{borderRadius: 8}}>
                            <Text
                              style={[
                                Styles.positionAbsolute,
                                Styles.marginTop8,
                                Styles.marginStart16,
                                Styles.fontSize18,
                                Styles.textColorWhite,
                                Styles.fontBold,
                                {top: 8},
                              ]}>
                              Scan QR OR Click Here To Share
                            </Text>
                          </ImageBackground>
                        </View>
                      </TouchableOpacity>
                    </View>
                    {/* QR Code End */}
                  </View>
                </View>
              </View>
            ) : userRoleID == projectLoginTypes.DEF_EMPLOYEE_GROUP_REFNO &&
              designID ==
                projectFixedDesignations.DEF_MARKETINGEXECUTIVE_DESIGNATION_REFNO &&
              companyAdminGroupID == 4 &&
              locationType ==
                projectFixedLocationTypes.DEF_REGIONALOFFICE_REFNO ? (
              <View>
                <View
                  style={[
                    Styles.width100per,
                    Styles.boxTopElevation,
                    Styles.borderTopRadius24,
                    Styles.paddingTop12,
                    Styles.paddingBottom16,
                  ]}>
                  <View style={[Styles.paddingHorizontal16]}>
                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>Activity</Text>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {
                              width: 100,
                              height: 108,
                              backgroundColor: isLoggedIn ? 'green' : '#fff',
                              // opacity: isLoginProcessing || isLoggedIn ? 0.5 : 1,
                            },
                          ]}
                          onPress={
                            !(isLoginProcessing && isLoggedIn)
                              ? loginMarketer
                              : false
                          }
                          disabled={isLoginProcessing || isLoggedIn}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={
                              !isLoggedIn
                                ? theme.colors.productionIcons
                                : '#fff'
                            }
                          />
                          <Text
                            style={([Styles.buttonIconLabel], {color: '#000'})}>
                            {isLoginProcessing
                              ? 'Logging in...'
                              : isLoggedIn
                              ? 'Logged In'
                              : 'Log In'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {width: 100, height: 108},
                          ]}
                          onPress={() => {
                            fetchActivityType();
                          }}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.productionIcons}
                          />
                          <Text
                            style={[Styles.buttonIconLabel, Styles.textCenter]}>
                            {isMarkingActivityInProcess
                              ? 'wait...'
                              : 'Pocket Diary'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            Styles.paddingHorizontal12,
                            {
                              width: 100,
                              height: 108,
                              // opacity: !isLoggedIn && !isLoggingOut ? 0.5 : 1,
                            },
                          ]}
                          onPress={
                            !isLoginProcessing && !isLoggingOut
                              ? logoutMarketer
                              : console.log
                          }
                          disabled={isLoggingOut && !isLoginProcessing}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.productionIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            {isLoggingOut ? 'Logging Out...' : 'Log Out'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={[Styles.paddingTop16]}>
                      <Text style={[Styles.HomeTitle]}>Employee Activity</Text>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('CustomerList');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            My Client List
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('EmployeeAttendanceReport');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            My Attendance & Salary
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.flexRow,
                          Styles.flexSpaceBetween,
                        ]}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('DailyActivityReport');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Daily Activity Report
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('ActivityReport');
                          }}
                          style={[
                            Styles.borderRadius8,
                            Styles.homeBox,
                            Styles.flexColumn,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                            {width: 156, height: 72},
                          ]}>
                          <Icon
                            name="archive-arrow-down"
                            size={22}
                            color={theme.colors.masterIcons}
                          />
                          <Text style={[Styles.buttonIconLabel]}>
                            Overall Activity Report
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {/* here TBC */}

                    <View style={[Styles.paddingTop16]}>
                      {/* Design Your Dream */}
                      <TouchableOpacity
                        onPress={() => {
                          if (redirectToProfileFlag == 1) {
                            showProfileDialog();
                          } else {
                            navigation.navigate('DesignYourDreamCategories');
                          }
                        }}>
                        <View
                          style={[
                            Styles.flex1,
                            Styles.width100per,
                            Styles.height250,
                            Styles.borderRadius8,
                            Styles.OverFlow,
                          ]}>
                          <FadeCarousel
                            elements={slidesTwo}
                            containerStyle={[
                              Styles.flex1,
                              Styles.flexAlignCenter,
                              Styles.flexJustifyCenter,
                            ]}
                            fadeDuration={2000}
                            stillDuration={2000}
                            start={true}
                          />
                          <View
                            style={[
                              Styles.width100per,
                              Styles.height40,
                              {
                                backgroundColor: 'rgba(0,0,0,0.4)',
                                position: 'absolute',
                              },
                            ]}>
                            <Text
                              style={[
                                Styles.marginTop8,
                                Styles.marginStart16,
                                Styles.fontSize18,
                                Styles.textColorWhite,
                                Styles.fontBold,
                              ]}>
                              Design your Dream
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                      {/* Design Your Dream */}

                      {/* Material Calculator */}
                      <TouchableOpacity
                        onPress={() => {
                          if (userRoleID == 2) {
                            navigation.navigate('MaterialSetupScreen', {
                              type: 'add',
                            });
                          } else {
                            navigation.navigate('MaterialCalculatorScreen', {
                              type: 'add',
                            });
                          }
                        }}
                        style={[
                          Styles.width100per,
                          Styles.height150,
                          Styles.flexRow,
                          Styles.marginTop16,
                          Styles.borderRadius8,
                          {elevation: 4},
                        ]}>
                        <ImageBackground
                          source={require('../../assets/material-calculator-with-element-bg.jpg')}
                          resizeMode="cover"
                          style={[{flex: 1, justifyContent: 'center'}]}
                          imageStyle={{borderRadius: 8}}>
                          <Text
                            style={[
                              Styles.positionAbsolute,
                              Styles.marginTop8,
                              Styles.marginStart16,
                              Styles.fontSize18,
                              Styles.textColorWhite,
                              Styles.fontBold,
                              {top: 8},
                            ]}>
                            Material Calculator
                          </Text>
                        </ImageBackground>
                      </TouchableOpacity>
                      {/* Material Calculator */}
                    </View>
                    {/* QR Code Start */}
                    <View
                      style={[
                        Styles.marginTop16,
                        Styles.borderRadius8,
                        Styles.homeBox,
                      ]}>
                      <TouchableOpacity
                        onPress={onShare}
                        style={[
                          Styles.padding0,
                          Styles.width100per,
                          Styles.height150,
                          Styles.flexRow,
                          Styles.borderRadius8,
                        ]}>
                        <View
                          style={[
                            Styles.width100per,
                            Styles.height150,
                            Styles.flexRow,
                            Styles.borderRadius8,
                            {elevation: 4},
                          ]}>
                          <ImageBackground
                            source={require('../../assets/QR-code-bg-2.jpg')}
                            resizeMode="cover"
                            style={[{flex: 1, justifyContent: 'center'}]}
                            imageStyle={{borderRadius: 8}}>
                            <Text
                              style={[
                                Styles.positionAbsolute,
                                Styles.marginTop8,
                                Styles.marginStart16,
                                Styles.fontSize18,
                                Styles.textColorWhite,
                                Styles.fontBold,
                                {top: 8},
                              ]}>
                              Scan QR OR Click Here To Share
                            </Text>
                          </ImageBackground>
                        </View>
                      </TouchableOpacity>
                    </View>
                    {/* QR Code End */}
                  </View>
                </View>
              </View>
            ) : (
              <View>
                {catalogueImages != null && catalogueImages.length > 0 && (
                  <>
                    {/* ImageSlider */}

                    <View style={{zIndex: 999, marginTop: 20}}>
                      {/* Main slider for current image */}
                      <ImageSlider
                        data={catalogueImages}
                        timer={10000}
                        indicatorContainerStyle={{top: 32, zIndex: 999}}
                        activeIndicatorStyle={{
                          backgroundColor: theme.colors.primary,
                          width: 9,
                          height: 9,
                        }}
                        autoPlay={true}
                        onClick={() => setCatalogueImagesZoomVisible(true)}
                        caroselImageContainerStyle={{
                          flexDirection: 'row',
                          width: 'auto',
                        }}
                        caroselImageStyle={{
                          width: 380,
                          height: 190,
                          marginHorizontal: 20,
                          borderRadius: 10,
                          resizeMode: 'cover',
                        }}
                      />
                    </View>
                  </>
                )}
                {/* Estimation Start */}
                <View>
                  <Title
                    style={[
                      Styles.marginTop12,
                      Styles.fontBold,
                      Styles.fontSize18,
                      {marginLeft: 25},
                      Styles.fontBold,
                    ]}>
                    Estimation
                  </Title>
                  <View
                    style={[
                      Styles.flexRow,
                      Styles.paddingHorizontal16,
                      Styles.flexWrap,
                    ]}>
                    {imageGalleryData?.map((k, i) => {
                      return (
                        <View
                          key={i}
                          style={[
                            Styles.width50per,
                            Styles.padding4,
                            Styles.paddingTop0,
                          ]}>
                          <CreateSCCards
                            key={i}
                            image={k.design_image_url}
                            title={k.service_name}
                            id={k.service_refno}
                            subttitle={k.designtype_name}
                            data={k}
                            cardClick={SingleCardClick}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Design Your Dream */}
                <View
                  style={{width: '100%', alignSelf: 'center', marginTop: 10}}>
                  <Title
                    style={[
                      Styles.marginTop4,
                      Styles.fontBold,
                      Styles.fontSize18,
                      {marginLeft: 25},
                      Styles.fontBold,
                    ]}>
                    Design your dream
                  </Title>
                  <TouchableOpacity
                    onPress={() => {
                      if (redirectToProfileFlag == 1) {
                        showProfileDialog();
                      } else {
                        navigation.navigate('DesignYourDreamCategories');
                      }
                    }}>
                    <ImageSlider
                      data={slidesTwo}
                      timer={10000}
                      indicatorContainerStyle={{top: 32, zIndex: 999}}
                      activeIndicatorStyle={{
                        backgroundColor: theme.colors.primary,
                        width: 9,
                        height: 9,
                      }}
                      autoPlay={true}
                      onClick={() => setCatalogueImagesZoomVisible(true)}
                      caroselImageContainerStyle={{
                        flexDirection: 'row',
                        width: 'auto',
                      }}
                      caroselImageStyle={{
                        width: 380,
                        height: 190,
                        marginHorizontal: 20,
                        borderRadius: 10,
                        resizeMode: 'cover',
                      }}
                    />
                    {/* <FadeCarousel
                        elements={slidesTwo}
                        containerStyle={[
                          Styles.flex1,
                          Styles.flexAlignCenter,
                          Styles.flexJustifyCenter,
                        ]}
                        fadeDuration={2000}
                        stillDuration={2000}
                        start={true}
                      /> */}
                  </TouchableOpacity>
                </View>
                {/* Design Your Dream */}

                {/* Sponsered Ad */}
                <View>
                  <Title
                    style={[
                      Styles.marginTop12,
                      Styles.fontBold,
                      Styles.fontSize18,
                      {marginLeft: 25},
                      Styles.fontBold,
                    ]}>
                    Sponsered Ads
                  </Title>
                  <View
                    style={[
                      Styles.margin4,
                      Styles.height96,
                      {width: '92%', alignSelf: 'center'},
                    ]}>
                    <Image
                      source={{
                        uri: 'https://www.wordstream.com/wp-content/uploads/2021/07/banner-ads-examples-ncino.jpg',
                      }}
                      style={{width: '100%', height: '100%', borderRadius: 10}}
                    />
                    <Caption
                      style={[
                        {
                          position: 'absolute',
                          bottom: 4,
                          right: 4,
                          color: theme.colors.textLight,
                        },
                      ]}>
                      Sponsered Ads
                    </Caption>
                  </View>
                </View>
                {/* Sponsered Ad */}

                <View
                  style={[
                    Styles.width100per,
                    Styles.padding16,
                    Styles.positionRelative,
                  ]}>
                  {/* Material Calculator */}
                  <Title
                    style={[
                      Styles.marginTop0,
                      Styles.fontBold,
                      Styles.fontSize18,
                      {marginLeft: 5},
                      Styles.fontBold,
                    ]}>
                    Material Calculator
                  </Title>
                  <TouchableOpacity
                    onPress={() => {
                      if (userRoleID == 2) {
                        navigation.navigate('MaterialSetupScreen', {
                          type: 'add',
                        });
                      } else {
                        navigation.navigate('MaterialCalculatorScreen', {
                          type: 'add',
                        });
                      }
                    }}
                    style={[
                      Styles.width100per,
                      Styles.height150,
                      Styles.flexRow,
                      Styles.marginTop6,
                      Styles.borderRadius8,
                      {elevation: 4},
                    ]}>
                    <ImageBackground
                      source={require('../../assets/materialcalculator.png')}
                      resizeMode="cover"
                      style={[{flex: 1, justifyContent: 'center'}]}
                      imageStyle={{borderRadius: 8}}></ImageBackground>
                  </TouchableOpacity>
                  {/* Material Calculator */}

                  {/* Enquiry & Estimation */}
                  <View style={[Styles.paddingTop16]}>
                    <Title
                      style={[
                        Styles.marginTop0,
                        Styles.fontBold,
                        Styles.fontSize18,
                        {marginLeft: 5},
                        Styles.fontBold,
                      ]}>
                      Enquiry & Estimation
                    </Title>
                    <View
                      style={[
                        Styles.marginTop6,
                        Styles.marginHorizontal12,
                        Styles.flexRow,
                        Styles.flexSpaceBetween,
                      ]}>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('Image Gallery');
                        }}
                        style={[
                          Styles.borderRadius8,
                          Styles.homeBox,
                          Styles.flexRow,
                          Styles.flexJustifyCenter,
                          Styles.flexAlignCenter,
                          Styles.paddingHorizontal12,
                          {width: 172, height: 92},
                        ]}>
                        <Image
                          source={require('../../assets/gallery.png')}
                          style={{width: 52, height: 52}}
                        />
                        <Text
                          style={[
                            Styles.fontSize16,
                            Styles.fontBold,
                            {marginLeft: 15},
                          ]}>
                          Image {'\n'}Gallery
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('My Estimations');
                        }}
                        style={[
                          Styles.borderRadius8,
                          Styles.homeBox,
                          Styles.flexRow,
                          Styles.flexJustifyCenter,
                          Styles.flexAlignCenter,
                          Styles.paddingHorizontal12,
                          {width: 172, height: 92},
                        ]}>
                        <Image
                          source={require('../../assets/estimate.png')}
                          style={{width: 52, height: 52}}
                        />
                        <Text
                          style={[
                            Styles.fontSize16,
                            Styles.fontBold,
                            {marginLeft: 12},
                          ]}>
                          My {'\n'}Estimation
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* Enquiry & Estimation */}

                  {userRoleID !=
                    projectLoginTypes.DEF_GENERALUSER_GROUP_REFNO &&
                    userRoleID != projectLoginTypes.DEF_APPADMIN_GROUP_REFNO &&
                    userRoleID != projectLoginTypes.DEF_CLIENT_GROUP_REFNO && (
                      <>
                        <View style={[Styles.paddingTop16]}>
                          <Text style={[Styles.HomeTitle]}>Activity</Text>
                          <View
                            style={[
                              Styles.marginTop16,
                              Styles.flexRow,
                              Styles.flexSpaceBetween,
                            ]}>
                            <TouchableOpacity
                              style={[
                                Styles.borderRadius8,
                                Styles.homeBox,
                                Styles.flexColumn,
                                Styles.flexJustifyCenter,
                                Styles.flexAlignCenter,
                                Styles.paddingHorizontal12,
                                {
                                  width: 100,
                                  height: 108,
                                  backgroundColor: isLoggedIn
                                    ? 'green'
                                    : '#fff',
                                },
                              ]}
                              onPress={loginMarketer}>
                              <Icon
                                name="archive-outline"
                                type="ionicon"
                                size={22}
                                color={
                                  !isLoggedIn
                                    ? theme.colors.productionIcons
                                    : '#fff'
                                }
                              />
                              <Text
                                style={
                                  ([Styles.buttonIconLabel], {color: '#000'})
                                }>
                                {isLoginProcessing
                                  ? 'Logging in...'
                                  : isLoggedIn
                                  ? 'Logged In'
                                  : 'Log In'}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                Styles.borderRadius8,
                                Styles.homeBox,
                                Styles.flexColumn,
                                Styles.flexJustifyCenter,
                                Styles.flexAlignCenter,
                                Styles.paddingHorizontal12,
                                {width: 100, height: 108},
                              ]}
                              onPress={() => {
                                fetchActivityType();
                              }}>
                              <Icon
                                name="archive-outline"
                                type="ionicon"
                                size={22}
                                color={theme.colors.productionIcons}
                              />
                              <Text
                                style={[
                                  Styles.buttonIconLabel,
                                  Styles.textCenter,
                                ]}>
                                {isMarkingActivityInProcess
                                  ? 'wait...'
                                  : 'Pocket Diary'}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                Styles.borderRadius8,
                                Styles.homeBox,
                                Styles.flexColumn,
                                Styles.flexJustifyCenter,
                                Styles.flexAlignCenter,
                                Styles.paddingHorizontal12,
                                {width: 100, height: 108},
                              ]}
                              onPress={logoutMarketer}>
                              <Icon
                                name="archive-outline"
                                type="ionicon"
                                size={22}
                                color={theme.colors.productionIcons}
                              />
                              <Text style={[Styles.buttonIconLabel]}>
                                {isLoggingOut ? 'Logging Out...' : 'Log Out'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={[Styles.paddingTop16]}>
                          <Text style={[Styles.HomeTitle]}>
                            Employee Activity
                          </Text>
                          <View
                            style={[
                              Styles.marginTop16,
                              Styles.flexRow,
                              Styles.flexSpaceBetween,
                            ]}>
                            <TouchableOpacity
                              onPress={() => {
                                navigation.navigate('CustomerList');
                              }}
                              style={[
                                Styles.borderRadius8,
                                Styles.homeBox,
                                Styles.flexColumn,
                                Styles.flexJustifyCenter,
                                Styles.flexAlignCenter,
                                {width: 176, height: 82},
                              ]}>
                              <Icon
                                name="archive-outline"
                                type="ionicon"
                                size={22}
                                color={theme.colors.masterIcons}
                              />
                              <Text style={[Styles.buttonIconLabel]}>
                                My Client List
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                navigation.navigate('Daily Activity Report');
                              }}
                              style={[
                                Styles.borderRadius8,
                                Styles.homeBox,
                                Styles.flexColumn,
                                Styles.flexJustifyCenter,
                                Styles.flexAlignCenter,
                                {width: 176, height: 82},
                              ]}>
                              <Icon
                                name="archive-outline"
                                type="ionicon"
                                size={22}
                                color={theme.colors.masterIcons}
                              />
                              <Text style={[Styles.buttonIconLabel]}>
                                Daily Activity Report
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <View
                            style={[
                              Styles.marginTop16,
                              Styles.flexRow,
                              Styles.flexSpaceBetween,
                            ]}>
                            <TouchableOpacity
                              onPress={() => {
                                navigation.navigate('Overall Activity Report');
                              }}
                              style={[
                                Styles.borderRadius8,
                                Styles.homeBox,
                                Styles.flexColumn,
                                Styles.flexJustifyCenter,
                                Styles.flexAlignCenter,
                                {width: 176, height: 82},
                              ]}>
                              <Icon
                                name="archive-outline"
                                type="ionicon"
                                size={22}
                                color={theme.colors.masterIcons}
                              />
                              <Text style={[Styles.buttonIconLabel]}>
                                Overall Activity Report
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                if (
                                  userRoleID ==
                                    projectLoginTypes.DEF_MENUFACTURER_GROUP_REFNO ||
                                  userRoleID ==
                                    projectLoginTypes.DEF_CONTRACTOR_BRANCHADMIN_GROUP_REFNO ||
                                  userRoleID ==
                                    projectLoginTypes.DEF_DEALER_BRANCHADMIN_GROUP_REFNO ||
                                  designID ==
                                    projectFixedDesignations.DEF_BRANCHADMIN_DESIGNATION_REFNO ||
                                  designID ==
                                    projectFixedDesignations.DEF_COMPANYADMIN_DESIGNATION_REFNO ||
                                  groupRefExtraNo ==
                                    projectLoginTypes.DEF_MENUFACTURER_GROUP_REFNO
                                ) {
                                  navigation.navigate('Attendance Report');
                                } else {
                                  navigation.navigate(
                                    'EmployeeAttendanceReport',
                                  );
                                }
                              }}
                              style={[
                                Styles.borderRadius8,
                                Styles.homeBox,
                                Styles.flexColumn,
                                Styles.flexJustifyCenter,
                                Styles.flexAlignCenter,
                                {width: 176, height: 82},
                              ]}>
                              <Icon
                                name="archive-outline"
                                type="ionicon"
                                size={22}
                                color={theme.colors.masterIcons}
                              />
                              <Text style={[Styles.buttonIconLabel]}>
                                {userRoleID ==
                                  projectLoginTypes.DEF_MENUFACTURER_GROUP_REFNO ||
                                userRoleID ==
                                  projectLoginTypes.DEF_CONTRACTOR_BRANCHADMIN_GROUP_REFNO ||
                                userRoleID ==
                                  projectLoginTypes.DEF_DEALER_BRANCHADMIN_GROUP_REFNO ||
                                designID ==
                                  projectFixedDesignations.DEF_BRANCHADMIN_DESIGNATION_REFNO ||
                                designID ==
                                  projectFixedDesignations.DEF_COMPANYADMIN_DESIGNATION_REFNO ||
                                groupRefExtraNo ==
                                  projectLoginTypes.DEF_MENUFACTURER_GROUP_REFNO
                                  ? 'Attendance Branch-Wise Report'
                                  : 'My Attendance & Salary'}
                              </Text>
                            </TouchableOpacity>
                          </View>

                          {(userRoleID ==
                            projectLoginTypes.DEF_MENUFACTURER_GROUP_REFNO ||
                            userRoleID ==
                              projectLoginTypes.DEF_CONTRACTOR_BRANCHADMIN_GROUP_REFNO ||
                            userRoleID ==
                              projectLoginTypes.DEF_DEALER_BRANCHADMIN_GROUP_REFNO ||
                            designID ==
                              projectFixedDesignations.DEF_BRANCHADMIN_DESIGNATION_REFNO ||
                            groupRefExtraNo ==
                              projectLoginTypes.DEF_MENUFACTURER_GROUP_REFNO) && (
                            <View
                              style={[
                                Styles.marginTop16,
                                Styles.flexRow,
                                Styles.flexSpaceBetween,
                              ]}>
                              <TouchableOpacity
                                onPress={() => {
                                  navigation.navigate(
                                    'EmployeeAttendanceReport',
                                  );
                                }}
                                style={[
                                  Styles.borderRadius8,
                                  Styles.homeBox,
                                  Styles.flexColumn,
                                  Styles.flexJustifyCenter,
                                  Styles.flexAlignCenter,
                                  {width: 156, height: 72},
                                ]}>
                                <Icon
                                  name="archive-outline"
                                  type="ionicon"
                                  size={22}
                                  color={theme.colors.masterIcons}
                                />
                                <Text style={[Styles.buttonIconLabel]}>
                                  My Attendance & Salary
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        {(userRoleID ==
                          projectLoginTypes.DEF_MENUFACTURER_GROUP_REFNO ||
                          userRoleID ==
                            projectLoginTypes.DEF_CONTRACTOR_BRANCHADMIN_GROUP_REFNO ||
                          userRoleID ==
                            projectLoginTypes.DEF_DEALER_BRANCHADMIN_GROUP_REFNO ||
                          designID ==
                            projectFixedDesignations.DEF_BRANCHADMIN_DESIGNATION_REFNO ||
                          groupRefExtraNo ==
                            projectLoginTypes.DEF_MENUFACTURER_GROUP_REFNO) && (
                          <View style={[Styles.paddingTop16]}>
                            <Text style={[Styles.HomeTitle]}>
                              Employee Attendance
                            </Text>
                            <View
                              style={[
                                Styles.marginTop16,
                                Styles.flexRow,
                                Styles.flexSpaceBetween,
                              ]}>
                              <TouchableOpacity
                                onPress={() => {
                                  navigation.navigate(
                                    'MarkAvailabilityListScreen',
                                  );
                                }}
                                style={[
                                  Styles.borderRadius8,
                                  Styles.homeBox,
                                  Styles.flexColumn,
                                  Styles.flexJustifyCenter,
                                  Styles.flexAlignCenter,
                                  {width: 156, height: 72},
                                ]}>
                                <Icon
                                  name="archive-outline"
                                  type="ionicon"
                                  size={22}
                                  color={theme.colors.masterIcons}
                                />
                                <Text style={[Styles.buttonIconLabel]}>
                                  Mark Availability
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => {
                                  navigation.navigate('AttendanceListScreen');
                                }}
                                style={[
                                  Styles.borderRadius8,
                                  Styles.homeBox,
                                  Styles.flexColumn,
                                  Styles.flexJustifyCenter,
                                  Styles.flexAlignCenter,
                                  {width: 156, height: 72},
                                ]}>
                                <Icon
                                  name="archive-outline"
                                  type="ionicon"
                                  size={22}
                                  color={theme.colors.masterIcons}
                                />
                                <Text style={[Styles.buttonIconLabel]}>
                                  Mark Attendance
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </>
                    )}
                  {(userRoleID === '4' || userRoleID === '5') && (
                    <>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.borderRadius8,
                          Styles.homeBox,
                          {height: 140},
                        ]}>
                        <ImageBackground
                          source={require('../../assets/user-access.jpg')}
                          resizeMode="cover"
                          style={[{flex: 1, justifyContent: 'center'}]}
                          imageStyle={{borderRadius: 8}}>
                          <Text
                            style={[
                              Styles.positionAbsolute,
                              Styles.marginTop8,
                              Styles.marginStart16,
                              Styles.fontSize18,
                              Styles.textColorWhite,
                              Styles.fontBold,
                              {top: 8},
                            ]}>
                            Control User Access
                          </Text>
                        </ImageBackground>
                      </View>
                    </>
                  )}

                  {/* Pocket Diary */}
                  {/* <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('PocketDiary', {type: 'add'});
                    }}
                    style={[
                      Styles.width100per,
                      Styles.height150,
                      Styles.flexRow,
                      Styles.marginTop16,
                      Styles.borderRadius8,
                      {elevation: 4},
                    ]}>
                    <ImageBackground
                      source={require('../../assets/pocket-diary-bg.png')}
                      resizeMode="cover"
                      style={[{flex: 1, justifyContent: 'center'}]}
                      imageStyle={{borderRadius: 8}}>
                      <Text
                        style={[
                          Styles.positionAbsolute,
                          Styles.marginTop8,
                          Styles.marginStart16,
                          Styles.fontSize18,
                          Styles.textColorWhite,
                          Styles.fontBold,
                          {top: 8},
                        ]}>
                        Pocket Diary
                      </Text>
                    </ImageBackground>
                  </TouchableOpacity> */}
                  {/* Pocket Diary */}

                  {/* Looking For Jobs */}
                  {/* {(designID == '0' || designID == '1' || designID == '2') && (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          if (redirectToProfileFlag == 1) {
                            showProfileDialog();
                          } else {
                            navigation.navigate('LookingForAJobJobGroup');
                          }
                        }}
                        style={[
                          Styles.padding0,
                          Styles.width100per,
                          Styles.height150,
                          Styles.flexRow,
                          Styles.marginTop16,
                          Styles.borderRadius8,
                        ]}>
                        <View
                          style={[
                            Styles.width100per,
                            Styles.height150,
                            Styles.flexRow,

                            Styles.borderRadius8,
                            {elevation: 4},
                          ]}>
                          <ImageBackground
                            source={require('../../assets/jobs-bg.jpg')}
                            resizeMode="cover"
                            style={[{flex: 1, justifyContent: 'center'}]}
                            imageStyle={{borderRadius: 8}}>
                            <Text
                              style={[
                                Styles.positionAbsolute,
                                Styles.marginTop8,
                                Styles.marginStart16,
                                Styles.fontSize18,
                                Styles.textColorWhite,
                                Styles.fontBold,
                                {top: 8},
                              ]}>
                              Looking For Jobs ?
                            </Text>
                          </ImageBackground>
                        </View>
                      </TouchableOpacity>
                    </>
                  )} */}
                  {/* Looking For Jobs */}

                  {/* Refer & Earn */}
                  {/* {userRoleID !== '2' && (
                    <>
                      <View
                        style={[
                          Styles.marginTop16,
                          Styles.borderRadius8,
                          Styles.homeBox,
                          {height: 140},
                        ]}>
                        <ImageBackground
                          source={require('../../assets/referral-wallet-1.jpg')}
                          resizeMode="cover"
                          style={[{flex: 1, justifyContent: 'center'}]}
                          imageStyle={{borderRadius: 8}}>
                          <Text
                            style={[
                              Styles.positionAbsolute,
                              Styles.marginTop8,
                              Styles.marginStart16,
                              Styles.fontSize18,
                              Styles.textColorWhite,
                              Styles.fontBold,
                              {top: 8},
                            ]}>
                            Refer and Earn
                          </Text>
                        </ImageBackground>
                      </View>
                    </>
                  )} */}
                  {/* Refer & Earn */}

                  {/* QR Code Start */}
                  {/* <View
                    style={[
                      Styles.marginTop16,
                      Styles.borderRadius8,
                      Styles.homeBox,
                    ]}>
                    <TouchableOpacity
                      onPress={onShare}
                      style={[
                        Styles.padding0,
                        Styles.width100per,
                        Styles.height150,
                        Styles.flexRow,
                        Styles.borderRadius8,
                      ]}>
                      <View
                        style={[
                          Styles.width100per,
                          Styles.height150,
                          Styles.flexRow,
                          Styles.borderRadius8,
                          {elevation: 4},
                        ]}>
                        <ImageBackground
                          source={require('../../assets/QR-code-bg-2.jpg')}
                          resizeMode="cover"
                          style={[{flex: 1, justifyContent: 'center'}]}
                          imageStyle={{borderRadius: 8}}>
                          <Text
                            style={[
                              Styles.positionAbsolute,
                              Styles.marginTop8,
                              Styles.marginStart16,
                              Styles.fontSize18,
                              Styles.textColorWhite,
                              Styles.fontBold,
                              {top: 8},
                            ]}>
                            Scan QR OR Click Here To Share
                          </Text>
                        </ImageBackground>
                      </View>
                    </TouchableOpacity>
                  </View> */}
                  {/* QR Code End */}

                  {/* Switch Role */}
                  {/* {userRoleID === '3' ? (
                    <View style={[Styles.marginTop16]}>
                      <Title
                        style={[
                          Styles.marginTop0,
                          Styles.fontBold,
                          Styles.fontSize18,
                          {marginLeft: 5},
                          Styles.fontBold,
                        ]}>
                        Switch Role
                      </Title>
                      <View
                        style={[
                          Styles.marginTop6,
                          Styles.bordergray,
                          Styles.bordergray,
                          Styles.borderRadius8,
                          Styles.paddingBottom8,
                        ]}>
                        <View
                          style={[
                            Styles.paddingHorizontal16,
                            Styles.marginTop12,
                          ]}>
                          <Dropdown
                            label="SELECT"
                            data={switchRoleNames}
                            onSelected={onRoleSelected}
                            isError={errorRole}
                            selectedItem={roleName}
                          />
                          <Button
                            mode="contained"
                            style={[Styles.marginTop12]}
                            loading={isButtonLoading}
                            disabled={isButtonLoading}
                            onPress={ValidateSwitchRole}>
                            Switch
                          </Button>
                        </View>
                        <Portal>
                          <Dialog
                            visible={isDialogVisible}
                            onDismiss={hideDialog}>
                            <Dialog.Title>Confirmation</Dialog.Title>
                            <Dialog.Content>
                              <Paragraph>
                                Do you really want to switch your role to{' '}
                                {roleName}? If OK, then your active role will
                                get automatically changed
                              </Paragraph>
                            </Dialog.Content>
                            <Dialog.Actions>
                              <Button onPress={UpdateUserRole}>Ok</Button>
                              <Button onPress={hideDialog}>Cancel</Button>
                            </Dialog.Actions>
                          </Dialog>
                        </Portal>

                        <Portal>
                          <Dialog
                            visible={isDialogVisible2}
                            onDismiss={() => setIsDialogVisible2(false)}>
                            <Dialog.Title>Select Your Services</Dialog.Title>
                            <Dialog.Content>
                              {list.map((item, key) => (
                                <React.Fragment key={key}>
                                  <Checkbox.Item
                                    status={
                                      item.checked ? 'checked' : 'unchecked'
                                    }
                                    label={item.service_name}
                                    onPress={() => {
                                      setlist(
                                        list.map((ite, idx) => {
                                          if (idx === key) {
                                            return {
                                              ...ite,
                                              checked: !ite.checked,
                                            };
                                          } else {
                                            return ite;
                                          }
                                        }),
                                      );
                                    }}
                                  />
                                </React.Fragment>
                              ))}
                            </Dialog.Content>
                            <Dialog.Actions>
                              <Button
                                onPress={() => {
                                  let isValid = false;
                                  list.map(item => {
                                    if (item.checked) {
                                      isValid = true;
                                      return;
                                    }
                                  });
                                  if (isValid) {
                                    SwitchRoleFunc();
                                  } else {
                                    setSnackbarText('Please select service');
                                    setSnackbarColor(theme.colors.error);
                                    setIsSnackbarVisible(true);
                                  }
                                }}>
                                Submit
                              </Button>
                            </Dialog.Actions>
                          </Dialog>
                        </Portal>
                      </View>
                    </View>
                  ) : null} */}
                  {/* Switch Role */}

                  {/* Refer & Earn */}
                  <View
                    style={[
                      Styles.marginTop12,
                      Styles.paddingVertical8,
                      Styles.flexRow,
                      Styles.BottomShadow,
                      Styles.borderRadius16,
                      Styles.homeBox,
                      {alignItems: 'center', width: '100%'},
                    ]}>
                    <Image
                      source={require('../../assets/refer.png')}
                      style={{width: 40, height: 40, marginLeft: 10}}
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={[
                          Styles.fontBold,
                          Styles.textColorDark,
                          Styles.fontSize18,
                          {marginLeft: 10},
                        ]}>
                        Invite to Samadhan
                      </Text>
                      <Title
                        style={[
                          Styles.fontSize18,
                          Styles.textCenter,
                          {
                            color: theme.colors.primaryLight,
                            marginRight: 10,
                          },
                        ]}>
                        Refer & earn
                      </Title>
                    </View>
                  </View>

                  {/* Menu */}
                  {/* <View style={style.borderBox}>
                    <Title
                      style={[
                        Styles.marginTop16,
                        Styles.fontBold,
                        Styles.fontSize20,
                        {marginLeft: 10},
                        Styles.fontBold,
                      ]}>
                      Menu
                    </Title>
                    {menuLoading ? (
                      <View
                        style={[
                          Styles.flex1,
                          Styles.flexGrow,
                          Styles.flexJustifyCenter,
                          Styles.flexAlignCenter,
                          {
                            paddingBottom: 20,
                          },
                        ]}>
                        <ActivityIndicator
                          size="small"
                          color={theme.colors.primary}
                        />
                      </View>
                    ) : (
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          paddingHorizontal: 12,
                          paddingVertical: 5,
                        }}>
                        {itemsToShow.map((item, index) => (
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate('Menu', {
                                data: menuData,
                                item: item,
                              })
                            }
                            key={item.id}
                            style={{
                              width: itemWidth,
                              padding: 5,
                              marginBottom: 12,
                              alignItems: 'center',
                            }}>
                            <Image
                              resizeMode="contain"
                              source={{
                                uri: item.icon,
                              }}
                              style={{
                                width: '43%',
                                height: 37,
                                borderRadius: 8,
                              }}
                            />
                            <Text
                              style={[
                                Styles.textColorDark,
                                Styles.marginTop8,
                                {
                                  fontWeight: '500',
                                  fontSize: 11.5,
                                  textAlign: 'center',
                                },
                              ]}>
                              {item.title}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        {menuData.length > 7 && !showAll && (
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate('Menu', {data: menuData})
                            }
                            style={{
                              width: itemWidth,
                              marginBottom: 16,
                              alignItems: 'center',
                              marginTop: 5,
                            }}>
                            <Icon
                              name="grid"
                              type="ionicon"
                              size={30}
                              color={theme.colors.primary}
                            />
                            <Text
                              style={[
                                Styles.textColorDark,
                                Styles.marginTop8,
                                {
                                  fontWeight: '500',
                                  fontSize: 12,
                                  textAlign: 'center',
                                },
                              ]}>
                              View More →
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View> */}

                  {/* Search Employee */}
                  <View style={[Styles.paddingTop16]}>
                    <Title
                      style={[
                        Styles.marginTop0,
                        Styles.fontBold,
                        Styles.fontSize18,
                        {marginLeft: 5},
                        Styles.fontBold,
                      ]}>
                      Search Employee
                    </Title>
                    <View
                      style={[
                        Styles.marginTop6,
                        Styles.marginHorizontal12,
                        Styles.flexRow,
                        Styles.flexSpaceBetween,
                      ]}>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('SearchEmployee');
                        }}
                        style={[
                          Styles.borderRadius8,
                          Styles.homeBox,
                          Styles.flexRow,
                          Styles.flexJustifyCenter,
                          Styles.flexAlignCenter,
                          Styles.paddingHorizontal12,
                          {width: 172, height: 92},
                        ]}>
                        <View
                          style={{
                            padding: 5,
                            backgroundColor: theme.colors.primaryLight,
                            borderRadius: 50,
                          }}>
                          <Image
                            source={require('../../assets/searchemployee.png')}
                            style={{width: 52, height: 52}}
                          />
                        </View>
                        <Text
                          style={[
                            Styles.fontSize16,
                            Styles.fontBold,
                            {marginLeft: 15},
                          ]}>
                          Search {'\n'}Employee
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('AddEmployee');
                        }}
                        style={[
                          Styles.borderRadius8,
                          Styles.homeBox,
                          Styles.flexRow,
                          Styles.flexJustifyCenter,
                          Styles.flexAlignCenter,
                          Styles.paddingHorizontal12,
                          {width: 172, height: 92},
                        ]}>
                        <View
                          style={{
                            padding: 5,
                            backgroundColor: theme.colors.primaryLight,
                            borderRadius: 50,
                          }}>
                          <Image
                            source={require('../../assets/addemployee.png')}
                            style={{width: 52, height: 52}}
                          />
                        </View>
                        <Text
                          style={[
                            Styles.fontSize16,
                            Styles.fontBold,
                            {marginLeft: 12},
                          ]}>
                          Add {'\n'}Employee
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        <Modal
          visible={catalogueImagesZoomVisible}
          onRequestClose={() => setCatalogueImagesZoomVisible(false)}
          transparent={true}>
          <View
            style={[
              Styles.flex1,
              {backgroundColor: 'rgba(0,0,0,0.85)', position: 'relative'},
            ]}>
            <Button
              mode="contained"
              style={{position: 'absolute', bottom: 16, zIndex: 20, right: 16}}
              onPress={() => {}}>
              View
            </Button>
            <Button
              mode="outlined"
              style={{
                position: 'absolute',
                bottom: 16,
                zIndex: 20,
                right: 104,
                backgroundColor: 'white',
              }}
              onPress={() => setCatalogueImagesZoomVisible(false)}>
              Close one
            </Button>
            <ImageViewer
              imageUrls={catalogueImagesZoom}
              backgroundColor="transparent"
              style={{height: 1920}}
            />
          </View>
        </Modal>
        <Modal
          contentContainerStyle={[
            {
              backgroundColor: 'white',
              padding: 20,
              width: '100%',
              height: '100%',
              alignSelf: 'center',
              position: 'relative',
            },
          ]}
          visible={markActivityModalVisible}
          onTouchCancel={() => setMarkActivityModalVisible(false)}
          onRequestClose={() => setMarkActivityModalVisible(false)}
          transparent={true}>
          <View
            style={[
              Styles.flex1,
              Styles.borderRadius4,
              {
                width: '80%',
                padding: 12,
                position: 'absolute',
                backgroundColor: '#fff',
                top: '40%',
                left: '11.5%',
                elevation: 6,
              },
            ]}>
            <FormInput
              label="Activity Type *"
              type="dropdown"
              data={activityType?.map(obj => obj.activity_name)}
              style={{
                backgroundColor: 'white',
              }}
              onChangeText={text => {
                setActivityRefNo(
                  activityType?.find(
                    item => '' + item.activity_name === '' + text,
                  )?.activity_refno,
                );
              }}
              value={'2'}
            />
            <TextInput
              style={{
                marginTop: 8,
              }}
              label={'Remarks'}
              onChangeText={text => setActivity(text)}
            />

            <View style={[Styles.flex1]}>
              <Button
                mode="contained"
                style={{
                  marginTop: 8,
                }}
                onPress={() => createActivity()}>
                {isActivityCreating ? 'Creating...' : 'Submit'}
              </Button>
              <Button
                mode="contained"
                style={{
                  marginTop: 8,

                  backgroundColor: '#722f37',
                }}
                onPress={() => {
                  setIsActivityCreating(false);
                  setMarkActivityModalVisible(false);
                }}>
                Close
              </Button>
            </View>
          </View>
        </Modal>
        <Portal>
          <Dialog visible={isProfileDialogVisible} dismissable={false}>
            <Dialog.Title>Profile Update</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                Please update your profile to continue further
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={RedirectToProfile}>Update Profile</Button>
              <Button onPress={hideProfileDialog}>Close</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Snackbar
          visible={isSnackbarVisible}
          onDismiss={() => setIsSnackbarVisible(false)}
          style={{backgroundColor: snackbarColor}}>
          {snackbarText}
        </Snackbar>
      </View>
    </SafeAreaView>
  );
};

export default DealerHomeScreen;

const style = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  borderBox: {
    borderWidth: 1,
    // width: '95%',
    alignSelf: 'center',
    marginTop: 10,
    borderColor: '#d3d3d3',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});
