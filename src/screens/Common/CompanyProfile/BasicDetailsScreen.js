import React, { useEffect, useRef, useState } from 'react';
import FormData from 'form-data';
import { View, Dimensions, ScrollView, Image, Platform, PermissionsAndroid, Pressable, Modal, SafeAreaView } from 'react-native';
import {
  ActivityIndicator,
  Card,
  HelperText,
  Snackbar,
  Subheading,
  Switch,
  TextInput,
  Button,
} from 'react-native-paper';
import { TabBar, TabView } from 'react-native-tab-view';
import Provider from '../../../api/Provider';
import Header from '../../../components/Header';
import { Styles } from '../../../styles/styles';
import { theme } from '../../../theme/apptheme';
import { communication } from '../../../utils/communication';
import * as ImagePicker from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import { AWSImagePath } from '../../../utils/paths';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useIsFocused,
  useFocusEffect,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { APIConverter } from '../../../utils/apiconverter';
import DFButton from '../../../components/Button';
import { StackActions } from '@react-navigation/native';
//#region camera related changes
import * as DocumentPicker from "react-native-document-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function getFileType(url, setImage) {
  const fileExtension = url.type.split("/").pop().toLowerCase();
  if (
    fileExtension === "jpg" ||
    fileExtension === "jpeg" ||
    fileExtension === "png" ||
    fileExtension === "gif"
  ) {
    setImage(url.uri);
  } else if (fileExtension === "pdf") {
    setImage("pdf");
  } else if (fileExtension === "doc" || fileExtension === "docx") {
    setImage("doc");
  } else if (fileExtension === "xls" || fileExtension === "xlsx") {
    setImage("xls");
  }
}
//#endregion

export const navigationRef = createNavigationContainerRef();

const windowWidth = Dimensions.get('window').width;
let userID = 0,
  sess_name = '',
  sess_mobile = '',
  Sess_company_refno = 0,
  userRole = 0;

