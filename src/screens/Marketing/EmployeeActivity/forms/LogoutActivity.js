import {View, Text, Image, Modal, Pressable, ScrollView} from 'react-native';
import uuid from 'react-native-uuid';
import React from 'react';
import {Styles} from '../../../../styles/styles';
import {useState} from 'react';
import {DateTimePicker} from '@hashiprobr/react-native-paper-datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Provider from '../../../../api/Provider';
import {useIsFocused} from '@react-navigation/core';
import {useEffect} from 'react';
import {
  Button,
  RadioButton,
  Subheading,
  Checkbox,
  HelperText,
  Snackbar,
} from 'react-native-paper';
import Dropdown from '../../../../components/Dropdown';
import FormInput from '../common/Input';
import {createIconSetFromFontello} from 'react-native-vector-icons';
import {theme} from '../../../../theme/apptheme';
import moment from 'moment';
import {communication} from '../../../../utils/communication';
import {AWSImagePath} from '../../../../utils/paths';
import * as ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'react-native-document-picker';

let userID = 0,
  groupID = 0,
  companyID = 0,
  branchID = 0,
  companyAdminID = 0,
  designID = 0;
const LogoutActivityForm = ({navigation, route}) => {
  const [filePath, setFilePath] = React.useState(null);
  const [image, setImage] = React.useState(
    AWSImagePath + 'placeholder-image.png',
  );

  const [errorDI, setDIError] = React.useState(false);
  const [isImageReplaced, setIsImageReplaced] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState('');
  const [isSnackbarVisible, setIsSnackbarVisible] = React.useState('');
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const [entryType, setEntryType] = useState([]);
  const [companyName, setCompanyName] = useState([]);
  const [companyPerson, setCompanyPerson] = useState([]);
  const [activityType, setActivityType] = useState([]);
  const [activityStatus, setActivityStatus] = useState([]);
  const [nextVisitNo, setNextVisitNo] = useState([]);
  const [daysMonthsRefNo, setDaysMonthsRefNo] = useState([]);
  const [helpPerson, setHelpPerson] = useState([]);
  const [referenceRef, setReferenceRef] = useState([]);
  const [marketingExecName, setMarketingExecName] = useState([]);
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  const isFocused = useIsFocused();

  const [state, setState] = useState({
    logout_from_location: '',
    logout_to_location: '',
    logout_total_kms: '',
  });

  const [error, setError] = useState({
    logout_from_location: false,
    logout_to_location: false,
    logout_total_kms: false,
  });

  const handleSubmit = (
    last_gprs_activitytrack_refno,
    locationData,
    kilometer,
  ) => {
    const datas = new FormData();
    let params = {
      Sess_UserRefno: userID,
      Sess_company_refno: companyID,
      Sess_branch_refno: branchID,
      Sess_group_refno: groupID,
      Sess_designation_refno: designID,
      logout_from_location: state.logout_from_location,
      logout_to_location: state.logout_to_location,
      logout_total_kms: state.logout_total_kms,
      logout_date_time: moment(new Date()).format('DD-MM-YYYY H:mm:ss'),
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      kilometer: kilometer,
      gprs_location_name: locationData.gprs_location_name,
    };
    params.attach_receipt =
      filePath != null && filePath != undefined
        ? {
            name: 'receipt',
            type: filePath.type || file.mimeType,
            uri: filePath.uri,
          }
        : null;
    Object.keys(params).forEach(key => {
      if (params[key] === null) {
        delete params[key];
      }
    });
    datas.append('data', JSON.stringify(params));
    // datas.append(
    //   'attachment_photo',
    //   filePath != null &&
    //     filePath != undefined &&
    //     filePath.type != undefined &&
    //     filePath.type != null
    //     ? {
    //         name: 'appimage1212.jpg',
    //         type: filePath.type + '/*',
    //         uri:
    //           Platform.OS === 'android'
    //             ? filePath.uri
    //             : filePath.uri.replace('file://', ''),
    //       }
    //     : '',
    // );

    Provider.createDFEmployeeWithHeader(
      Provider.API_URLS.employee_gprs_logout,
      datas,
    )
      .then(response => {
        setIsButtonLoading(false);
        console.log('response is--->', response);
        if (response.data && response.data.code === 200) {
          route.params.activityStatus('logout_success');
          navigation.goBack();
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setIsSnackbarVisible(true);
          setSnackbarColor(theme.colors.error);
        } else {
          setSnackbarText(communication.InsertError);
          setIsSnackbarVisible(true);
          setSnackbarColor(theme.colors.error);
        }
      })
      .catch(e => {
        console.log('error-->', e);
        setIsButtonLoading(false);
        setSnackbarText(communication.NetworkError);
        setIsSnackbarVisible(true);
        setSnackbarColor(theme.colors.error);
      });
  };

  const calcKm = (lat1, lon1, lat2, lon2) => {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a =
      0.5 -
      c((lat2 - lat1) * p) / 2 +
      (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    const km = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    return km.toFixed(4);
  };

  const validateGPS = async () => {
    setIsButtonLoading(true);

    await Provider.createDFEmployee(
      Provider.API_URLS.get_employee_last_markactivity_gprs_data,
      {
        data: {
          Sess_UserRefno: userID,
        },
      },
    )
      .then(res => {
        let kilometer = calcKm(
          res?.data?.data[0]?.latitude,
          res?.data?.data[0]?.longitude,
          route.params.data.location?.latitude,
          route.params.data.location?.longitude,
        );
        handleSubmit(
          res?.data?.data[0]?.last_gprs_activitytrack_refno,
          route.params.data.location,
          kilometer,
        );
      })
      .catch(error => {
        console.log(error);
      });
  };

  const validateSubmit = () => {
    let isValid = true;

    if (state.logout_from_location == '') {
      isValid = false;
      setError(error => ({
        ...error,
        logout_from_location: true,
      }));
    }

    if (state.logout_to_location == '') {
      isValid = false;
      setError(error => ({
        ...error,
        logout_to_location: true,
      }));
    }

    if (state.logout_total_kms == '') {
      isValid = false;
      setError(error => ({
        ...error,
        logout_total_kms: true,
      }));
    }

    if (isValid) {
      validateGPS();
    } else {
      setSnackbarText('Please fill all mandatory fields.');
      setIsSnackbarVisible(true);
      setSnackbarColor(theme.colors.error);
    }
  };

  const fetchUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      groupID = JSON.parse(userData).Sess_group_refno;
      designID = JSON.parse(userData).Sess_designation_refno;
      companyID = JSON.parse(userData).Sess_company_refno;
      branchID = JSON.parse(userData).Sess_branch_refno;
      companyAdminID = JSON.parse(userData).Sess_CompanyAdmin_UserRefno;
    }
  };
  const pickDocument = async () => {
    try {
      const documentPickerResult = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles], // Allow all document types
      });
      console.log('document--->', documentPickerResult);
      setDIError(false);
      const arrExt = documentPickerResult[0].uri.split('.');
      const unique_id = uuid.v4();
      // setDesignImage(
      //   AWSImagePath + unique_id + "." + arrExt[arrExt.length - 1]
      // );
      setImage(documentPickerResult[0].uri);
      setFilePath(documentPickerResult[0]);
      setIsVisible(false);

      if (route.params.type === 'edit' || route.params.type === 'verify') {
        setIsImageReplaced(true);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const openCamera = async () => {
    // await getCameraPermission();
    const result = await ImagePicker.launchCamera({
      allowsEditing: true,
      quality: 1,
    });
    console.warn('camera result is--->', result);
    if (!result.canceled) {
      setDIError(false);
      const arrExt = result.assets[0].uri.split('.');
      const unique_id = uuid.v4();
      // setDesignImage(
      //   AWSImagePath + unique_id + "." + arrExt[arrExt.length - 1]
      // );
      setImage(result.assets[0].uri);
      setFilePath(result.assets[0]);
      setIsVisible(false);
      if (route.params.type === 'edit' || route.params.type === 'verify') {
        setIsImageReplaced(true);
      }
    }
  };
  const chooseFile = async () => {
    let result = await ImagePicker.launchImageLibrary({
      // mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      //aspect: [4, 3],
      quality: 1,
    });
    if (!result.didCancel) {
      setDIError(false);
      const arrExt = result.assets[0].uri.split('.');
      const unique_id = uuid.v4();
      // setDesignImage(
      //   AWSImagePath + unique_id + "." + arrExt[arrExt.length - 1]
      // );
      setImage(result.assets[0].uri);
      setFilePath(result.assets[0]);
      if (route.params.type === 'edit' || route.params.type === 'verify') {
        setIsImageReplaced(true);
      }
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchUser();
    }
  }, [isFocused]);

  return (
    <View style={[Styles.flex1, Styles.backgroundColor]}>
      <ScrollView>
        <View style={[Styles.flex1, Styles.padding16, {background: '#fff'}]}>
          <View style={[Styles.flex1, Styles.marginTop16]}>
            <FormInput
              label="Location From"
              onChangeText={text => {
                setState(state => ({
                  ...state,
                  logout_from_location: text,
                }));

                setError(state => ({
                  ...state,
                  logout_from_location: false,
                }));
              }}
              error={error.logout_from_location}
              value={state.logout_from_location}
            />
            <FormInput
              label="Location To"
              onChangeText={text => {
                setState(state => ({
                  ...state,
                  logout_to_location: text,
                }));

                setError(state => ({
                  ...state,
                  logout_to_location: false,
                }));
              }}
              error={error.logout_to_location}
              value={state.logout_to_location}
            />
            <FormInput
              label="Total Kilometer"
              keyboardType={'number-pad'}
              onChangeText={text => {
                setState(state => ({
                  ...state,
                  logout_total_kms: text,
                }));

                setError(state => ({
                  ...state,
                  logout_total_kms: false,
                }));
              }}
              error={error.logout_total_kms}
              value={state.logout_total_kms}
            />
            <View
              style={[Styles.flexRow, Styles.flexAlignEnd, Styles.marginTop16]}>
              <Image
                source={{uri: image}}
                style={[Styles.width104, Styles.height96, Styles.border1]}
              />
              <Button mode="text" onPress={() => setIsVisible(true)}>
                {filePath !== null ? 'Replace' : 'Attachment / Slip Copy'}
              </Button>
            </View>
          </View>
          <Modal
            visible={isVisible}
            animationType="fade" // You can customize the animation type
            transparent={true}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  height: 150,
                  width: '85%',
                  borderRadius: 5,
                  padding: 20,
                  alignSelf: 'center', // Center the content horizontally
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    alignSelf: 'center',
                    marginTop: 10,
                  }}>
                  <Pressable
                    onPress={e => {
                      openCamera();
                    }}
                    style={{padding: 10, alignItems: 'center'}}>
                    <Icon
                      name="camera-outline"
                      color={theme.colors.primary}
                      type="ionicon"
                      size={40}
                    />
                    <Button mode="text">Camera</Button>
                  </Pressable>
                  <Pressable
                    onPress={e => {
                      pickDocument();
                    }}
                    style={{padding: 10, alignItems: 'center'}}>
                    <Icon
                      name="folder-outline"
                      color={theme.colors.primary}
                      type="ionicon"
                      size={40}
                    />
                    <Button mode="text">Gallery</Button>
                  </Pressable>
                </View>
                <Pressable
                  onPress={e => {
                    setIsVisible(!isVisible);
                  }}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: 10,
                    marginBottom: 10,
                  }}>
                  <Icon
                    name="close-circle"
                    color={'red'}
                    type="ionicon"
                    size={30}
                  />
                </Pressable>
              </View>
            </View>
          </Modal>
          <Button
            onPress={validateSubmit}
            mode="contained"
            disabled={isButtonLoading}
            loading={isButtonLoading}
            style={[Styles.marginTop16, {width: '100%', alignSelf: 'center'}]}>
            Submit
          </Button>
        </View>
      </ScrollView>
      <Snackbar
        visible={isSnackbarVisible}
        onDismiss={() => setIsSnackbarVisible(false)}
        style={{backgroundColor: snackbarColor}}>
        {snackbarText}
      </Snackbar>
    </View>
  );
};

export default LogoutActivityForm;
