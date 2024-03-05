import {View, Text} from 'react-native';
import React from 'react';
// import * as Location from "expo-location";
import Geolocation from 'react-native-geolocation-service';
import {Button, TextInput} from 'react-native-paper';
import {Modal, Platform, PermissionsAndroid} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Provider from '../../api/Provider';
import moment from 'moment';
import {Styles} from '../../styles/styles';
import FormInput from './EmployeeActivity/common/Input';
import Geocoder from 'react-native-geocoding';
let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_group_refno = 0;
let Sess_designation_refno = 0;

const Dashboard = () => {
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

  // ?GPRS - LOGIN
  //   "Sess_UserRefno,
  //   "Sess_company_refno,
  //   "Sess_branch_refno": "0",
  //   "Sess_group_refno": "0",
  //   "Sess_designation_refno": "0",
  //   "login_date_time": "20-04-2023 10:25:52",
  //   "latitude": "13.075850",
  //   "longitude": "80.216560",
  //   "location_name": "Shenoy Nagar, Chennai"

  // ?GPRS - LOGOUT
  //   "Sess_UserRefno": "0",
  //   "Sess_company_refno": "0",
  //   "Sess_branch_refno": "0",
  //   "Sess_group_refno": "0",
  //   "Sess_designation_refno": "0",
  //   "logout_date_time": "20-04-2023 10:25:52",
  //   "latitude": "12.987140",
  //   "longitude": "80.175110",
  //   "location_name": "Airport, Chennai"

  //?GPRS - Create activity
  //   "Sess_UserRefno": "0",
  //   "Sess_company_refno": "0",
  //   "Sess_branch_refno": "0",
  //   "Sess_group_refno": "0",
  //   "Sess_designation_refno": "0",
  //   "last_gprs_activitytrack_refno": "0",
  //   "activity_date_time": "20-04-2023 10:25:52",
  //   "activity_refno": "0",
  //   "activity_remarks": "test",
  //   "latitude": "13.084380",
  //   "longitude": "80.217830",
  //   "kilometer": "10",
  //   "location_name": "Anna Arch, Chennai"

  //?GPRS - Live tracking create
  // "Sess_UserRefno": "0",
  // "Sess_company_refno": "0",
  // "Sess_branch_refno": "0",
  // "Sess_group_refno": "0",
  // "Sess_designation_refno": "0",
  // "last_gprs_livetrack_refno": "0",
  // "tracking_date_time": "20-04-2023 10:25:52",
  // "kilometer": "10",
  // "latitude": "13.076850",
  // "longitude": "80.210320",
  // "location_name": "Arumbakkam, Chennai"

  console.log(activity, 'activity');
  const getLocation = async () => {
    let status;
    if (Platform.OS === 'ios') {
      const permissionResult = await request(
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      );
      status = permissionResult === 'granted';
    } else if (Platform.OS === 'android') {
      const permissionResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      status = permissionResult === PermissionsAndroid.RESULTS.GRANTED;
    }
    console.warn('location status--->', status);
    if (!status) {
      setErrorMsg('Permission to access location was denied');
      return;
    }
    Geolocation.getCurrentPosition(
      async locationGps => {
        if (locationGps) {
          const address = await Geocoder.from(
            locationGps.coords.latitude,
            locationGps?.coords?.longitude,
          )
            .then(json => {
              var addressComponent = json;
              return addressComponent;
            })
            .catch(error => console.warn(error));
          console.log('latitude-longitude is--->', locationGps?.coords);
          console.log('address is--->', address.results[0]);
          setLocation({
            latitude: locationGps?.coords?.latitude,
            longitude: locationGps?.coords?.longitude,
            login_date_time: moment
              .unix(locationGps?.timestamp)
              .format('DD-MM-yyyy HH:mm:ss'),
            logout_date_time: moment
              .unix(locationGps?.timestamp)
              .format('DD-MM-yyyy HH:mm:ss'),
            location_name: `${address[0]?.street}, ${address[0]?.district}, ${address[0]?.city}, ${address[0]?.subregion}, ${address[0]?.country}`,
          });
        }
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const getLiveLocation = async () => {
    let status;
    if (Platform.OS === 'ios') {
      const permissionResult = await request(
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      );
      status = permissionResult === 'granted';
    } else if (Platform.OS === 'android') {
      const permissionResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      status = permissionResult === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (!status) {
      setErrorMsg('Permission to access location was denied');
      return;
    }
    Geolocation.getCurrentPosition(
      async locationGps => {
        if (locationGps) {
          const address = await Geocoder.from(
            locationGps.coords.latitude,
            locationGps?.coords?.longitude,
          )
            .then(json => {
              var addressComponent = json;
              return addressComponent;
            })
            .catch(error => console.warn(error));
          console.log('latitude-longitude is--->', locationGps?.coords);
          console.log('address is--->', address.results[0]);
          setLiveLocation({
            latitude: locationGps?.coords?.latitude,
            longitude: locationGps?.coords?.longitude,
            login_date_time: moment
              .unix(locationGps?.timestamp)
              .format('DD-MM-yyyy HH:mm:ss'),
            logout_date_time: moment
              .unix(locationGps?.timestamp)
              .format('DD-MM-yyyy HH:mm:ss'),
            location_name: `${address[0]?.street}, ${address[0]?.district}, ${address[0]?.city}, ${address[0]?.subregion}, ${address[0]?.country}`,
          });
        }
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const getLastTracked = async () => {
    await Provider.createDFEmployee(
      Provider.API_URLS.get_employee_last_livetracking_gprs_data,
      {
        data: {
          Sess_UserRefno: '8',
        },
      },
    )
      .then(res => {
        console.log(res?.data, 'lastrack');
      })
      .catch(error => {
        console.log(error);
      });
  };
  const trackUserLocation = async () => {
    console.log('-->1');
    await getLastTracked();
    // if (lastTracked) {
    await getLiveLocation();
    console.log(lastTracked, liveLocation, '<===llastttracled');
    // }
  };

  const fetchActivityType = async () => {
    console.log('activity type');

    await Provider.createDFEmployee(
      Provider.API_URLS.get_activitytype_employeeactivityform,
      {
        data: {
          Sess_UserRefno,
          Sess_company_refno,
        },
      },
    ).then(res => setActivityType(res.data?.data));
  };

  const createActivity = async () => {
    await getLastActivityData();
    await getLocation();

    if (distance && location) {
      calcKm(
        lastActivityData?.latitude,
        lastActivityData?.longitude,
        location?.latitude,
        location?.longitude,
      );
      await Provider.createDFEmployee(
        Provider.API_URLS.employee_gprs_markactivity_create,
        {
          data: {
            Sess_UserRefno,
            Sess_company_refno,
            Sess_branch_refno,
            Sess_group_refno,
            Sess_designation_refno,
            last_gprs_activitytrack_refno:
              lastActivityData?.last_gprs_activitytrack_refno,
            activity_date_time: lastActivityData?.activity_date_time,
            activity_refno: activityRefNo,
            activity_remarks: activity,
            latitude: location?.latitude,
            longitude: location?.longitude,
            kilometer: distance,
            location_name: location?.location_name,
          },
        },
      )
        .then(res => {
          console.log(res);
          setMarkActivityModalVisible(false);
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const getLastActivityData = async () => {
    await Provider.createDFEmployee(
      Provider.API_URLS.get_employee_last_markactivity_gprs_data,
      {
        data: {
          Sess_UserRefno,
        },
      },
    )
      .then(res => {
        setLastActivityData(res?.data?.data[0]);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const fetchUser = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('user'));
    Sess_UserRefno = data.UserID;
    Sess_company_refno = data.Sess_company_refno;
    Sess_branch_refno = data.Sess_branch_refno;
    Sess_group_refno = data.Sess_group_refno;
    Sess_designation_refno = data.Sess_designation_refno;
    await fetchActivityType();
  };

  React.useEffect(() => {
    if (isFocused) {
      fetchUser();
    }
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      trackUserLocation();
    }, 15000);

    return () => clearInterval(timer);
  }, []);

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
  // const calcKm = (lat1, lon1, lat2, lon2) => {
  //   var p = 0.017453292519943295; // Math.PI / 180
  //   var c = Math.cos;
  //   var a =
  //     0.5 -
  //     c((lat2 - lat1) * p) / 2 +
  //     (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

  //   const km = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  //   setDistance(km);
  // };

  const loginMarketer = async () => {
    setIsLoginProcessing(true);
    await getLocation();
    if (location?.latitude) {
      await Provider.createDFEmployee(Provider.API_URLS.employee_gprs_login, {
        data: {
          Sess_UserRefno,
          Sess_company_refno,
          Sess_branch_refno,
          Sess_group_refno,
          Sess_designation_refno,
          ...location,
        },
      })
        .then(res => {
          setIsLoginProcessing(false);
          console.log(res?.data?.data);
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const logoutMarketer = async () => {
    await getLocation();
    if (location?.latitude) {
      await Provider.createDFEmployee(Provider.API_URLS.employee_gprs_logout, {
        data: {
          Sess_UserRefno,
          Sess_company_refno,
          Sess_branch_refno,
          Sess_group_refno,
          Sess_designation_refno,
          ...location,
        },
      })
        .then(res => {
          console.log(res?.data?.data);
        })
        .catch(error => {
          console.log(error);
        });
    }
  };
  return (
    <View style={[Styles.flex1, Styles.flexAlignCenter]}>
      <Snackbar
        visible={isLoginProcessing}
        onDismiss={() => setIsSnackbarVisible(false)}
        // style={{ backgroundColor: "theme.colors.success" }}
      >
        "Loging In..."
      </Snackbar>{' '}
      <Snackbar
        visible={!isLoginProcessing}
        onDismiss={() => setIsSnackbarVisible(false)}
        style={{backgroundColor: 'green'}}>
        "Logged In"
      </Snackbar>{' '}
      <Snackbar
        visible={isSnackbarVisible}
        onDismiss={() => setIsSnackbarVisible(false)}
        style={{backgroundColor: theme.colors.error}}>
        {snackbarText}
      </Snackbar>
      <Button
        mode="contained"
        style={{width: 100, marginTop: 10, marginBottom: 10}}
        onPress={loginMarketer}>
        Login
      </Button>
      <Button
        mode="contained"
        onPress={() => setMarkActivityModalVisible(true)}
        style={{backgroundColor: 'blue', marginBottom: 10}}>
        Mark Activity
      </Button>
      <Button
        mode="contained"
        style={{backgroundColor: 'crimson', marginBottom: 10}}
        onPress={logoutMarketer}>
        Logout
      </Button>
      <Modal
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 20,
          width: '50%',
          height: '50%',
          alignSelf: 'center',
        }}
        visible={markActivityModalVisible}
        onRequestClose={() => setMarkActivityModalVisible(false)}
        transparent={true}>
        <View
          style={[
            Styles.flex1,
            {backgroundColor: 'rgba(0,0,0,0.85)', position: 'relative'},
          ]}>
          <TextInput
            style={{
              position: 'absolute',
              zIndex: 20,
              top: '30%',
              width: '60%',
              left: '20%',
              backgroundColor: 'white',
            }}
            label={'Activity'}
            onChangeText={text => setActivity(text)}
          />

          <FormInput
            label="Activity Type"
            type="dropdown"
            data={activityType?.map(obj => obj.activity_name)}
            style={{
              position: 'absolute',
              top: 365,
              zIndex: 20,
              //   right: 16,
              // bottom: "300px",
              width: '60%',
              left: '20%',
              backgroundColor: 'white',
            }}
            // setState((state) => ({
            //   ...state,
            //   activity_refno: text,
            // }));

            onChangeText={text => {
              setActivityRefNo(
                activityType?.find(
                  item => '' + item.activity_name === '' + text,
                )?.activity_refno,
              );
            }}
            // setError((state) => ({
            //   ...state,
            //   district_refno: false,
            // }));
            // }}
            // setError((state) => ({
            //   ...state,
            //   district_refno: false,
            // }));
            // }}
            value={'2'}
            // error={error.district_refno}
          />
          <Button
            mode="contained"
            style={{
              position: 'absolute',
              //   bottom: ,
              zIndex: 20,
              top: '50%',
              width: '28%',
              right: '20%',
              backgroundColor: '#008a7d',
            }}
            onPress={() => createActivity()}>
            Submit
          </Button>
          <Button
            mode="contained"
            style={{
              position: 'absolute',
              zIndex: 20,
              top: '50%',
              width: '30%',
              left: '20%',
              backgroundColor: '#722f37',
            }}
            onPress={() => setMarkActivityModalVisible(false)}>
            Close
          </Button>
        </View>
      </Modal>
    </View>
  );
};

export default Dashboard;