const BasicDetailsScreen = ({ route, navigation }) => {
  //#region Variables
  const isFocused = useIsFocused();
  const [index, setIndex] = useState(
    route.params && route.params.from === 'brand' ? 2 : 0,
  );

  const [companyID, setCompanyID] = useState('0');
  const [companyName, setCompanyName] = useState('');
  const [companyNameInvalid, setCompanyNameInvalid] = useState('');
  const companyNameRef = useRef({});

  const [contactName, setContactName] = useState('');
  const [contactNameInvalid, setContactNameInvalid] = useState('');
  const contactNameRef = useRef({});

  const [contactNumber, setContactNumber] = useState('');
  const [contactNumberInvalid, setContactNumberInvalid] = useState('');
  const contactNumberRef = useRef({});

  const [gstNumber, setGSTNumber] = useState('');
  const [gstNumberInvalid, setGSTNumberInvalid] = useState('');
  const gstNumberRef = useRef({});

  const [panNumber, setPANNumber] = useState('');
  const [panNumberInvalid, setPANNumberInvalid] = useState('');
  const panNumberRef = useRef({});

  const [address, setAddress] = useState('');
  const [addressInvalid, setAddressInvalid] = useState('');
  const addressRef = useRef({});

  const [location, setLocation] = useState('');
  const [locationInvalid, setLocationInvalid] = useState('');
  const locationRef = useRef({});

  const [cityFullData, setCityFullData] = React.useState([]);
  const [cityData, setCityData] = React.useState([]);
  const [cityName, setCityName] = React.useState('');
  const [cityID, setCityID] = React.useState(0);
  const [errorCN, setCNError] = React.useState(false);
  const cityRef = useRef({});

  const [statesFullData, setStatesFullData] = React.useState([]);
  const [statesData, setStatesData] = React.useState([]);
  const [stateName, setStateName] = React.useState('');
  const [stateID, setStateID] = React.useState(0);
  const [errorSN, setSNError] = React.useState(false);

  const [pincode, setPincode] = useState('');
  const [pincodeInvalid, setPincodeInvalid] = useState('');
  const pincodenRef = useRef({});

  const [accountNo, setAccountNo] = useState('');
  const [accountNoInvalid, setAccountNoInvalid] = useState('');
  const accountNoRef = useRef({});

  const [bankName, setBankName] = useState('');
  const [bankNameInvalid, setBankNameInvalid] = useState('');
  const bankNameRef = useRef({});

  const [bankBranchName, setBankBranchName] = useState('');
  const [bankBranchNameInvalid, setBankBranchNameInvalid] = useState('');
  const bankBranchNameRef = useRef({});

  const [ifscCode, setIfscCode] = useState('');
  const [ifscCodeInvalid, setIfscCodeInvalid] = useState('');
  const ifscCodeRef = useRef({});

  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const [cnPrefix, setCNPrefix] = useState('');
  const [cnPrefixInvalid, setCNPrefixInvalid] = useState('');
  const cnPrefixRef = useRef({});

  const [qbPrefix, setQBPrefix] = useState('');
  const qbPrefixRef = useRef({});

  const [ecPrefix, setECPrefix] = useState('');
  const [ecPrefixInvalid, setECPrefixInvalid] = useState('');
  const ecPrefixRef = useRef({});

  const [poPrefix, setPOPrefix] = useState('');
  const [poPrefixInvalid, setPOPrefixInvalid] = useState('');
  const poPrefixRef = useRef({});

  const [soPrefix, setSOPrefix] = useState('');
  const [soPrefixInvalid, setSOPrefixInvalid] = useState('');
  const soPrefixRef = useRef({});

  const [logoImage, setLogoImage] = useState('');
  const [image, setImage] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const [errorLogo, setLogoError] = useState(false);

  const [isImageReplaced, setIsImageReplaced] = React.useState(false);
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarColor, setSnackbarColor] = React.useState(theme.colors.error);
  const [snackbarText, setSnackbarText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  const [singleLoad, setSingleLoad] = React.useState(0);
  //#endregion

  //#region Functions

  //#region camera related changes
  const [isVisible, setIsVisible] = useState(false);
  const getCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
    }
  };

  const pickDocument = async () => {
    try {
      const documentPickerResult = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles], // Allow all document types
      });
      console.log("document--->", documentPickerResult);
      setFilePath(documentPickerResult[0]);
      setIsVisible(false);
      getFileType(documentPickerResult[0], setImage);
      // }

      setIsVisible(false);

      if (route.params.type === "edit" || route.params.type === "verify") {
        setIsImageReplaced(true);
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };
  const openCamera = async () => {
    // await getCameraPermission();
    const result = await ImagePicker.launchCamera({
      allowsEditing: true,
      quality: 1,
    });
    console.warn("camera result is--->", result);
    if (!result.canceled) {
      setFilePath(result.assets[0]);
      getFileType(result.assets[0], setImage);
      setIsVisible(false);
      if (route.params.type === "edit" || route.params.type === "verify") {
        setIsImageReplaced(true);
      }
    }
  };

  //#endregion

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      userRole = JSON.parse(userData).Sess_group_refno;
      sess_name = JSON.parse(userData).Sess_FName;
      sess_mobile = JSON.parse(userData).Sess_MobileNo;
      Sess_company_refno = JSON.parse(userData).Sess_company_refno;
      if (singleLoad == 0) {
        FetchBasicDetails();
      }
    }
  };
  let tempStateName = '';
  let tempCityID = '';
  const FetchBasicDetails = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.GetDealerCompanyBasicDetails,
      params,
    )
      .then(response => {
        setSingleLoad(1);
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            if (response.data.data[0].recordcount != '0') {
              response.data.data = APIConverter(
                response.data.data,
                null,
                'basicDetails',
              );

              setCompanyName(
                response.data.data[0].companyName
                  ? response.data.data[0].companyName
                  : '',
              );
              setCompanyID(
                response.data.data[0].id ? response.data.data[0].id : '0',
              );
              setContactName(
                response.data.data[0].contactPersonName
                  ? response.data.data[0].contactPersonName
                  : '',
              );
              setContactNumber(
                response.data.data[0].contactPersonNumber
                  ? response.data.data[0].contactPersonNumber
                  : '',
              );
              setGSTNumber(
                response.data.data[0].gstNumber
                  ? response.data.data[0].gstNumber
                  : '',
              );
              setPANNumber(
                response.data.data[0].pan ? response.data.data[0].pan : '',
              );
              setLocation(
                response.data.data[0].locationName
                  ? response.data.data[0].locationName
                  : '',
              );
              setAddress(
                response.data.data[0].addressLine
                  ? response.data.data[0].addressLine
                  : '',
              );
              setStateName(
                response.data.data[0].stateName === null
                  ? ''
                  : response.data.data[0].stateName,
              );
              setStateID(
                response.data.data[0].stateID === null
                  ? ''
                  : response.data.data[0].stateID,
              );
              tempStateName =
                response.data.data[0].stateName === null
                  ? ''
                  : response.data.data[0].stateName;
              setCityName(
                response.data.data[0].cityName === null
                  ? ''
                  : response.data.data[0].cityName,
              );
              setCityID(
                response.data.data[0].cityID === null
                  ? ''
                  : response.data.data[0].cityID,
              );
              tempCityID =
                response.data.data[0].cityID === null
                  ? ''
                  : response.data.data[0].cityID;
              setPincode(
                response.data.data[0].pincode === null ||
                  response.data.data[0].pincode === 0
                  ? ''
                  : response.data.data[0].pincode.toString(),
              );
              setAccountNo(
                response.data.data[0].accountNumber === null ||
                  response.data.data[0].accountNumber === 0
                  ? ''
                  : response.data.data[0].accountNumber.toString(),
              );
              setBankName(
                response.data.data[0].bankName
                  ? response.data.data[0].bankName
                  : '',
              );
              setBankBranchName(
                response.data.data[0].branchName
                  ? response.data.data[0].branchName
                  : '',
              );
              setIfscCode(
                response.data.data[0].ifscCode
                  ? response.data.data[0].ifscCode
                  : '',
              );
              setCNPrefix(
                response.data.data[0].companyNamePrefix
                  ? response.data.data[0].companyNamePrefix
                  : '',
              );
              setECPrefix(
                response.data.data[0].employeeCodePrefix
                  ? response.data.data[0].employeeCodePrefix
                  : '',
              );
              setPOPrefix(
                response.data.data[0].purchaseOrderPrefix
                  ? response.data.data[0].purchaseOrderPrefix
                  : '',
              );
              setSOPrefix(
                response.data.data[0].salesOrderPrefix
                  ? response.data.data[0].salesOrderPrefix
                  : '',
              );
              setIsSwitchOn(
                response.data.data[0].showBrand
                  ? response.data.data[0].showBrand == '1'
                    ? true
                    : false
                  : false,
              );
              setLogoImage(response.data.data[0].companyLogo);
              setImage(
                response.data.data[0].companyLogo
                  ? response.data.data[0].companyLogo
                  : AWSImagePath + 'placeholder-image.png',
              );
              setFilePath(
                response.data.data[0].companyLogo
                  ? response.data.data[0].companyLogo
                  : null,
              );
              if (userRole != 4) {
                setQBPrefix(
                  response.data.data[0].quotationPrefix
                    ? response.data.data[0].quotationPrefix
                    : '',
                );
              }
            } else {
              setContactName(sess_name);
              setContactNumber(sess_mobile);
            }
          }
          FetchStates(response.data.data[0].stateID);
          setIsLoading(false);
        }
      })
      .catch(e => {
        setIsLoading(false);
      });
  };

  const FetchStates = stateID => {
    Provider.createDFCommon(Provider.API_URLS.GetStateDetails, null)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setStatesFullData(response.data.data);
            const states = response.data.data.map(data => data.stateName);
            setStatesData(states);

            if (stateID != '') {
              setStateName(
                response.data.data.find(el => {
                  return el.stateID == stateID;
                }).stateName,
              );
            }
            if (tempStateName) {
              FetchCities(tempStateName, response.data.data);
            } else {
              FetchCities(
                response.data.data.find(el => {
                  return el.stateID == stateID;
                }).stateName,
                response.data.data,
              );
            }
          }
        }
      })
      .catch(e => { });
  };

  const FetchCities = (tempStateName, stateData) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        state_refno: stateData
          ? stateData.find(el => {
            return el.stateName == tempStateName;
          }).stateID
          : statesFullData.find(el => {
            return el.stateName == tempStateName;
          }).stateID,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.GetDistrictDetailsByStateRefno,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setCityFullData(response.data.data);
            const cities = response.data.data.map(data => data.cityName);
            setCityData(cities);
            if (tempCityID) {
              setCityName(
                response.data.data.find(el => {
                  return el.cityID == tempCityID;
                }).cityName,
              );
            }
          }
        }
      })
      .catch(e => { });
  };

  // useEffect(() => {
  //   GetUserID();
  // }, []);

  useFocusEffect(
    React.useCallback(() => {
      const refreshScreen = () => {
        // Refresh the screen here
        GetUserID();
      };
      refreshScreen();
      return () => { };
    }, [navigationRef]),
  );

  const onCompanyNameChanged = text => {
    setCompanyName(text);
    setCompanyNameInvalid(false);
  };
  const onContactNameChanged = text => {
    setContactName(text);
    setContactNameInvalid(false);
  };
  const onContactNumberChanged = text => {
    setContactNumber(text);
    setContactNumberInvalid(false);
  };
  const onGSTNumberChanged = text => {
    const alphanumericOnly = text.replace(/[^a-zA-Z0-9]/g, '');
    setGSTNumber(alphanumericOnly);
    setGSTNumberInvalid(false);
  };
  const onPANNumberChanged = text => {
    const alphanumericOnly = text.replace(/[^a-zA-Z0-9]/g, '');
    setPANNumber(alphanumericOnly);
    setPANNumberInvalid(false);
  };
  const onAddressChanged = text => {
    setAddress(text);
    setAddressInvalid(false);
  };
  const onLocationChanged = text => {
    const alphanumericOnly = text.replace(/[^a-zA-Z0-9]/g, '');
    setLocation(alphanumericOnly);
    setLocationInvalid(false);
  };
  const onCityNameSelected = selectedItem => {
    setCityName(selectedItem);
    setCNError(false);
  };
  const onStateNameSelected = selectedItem => {
    setStateName(selectedItem);
    setSNError(false);
    cityRef.current.reset();
    setCityName('');
    FetchCities(selectedItem);
  };
  const onPincodeChanged = text => {
    const numeric = text.replace(/[^0-9]/g, '');
    setPincode(numeric);
    setPincodeInvalid(false);
  };

  const onAccountNoChanged = text => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setAccountNo(numericValue);
    setAccountNoInvalid(false);
  };
  const onBankNameChanged = text => {
    const alphanumericAndSpaceOnly = text.replace(/[^a-zA-Z0-9\s]/g, '');
    setBankName(alphanumericAndSpaceOnly);
    setBankNameInvalid(false);
  };
  const onBankBranchNameChanged = text => {
    const alphanumericAndSpaceOnly = text.replace(/[^a-zA-Z0-9\s]/g, '');
    setBankBranchName(alphanumericAndSpaceOnly);
    setBankBranchNameInvalid(false);
  };
  const onIfscCodeChanged = text => {
    const alphanumericOnly = text.replace(/[^a-zA-Z0-9\s]/g, '');
    setIfscCode(alphanumericOnly.toUpperCase());
    setIfscCodeInvalid(false);
  };

  const onCNPChanged = text => {
    setCNPrefix(text);
    setCNPrefixInvalid(false);
  };
  const onQBPChanged = text => {
    setQBPrefix(text);
  };
  const onECPChanged = text => {
    setECPrefix(text);
    setECPrefixInvalid(false);
  };
  const onPOPChanged = text => {
    setPOPrefix(text);
    setPOPrefixInvalid(false);
  };
  const onSOPChanged = text => {
    setSOPrefix(text);
    setSOPrefixInvalid(false);
  };

  const chooseFile = async () => {
    let result = await ImagePicker.launchImageLibrary({
      // mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      //aspect: [4, 3],
      quality: 1,
    });
    if (!result.didCancel) {
      setLogoError(false);
      const arrExt = result.assets[0].uri.split('.');
      const unique_id = uuid.v4();
      setLogoImage(AWSImagePath + unique_id + '.' + arrExt[arrExt.length - 1]);
      setImage(result.assets[0].uri);
      setFilePath(result.assets[0]);
      setIsImageReplaced(true);
    }
  };

  const GetUserDetails = user_refno => {
    setIsButtonLoading(true);
    let params = {
      data: {
        user_refno: user_refno,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.UserFromRefNo, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          const user = {
            UserID: response.data.data.Sess_UserRefno,
            FullName:
              response.data.data.Sess_FName === ''
                ? response.data.data.Sess_Username
                : response.data.data.Sess_FName,
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
            Sess_if_create_brand: response.data.data.Sess_if_create_brand,
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

          StoreUserData(user, navigation);
        } else {
          setSnackbarText(communication.InvalidUserNotExists);
          setIsSnackbarVisible(true);
        }
        setIsButtonLoading(false);
      })
      .catch(e => {
        setSnackbarText(e.message);
        setIsSnackbarVisible(true);
        setIsButtonLoading(false);
      });
  };

  const StoreUserData = async user => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      // navigation.navigate("HomeStack", {
      //   type: "edit",
      //   fetchData: FetchData,
      //   data: {
      //     id: data.item.id,
      //     departmentName: data.item.departmentName,
      //     display: data.item.display,
      //   },
      // });
      navigation.dispatch(
        StackActions.replace('HomeStack', {
          userDetails: user,
        })
      );
      navigation.goBack();

    } catch (error) {
      console.log(error);
    }
  };

  const InsertData = () => {
    //Sess_company_refno
    let path = '';

    if (Sess_company_refno == 0) {
      path = Provider.API_URLS.dealercompanybasicdetailscreate;
    } else {
      path = Provider.API_URLS.DealerCompanyBasicDetailsUpdate;
    }

    const datas = new FormData();
    const stateData = statesFullData.find(el => {
      return el.stateName == stateName;
    });
    const cityData = cityFullData.find(el => {
      return el.cityName == cityName;
    });
    const params = {
      Sess_UserRefno: userID,
      company_name: companyName,
      firstname: contactName,
      mobile_no: contactNumber,
      gst_no: gstNumber,
      pan_no: panNumber,
      location_name: location,
      address: address,
      state_refno: stateData ? stateData.stateID : '0',
      district_refno: cityData ? cityData.cityID : '0',
      pincode: pincode,
      bank_account_no: accountNo,
      bank_name: bankName,
      bank_branch_name: bankBranchName,
      ifsc_code: ifscCode,
      if_create_brand: isSwitchOn ? 1 : 0,
      company_name_prefix: cnPrefix,
      employee_code_prefix: ecPrefix,
      po_prefix: poPrefix,
      so_prefix: soPrefix,
    };

    if (userRole != 4) {
      params.quotation_no_prefix = qbPrefix;
    } else {
      params.quotation_no_prefix = '';
    }

    if (Sess_company_refno != 0) {
      params.company_refno = companyID;
    }

    datas.append('data', JSON.stringify(params));

    datas.append(
      "company_logo",
      filePath != null && filePath != undefined && filePath.type != undefined && filePath.type != null
        ? {
          name: "appimage1212.jpg",
          // type: filePath.type + "/*",
          type: filePath.type || filePath.mimeType,
          uri: filePath.uri,
          // uri: Platform.OS === "android" ? filePath.uri : filePath.uri.replace("file://", ""),
        }
        : ""
    );
   
    Provider.createDFCommonWithHeader(path, datas)
      .then(response => {
        setIsButtonLoading(false);
        if (response.data && response.data.code === 200) {
          setSnackbarColor(theme.colors.success);
          setSnackbarText('Data updated successfully');
          setSnackbarVisible(true);

          if (route.params && route.params.from == 'adm_profile') {
            GetUserDetails(userID);
          } else {
            setTimeout(function () {
              setIsButtonLoading(false);
              // navigation.goBack();
              GetUserDetails(userID);
            }, 500);
          }
        } else {
          setSnackbarColor(theme.colors.error);
          setSnackbarText(communication.UpdateError);
          setSnackbarVisible(true);
        }
      })
      .catch(e => {
        console.log(e);
        setIsButtonLoading(false);
        setSnackbarColor(theme.colors.error);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const ValidateData = () => {
    let isValid = true;

    if (companyName.trim() == '') {
      isValid = false;
      setCompanyNameInvalid(true);
    }

    if (contactName.trim() == '') {
      isValid = false;
      setContactNameInvalid(true);
    }

    if (contactNumber.trim() == '') {
      isValid = false;
      setContactNumberInvalid(true);
    }

    if (location.trim() == '') {
      isValid = false;
      setLocationInvalid(true);
    }

    if (isValid) {
      setIsButtonLoading(true);
      InsertData();
    }
  };

  //#endregion

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'companyDetails':
        return (
          <ScrollView style={[Styles.flex1, Styles.backgroundColor]}>
            <View style={[Styles.padding16]}>
              <TextInput
                ref={companyNameRef}
                mode="outlined"
                dense
                label="Company / Firm Name"
                value={companyName}
                returnKeyType="next"
                onSubmitEditing={() => contactNameRef.current.focus()}
                onChangeText={onCompanyNameChanged}
                style={{ backgroundColor: 'white' }}
                error={companyNameInvalid}
              />
              <HelperText type="error" visible={companyNameInvalid}>
                {communication.InvalidCompanyName}
              </HelperText>
              <TextInput
                ref={contactNameRef}
                mode="outlined"
                dense
                label="Contact Person Name"
                value={contactName}
                returnKeyType="next"
                onSubmitEditing={() => contactNumberRef.current.focus()}
                onChangeText={onContactNameChanged}
                style={{ backgroundColor: 'white' }}
                error={contactNameInvalid}
              />
              <HelperText type="error" visible={contactNameInvalid}>
                {communication.InvalidContactPerson}
              </HelperText>

              <TextInput
                ref={contactNumberRef}
                mode="outlined"
                dense
                keyboardType="number-pad"
                maxLength={10}
                editable={false}
                disabled={true}
                label="Contact Number"
                value={contactNumber}
                style={{ backgroundColor: 'white' }}
              />
              <HelperText type="error" visible={contactNameInvalid}>
                {communication.InvalidContactPerson}
              </HelperText>
              <TextInput
                ref={gstNumberRef}
                mode="outlined"
                dense
                label="GST No."
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={15}
                value={gstNumber}
                returnKeyType="next"
                onSubmitEditing={() => panNumberRef.current.focus()}
                onChangeText={onGSTNumberChanged}
                style={{ backgroundColor: 'white' }}
                error={gstNumberInvalid}
              />
              <HelperText type="error" visible={gstNumberInvalid}>
                {communication.InvalidActivityName}
              </HelperText>
              <TextInput
                ref={panNumberRef}
                mode="outlined"
                dense
                label="PAN No."
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={10}
                value={panNumber}
                returnKeyType="next"
                onSubmitEditing={() => addressRef.current.focus()}
                onChangeText={onPANNumberChanged}
                style={{ backgroundColor: 'white' }}
                error={panNumberInvalid}
              />
              <HelperText type="error" visible={panNumberInvalid}>
                {communication.InvalidActivityName}
              </HelperText>
              <TextInput
                ref={addressRef}
                mode="outlined"
                dense
                label="Location Name"
                value={location}
                returnKeyType="next"
                onSubmitEditing={() => locationRef.current.focus()}
                onChangeText={onLocationChanged}
                style={{ backgroundColor: 'white' }}
                error={locationInvalid}
              />
              <HelperText type="error" visible={locationInvalid}>
                Please enter a valid location name
              </HelperText>
              <TextInput
                ref={locationRef}
                mode="outlined"
                dense
                label="Address"
                value={address}
                returnKeyType="next"
                onSubmitEditing={() => pincodenRef.current.focus()}
                onChangeText={onAddressChanged}
                style={{ backgroundColor: 'white' }}
                error={addressInvalid}
              />
              <HelperText type="error" visible={addressInvalid}>
                {communication.InvalidActivityName}
              </HelperText>
              <Dropdown
                label="State"
                data={statesData}
                onSelected={onStateNameSelected}
                isError={errorSN}
                selectedItem={stateName}
              />
              <HelperText type="error" visible={errorSN}>
                {communication.InvalidStateName}
              </HelperText>
              <Dropdown
                label="City"
                data={cityData}
                onSelected={onCityNameSelected}
                isError={errorCN}
                selectedItem={cityName}
                reference={cityRef}
              />
              <HelperText type="error" visible={errorCN}>
                {communication.InvalidStateName}
              </HelperText>
              <TextInput
                ref={pincodenRef}
                mode="outlined"
                dense
                keyboardType="number-pad"
                maxLength={6}
                label="Pincode"
                value={pincode}
                returnKeyType="done"
                onChangeText={onPincodeChanged}
                style={{ backgroundColor: 'white' }}
                error={pincodeInvalid}
              />
              <HelperText type="error" visible={pincodeInvalid}>
                {communication.InvalidActivityName}
              </HelperText>
            </View>
          </ScrollView>
        );
      case 'bankDetails':
        return (
          <ScrollView style={[Styles.flex1, Styles.backgroundColor]}>
            <View style={[Styles.padding16]}>
              <TextInput
                ref={accountNoRef}
                mode="outlined"
                dense
                label="Account Number"
                value={accountNo}
                returnKeyType="next"
                onSubmitEditing={() => bankNameRef.current.focus()}
                onChangeText={onAccountNoChanged}
                style={{ backgroundColor: 'white' }}
                error={accountNoInvalid}
              />
              <HelperText type="error" visible={accountNoInvalid}>
                {communication.InvalidActivityName}
              </HelperText>
              <TextInput
                ref={bankNameRef}
                mode="outlined"
                dense
                label="Bank Name"
                value={bankName}
                returnKeyType="next"
                onSubmitEditing={() => bankBranchNameRef.current.focus()}
                onChangeText={onBankNameChanged}
                style={{ backgroundColor: 'white' }}
                error={bankNameInvalid}
              />
              <HelperText type="error" visible={bankNameInvalid}>
                {communication.InvalidActivityName}
              </HelperText>
              <TextInput
                ref={bankBranchNameRef}
                mode="outlined"
                dense
                label="Bank Branch Name"
                value={bankBranchName}
                returnKeyType="next"
                onSubmitEditing={() => ifscCodeRef.current.focus()}
                onChangeText={onBankBranchNameChanged}
                style={{ backgroundColor: 'white' }}
                error={bankBranchNameInvalid}
              />
              <HelperText type="error" visible={bankBranchNameInvalid}>
                {communication.InvalidActivityName}
              </HelperText>
              <TextInput
                ref={ifscCodeRef}
                mode="outlined"
                dense
                label="IFSC Code"
                value={ifscCode}
                returnKeyType="done"
                autoCapitalize="characters"
                onChangeText={onIfscCodeChanged}
                style={{ backgroundColor: 'white' }}
                error={ifscCodeInvalid}
              />
              <HelperText type="error" visible={ifscCodeInvalid}>
                {communication.InvalidActivityName}
              </HelperText>
            </View>
          </ScrollView>
        );
      case 'commonSetup':
        return (
          <ScrollView style={[Styles.flex1, Styles.backgroundColor]}>
            <View style={[Styles.padding16]}>
              {userRole && userRole == 4 && (
                <>
                  <View
                    style={[
                      Styles.flexRow,
                      Styles.flexAlignCenter,
                      Styles.marginBottom16,
                    ]}>
                    <Subheading style={[Styles.flexGrow]}>
                      Create Brand & Product
                    </Subheading>
                    <Switch
                      value={isSwitchOn}
                      onValueChange={() => setIsSwitchOn(!isSwitchOn)}
                    />
                  </View>
                </>
              )}

              <TextInput
                ref={cnPrefixRef}
                mode="outlined"
                dense
                label="Company Name Prefix"
                value={cnPrefix}
                returnKeyType="next"
                onSubmitEditing={() => ecPrefixRef.current.focus()}
                onChangeText={onCNPChanged}
                style={{ backgroundColor: 'white' }}
                error={cnPrefixInvalid}
              />
              <HelperText type="error" visible={cnPrefixInvalid}>
                {communication.InvalidActivityName}
              </HelperText>
              {userRole && userRole != 4 && (
                <>
                  <TextInput
                    ref={qbPrefixRef}
                    mode="outlined"
                    dense
                    label="Quotation / Budget No Prefix"
                    value={qbPrefix}
                    returnKeyType="next"
                    onSubmitEditing={() => ecPrefixRef.current.focus()}
                    onChangeText={onQBPChanged}
                    style={[Styles.marginBottom16, { backgroundColor: 'white' }]}
                  />
                </>
              )}
              <TextInput
                ref={ecPrefixRef}
                mode="outlined"
                dense
                label="Employee Code Prefix"
                value={ecPrefix}
                returnKeyType="next"
                onSubmitEditing={() => poPrefixRef.current.focus()}
                onChangeText={onECPChanged}
                style={{ backgroundColor: 'white' }}
                error={ecPrefixInvalid}
              />
              <HelperText type="error" visible={ecPrefixInvalid}>
                {communication.InvalidActivityName}
              </HelperText>
              <TextInput
                ref={poPrefixRef}
                mode="outlined"
                dense
                label="Purchase Order Prefix"
                value={poPrefix}
                returnKeyType="next"
                onSubmitEditing={() => soPrefixRef.current.focus()}
                onChangeText={onPOPChanged}
                style={{ backgroundColor: 'white' }}
                error={poPrefixInvalid}
              />
              <HelperText type="error" visible={poPrefixInvalid}>
                {communication.InvalidActivityName}
              </HelperText>
              <TextInput
                ref={soPrefixRef}
                mode="outlined"
                dense
                label="Sales Order Prefix"
                value={soPrefix}
                returnKeyType="done"
                onChangeText={onSOPChanged}
                style={{ backgroundColor: 'white' }}
                error={soPrefixInvalid}
              />
              <HelperText type="error" visible={soPrefixInvalid}>
                {communication.InvalidActivityName}
              </HelperText>
            </View>
          </ScrollView>
        );
      case 'logo':
        return (
          <ScrollView style={[Styles.flex1, Styles.backgroundColor]}>
            <View
              style={[Styles.flexRow, Styles.flexAlignEnd, Styles.marginTop16]}>
              <Image
                source={{ uri: image }}
                style={[Styles.width104, Styles.height96, Styles.border1]}
              />
              <Button mode="text" onPress={() => setIsVisible(true)}>
                {filePath !== null || image !== null ? 'Replace' : 'Choose Image'}
              </Button>
            </View>
            {/* camera related changes */}
          <Modal
            visible={isVisible}
            animationType="fade" // You can customize the animation type
            transparent={true}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  height: 150,
                  width: "85%",
                  borderRadius: 5,
                  padding: 20,
                  alignSelf: "center", // Center the content horizontally
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    alignSelf: "center",
                    marginTop: 10,
                  }}
                >
                  <Pressable
                    onPress={(e) => {
                      openCamera();
                    }}
                    style={{ padding: 10, alignItems: "center" }}
                  >
                    <Icon
                      name="camera-outline"
                      color={theme.colors.primary}
                      type="ionicon"
                      size={40}
                    />
                    <Button mode="text">Camera</Button>
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      pickDocument();
                    }}
                    style={{ padding: 10, alignItems: "center" }}
                  >
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
                  onPress={(e) => {
                    setIsVisible(!isVisible);
                  }}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 10,
                    marginBottom: 10,
                  }}
                >
                  <Icon
                    name="close-circle"
                    color={"red"}
                    type="ionicon"
                    size={30}
                  />
                </Pressable>
              </View>
            </View>
          </Modal>
          {/* camera related changes */}
            <HelperText type="error" visible={errorLogo}>
              {communication.InvalidDesignImage}
            </HelperText>
          </ScrollView>
        );
      default:
        return null;
    }
  };
  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.colors.primary }}
      style={{ backgroundColor: theme.colors.textLight }}
      inactiveColor={theme.colors.textSecondary}
      activeColor={theme.colors.primary}
      scrollEnabled={true}
      tabStyle={{ width: windowWidth / 4 }}
      labelStyle={[Styles.fontSize12, Styles.fontBold]}
    />
  );

  const [routes] = React.useState([
    { key: 'companyDetails', title: 'Company' },
    { key: 'bankDetails', title: 'Bank' },
    { key: 'commonSetup', title: 'Common' },
    { key: 'logo', title: 'Logo' },
  ]);
  return (
    isFocused && (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
      <View style={[Styles.flex1]}>
        <Header
          navigation={navigation}
          title="Basic Details"
          isDrawer="false"
        />
        {isLoading ? (
          <View
            style={[
              Styles.flex1,
              Styles.flexJustifyCenter,
              Styles.flexAlignCenter,
            ]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <TabView
            style={{ marginBottom: 64 }}
            renderTabBar={renderTabBar}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
          />
        )}
        <View
          style={[
            Styles.backgroundColor,
            Styles.width100per,
            Styles.marginTop32,
            Styles.padding16,
            { position: 'absolute', bottom: 0, elevation: 3 },
          ]}>
          <Card.Content>
            <DFButton
              mode="contained"
              onPress={ValidateData}
              title={Sess_company_refno == 0 ? 'Submit' : 'Update'}
              loader={isButtonLoading}
            />
          </Card.Content>
        </View>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{ backgroundColor: snackbarColor }}>
          {snackbarText}
        </Snackbar>
      </View>
    </SafeAreaView>
    )
  );
};

export default BasicDetailsScreen;
