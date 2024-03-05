import { useEffect, useRef, useState } from 'react';
import {
  View,
  LogBox,
  Dimensions,
  RefreshControl,
  ScrollView,
  Image,
  Text,
  Platform,
  Modal,
  Pressable,
  PermissionsAndroid,
} from 'react-native';
import {
  ActivityIndicator,
  Title,
  Button,
  List,
  Card,
  HelperText,
  Searchbar,
  Checkbox,
  Snackbar,
  Subheading,
  Switch,
  FAB,
  TextInput,
} from 'react-native-paper';
import { TabBar, TabView } from 'react-native-tab-view';
import Provider from '../../../api/Provider';
import Header from '../../../components/Header';
import { Styles } from '../../../styles/styles';
import { theme } from '../../../theme/apptheme';
import { communication } from '../../../utils/communication';
import { AWSImagePath } from '../../../utils/paths';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { NullOrEmpty } from '../../../utils/validations';
import RBSheet from 'react-native-raw-bottom-sheet';
import { SwipeListView } from 'react-native-swipe-list-view';
import { RenderHiddenItems } from '../../../components/ListActions';
import NoItems from '../../../components/NoItems';
import { APIConverter } from '../../../utils/apiconverter';
import Search from '../../../components/Search';
import * as ImagePicker from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import { StackActions } from '@react-navigation/native';
//#region camera related changes
import * as DocumentPicker from "react-native-document-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
//#endregion

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
let userID = 0,
  companyID = 0,
  // branchID=0,
  groupID = 0;

const windowWidth = Dimensions.get('window').width;
// let userID = 0,

//   groupID = 0;

let st_ID = 0,
  ct_ID = 0;

//#region camera related changes
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

