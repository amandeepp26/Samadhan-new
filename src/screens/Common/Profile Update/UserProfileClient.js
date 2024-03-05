import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  LogBox,
  Dimensions,
  RefreshControl,
  ScrollView,
  Image,
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
import {TabBar, TabView} from 'react-native-tab-view';
import Provider from '../../../api/Provider';
import Header from '../../../components/Header';
import {Styles} from '../../../styles/styles';
import {theme} from '../../../theme/apptheme';
import {communication} from '../../../utils/communication';
import {RNS3} from 'react-native-aws3';
import * as ImagePicker from 'react-native-image-picker';
import {creds} from '../../../utils/credentials';
import uuid from 'react-native-uuid';
import {AWSImagePath} from '../../../utils/paths';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import {NullOrEmpty} from '../../../utils/validations';
import RBSheet from 'react-native-raw-bottom-sheet';
import {SwipeListView} from 'react-native-swipe-list-view';
import {RenderHiddenItems} from '../../../components/ListActions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NoItems from '../../../components/NoItems';
import {
  APIConverter,
  RemoveUnwantedParameters,
} from '../../../utils/apiconverter';

const UserProfileClient = ({route, navigation}) => {
  //#region Variables

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
  const [image, setImage] = useState(AWSImagePath + 'placeholder-image.png');
  const [filePath, setFilePath] = useState(null);
  const [errorLogo, setLogoError] = useState(false);

  const [isImageReplaced, setIsImageReplaced] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  //#endregion

  //#region Functions

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
      route.params.userDetails = {user};
      console.log('step 22');
      // navigation.goBack();
      navigation.dispatch(StackActions.replace('HomeStack'));
    } catch (error) {}
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
      .catch(e => {});
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
      .catch(e => {});
  };

  useEffect(() => {
    GetUserID();
  }, []);

  const onCompanyNameChanged = text => {
    const filteredText = text.replace(/[^a-zA-Z]/g, '');
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

    datas.append('data', JSON.stringify(params));
    datas.append(
      'profile_image',
      filePath != null &&
        filePath != undefined &&
        filePath.type != undefined &&
        filePath.type != null
        ? {
            name: 'appimage1212.jpg',
            type: filePath.type + '/*',
            uri:
              Platform.OS === 'android'
                ? filePath.uri
                : filePath.uri.replace('file://', ''),
          }
        : '',
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

          setTimeout(function () {
            GetUserDetails(userID);
            setIsButtonLoading(false);
            //navigation.goBack();
          }, 1000);
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
      UpdateData();
    }
  };

  const chooseFile = async () => {
    let result = await ImagePicker.launchImageLibrary({
      // mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      //aspect: [3, 4],
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

  //#endregion

  return (
    <ScrollView style={[Styles.flex1, Styles.backgroundColor]}>
      <View style={[Styles.padding16]}>
        <View style={[Styles.flex1]}>
          {/* <Header navigation={navigation} title="Update Profile" isDrawer="false" /> */}
          <ScrollView
            style={[Styles.flex1, Styles.backgroundColor, {marginBottom: 64}]}
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
                style={{backgroundColor: 'white'}}
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
                style={{backgroundColor: 'white'}}
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
                style={{backgroundColor: 'white'}}
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
                style={{backgroundColor: 'white'}}
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
                style={{backgroundColor: 'white'}}
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
                style={{backgroundColor: 'white'}}
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
                style={{backgroundColor: 'white'}}
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
                  source={{uri: image}}
                  style={[Styles.width104, Styles.height96, Styles.border1]}
                />
                <Button mode="text" onPress={chooseFile}>
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
              {position: 'absolute', bottom: 0, elevation: 3},
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
            style={{backgroundColor: snackbarColor}}>
            {snackbarText}
          </Snackbar>
        </View>
      </View>
    </ScrollView>
  );
};

export default UserProfileClient;