const UserProfile = ({ route, navigation }) => {
  //#region Variables
  const isFocused = useIsFocused();
  const [index, setIndex] = useState(
    route.params && route.params.from === 'brand' ? 2 : 0,
  );

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

  //const [cityNameList, setCityNameList] = useState<Array<CityModel>>([]);
  const [cityFullData, setCityFullData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [cityName, setCityName] = useState('');
  const [errorCN, setCNError] = useState(false);
  const cityRef = useRef({});

  //const [stateNameList, setStateNameList] = useState<Array<StateModel>>([]);
  const [statesFullData, setStatesFullData] = useState([]);
  const [statesData, setStatesData] = useState([]);
  const [stateName, setStateName] = useState('');
  const [errorSN, setSNError] = useState(false);

  const [pincode, setPincode] = useState('');
  const [pincodeInvalid, setPincodeInvalid] = useState('');
  const pincodenRef = useRef({});

  const [logoImage, setLogoImage] = useState('');
  const [image, setImage] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const [errorLogo, setLogoError] = useState(false);

  const [isImageReplaced, setIsImageReplaced] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranchName, setBankBranchName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [cardType, setCardType] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [remarks, setRemarks] = useState('');
  const [display, setDisplay] = useState('');

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

  const refRBSheet = useRef();

  //#endregion

  const GetUserDetails = user_refno => {
    setIsButtonLoading(true);
    let params = {
      data: {
        user_refno: user_refno,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.UserFromRefNo, params)
      .then(response => {
        //console.log('resp:', response.data.data);
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
    console.log('user setting data', user);
    try {
      console.log('Going Back');
      await AsyncStorage.setItem('user', JSON.stringify(user));
      //route.params.userDetails = { user };
      console.log('step 22');
      // navigation.goBack();
      //navigation.dispatch(StackActions.replace('HomeStack'));
      navigation.dispatch(
        StackActions.replace('HomeStack', {
          userDetails: user,
        })
      );
      navigation.goBack();
    } catch (error) { }
  };

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      companyID = JSON.parse(userData).Sess_company_refno;
      groupID = JSON.parse(userData).Sess_group_refno;
      // branchID = JSON.parse(userData).Sess_branch_refno;
      FetchBasicDetails();
      FetchData();
    }
  };
  let tempStateName = '';
  const FetchBasicDetails = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.getuserprofile, params)
      .then(response => {
        //console.log("resp:", response.data.data);
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            if (response.data.data[0] != null) {
              setCompanyName(
                !NullOrEmpty(response.data.data[0].company_name)
                  ? response.data.data[0].company_name
                  : '',
              );
              setContactName(
                !NullOrEmpty(response.data.data[0].contact_person)
                  ? response.data.data[0].contact_person
                  : '',
              );
              setContactNumber(
                !NullOrEmpty(response.data.data[0].contact_person_mobile_no)
                  ? response.data.data[0].contact_person_mobile_no
                  : '',
              );
              setGSTNumber(
                !NullOrEmpty(response.data.data[0].gst_no)
                  ? response.data.data[0].gst_no
                  : '',
              );
              setPANNumber(
                !NullOrEmpty(response.data.data[0].pan_no)
                  ? response.data.data[0].pan_no
                  : '',
              );
              setAddress(
                !NullOrEmpty(response.data.data[0].address)
                  ? response.data.data[0].address
                  : '',
              );
              setPincode(
                !NullOrEmpty(response.data.data[0].pincode)
                  ? response.data.data[0].pincode.toString()
                  : '',
              );

              setLogoImage(response.data.data[0].profile_image_url);
              setImage(
                response.data.data[0].profile_image_url
                  ? response.data.data[0].profile_image_url
                  : AWSImagePath + 'placeholder-image.png',
              );
              setFilePath(
                response.data.data[0].profile_image_url
                  ? response.data.data[0].profile_image_url
                  : null,
              );

              if (!NullOrEmpty(response.data.data[0].state_refno)) {
                st_ID = response.data.data[0].state_refno;
              }
              if (!NullOrEmpty(response.data.data[0].district_refno)) {
                ct_ID = response.data.data[0].district_refno;
              }
            }
          }
        }

        FetchStates(response.data.data[0].state_refno);
        setIsLoading(false);
      })
      .catch(e => {
        setIsLoading(false);
      });
  };

  const FetchStates = editID => {
    Provider.createDFCommon(Provider.API_URLS.GetStateDetails, null)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setStatesFullData(response.data.data);

            const states = response.data.data.map(data => data.stateName);
            setStatesData(states);

            const stateData = [];
            response.data.data.map((data, i) => {
              stateData.push({
                id: data.stateID,
                label: data.stateName,
              });
            });

            if (editID != null) {
              let a = stateData.filter(el => {
                return el.id == editID;
              });
              setStateName(a[0].label);
            }
          }

          FetchCities(st_ID);
        }
      })
      .catch(e => { });
  };

  const FetchCities = stateID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        state_refno: stateID,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.GetDistrictDetailsByStateRefno,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setCityFullData(response.data.data);
            const cities = response.data.data.map(data => data.district_name);
            setCityData(cities);

            const cityData = [];
            response.data.data.map((data, i) => {
              cityData.push({
                id: data.district_refno,
                label: data.district_name,
              });
            });

            if (ct_ID > 0) {
              let a = cityData.filter(el => {
                return el.id === ct_ID;
              });
              setCityName(a[0].label);
            } else {
              setCityNameList([]);
              setCity('');
              ct_ID = 0;
              setCityID(0);
            }
          } else {
            setCityNameList([]);
            setCity('');
            ct_ID = 0;
            setCityID(0);
          }
        }
      })
      .catch(e => { });
  };

  useEffect(() => {
    GetUserID();
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     if (Platform.OS === 'android') {
  //       const {status} =
  //         await ImagePicker.requestMediaLibraryPermissionsAsync();

  //       if (status !== 'granted') {
  //         alert(
  //           'Sorry, we need camera roll permissions to make this work on Android!',
  //         );
  //       }
  //     } else if (Platform.OS === 'ios') {
  //       // You can handle iOS permissions here if needed.
  //     }
  //   })();
  // }, []);

  const onCompanyNameChanged = text => {
    const filteredText = text.replace(/[^a-zA-Z0-9\s]/g, '');
    setCompanyName(filteredText);
    setCompanyNameInvalid(false);
  };
  const onContactNameChanged = text => {
    setContactName(text);
    setContactNameInvalid(false);
  };
  const onContactNumberChanged = text => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setContactNumber(numericValue);
    setContactNumberInvalid(false);
  };
  const onGSTNumberChanged = text => {
    setGSTNumber(text);
    setGSTNumberInvalid(false);
  };
  const onPANNumberChanged = text => {
    setPANNumber(text);
    setPANNumberInvalid(false);
  };
  const onAddressChanged = text => {
    const alphanumericOnly = text.replace(/[^a-zA-Z0-9]/g, '');
    setAddress(alphanumericOnly);
    setAddressInvalid(false);
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

    let s = statesFullData.filter(el => {
      return el.stateName === selectedItem;
    });
    FetchCities(s[0].stateID);
  };
  const onPincodeChanged = text => {
    const numeric = text.replace(/[^0-9]/g, '');
    setPincode(numeric);
    setPincodeInvalid(false);
  };

  const UpdateData = () => {
    const datas = new FormData();
    setIsButtonLoading(true);
    const params = {
      Sess_UserRefno: userID,
      Sess_group_refno: groupID,
      company_name: companyName,
      contact_person: contactName,
      contact_person_mobile_no: contactNumber,
      address: address,
      state_refno: stateName
        ? statesFullData.find(el => el.stateName === stateName).stateID
        : 0,
      district_refno: cityName
        ? cityFullData.find(el => el.district_name === cityName).district_refno
        : 0,
      pincode: pincode ? pincode : 0,
      gst_no: gstNumber,
      pan_no: panNumber,
    };

    datas.append("data", JSON.stringify(params));
    datas.append(
      "profile_image",
      filePath != null && filePath != undefined && filePath.type != undefined && filePath.type != null
        ? {
          name: "appimage1212.jpg",
          type: filePath.type || filePath.mimeType,
          uri: filePath.uri,
        }
        : ""
    );

    Provider.createDFCommonWithHeader(
      Provider.API_URLS.userprofileupdate,
      datas,
    )
      .then(response => {
        //console.log(response.data.data);
        if (response.data && response.data.code === 200) {
          setSnackbarColor(theme.colors.success);
          setSnackbarText('Data updated successfully');
          setSnackbarVisible(true);
          // if (route.params.from == "gu_estimate") {
          //   GetUserDetails(userID);
          // } else {
          //   setTimeout(function () {
          //     GetUserDetails(userID);
          //     setIsButtonLoading(false);
          //     navigation.goBack();
          //   }, 500);
          // }

          setTimeout(function () {
            GetUserDetails(userID);
            setIsButtonLoading(false);
            //navigation.goBack();
          }, 500);
        } else {
          setSnackbarColor(theme.colors.error);
          setSnackbarText(communication.UpdateError);
          setSnackbarVisible(true);
          setIsButtonLoading(false);
        }
      })
      .catch(e => {
        setIsButtonLoading(false);
        console.log(e);
        setSnackbarColor(theme.colors.error);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const ValidateData = () => {
    const isValid = true;

    if (isValid) {
      // if (filePath !== null) {
      //   uploadFile();
      // } else {
      //   UpdateData();
      // }
      UpdateData();
    }
  };

  const FetchData = from => {
    if (from === 'add' || from === 'update') {
      setSnackbarText(
        'Item ' + (from === 'add' ? 'added' : 'updated') + ' successfully',
      );
      setSnackbarColor(theme.colors.success);
      setSnackbarVisible(true);
    }
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        bank_refno: 'all',
      },
    };

    Provider.createDFCommon(Provider.API_URLS.userbankrefnocheck, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            const lisData = [...response.data.data];
            lisData.map((k, i) => {
              k.key = (parseInt(i) + 1).toString();
            });
            setListData(response.data.data);
            setListSearchData(response.data.data);
          }
        } else {
          setListData([]);
          // setSnackbarText("No data found");
          // setSnackbarColor(theme.colors.error);
          // setSnackbarVisible(true);
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
          Styles.borderBottom1,
          Styles.paddingStart16,
          Styles.flexJustifyCenter,
          { height: 72 },
        ]}>
        <List.Item
          title={data.item.bankName}
          titleStyle={{ fontSize: 18 }}
          description={`Bank Branch: ${NullOrEmpty(data.item.branchName) ? '' : data.item.branchName
            }\nAccount Holder Name: ${NullOrEmpty(data.item.acHolderName) ? '' : data.item.acHolderName
            } `}
          onPress={() => {
            refRBSheet.current.open();
            setAccountHolderName(data.item.acHolderName);
            setAccountNo(data.item.accountNumber);
            setBankName(data.item.bankName);
            setBankBranchName(data.item.branchName);
            setIfscCode(data.item.ifscCode);
            setCardType(data.item.cardTypeName);
            setOpeningBalance(data.item.openingBalance);
            setRemarks(data.item.remark);
            setDisplay(data.item.display);
          }}
          left={() => (
            <Icon
              style={{ marginVertical: 12, marginRight: 12 }}
              size={30}
              color={theme.colors.textSecondary}
              name="file-tree"
            />
          )}
          right={() => (
            <Icon
              style={{ marginVertical: 12, marginRight: 12 }}
              size={30}
              color={theme.colors.textSecondary}
              name="eye"
            />
          )}
        />
      </View>
    );
  };

  const AddCallback = () => {
    navigation.navigate('AddBankDetails', {
      type: 'add',
      fetchData: FetchData,
    });
  };

  const EditCallback = (data, rowMap) => {
    rowMap[data.item.key].closeRow();
    navigation.navigate('AddBankDetails', {
      type: 'edit',
      fetchData: FetchData,
      data: {
        id: data.item.id,
        accountHolderName: data.item.acHolderName,
        accountNo: data.item.accountNumber,
        bankName: data.item.bankName,
        bankBranchName: data.item.branchName,
        ifscCode: data.item.ifscCode,
        cardType: data.item.cardTypeName,
        openingBalance: data.item.openingBalance,
        remarks: data.item.remark,
        display: data.item.display,
        bankID: data.item.bank_refno,
        cardtypeID: data.item.cardtypeID,
      },
    });
  };



  //#endregionc

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'basicDetail':
        return (
          <View style={[Styles.flex1]}>
            {/* <Header navigation={navigation} title="Update Profile" isDrawer="false" /> */}
            <ScrollView
              style={[Styles.flex1, Styles.backgroundColor, { marginBottom: 64 }]}
              keyboardShouldPersistTaps="handled">
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
                  {communication.InvalidActivityName}
                </HelperText>
                <TextInput
                  ref={contactNameRef}
                  mode="outlined"
                  dense
                  label="Contact Person Name"
                  value={contactName}
                  returnKeyType="next"
                  onSubmitEditing={() => contactNumberRef.current.focus()}
                  onChangeText={text => {
                    onContactNameChanged(text.replace(/[^a-zA-Z\s]/g, ''));
                  }}
                  style={{ backgroundColor: 'white' }}
                  error={contactNameInvalid}
                />
                <HelperText type="error" visible={contactNameInvalid}>
                  {communication.InvalidActivityName}
                </HelperText>
                <TextInput
                  ref={contactNumberRef}
                  mode="outlined"
                  dense
                  keyboardType="number-pad"
                  label="Contact Number"
                  value={contactNumber}
                  maxLength={10}
                  returnKeyType="next"
                  onSubmitEditing={() => gstNumberRef.current.focus()}
                  onChangeText={onContactNumberChanged}
                  style={{ backgroundColor: 'white' }}
                  error={contactNumberInvalid}
                />
                <HelperText type="error" visible={contactNumberInvalid}>
                  {communication.InvalidActivityName}
                </HelperText>
                <TextInput
                  ref={addressRef}
                  mode="outlined"
                  dense
                  label="Address"
                  value={address}
                  returnKeyType="next"
                  onSubmitEditing={() => locationRef.current.focus()}
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
                  label="Pincode"
                  value={pincode}
                  returnKeyType="done"
                  maxLength={6}
                  onChangeText={onPincodeChanged}
                  style={{ backgroundColor: 'white' }}
                  error={pincodeInvalid}
                />
                <HelperText type="error" visible={pincodeInvalid}>
                  {communication.InvalidActivityName}
                </HelperText>
                <TextInput
                  ref={gstNumberRef}
                  mode="outlined"
                  dense
                  label="GST No."
                  autoCapitalize="characters"
                  value={gstNumber}
                  returnKeyType="next"
                  maxLength={15}
                  onSubmitEditing={() => panNumberRef.current.focus()}
                  onChangeText={text => {
                    onGSTNumberChanged(
                      text
                        .toUpperCase()
                        .replace(/[^a-z0-9]/gi, '')
                        .trim(),
                    );
                  }}
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
                  autoCapitalize="characters"
                  label="PAN No."
                  value={panNumber}
                  keyboardType="name-phone-pad"
                  returnKeyType="next"
                  maxLength={10}
                  onSubmitEditing={() => addressRef.current.focus()}
                  onChangeText={text => {
                    onPANNumberChanged(
                      text
                        .toUpperCase()
                        .replace(/[^a-z0-9]/gi, '')
                        .trim(),
                    );
                  }}
                  style={{ backgroundColor: 'white' }}
                  error={panNumberInvalid}
                />
                <HelperText type="error" visible={panNumberInvalid}>
                  {communication.InvalidActivityName}
                </HelperText>
                <View
                  style={[
                    Styles.flexRow,
                    Styles.flexAlignEnd,
                    Styles.marginTop16,
                  ]}>
                  <Image
                    source={{ uri: image }}
                    style={[Styles.width104, Styles.height96, Styles.border1]}
                  />
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
                  <Button mode="text" onPress={() => setIsVisible(true)}>
                    {filePath !== null ? 'Replace' : 'Choose Profile Image'}
                  </Button>
                </View>
              </View>
            </ScrollView>
            <View
              style={[
                Styles.backgroundColor,
                Styles.width100per,
                Styles.marginTop32,
                Styles.padding16,
                { position: 'absolute', bottom: 0, elevation: 3 },
              ]}>
              <Card.Content>
                <Button
                  mode="contained"
                  onPress={ValidateData}
                  loading={isButtonLoading}
                  disabled={isButtonLoading}>
                  Update
                </Button>
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
        );
      case 'bankDetail':
        return (
          <View style={[Styles.flex1]}>
            {isLoading ? (
              <View
                style={[
                  Styles.flex1,
                  Styles.flexJustifyCenter,
                  Styles.flexAlignCenter,
                ]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : listData.length > 0 ? (
              <View
                style={[
                  Styles.flex1,
                  Styles.flexColumn,
                  Styles.backgroundColor,
                ]}>
                <Search
                  data={listData}
                  setData={setListSearchData}
                  filterFunction={[
                    'acHolderName',
                    'accountNumber',
                    'bankName',
                    'bank_refno',
                    'branchName',
                    'cardTypeName',
                    'ifscCode',
                    'openingBalance',
                    'pckdiary_transaction_count',
                    'user_refno',
                  ]}
                />
                {listSearchData?.length > 0 ? (
                  <SwipeListView
                    previewDuration={1000}
                    previewOpenValue={-72}
                    previewRowKey="1"
                    previewOpenDelay={1000}
                    refreshControl={
                      <RefreshControl
                        colors={[theme.colors.primary]}
                        refreshing={refreshing}
                        onRefresh={() => {
                          FetchData();
                        }}
                      />
                    }
                    data={listSearchData}
                    disableRightSwipe={true}
                    rightOpenValue={-72}
                    renderItem={data => RenderItems(data)}
                    renderHiddenItem={(data, rowMap) =>
                      RenderHiddenItems(data, rowMap, [EditCallback])
                    }
                  />
                ) : (
                  <NoItems
                    icon="format-list-bulleted"
                    text="No records found for your query"
                  />
                )}
              </View>
            ) : (
              <NoItems
                icon="format-list-bulleted"
                text="No records found. Add records by clicking on plus icon."
              />
            )}
            <FAB
              style={[
                Styles.margin16,
                Styles.primaryBgColor,
                { position: 'absolute', right: 16, bottom: 16 },
              ]}
              icon="plus"
              onPress={AddCallback}
            />
            <Snackbar
              visible={snackbarVisible}
              onDismiss={() => setSnackbarVisible(false)}
              duration={3000}
              style={{ backgroundColor: snackbarColor }}>
              {snackbarText}
            </Snackbar>
            <RBSheet
              ref={refRBSheet}
              closeOnDragDown={true}
              closeOnPressMask={true}
              dragFromTopOnly={true}
              height={420}
              animationType="fade"
              customStyles={{
                wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
                draggableIcon: { backgroundColor: '#000' },
              }}>
              <View>
                <Title style={[Styles.paddingHorizontal16]}>
                  {accountHolderName}
                </Title>
                <ScrollView>
                  <List.Item
                    title="A/C Holder Name"
                    description={accountHolderName}
                  />
                  <List.Item title="A/C No" description={accountNo} />
                  <List.Item title="Bank Name" description={bankName} />
                  <List.Item title="Branch Name" description={bankBranchName} />
                  <List.Item title="IFSC Code" description={ifscCode} />
                  <List.Item title="Card Type Name" description={cardType} />
                  <List.Item
                    title="Opening Balance"
                    description={openingBalance}
                  />
                  <List.Item title="Remarks" description={remarks} />
                  <List.Item title="Display" description={display} />
                </ScrollView>
              </View>
            </RBSheet>
          </View>
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

  const [routes] = useState([
    { key: 'basicDetail', title: 'Basic' },
    { key: 'bankDetail', title: 'Bank' },
  ]);
  return (
    isFocused && (
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
            renderTabBar={renderTabBar}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            swipeEnabled={false}
          />
        )}

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{ backgroundColor: snackbarColor }}>
          {snackbarText}
        </Snackbar>
      </View>
    )
  );
};

export default UserProfile;
