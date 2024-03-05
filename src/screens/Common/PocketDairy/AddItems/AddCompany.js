import moment from 'moment';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useRef, useState} from 'react';
import {
  ScrollView,
  Image,
  View,
  LogBox,
  Modal,
  PermissionsAndroid,
  Pressable,
  Platform,
} from 'react-native';
// import * as Location from 'expo-location';
import Geolocation from 'react-native-geolocation-service';
import {
  Button,
  Card,
  Checkbox,
  HelperText,
  Snackbar,
  Subheading,
  RadioButton,
  Text,
  TextInput,
} from 'react-native-paper';
import Provider from '../../../../api/Provider';
import Dropdown from '../../../../components/Dropdown';
import {Styles} from '../../../../styles/styles';
import {theme} from '../../../../theme/apptheme';
import {communication} from '../../../../utils/communication';
import {DateTimePicker} from '@hashiprobr/react-native-paper-datetimepicker';
import {AWSImagePath} from '../../../../utils/paths';
import {APIConverter} from '../../../../utils/apiconverter';
import {common} from '@material-ui/core/colors';
import {
  projectVariables,
  projectLoginTypes,
  projectFixedDesignations,
} from '../../../../utils/credentials';
import RadioGroup from 'react-native-radio-buttons-group';
import DFButton from '../../../../components/Button';
import RBSheet from 'react-native-raw-bottom-sheet';
import {AutocompleteDropdown} from 'react-native-autocomplete-dropdown';
import * as DocumentPicker from 'react-native-document-picker';
import * as ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geocoder from 'react-native-geocoding';
let userID = 0,
  groupID = 0,
  groupExtraID = 0,
  companyID = 0,
  branchID = 0,
  _pktEntryTypeID = 0,
  designID = 0,
  companyAdminID = 0,
  RoleID = 0;

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Material-UI: The `css` function is deprecated. Use the `styleFunctionSx` instead',
  'source.uri should not be an empty string',
  'VirtualizedLists should never be nested inside plain ScrollViews with the same orientation because it can break windowing and other functionality - use another VirtualizedList-backed container instead.',
]);
function getFileType(url, setImage) {
  const fileExtension = url.type.split('/').pop().toLowerCase();
  if (
    fileExtension === 'jpg' ||
    fileExtension === 'jpeg' ||
    fileExtension === 'png' ||
    fileExtension === 'gif'
  ) {
    setImage(url.uri);
  } else if (fileExtension === 'pdf') {
    setImage('pdf');
  } else if (fileExtension === 'doc' || fileExtension === 'docx') {
    setImage('doc');
  } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
    setImage('xls');
  }
}

const AddCompany = ({route, navigation}) => {
  const [loc, setLoc] = React.useState({});
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
  const getLocation = async x => {
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
      setSnackbarText('Please grant permission to submit form.');
      setSnackbarColor(theme.colors.error);
      setSnackbarVisible(true);
      return;
    }
    try {
      // let {status} = await Geolocation.requestForegroundPermissionsAsync();
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
                  locationGps?.coords?.latitude,
                  locationGps?.coords?.longitude,
                );
                let currentLoc = {
                  last_gprs_activitytrack_refno:
                    res?.data?.data[0]?.last_gprs_activitytrack_refno,
                  latitude: locationGps?.coords?.latitude,
                  longitude: locationGps?.coords?.longitude,
                  kilometer: kilometer,
                  gprs_location_name: `${address[0]?.street}, ${
                    address[0]?.district
                  }, ${address[0]?.city}, ${
                    address[0]?.region == ''
                      ? address[0]?.subregion == ''
                        ? ''
                        : address[0]?.subregion
                      : address[0]?.region
                  }, ${address[0]?.country}`,
                };
                setLoc(currentLoc);
              })
              .catch(error => {
                console.log(error);
              });
            if (x !== null && x !== undefined && x !== '') {
              if (
                locationGps?.coords?.latitude == null ||
                locationGps?.coords?.latitude == undefined
              ) {
                return false;
              } else {
                return true;
              }
            }
            return;
          }
        },
        error => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } catch (e) {
      console.log(e);
    }
  };
  // const getCameraPermission = async () => {
  //   const {status} = await ImagePicker.req();
  //   if (status !== 'granted') {
  //     alert('Sorry, we need camera permissions to make this work!');
  //   }
  // };

  const [isImageReplaced, setIsImageReplaced] = useState(false);
  const [image, setImage] = React.useState(null);
  const [file, setFile] = useState(null);

  const pickDocument = async () => {
    try {
      const documentPickerResult = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles], // Allow all document types
      });
      console.log('document--->', documentPickerResult);
      setFile(documentPickerResult[0]);
      setIsVisible(false);
      getFileType(documentPickerResult[0], setImage);
      // }

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
      setFile(result.assets[0]);
      getFileType(result.assets[0], setImage);
      setIsVisible(false);
      if (route.params.type === 'edit' || route.params.type === 'verify') {
        setIsImageReplaced(true);
      }
    }
  };
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [buttonStatus, setButtonStatus] = React.useState(true);
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState('');
  const [isVisible, setIsVisible] = React.useState(false);
  const [snackbarColor, setSnackbarColor] = React.useState(
    theme.colors.success,
  );
  const refRBSheet = useRef();
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);
  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      groupID = JSON.parse(userData).Sess_group_refno;
      groupExtraID = JSON.parse(userData).Sess_group_refno_extra_1;
      companyID = JSON.parse(userData).Sess_company_refno;
      branchID = JSON.parse(userData).Sess_branch_refno;
      designID = JSON.parse(userData).Sess_designation_refno;
      companyAdminID = JSON.parse(userData).Sess_CompanyAdmin_UserRefno;
      RoleID = JSON.parse(userData).RoleID;
      FetchEntryType();
    }
  };

  useEffect(() => {
    getLocation();
    GetUserID();
  }, []);

  const [formData, setFormData] = useState({
    pck_entrytype_refno:
      route.params.type == 'edit' ? route.params.data.pck_entrytype_refno : '',
    pck_transtype_refno: '',
    amount: '',
    pck_mode_refno: '',
    pck_category_refno: '',
    pck_sub_category_refno: '',
    pck_contacttype_refno: '',
    pck_mybank_refno: '',
    mybank_balance: '',
    cheque_no: '',
    pck_mycontact_refno: '',
    reminder_date: '',
    contact_name: '',
    contact_phoneno: '',
    utr_no: '',
    deposit_type_refno: '',
    cheque_date: '',
    mycash_balance: '',
    recurring_status: '',
    cardtype_refno: '',
    pck_card_mybank_refno: '',
    due_date: '',
    notes: '',
    document: '',
    view_status: '',
    myclient_refno: '',
    cont_project_refno: '',
    payment_group_refno: '',
    payment_type_refno: '',
    invoice_no: '',
    pck_custom_category_refno: '',
    myemployee_refno: '',
    exp_branch_refno: '',
    exp_designation_refno: '',
  });
  const [fullData, setFullData] = useState({
    pck_transtype_refno: [],
    pck_mode_refno: [],
    pck_category_refno: [],
    pck_sub_category_refno: [],
    pck_contacttype_refno: [],
    pck_mybank_refno: [],
    pck_mycontact_refno: [],
    deposit_type_refno: [],
    cardtype_refno: [],
    pck_card_mybank_refno: [],
    myclient_refno: [],
    cont_project_refno: [],
    payment_group_refno: [],
    payment_type_refno: [],
    pck_custom_category_refno: [],
    myemployee_refno: [],
    exp_branch_refno: [],
    exp_designation_refno: [],
  });
  const [errorData, setErrorData] = useState({
    pck_transtype_refno: false,
    amount: false,
    pck_mode_refno: false,
    pck_category_refno: false,
    pck_sub_category_refno: false,
    pck_contacttype_refno: false,
    pck_mybank_refno: false,
    cheque_no: false,
    pck_mycontact_refno: false,
    reminder_date: false,
    deposit_type_refno: false,
    cheque_date: false,
    cardtype_refno: false,
    pck_card_mybank_refno: false,
    due_date: false,
    myclient_refno: false,
    cont_project_refno: false,
    payment_group_refno: false,
    payment_type_refno: false,
    invoice_no: false,
    pck_custom_category_refno: false,
    myemployee_refno: false,
    exp_branch_refno: false,
    exp_designation_refno: false,
  });
  const [statusData, setStatusData] = useState({
    amount: false,
    pck_category_refno: false,
    pck_sub_category_refno: false,
    pck_contacttype_refno: false,
    pck_mybank_refno: false,
    mybank_balance: false,
    cheque_no: false,
    pck_mycontact_refno: false,
    reminder_date: false,
    contact_name: false,
    contact_phoneno: false,
    utr_no: false,
    deposit_type_refno: false,
    cheque_date: false,
    mycash_balance: false,
    recurring_status: false,
    cardtype_refno: false,
    pck_card_mybank_refno: false,
    due_date: false,
    notes: false,
    document: false,
    view_status: false,
    myclient_refno: false,
    cont_project_refno: false,
    payment_group_refno: false,
    payment_type_refno: false,
    invoice_no: false,
    pck_custom_category_refno: false,
    myemployee_refno: false,
    exp_branch_refno: false,
    exp_designation_refno: false,
  });

  const changeCommonStatus = () => {
    setFormData(prev => {
      return {
        ...prev,
        view_status: true,
      };
    });
    setStatusData(prev => {
      return {
        ...prev,
        notes: true,
        document: true,
        view_status: true,
      };
    });
    setButtonStatus(false);
  };
  const changeFullData = (name, data) => {
    setFullData(prev => {
      return {
        ...prev,
        [name]: data,
      };
    });
  };
  const changeStatusData = (name, data) => {
    setStatusData(prev => {
      return {
        ...prev,
        [name]: data,
      };
    });
  };
  const changeFormData = (name, data, status) => {
    setFormData(prev => {
      return {
        ...prev,
        [name]: data,
      };
    });
    setErrorData(prev => {
      return {
        ...prev,
        [name]: false,
      };
    });
    if (status) {
      status?.map(item => {
        setStatusData(prev => {
          return {
            ...prev,
            [item]: true,
          };
        });
      });
    }
  };

  const resetFields = fields => {
    fields.map(field => {
      setErrorData(prev => {
        return {
          ...prev,
          [field]: false,
        };
      });
      setStatusData(prev => {
        return {
          ...prev,
          [field]: false,
        };
      });
      setFullData(prev => {
        return {
          ...prev,
          [field]: [],
        };
      });
      setFormData(prev => {
        return {
          ...prev,
          [field]: '',
        };
      });
    });
  };

  const SetEditData = (data, temp) => {
    let typename = temp.find(
      item => item.pck_transtype_refno == data.pck_transtype_refno,
    ).pck_transtype_name;
    changeFormData('pck_transtype_refno', parseInt(data.pck_transtype_refno));
    changeFormData('amount', data.amount);
    FetchTransactionMode(
      parseInt(data.pck_transtype_refno),
      data.pck_mode_refno,
    );
    if (typename == 'Expenses' && data.pck_mode_name == 'Cash') {
      changeStatusData('mycash_balance', true);
      FetchAvailableCashBalance();
    }
    if (
      data.pck_mybank_refno !== null &&
      data.pck_mybank_refno !== '0' &&
      data.pck_mybank_refno !== ''
    ) {
      FetchBankList(
        data.pck_transtype_refno,
        data.pck_mode_refno,
        data.pck_mybank_refno.toString(),
        typename,
        data.pck_mode_name,
      );
    }
    if (
      data.pck_category_refno !== null &&
      data.pck_category_refno !== '0' &&
      data.pck_category_refno !== ''
    ) {
      FetchCategory(data.pck_mode_refno, typename, data.pck_category_refno);
    }

    if (data.cheque_no !== null && data.cheque_no !== '') {
      changeFormData('cheque_no', data.cheque_no, ['cheque_no']);
    }

    if (data.invoice_no !== null && data.invoice_no !== '') {
      changeFormData('invoice_no', data.invoice_no, ['invoice_no']);
    }

    if (data.cheque_date !== null && data.cheque_date !== '') {
      changeFormData(
        'cheque_date',
        new Date(
          data.cheque_date.substring(3, 5) +
            '/' +
            data.cheque_date.substring(0, 2) +
            '/' +
            data.cheque_date.substring(6, 10),
        ),
        ['cheque_date'],
      );
    }

    if (data.due_date !== null && data.due_date !== '') {
      changeFormData(
        'due_date',
        new Date(
          data.due_date.substring(3, 5) +
            '/' +
            data.due_date.substring(0, 2) +
            '/' +
            data.due_date.substring(6, 10),
        ),
        ['due_date'],
      );
    }

    if (
      data.pck_sub_category_refno !== null &&
      data.pck_sub_category_refno !== '0' &&
      data.pck_sub_category_refno !== ''
    ) {
      FetchSubCategory(
        data.pck_category_refno,
        typename,
        data.pck_sub_category_refno,
      );
    }

    if (data.pck_mode_refno == 2 || data.pck_mode_refno == 4) {
      changeFormData('utr_no', data.utr_no, ['utr_no']);
    }

    if (
      data.deposit_type_refno !== null &&
      data.deposit_type_refno !== '0' &&
      data.deposit_type_refno !== ''
    ) {
      FetchDepositType(data.deposit_type_refno);
    }

    if (
      data.cardtype_refno !== null &&
      data.cardtype_refno !== '0' &&
      data.cardtype_refno !== ''
    ) {
      FetchCardType(data.cardtype_refno);
    }

    if (
      data.pck_card_mybank_refno !== null &&
      data.pck_card_mybank_refno !== '0' &&
      data.pck_card_mybank_refno !== ''
    ) {
      FetchCardBankList(data.cardtype_refno, data.pck_card_mybank_refno);
    }

    if (
      data.myclient_refno !== null &&
      data.myclient_refno !== '0' &&
      data.myclient_refno !== ''
    ) {
      FetchClientList(data.myclient_refno);
    }

    if (
      data.cont_project_refno !== null &&
      data.cont_project_refno !== '0' &&
      data.cont_project_refno !== ''
    ) {
      FetchProjectList(data.myclient_refno, data.cont_project_refno);
    }

    if (
      data.payment_group_refno !== null &&
      data.payment_group_refno !== '0' &&
      data.payment_group_refno !== ''
    ) {
      FetchPaymentGroup(data.payment_group_refno);
    }

    if (
      data.payment_type_refno !== null &&
      data.payment_type_refno !== '0' &&
      data.payment_type_refno !== ''
    ) {
      FetchPaymentType(data.payment_type_refno);
    }

    if (
      data.pck_custom_category_refno !== null &&
      data.pck_custom_category_refno !== '0' &&
      data.pck_custom_category_refno !== ''
    ) {
      FetchExpenseTo(
        data.pck_sub_category_refno,
        data.pck_custom_category_refno,
      );
    }

    if (
      data.myemployee_refno !== null &&
      data.myemployee_refno !== '0' &&
      data.myemployee_refno !== ''
    ) {
      FetchEmployeeList(
        data.pck_custom_category_refno,
        data.exp_designation_refno,
        data.exp_branch_refno,
        data.myemployee_refno,
      );
    }

    changeFormData('notes', data.notes);
    getFileType(data.attach_receipt_url, setImage);
    changeCommonStatus();
    changeFormData('view_status', data.view_status == '1' ? true : false);
  };

  const FetchEntryType = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckentrytype, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data.map(data => {
              if (data.pck_entrytype_name == 'Company') {
                setFormData(prev => {
                  return {
                    ...prev,
                    pck_entrytype_refno: data.pck_entrytype_refno,
                  };
                });
                FetchTransactionType();
              }
            });
          }
        }
      })
      .catch(e => {});
  };

  const FetchTransactionType = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.gettransactiontype_pckcategoryform_user,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let temp = [];
            response.data.data.map(item => {
              if (item.pck_transtype_name == 'Activity') {
              } else {
                temp.push(item);
              }
            });

            if (route.params.tabIndex != null && route.params.type === 'add') {
              changeFormData('pck_transtype_refno', route.params.tabIndex + 1);
              FetchTransactionMode(route.params.tabIndex + 1);
            }

            if (route.params.tabIndex != null && route.params.type === 'add') {
              changeFormData('pck_transtype_refno', route.params.tabIndex + 1);
            }

            changeFullData('pck_transtype_refno', temp);
            if (route.params.type === 'edit') {
              SetEditData(route.params.data, temp);
            }
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };
  const FetchTransactionMode = (pck_transtype_refno, editID) => {
    console.log('fetchingpaymentmode', editID);
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_transtype_refno: pck_transtype_refno,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.get_pckpaymentmodetype,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('pck_mode_refno', response.data.data);
          }
          if (editID != null && editID !== '0' && editID !== '') {
            changeFormData('pck_mode_refno', editID);
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  const FetchCategory = (receiptModeID, type, categoryID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        Sess_designation_refno: designID.toString(),
        Sess_group_refno_extra_1: groupExtraID.toString(),
        pck_mode_refno: receiptModeID,
        pck_entrytype_refno: formData.pck_entrytype_refno,
      },
    };

    Provider.createDFPocketDairy(
      Provider.API_URLS[
        type == 'Source'
          ? 'getcategoryname_pckaddsourceform'
          : 'getcategoryname_pckaddexpensesform'
      ],
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('pck_category_refno', response.data.data);
            if (categoryID !== null) {
              changeFormData('pck_category_refno', categoryID, [
                'pck_category_refno',
              ]);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchSubCategory = (categoryID, type, editID) => {
    console.log('subcategory', categoryID, type);
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        pck_category_refno: categoryID,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS[
        type == 'Source'
          ? 'getsubcategoryname_pckaddsourceform'
          : 'getsubcategoryname_pckaddexpensesform'
      ],
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('pck_sub_category_refno', response.data.data);
            if (editID !== null) {
              changeFormData('pck_sub_category_refno', editID, [
                'pck_sub_category_refno',
              ]);
            }
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };
  const FetchContactType = editID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_contacttype, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('pck_contacttype_refno', response.data.data);
          }
        }
      })
      .catch(e => {});
  };

  const reloadbank = () => {
    FetchBankList(formData.pck_transtype_refno, formData.pck_mode_refno);
    changeStatusData('pck_mybank_refno', true);
  };

  const FetchBankList = (
    pck_transtype_refno,
    mode,
    editID,
    transname,
    modename,
  ) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        Sess_group_refno: groupID.toString(),
        Sess_designation_refno: designID.toString(),
        pck_entrytype_refno: formData.pck_entrytype_refno,
        pck_transtype_refno: pck_transtype_refno,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckmybankname, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('pck_mybank_refno', response.data.data);

            if (editID !== null) {
              changeFormData('pck_mybank_refno', editID, ['pck_mybank_refno']);
              if (modename == 'Cash' || transname == 'Expenses') {
                FetchBankCurrentBalance(editID);
                changeStatusData('mybank_balance', true);
              }
            }
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };
  const FetchBankCurrentBalance = bankID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID.toString(),
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        pck_entrytype_refno: _pktEntryTypeID,
        pck_mybank_refno: bankID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.get_availablebalance_cashinbank_expensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFormData(
              'mybank_balance',
              response.data.data[0].cashinbank.toString(),
            );
            let amt = formData.amount == '' ? 0 : parseFloat(formData.amount);
            let bankAmt =
              response.data.data[0].cashinbank == ''
                ? 0
                : parseFloat(response.data.data[0].cashinbank);
            if (amt > bankAmt) {
              changeFormData('amount', '');
              setSnackbarText(
                'Your entered amount is greater than for available balance.',
              );
              setSnackbarColor(theme.colors.error);
              setSnackbarVisible(true);
            }
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  const FetchReceiverList = (subCategoryID, contactTypeID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_sub_category_refno:
          subCategoryID.toString() !== '' ? subCategoryID.toString() : 'all',
        pck_contacttype_refno:
          contactTypeID == null
            ? 0
            : contactTypeID == ''
            ? 0
            : contactTypeID.toString(),
        AddNew: 'NO',
        UserPhoneBookAllContactList: '',
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckmycontactname, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('pck_mycontact_refno', response.data.data);
          }
        }
      })
      .catch(e => {});
  };

  const FetchDepositType = editID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckdeposittype, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('deposit_type_refno', response.data.data);
            if (editID !== null) {
              changeFormData('deposit_type_refno', editID, [
                'deposit_type_refno',
              ]);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchAvailableCashBalance = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID.toString(),
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        pck_entrytype_refno: formData.pck_entrytype_refno,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.get_availablebalance_cashinhand_expensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFormData(
              'mycash_balance',
              response.data.data[0].cashinhand.toString(),
            );
            let amt = formData.amount == '' ? 0 : parseFloat(formData.amount);
            let bankAmt =
              response.data.data[0].cashinhand == ''
                ? 0
                : parseFloat(response.data.data[0].cashinhand);
            if (amt > bankAmt) {
              changeFormData('amount', '');
              setSnackbarText(
                'Your entered amount is greater than for available balance.',
              );
              setSnackbarColor(theme.colors.error);
              setSnackbarVisible(true);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchCardType = editID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getcardtype_pckaddexpensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('cardtype_refno', response.data.data);
            if (editID !== null) {
              changeFormData('cardtype_refno', editID, ['cardtype_refno']);
            }
          }
        }
      })
      .catch(e => {});
  };
  const FetchCardBankList = (cardtypeID, editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        cardtype_refno: cardtypeID,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getcardbankname_pckaddexpensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('pck_card_mybank_refno', response.data.data);
            if (editID !== null) {
              changeFormData('pck_card_mybank_refno', editID, [
                'pck_card_mybank_refno',
              ]);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchClientList = clientID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        Sess_group_refno: groupID.toString(),
        Sess_designation_refno: designID.toString(),
        Sess_CompanyAdmin_UserRefno: companyAdminID.toString(),
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckmyclientname, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('myclient_refno', response.data.data);
            if (clientID !== null) {
              changeFormData('myclient_refno', clientID, ['myclient_refno']);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchProjectList = (clientID, editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        Sess_group_refno: groupID.toString(),
        myclient_refno: clientID,
        Sess_CompanyAdmin_UserRefno: companyAdminID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.get_pckmyclientprojectname,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('cont_project_refno', response.data.data);
            if (editID !== null) {
              changeFormData('cont_project_refno', editID, [
                'cont_project_refno',
              ]);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchPaymentGroup = editID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckpaymentgroup, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('payment_group_refno', response.data.data);
            if (editID !== null) {
              changeFormData('payment_group_refno', parseInt(editID), [
                'payment_group_refno',
              ]);
            }
          }
        }
      })
      .catch(e => {});
  };
  const FetchPaymentType = editID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckpaymenttype, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('payment_type_refno', response.data.data);
            if (editID !== null) {
              changeFormData('payment_type_refno', parseInt(editID), [
                'payment_type_refno',
              ]);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchExpenseTo = (subcategoryID, editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        Sess_designation_refno: designID,
        Sess_group_refno_extra_1: groupExtraID.toString(),
        pck_sub_category_refno: subcategoryID,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getexpensesto_pckaddexpensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('pck_custom_category_refno', response.data.data);

            if (editID !== null) {
              changeFormData('pck_custom_category_refno', editID, [
                'pck_custom_category_refno',
              ]);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchEmployeeList = (
    pck_custom_category_refno,
    exp_designation_refno = '0',
    exp_branch_refno = '0',
    editID,
  ) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        exp_designation_refno: exp_designation_refno.toString(),
        exp_branch_refno: exp_branch_refno.toString(),
        pck_custom_category_refno: pck_custom_category_refno,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getemployeelist_pckaddexpensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('myemployee_refno', response.data.data);
            if (editID !== null) {
              changeFormData('myemployee_refno', editID, ['myemployee_refno']);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchBranchList = editID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getbranchlist_pckaddexpensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('exp_branch_refno', response.data.data);
          }
        }
      })
      .catch(e => {});
  };

  const FetchDesignationList = editID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getdesignationlist_pckaddexpensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            changeFullData('exp_designation_refno', response.data.data);
          }
        }
      })
      .catch(e => {});
  };
  const checkValidation = async () => {
    setButtonStatus(true);
    let isValid = true;
    Object.keys(statusData).map(item => {
      if (item !== 'notes' && item !== 'document' && item !== 'utr_no') {
        if (
          item == 'amount' &&
          (formData[item] == null ||
            formData[item] == undefined ||
            formData[item].toString()?.trim() === '')
        ) {
          isValid = false;
          setErrorData(prev => {
            return {
              ...prev,
              [item]: true,
            };
          });
        } else if (
          statusData[item] &&
          (formData[item] == null ||
            formData[item] == undefined ||
            formData[item].toString()?.trim() === '')
        ) {
          isValid = false;
          setErrorData(prev => {
            return {
              ...prev,
              [item]: true,
            };
          });
        }
      }
    });
    setButtonStatus(false);
    if (isValid) {
      if (loc?.latitude == null || loc?.latitude == undefined) {
        try {
          const temp = await getLocation('validate');
          if (!temp) {
            setSnackbarText('Please turn on GPS location.');
            setSnackbarColor(theme.colors.error);
            setSnackbarVisible(true);
          } else {
            if (route?.params?.type === 'edit') {
              UpdateData();
            } else {
              InsertData();
            }
          }
        } catch (e) {
          setSnackbarText('Something went wrong');
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
        }
      } else {
        if (route?.params?.type === 'edit') {
          UpdateData();
        } else {
          InsertData();
        }
      }
    } else {
      setSnackbarText('Please fill all required fields.');
      setSnackbarColor(theme.colors.error);
      setSnackbarVisible(true);
      console.log(
        Object.entries(errorData).filter(([key, value]) => value == true),
      );
    }
  };

  const InsertData = () => {
    setIsButtonLoading(true);
    const datas = new FormData();
    const params = {
      Sess_UserRefno: userID.toString(),
      Sess_company_refno: companyID.toString(),
      Sess_branch_refno: branchID.toString(),
      Sess_group_refno: groupID.toString(),
      Sess_designation_refno: designID.toString(),
      pck_entrytype_refno: formData.pck_entrytype_refno.toString(),
      pck_transtype_refno: formData.pck_transtype_refno.toString(),
      pck_mode_refno: formData.pck_mode_refno.toString(),
      pck_category_refno: statusData.pck_category_refno
        ? formData.pck_category_refno.toString()
        : null,
      pck_sub_category_refno: statusData.pck_sub_category_refno
        ? formData.pck_sub_category_refno.toString()
        : null,
      pck_sub_category_notes: '', //Need Confirmation
      pck_contacttype_refno: statusData.pck_contacttype_refno
        ? formData.pck_contacttype_refno.toString()
        : null,
      contact_name: statusData.contact_name ? formData.contact_name : null,
      contact_phoneno: statusData.contact_phoneno
        ? formData.contact_phoneno.toString()
        : null,
      pck_mycontact_refno: statusData.pck_mycontact_refno
        ? formData.pck_mycontact_refno.toString()
        : null,
      pck_mybank_refno: statusData.pck_mybank_refno
        ? formData.pck_mybank_refno.toString()
        : null,
      utr_no: statusData.utr_no ? formData.utr_no.toString() : null,
      cheque_no: statusData.cheque_no ? formData.cheque_no.toString() : null,
      deposit_type_refno: statusData.deposit_type_refno
        ? formData.deposit_type_refno.toString()
        : null,
      cheque_date: statusData.cheque_date
        ? formData.cheque_date.toString()
        : null,
      amount: formData.amount.toString(),
      notes: formData.notes.toString(),
      reminder_date: statusData.reminder_date
        ? formData.reminder_date.toString()
        : null,
      myclient_refno: statusData.myclient_refno
        ? formData.myclient_refno.toString()
        : null,
      cont_project_refno: statusData.cont_project_refno
        ? formData.cont_project_refno.toString()
        : null,
      invoice_no: statusData.invoice_no ? formData.invoice_no.toString() : null,
      payment_type_refno: statusData.payment_type_refno
        ? formData.payment_type_refno.toString()
        : null,
      payment_group_refno: statusData.payment_group_refno
        ? formData.payment_group_refno.toString()
        : null,
      cardtype_refno: statusData.cardtype_refno
        ? formData.cardtype_refno.toString()
        : null,
      pck_card_mybank_refno: statusData.pck_card_mybank_refno
        ? formData.pck_card_mybank_refno.toString()
        : null,
      due_date: statusData.due_date ? formData.due_date.toString() : null,
      pck_custom_category_refno: statusData.pck_custom_category_refno
        ? formData.pck_custom_category_refno.toString()
        : null,
      exp_branch_refno: statusData.exp_branch_refno
        ? formData.exp_branch_refno.toString()
        : null,
      exp_designation_refno: statusData.exp_designation_refno
        ? formData.exp_designation_refno.toString()
        : null,
      myemployee_refno: statusData.myemployee_refno
        ? formData.myemployee_refno.toString()
        : null,
      activity_refno: null,
      dynamic_expenses_refno: null,
      refer_user_refno: null,
      visit_location_name: null,
      activity_entry_type: null,
      activity_date_time: null,
      activity_status: null,
      next_visit_no: null,
      daysmonths_refno: null,
      reference_refno: null,
      help_employee_user_refno: null,
      activity_remarks: null,
      last_gprs_activitytrack_refno: loc?.last_gprs_activitytrack_refno
        ? loc?.last_gprs_activitytrack_refno.toString()
        : null,
      latitude: loc?.latitude?.toString(),
      longitude: loc?.longitude?.toString(),
      kilometer: loc?.kilometer?.toString(),
      gprs_location_name: loc?.gprs_location_name?.toString(),
      view_status: formData.view_status ? '1' : '0',
    };
    // params.attach_receipt =
    //   file != null && file != undefined
    //     ? {
    //         name: 'receipt',
    //         type: file.type || file.mimeType,
    //         uri: file.uri,
    //       }
    //     : null;
    // Object.keys(params).forEach(key => {
    //   if (params[key] === null) {
    //     delete params[key];
    //   }
    // });
    datas.append("data", JSON.stringify(params));
    datas.append(
      "attach_receipt",
      file != null && file != undefined && file.type != undefined && file.type != null
        ? {
          name: "appimage1212.jpg",
          // type: file.type + "/*",
          type: file.type || file.mimeType,
          uri: file.uri,
          // uri: Platform.OS === "android" ? file.uri : file.uri.replace("file://", ""),
        }
        : ""
    );

    Provider.createDFPocketDairyWithHeader(
      Provider.API_URLS.pckadd_source_expenses_activity_create,
      datas,
    )
      .then(response => {
        // console.log('response is--->r',response)
        setIsButtonLoading(false);
        // console.log(datas);
        // console.log(params);
        console.log('response is----->', response.data);
        if (
          response.data &&
          response.data.code === 200 &&
          response.data.data.Created == 1
        ) {
          route.params.fetchData('add');
          navigation.goBack();
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.InsertError);
          setSnackbarVisible(true);
        }
      })
      .catch(e => {
        setIsButtonLoading(false);
        console.log('except', e);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const UpdateData = () => {
    const datas = new FormData();
    const params = {
      Sess_UserRefno: userID.toString(),
      Sess_company_refno: companyID.toString(),
      Sess_branch_refno: branchID.toString(),
      Sess_group_refno: groupID.toString(),
      Sess_designation_refno: designID.toString(),
      pck_trans_refno_edit: route.params.data.pck_trans_refno.toString(),
      pck_entrytype_refno: formData.pck_entrytype_refno.toString(),
      pck_transtype_refno: formData.pck_transtype_refno.toString(),
      pck_mode_refno: formData.pck_mode_refno.toString(),
      pck_category_refno: statusData.pck_category_refno
        ? formData.pck_category_refno.toString()
        : null,
      pck_sub_category_refno: statusData.pck_sub_category_refno
        ? formData.pck_sub_category_refno.toString()
        : null,
      pck_sub_category_notes: '', //Need Confirmation
      pck_contacttype_refno: statusData.pck_contacttype_refno
        ? formData.pck_contacttype_refno.toString()
        : null,
      contact_name: statusData.contact_name ? formData.contact_name : null,
      contact_phoneno: statusData.contact_phoneno
        ? formData.contact_phoneno.toString()
        : null,
      pck_mycontact_refno: statusData.pck_mycontact_refno
        ? formData.pck_mycontact_refno.toString()
        : null,
      pck_mybank_refno: statusData.pck_mybank_refno
        ? formData.pck_mybank_refno.toString()
        : null,
      utr_no: statusData.utr_no ? formData.utr_no.toString() : null,
      cheque_no: statusData.cheque_no ? formData.cheque_no.toString() : null,
      deposit_type_refno: statusData.deposit_type_refno
        ? formData.deposit_type_refno.toString()
        : null,
      cheque_date: statusData.cheque_date
        ? formData.cheque_date.toString()
        : null,
      amount: formData.amount.toString(),
      notes: formData.notes.toString(),
      reminder_date: statusData.reminder_date
        ? formData.reminder_date.toString()
        : null,
      myclient_refno: statusData.myclient_refno
        ? formData.myclient_refno.toString()
        : null,
      cont_project_refno: statusData.cont_project_refno
        ? formData.cont_project_refno.toString()
        : null,
      invoice_no: statusData.invoice_no ? formData.invoice_no.toString() : null,
      payment_type_refno: statusData.payment_type_refno
        ? formData.payment_type_refno.toString()
        : null,
      payment_group_refno: statusData.payment_group_refno
        ? formData.payment_group_refno.toString()
        : null,
      cardtype_refno: statusData.cardtype_refno
        ? formData.cardtype_refno.toString()
        : null,
      pck_card_mybank_refno: statusData.pck_card_mybank_refno
        ? formData.pck_card_mybank_refno.toString()
        : null,
      due_date: statusData.due_date ? formData.due_date.toString() : null,
      pck_custom_category_refno: statusData.pck_custom_category_refno
        ? formData.pck_custom_category_refno.toString()
        : null,
      exp_branch_refno: statusData.exp_branch_refno
        ? formData.exp_branch_refno.toString()
        : null,
      exp_designation_refno: statusData.exp_designation_refno
        ? formData.exp_designation_refno.toString()
        : null,
      myemployee_refno: statusData.myemployee_refno
        ? formData.myemployee_refno.toString()
        : null,
      activity_refno: null,
      dynamic_expenses_refno: null,
      refer_user_refno: null,
      visit_location_name: null,
      activity_entry_type: null,
      activity_date_time: null,
      activity_status: null,
      next_visit_no: null,
      daysmonths_refno: null,
      reference_refno: null,
      help_employee_user_refno: null,
      activity_remarks: null,
      last_gprs_activitytrack_refno: loc?.last_gprs_activitytrack_refno
        ? loc?.last_gprs_activitytrack_refno.toString()
        : null,
      latitude: loc?.latitude?.toString(),
      longitude: loc?.longitude?.toString(),
      kilometer: loc?.kilometer?.toString(),
      gprs_location_name: loc?.gprs_location_name?.toString(),
      view_status: formData.view_status ? '1' : '0',
    };
    Object.keys(params).forEach(key => {
      if (params[key] === null) {
        delete params[key];
      }
    });
    datas.append('data', JSON.stringify(params));
    datas.append(
      'attach_receipt',
      isImageReplaced
        ? {
            name: file.name,
            type: file.mimeType,
            uri: file.uri,
          }
        : '',
    );
    setIsButtonLoading(true);
    Provider.createDFPocketDairyWithHeader(
      Provider.API_URLS.pckadd_source_expenses_activity_update,
      datas,
    )
      .then(response => {
        setIsButtonLoading(false);
        console.log(datas);
        console.log(params);
        console.log(response.data);
        if (
          response.data &&
          response.data.code === 200 &&
          response.data.data.Updated == 1
        ) {
          route.params.fetchData('update');
          navigation.goBack();
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.InsertError);
          setSnackbarVisible(true);
        }
      })
      .catch(e => {
        setIsButtonLoading(false);
        console.log(e);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  return (
    <View style={[Styles.flex1]}>
      <ScrollView
        style={[Styles.flex1, Styles.backgroundColor, {marginBottom: 64}]}
        keyboardShouldPersistTaps="handled">
        <View style={[Styles.padding16]}>
          <Text>Transaction Type:</Text>
          <RadioButton.Group
            onValueChange={newValue => {
              resetFields([
                'amount',
                'pck_mode_refno',
                'pck_category_refno',
                'pck_sub_category_refno',
                'pck_contacttype_refno',
                'pck_mybank_refno',
                'mybank_balance',
                'cheque_no',
                'pck_mycontact_refno',
                'reminder_date',
                'contact_name',
                'contact_phoneno',
                'utr_no',
                'deposit_type_refno',
                'cheque_date',
                'mycash_balance',
                'recurring_status',
                'cardtype_refno',
                'pck_card_mybank_refno',
                'due_date',
                'notes',
                'document',
                'view_status',
                'myclient_refno',
                'cont_project_refno',
                'payment_group_refno',
                'payment_type_refno',
                'invoice_no',
                'pck_custom_category_refno',
                'myemployee_refno',
                'exp_branch_refno',
                'exp_designation_refno',
              ]);
              setButtonStatus(true);
              changeFormData('pck_transtype_refno', newValue);
              FetchTransactionMode(newValue);
            }}
            value={formData.pck_transtype_refno}>
            <View style={{flexDirection: 'row'}}>
              {fullData?.pck_transtype_refno?.map(item => (
                <View
                  key={item.pck_transtype_refno}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text>{item.pck_transtype_name}</Text>
                  <RadioButton value={item.pck_transtype_refno} />
                </View>
              ))}
            </View>
          </RadioButton.Group>
          {errorData.pck_transtype_refno && (
            <HelperText type="error" visible={errorData.pck_transtype_refno}>
              {'Please select transaction type.'}
            </HelperText>
          )}

          <TextInput
            mode="outlined"
            label="Amount *"
            value={formData.amount}
            returnKeyType="next"
            keyboardType="number-pad"
            onChangeText={input => {
              const text = input.replace(/[^0-9.]/g, '');
              const dotCount = input.split('.').length - 1;
              if (dotCount > 1) {
                return;
              }
              if (
                (statusData.mybank_balance &&
                  parseFloat(text) > parseFloat(formData.mybank_balance)) ||
                (statusData.mycash_balance &&
                  parseFloat(text) > parseFloat(formData.mycash_balance))
              ) {
                setSnackbarText(
                  'Your entered amount is greater than for available balance.',
                );
                setSnackbarColor(theme.colors.error);
                setSnackbarVisible(true);
              } else {
                changeFormData('amount', text);
              }
            }}
            style={{backgroundColor: 'white', marginTop: 10}}
            error={errorData.amount}
          />
          {errorData.amount && (
            <HelperText type="error" visible={errorData.amount}>
              Please fill correct amount.
            </HelperText>
          )}
          <Dropdown
            label="Transaction Mode *"
            style={{marginBottom: 10, marginTop: 10}}
            data={fullData?.pck_mode_refno?.map(item => item.pck_mode_name)}
            onSelected={newValue => {
              setButtonStatus(true);
              resetFields([
                'pck_category_refno',
                'pck_sub_category_refno',
                'pck_contacttype_refno',
                'pck_mybank_refno',
                'mybank_balance',
                'cheque_no',
                'pck_mycontact_refno',
                'reminder_date',
                'contact_name',
                'contact_phoneno',
                'utr_no',
                'deposit_type_refno',
                'cheque_date',
                'mycash_balance',
                'recurring_status',
                'cardtype_refno',
                'pck_card_mybank_refno',
                'due_date',
                'notes',
                'document',
                'view_status',
                'myclient_refno',
                'cont_project_refno',
                'payment_group_refno',
                'payment_type_refno',
                'invoice_no',
                'pck_custom_category_refno',
                'myemployee_refno',
                'exp_branch_refno',
                'exp_designation_refno',
              ]);
              let modeID = fullData?.pck_mode_refno?.find(
                item => item.pck_mode_name == newValue,
              )?.pck_mode_refno;
              let type = fullData?.pck_transtype_refno?.find(
                item =>
                  item.pck_transtype_refno == formData.pck_transtype_refno,
              )?.pck_transtype_name;
              changeFormData('pck_mode_refno', modeID, ['pck_category_refno']);
              FetchCategory(modeID, type);
              if (type == 'Expenses' && newValue == 'Cash') {
                changeStatusData('mycash_balance', true);
                FetchAvailableCashBalance();
              }
              if (newValue == 'Card') {
                FetchCardType();
                changeStatusData('cardtype_refno', true);
              }
            }}
            isError={errorData.pck_mode_refno}
            selectedItem={
              fullData?.pck_mode_refno?.find(
                item => item.pck_mode_refno == formData.pck_mode_refno,
              )?.pck_mode_name
            }
          />
          {errorData.pck_mode_refno && (
            <HelperText type="error" visible={errorData.pck_mode_refno}>
              Please select a valid payment mode
            </HelperText>
          )}
          {statusData.mycash_balance && (
            <>
              <TextInput
                mode="outlined"
                label="Available Balance"
                value={formData.mycash_balance}
                disabled={true}
                style={{
                  backgroundColor: 'white',
                  marginTop: 10,
                  marginBottom: 10,
                }}
              />
            </>
          )}
          {statusData.cardtype_refno && (
            <Dropdown
              label={'Card Type *'}
              style={{marginBottom: 10, marginTop: 10}}
              data={fullData?.cardtype_refno?.map(item => item.cardtype_name)}
              onSelected={newValue => {
                let modeID = fullData?.cardtype_refno?.find(
                  item => item.cardtype_name == newValue,
                )?.cardtype_refno;
                resetFields(['pck_card_mybank_refno', 'due_date']);
                FetchCardBankList(modeID);
                changeFormData('cardtype_refno', modeID, [
                  'pck_card_mybank_refno',
                ]);
                if (newValue == 'Credit Card') {
                  changeFormData('due_date', new Date());
                  changeStatusData('due_date', true);
                }
              }}
              isError={errorData.cardtype_refno}
              selectedItem={
                fullData?.cardtype_refno?.find(
                  item => item.cardtype_refno == formData.cardtype_refno,
                )?.cardtype_name
              }
            />
          )}
          {statusData.pck_card_mybank_refno && (
            <Dropdown
              label={'Card Bank Name *'}
              style={{marginBottom: 10, marginTop: 10}}
              data={fullData?.pck_card_mybank_refno?.map(
                item => item.bank_name,
              )}
              onSelected={newValue => {
                let modeID = fullData?.pck_card_mybank_refno?.find(
                  item => item.bank_name == newValue,
                )?.bank_refno;
                changeFormData('pck_card_mybank_refno', modeID);
              }}
              isError={errorData.pck_card_mybank_refno}
              selectedItem={
                fullData?.pck_card_mybank_refno?.find(
                  item => item.bank_refno == formData.pck_card_mybank_refno,
                )?.bank_name
              }
            />
          )}
          {statusData.due_date && (
            <>
              <DateTimePicker
                style={Styles.backgroundColorWhite}
                isError={errorData.due_date}
                label="Credit Card RePayment Due Date"
                type="date"
                value={formData?.due_date}
                onChangeDate={date => {
                  changeFormData('due_date', date);
                }}
              />
              <HelperText type="error" visible={errorData.due_date}>
                Please select a valid date
              </HelperText>
            </>
          )}
          {statusData.pck_category_refno && (
            <Dropdown
              label={
                fullData?.pck_transtype_refno?.find(
                  item =>
                    item.pck_transtype_refno == formData.pck_transtype_refno,
                )?.pck_transtype_name == 'Expenses'
                  ? 'Expenses Name *'
                  : 'Source / Receipt *'
              }
              style={{marginBottom: 10, marginTop: 10}}
              data={fullData?.pck_category_refno?.map(
                item => item.pck_category_name,
              )}
              onSelected={newValue => {
                let modeID = fullData?.pck_category_refno?.find(
                  item => item.pck_category_name == newValue,
                )?.pck_category_refno;
                changeFormData('pck_category_refno', modeID);
                resetFields([
                  'pck_sub_category_refno',
                  'pck_contacttype_refno',
                  'pck_mybank_refno',
                  'mybank_balance',
                  'cheque_no',
                  'pck_mycontact_refno',
                  'reminder_date',
                  'contact_name',
                  'contact_phoneno',
                  'utr_no',
                  'deposit_type_refno',
                  'cheque_date',
                  'recurring_status',
                  'myclient_refno',
                  'cont_project_refno',
                  'payment_group_refno',
                  'payment_type_refno',
                  'invoice_no',
                  'pck_custom_category_refno',
                  'myemployee_refno',
                  'exp_branch_refno',
                  'exp_designation_refno',
                ]);
                if (newValue === 'Hand Loan') {
                  changeStatusData('pck_contacttype_refno', true);
                  FetchContactType();
                } else if (newValue === 'Clients') {
                  FetchClientList();
                  changeStatusData('myclient_refno', true);
                } else if (newValue === 'Testing 1') {
                  changeStatusData('notes', false);
                  changeStatusData('document', false);
                  changeStatusData('view_status', false);
                  setButtonStatus(true);
                } else {
                  changeStatusData('pck_sub_category_refno', true);
                  FetchSubCategory(
                    modeID,
                    fullData?.pck_transtype_refno?.find(
                      item =>
                        item.pck_transtype_refno ==
                        formData.pck_transtype_refno,
                    )?.pck_transtype_name,
                  );
                }
              }}
              isError={errorData.pck_category_refno}
              selectedItem={
                fullData?.pck_category_refno?.find(
                  item =>
                    item.pck_category_refno == formData.pck_category_refno,
                )?.pck_category_name
              }
            />
          )}
          {errorData.pck_category_refno && (
            <HelperText type="error" visible={errorData.pck_category_refno}>
              Please select a valid option
            </HelperText>
          )}

          {statusData.pck_sub_category_refno && (
            <Dropdown
              label="Sub Category Name *"
              style={{marginBottom: 10, marginTop: 10}}
              data={fullData?.pck_sub_category_refno?.map(
                item => item.sub_category_name,
              )}
              onSelected={newValue => {
                let modeID = fullData?.pck_sub_category_refno?.find(
                  item => item.sub_category_name == newValue,
                )?.pck_sub_category_refno;
                let typename = fullData?.pck_transtype_refno?.find(
                  item =>
                    item.pck_transtype_refno == formData.pck_transtype_refno,
                )?.pck_transtype_name;
                changeFormData('pck_sub_category_refno', modeID);
                resetFields([
                  'pck_mybank_refno',
                  'mybank_balance',
                  'cheque_no',
                  'cheque_date',
                  'myclient_refno',
                  'pck_custom_category_refno',
                  'cont_project_refno',
                  'payment_group_refno',
                  'payment_type_refno',
                  'invoice_no',
                  'myemployee_refno',
                  'exp_branch_refno',
                  'exp_designation_refno',
                  'pck_mybank_refno',
                  'mybank_balance',
                  'utr_no',
                  'cheque_date',
                  'cheque_no',
                  'deposit_type_refno',
                ]);

                if (typename == 'Source') {
                  changeCommonStatus();
                  if (
                    formData.pck_mode_refno == 2 ||
                    formData.pck_mode_refno == 4
                  ) {
                    FetchBankList(
                      formData.pck_transtype_refno,
                      formData.pck_mode_refno,
                    );
                    changeStatusData('pck_mybank_refno', true);
                    changeStatusData('utr_no', true);
                  } else if (formData.pck_mode_refno == 3) {
                    FetchDepositType();
                    changeStatusData('deposit_type_refno', true);
                  }
                  if (newValue == 'Cash Withdrawal') {
                    FetchBankList(
                      formData.pck_transtype_refno,
                      formData.pck_mode_refno,
                    );
                    changeStatusData('pck_mybank_refno', true);
                    changeStatusData('cheque_no', true);
                  } else if (newValue == 'ATM Withdrawal') {
                    FetchBankList(
                      formData.pck_transtype_refno,
                      formData.pck_mode_refno,
                    );
                    changeStatusData('pck_mybank_refno', true);
                  }
                } else {
                  FetchExpenseTo(modeID);
                  changeStatusData('pck_custom_category_refno', true);
                }
              }}
              isError={errorData.pck_sub_category_refno}
              selectedItem={
                fullData?.pck_sub_category_refno?.find(
                  item =>
                    item.pck_sub_category_refno ==
                    formData.pck_sub_category_refno,
                )?.sub_category_name
              }
            />
          )}
          {errorData.pck_sub_category_refno && (
            <HelperText type="error" visible={errorData.pck_sub_category_refno}>
              Please select a valid option
            </HelperText>
          )}

          {statusData.pck_custom_category_refno && (
            <Dropdown
              label="Expenses / Payment *"
              style={{marginBottom: 10, marginTop: 10}}
              data={fullData?.pck_custom_category_refno?.map(
                item => item.category_name,
              )}
              onSelected={newValue => {
                let modeID = fullData?.pck_custom_category_refno?.find(
                  item => item.category_name == newValue,
                )?.pck_custom_category_refno;
                let typename = fullData?.pck_transtype_refno?.find(
                  item =>
                    item.pck_transtype_refno == formData.pck_transtype_refno,
                )?.pck_transtype_name;
                changeFormData('pck_custom_category_refno', modeID);
                resetFields([
                  'myclient_refno',
                  'cont_project_refno',
                  'payment_group_refno',
                  'payment_type_refno',
                  'invoice_no',
                  'myemployee_refno',
                  'exp_branch_refno',
                  'exp_designation_refno',
                  'pck_mybank_refno',
                  'mybank_balance',
                  'utr_no',
                  'cheque_date',
                  'cheque_no',
                  'deposit_type_refno',
                ]);
                if (newValue == 'Vendor' || newValue == 'Supplier') {
                  changeStatusData('notes', false);
                  changeStatusData('document', false);
                  changeStatusData('view_status', false);
                  setButtonStatus(true);
                } else if (newValue == 'Clients') {
                  FetchClientList();
                  changeStatusData('myclient_refno', true);
                } else if (newValue == 'Employee') {
                  FetchEmployeeList(modeID);
                  changeStatusData('myemployee_refno', true);
                } else if (newValue == 'Branch') {
                  FetchBranchList();
                  changeStatusData('exp_branch_refno', true);
                }
              }}
              isError={errorData.pck_custom_category_refno}
              selectedItem={
                fullData?.pck_custom_category_refno?.find(
                  item =>
                    item.pck_custom_category_refno ==
                    formData.pck_custom_category_refno,
                )?.category_name
              }
            />
          )}
          {errorData.pck_custom_category_refno && (
            <HelperText
              type="error"
              visible={errorData.pck_custom_category_refno}>
              Please select a valid option
            </HelperText>
          )}

          {statusData.exp_branch_refno && (
            <Dropdown
              label="Branch List *"
              style={{marginBottom: 10, marginTop: 10}}
              data={fullData?.exp_branch_refno?.map(
                item => `${item.location_name} >> ${item.locationtype_name}`,
              )}
              onSelected={newValue => {
                let modeID = fullData?.exp_branch_refno?.find(
                  item =>
                    `${item.location_name} >> ${item.locationtype_name}` ==
                    newValue,
                )?.exp_branch_refno;
                changeFormData('exp_branch_refno', modeID);
                resetFields(['exp_designation_refno']);
                FetchDesignationList();
                changeStatusData('exp_designation_refno', true);
              }}
              isError={errorData.exp_branch_refno}
              selectedItem={`${
                fullData?.exp_branch_refno?.find(
                  item => item.exp_branch_refno == formData.exp_branch_refno,
                )?.location_name
              } >> ${
                fullData?.exp_branch_refno?.find(
                  item => item.exp_branch_refno == formData.exp_branch_refno,
                )?.locationtype_name
              }`}
            />
          )}
          {errorData.exp_branch_refno && (
            <HelperText type="error" visible={errorData.exp_branch_refno}>
              Please select a valid option
            </HelperText>
          )}

          {statusData.exp_designation_refno && (
            <Dropdown
              label="Designation List *"
              style={{marginBottom: 10, marginTop: 10}}
              data={fullData?.exp_designation_refno?.map(
                item => item.designation_name,
              )}
              onSelected={newValue => {
                let modeID = fullData?.exp_designation_refno?.find(
                  item => item.designation_name == newValue,
                )?.designation_refno;
                changeFormData('exp_designation_refno', modeID);
                resetFields(['myemployee_refno']);
                changeStatusData('myemployee_refno', true);
                FetchEmployeeList(
                  formData.pck_custom_category_refno,
                  modeID,
                  formData.exp_branch_refno,
                );
              }}
              isError={errorData.exp_designation_refno}
              selectedItem={
                fullData?.exp_designation_refno?.find(
                  item =>
                    item.exp_designation_refno ==
                    formData.exp_designation_refno,
                )?.designation_name
              }
            />
          )}
          {errorData.exp_designation_refno && (
            <HelperText type="error" visible={errorData.exp_designation_refno}>
              Please select a valid option
            </HelperText>
          )}

          {statusData.myemployee_refno && (
            <Dropdown
              label="Employee List *"
              style={{marginBottom: 10, marginTop: 10}}
              data={fullData?.myemployee_refno?.map(
                item => `${item.employee_name} / ${item.employee_code}`,
              )}
              onSelected={newValue => {
                let modeID = fullData?.myemployee_refno?.find(
                  item =>
                    `${item.employee_name} / ${item.employee_code}` == newValue,
                )?.myemployee_refno;
                changeFormData('myemployee_refno', modeID);
                changeCommonStatus();
                if (
                  formData.pck_mode_refno == 2 ||
                  formData.pck_mode_refno == 4
                ) {
                  FetchBankList(
                    formData.pck_transtype_refno,
                    formData.pck_mode_refno,
                  );
                  changeStatusData('pck_mybank_refno', true);
                  changeStatusData('utr_no', true);
                } else if (formData.pck_mode_refno == 3) {
                  FetchDepositType();
                  changeStatusData('deposit_type_refno', true);
                }
              }}
              isError={errorData.myemployee_refno}
              selectedItem={`${
                fullData?.myemployee_refno?.find(
                  item => item.myemployee_refno == formData.myemployee_refno,
                )?.employee_name
              } / ${
                fullData?.myemployee_refno?.find(
                  item => item.myemployee_refno == formData.myemployee_refno,
                )?.employee_code
              }`}
            />
          )}
          {errorData.myemployee_refno && (
            <HelperText type="error" visible={errorData.myemployee_refno}>
              Please select a valid option
            </HelperText>
          )}

          {statusData.myclient_refno && (
            <Dropdown
              label="My Client List *"
              style={{marginBottom: 10, marginTop: 10}}
              data={fullData?.myclient_refno?.map(item => item.company_name)}
              onSelected={newValue => {
                let modeID = fullData?.myclient_refno?.find(
                  item => item.company_name == newValue,
                )?.myclient_refno;
                let typename = fullData?.pck_transtype_refno?.find(
                  item =>
                    item.pck_transtype_refno == formData.pck_transtype_refno,
                )?.pck_transtype_name;
                resetFields(['cont_project_refno']);
                changeFormData('myclient_refno', modeID);
                if (RoleID == 4) {
                  changeCommonStatus();
                  if (typename == 'Source') {
                    changeStatusData('payment_group_refno', true);
                    FetchPaymentGroup();
                  }
                  if (
                    formData.pck_mode_refno == 2 ||
                    formData.pck_mode_refno == 4
                  ) {
                    FetchBankList(
                      formData.pck_transtype_refno,
                      formData.pck_mode_refno,
                    );
                    changeStatusData('pck_mybank_refno', true);
                    changeStatusData('utr_no', true);
                  } else if (formData.pck_mode_refno == 3) {
                    FetchDepositType();
                    changeStatusData('deposit_type_refno', true);
                  }
                } else {
                  changeStatusData('cont_project_refno', true);
                  FetchProjectList(modeID);
                }
              }}
              isError={errorData.myclient_refno}
              selectedItem={
                fullData?.myclient_refno?.find(
                  item => item.myclient_refno == formData.myclient_refno,
                )?.company_name
              }
            />
          )}
          {errorData.myclient_refno && (
            <HelperText type="error" visible={errorData.myclient_refno}>
              Please select a valid option
            </HelperText>
          )}

          {statusData.cont_project_refno && (
            <Dropdown
              label="Project List *"
              style={{marginBottom: 10, marginTop: 10}}
              data={fullData?.cont_project_refno?.map(
                item => item.project_name,
              )}
              onSelected={newValue => {
                let modeID = fullData?.cont_project_refno?.find(
                  item => item.project_name == newValue,
                )?.cont_project_refno;
                let typename = fullData?.pck_transtype_refno?.find(
                  item =>
                    item.pck_transtype_refno == formData.pck_transtype_refno,
                )?.pck_transtype_name;
                changeFormData('cont_project_refno', modeID);
                changeCommonStatus();
                if (typename == 'Source') {
                  changeStatusData('payment_group_refno', true);
                  FetchPaymentGroup();
                }
                if (
                  formData.pck_mode_refno == 2 ||
                  formData.pck_mode_refno == 4
                ) {
                  FetchBankList(
                    formData.pck_transtype_refno,
                    formData.pck_mode_refno,
                  );
                  changeStatusData('pck_mybank_refno', true);
                  changeStatusData('utr_no', true);
                } else if (formData.pck_mode_refno == 3) {
                  FetchDepositType();
                  changeStatusData('deposit_type_refno', true);
                }
              }}
              isError={errorData.cont_project_refno}
              selectedItem={
                fullData?.cont_project_refno?.find(
                  item =>
                    item.cont_project_refno == formData.cont_project_refno,
                )?.project_name
              }
            />
          )}
          {errorData.cont_project_refno && (
            <HelperText type="error" visible={errorData.cont_project_refno}>
              Please select a valid option
            </HelperText>
          )}
          {statusData.payment_group_refno && (
            <>
              <Text style={{fontWeight: 'bold'}}>Payment Group *:</Text>
              <RadioButton.Group
                onValueChange={newValue => {
                  changeFormData('payment_group_refno', newValue);
                  resetFields(['payment_type_refno', 'invoice_no']);
                  changeStatusData('invoice_no', newValue == 2);
                  changeStatusData('payment_type_refno', newValue == 2);
                  if (newValue == 2) {
                    FetchPaymentType();
                  }
                }}
                value={formData.payment_group_refno}>
                <View style={{flexDirection: 'row'}}>
                  {fullData?.payment_group_refno.map(item => (
                    <View
                      key={item.payment_group_refno}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text>{item.payment_group_name}</Text>
                      <RadioButton value={item.payment_group_refno} />
                    </View>
                  ))}
                </View>
              </RadioButton.Group>
            </>
          )}

          {statusData.payment_type_refno && (
            <>
              <Text style={{fontWeight: 'bold'}}>Payment Type *:</Text>
              <RadioButton.Group
                onValueChange={newValue => {
                  changeFormData('payment_type_refno', newValue);
                }}
                value={formData.payment_type_refno}>
                <View style={{flexDirection: 'row'}}>
                  {fullData?.payment_type_refno.map(item => (
                    <View
                      key={item.payment_type_refno}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text>{item.payment_type_name}</Text>
                      <RadioButton value={item.payment_type_refno} />
                    </View>
                  ))}
                </View>
              </RadioButton.Group>
            </>
          )}
          {statusData.invoice_no && (
            <>
              <TextInput
                mode="outlined"
                label="Invoice No. *"
                value={formData.invoice_no}
                returnKeyType="next"
                keyboardType="number-pad"
                onChangeText={input => {
                  const text = input.replace(/[^0-9]/g, '');
                  changeFormData('invoice_no', text);
                }}
                style={{
                  backgroundColor: 'white',
                  marginTop: 10,
                  marginBottom: 10,
                }}
                error={errorData.invoice_no}
              />
            </>
          )}

          {statusData.pck_contacttype_refno && (
            <Dropdown
              label="Contact Type *"
              style={{marginBottom: 10, marginTop: 10}}
              data={fullData?.pck_contacttype_refno?.map(
                item => item.pck_contacttype_name,
              )}
              onSelected={newValue => {
                changeCommonStatus();
                let modeID = fullData?.pck_contacttype_refno?.find(
                  item => item.pck_contacttype_name == newValue,
                )?.pck_contacttype_refno;
                let type = fullData?.pck_transtype_refno?.find(
                  item =>
                    item.pck_transtype_refno == formData.pck_transtype_refno,
                )?.pck_transtype_name;
                changeFormData('reminder_date', new Date());
                changeFormData('pck_contacttype_refno', modeID, [
                  'reminder_date',
                ]);
                resetFields([
                  'pck_mycontact_refno',
                  'contact_name',
                  'contact_phoneno',
                ]);
                if (newValue !== 'Others') {
                  changeStatusData('pck_mycontact_refno', true);
                  FetchReceiverList(formData.pck_sub_category_refno, modeID);
                } else {
                  changeStatusData('contact_name', true);
                  changeStatusData('contact_phoneno', true);
                }
                if (
                  formData.pck_mode_refno == 2 ||
                  formData.pck_mode_refno == 4
                ) {
                  FetchBankList(
                    formData.pck_transtype_refno,
                    formData.pck_mode_refno,
                  );
                  changeStatusData('pck_mybank_refno', true);
                  changeStatusData('utr_no', true);
                } else if (formData.pck_mode_refno == 3) {
                  FetchDepositType();
                  changeStatusData('deposit_type_refno', true);
                }
                if (type == 'Expenses') {
                  changeFormData('recurring_status', 1, ['recurring_status']);
                }
              }}
              isError={errorData.pck_contacttype_refno}
              selectedItem={
                fullData?.pck_contacttype_refno?.find(
                  item =>
                    item.pck_contacttype_refno ==
                    formData.pck_contacttype_refno,
                )?.pck_contacttype_name
              }
            />
          )}
          {errorData.pck_contacttype_refno && (
            <HelperText type="error" visible={errorData.pck_contacttype_refno}>
              Please select a valid option
            </HelperText>
          )}

          {statusData.pck_mycontact_refno && (
            <Dropdown
              label={
                fullData?.pck_transtype_refno?.find(
                  item =>
                    item.pck_transtype_refno == formData.pck_transtype_refno,
                )?.pck_transtype_name == 'Expenses'
                  ? 'Paid To *'
                  : 'Received From *'
              }
              style={{marginBottom: 10, marginTop: 10}}
              data={fullData?.pck_mycontact_refno?.map(
                item => `${item.contact_name} >> ${item.contact_phoneno}`,
              )}
              onSelected={newValue => {
                let modeID = fullData?.pck_mycontact_refno?.find(
                  item =>
                    `${item.contact_name} >> ${item.contact_phoneno}` ==
                    newValue,
                )?.pck_mycontact_refno;
                changeFormData('pck_mycontact_refno', modeID);
              }}
              isError={errorData.pck_mycontact_refno}
              selectedItem={() => {
                let item = fullData?.pck_mycontact_refno?.find(
                  item =>
                    item.pck_mycontact_refno == formData.pck_mycontact_refno,
                );
                return `${item.contact_name} >> ${item.contact_phoneno}`;
              }}
            />
          )}
          {errorData.pck_mycontact_refno && (
            <HelperText type="error" visible={errorData.pck_mycontact_refno}>
              Please select a valid option
            </HelperText>
          )}
          {statusData.contact_name && (
            <>
              <TextInput
                mode="outlined"
                label={
                  fullData?.pck_transtype_refno?.find(
                    item =>
                      item.pck_transtype_refno == formData.pck_transtype_refno,
                  )?.pck_transtype_name == 'Expenses'
                    ? 'Paid To *'
                    : 'Received From *'
                }
                value={formData.contact_name}
                returnKeyType="next"
                onChangeText={input => {
                  changeFormData('contact_name', input);
                }}
                style={{backgroundColor: 'white'}}
                error={errorData.contact_name}
              />
            </>
          )}
          {statusData.contact_phoneno && (
            <>
              <TextInput
                mode="outlined"
                label="Mobile No. *"
                value={formData.contact_phoneno}
                returnKeyType="next"
                keyboardType="number-pad"
                onChangeText={input => {
                  const text = input.replace(/[^0-9]/g, '');
                  changeFormData('contact_phoneno', text);
                }}
                style={{
                  backgroundColor: 'white',
                  marginTop: 10,
                  marginBottom: 10,
                }}
                error={errorData.contact_phoneno}
              />
            </>
          )}
          {statusData.deposit_type_refno && (
            <Dropdown
              label="Deposit Type *"
              style={{marginBottom: 10, marginTop: 10}}
              data={fullData?.deposit_type_refno?.map(
                item => item.deposit_type_name,
              )}
              onSelected={newValue => {
                let modeID = fullData?.deposit_type_refno?.find(
                  item => item.deposit_type_name == newValue,
                )?.deposit_type_refno;
                let type = fullData?.pck_transtype_refno?.find(
                  item =>
                    item.pck_transtype_refno == formData.pck_transtype_refno,
                )?.pck_transtype_name;
                resetFields(['pck_mybank_refno', 'mybank_balance']);
                changeFormData('cheque_date', new Date(), [
                  'cheque_no',
                  'cheque_date',
                ]);
                changeFormData('deposit_type_refno', modeID);
                if (newValue == 'Current' || type == 'Expenses') {
                  FetchBankList(
                    formData.pck_transtype_refno,
                    formData.pck_mode_refno,
                  );
                  changeStatusData('pck_mybank_refno', true);
                }
              }}
              isError={errorData.deposit_type_refno}
              selectedItem={
                fullData?.deposit_type_refno?.find(
                  item =>
                    item.deposit_type_refno == formData.deposit_type_refno,
                )?.deposit_type_name
              }
            />
          )}
          {errorData.deposit_type_refno && (
            <HelperText type="error" visible={errorData.deposit_type_refno}>
              Please select a valid option
            </HelperText>
          )}
          {statusData.pck_mybank_refno && (
            <>
              <Dropdown
                label={`${
                  (formData.pck_mode_refno == 2 ||
                    formData.pck_mode_refno == 3 ||
                    formData.pck_mode_refno == 4) &&
                  formData.pck_transtype_refno == 1
                    ? 'Company'
                    : 'My'
                } Bank List *`}
                style={{
                  marginBottom: 10,
                  marginTop: 10,
                }}
                data={fullData?.pck_mybank_refno?.map(
                  item => `${item.bank_name} (${item.bank_account_no})`,
                )}
                onSelected={newValue => {
                  let bankRefNo = fullData?.pck_mybank_refno?.find(
                    item =>
                      `${item.bank_name} (${item.bank_account_no})` == newValue,
                  )?.bank_refno;
                  let transtype = fullData?.pck_transtype_refno?.find(
                    item =>
                      item.pck_transtype_refno == formData.pck_transtype_refno,
                  )?.pck_transtype_name;
                  let mode = fullData?.pck_mode_refno?.find(
                    item => item.pck_mode_refno == formData.pck_mode_refno,
                  )?.pck_mode_name;
                  changeFormData('pck_mybank_refno', bankRefNo);
                  resetFields(['mybank_balance']);
                  if (mode == 'Cash' || transtype == 'Expenses') {
                    FetchBankCurrentBalance(bankRefNo);
                    changeStatusData('mybank_balance', true);
                  }
                }}
                isError={errorData.pck_mybank_refno}
                selectedItem={`${
                  fullData?.pck_mybank_refno?.find(
                    item => item.bank_refno == formData.pck_mybank_refno,
                  )?.bank_name
                } (${
                  fullData?.pck_mybank_refno?.find(
                    item => item.bank_refno == formData.pck_mybank_refno,
                  )?.bank_account_no
                })`}
              />
              <Button
                icon={'plus'}
                mode="contained"
                onPress={() => {
                  navigation.navigate('AddGMyBankScreen', {
                    type: 'newAccount',
                    fetchBankList: reloadbank,
                  });
                }}>
                Add Bank Account
              </Button>
            </>
          )}

          {errorData.pck_mybank_refno && (
            <HelperText type="error" visible={errorData.pck_mybank_refno}>
              Please select a valid option
            </HelperText>
          )}
          {statusData.mybank_balance && (
            <>
              <TextInput
                mode="outlined"
                label="Available Balance"
                value={formData.mybank_balance}
                disabled={true}
                style={{
                  backgroundColor: 'white',
                  marginTop: 10,
                  marginBottom: 10,
                }}
              />
            </>
          )}
          {statusData.utr_no && (
            <>
              <TextInput
                mode="outlined"
                label="UTR No"
                maxLength={22}
                value={formData.utr_no}
                returnKeyType="next"
                keyboardType="number-pad"
                onChangeText={input => {
                  const text = input.replace(/[^0-9]/g, '');
                  changeFormData('utr_no', text);
                }}
                style={{backgroundColor: 'white', marginTop: 5}}
              />
            </>
          )}
          {statusData.cheque_no && (
            <>
              <TextInput
                mode="outlined"
                label="Cheque No *"
                maxLength={6}
                value={formData.cheque_no}
                returnKeyType="next"
                keyboardType="number-pad"
                onChangeText={input => {
                  const text = input.replace(/[^0-9]/g, '');
                  changeFormData('cheque_no', text);
                }}
                style={{
                  backgroundColor: 'white',
                  marginTop: 5,
                  marginBottom: 5,
                }}
                error={errorData.cheque_no}
              />
            </>
          )}
          {statusData.cheque_date && (
            <>
              <DateTimePicker
                style={Styles.backgroundColorWhite}
                isError={errorData.cheque_date}
                label="Cheque Date *"
                type="date"
                value={formData?.cheque_date}
                onChangeDate={date => {
                  const enteredDate = new Date(date).setHours(0, 0, 0, 0);
                  const currentDate = new Date().setHours(0, 0, 0, 0);
                  if (enteredDate >= currentDate) {
                    changeFormData('cheque_date', date);
                  }
                }}
              />
              <HelperText type="error" visible={errorData.cheque_date}>
                Please select a valid date
              </HelperText>
            </>
          )}
          {statusData.recurring_status && (
            <>
              <Text>Recurring:</Text>
              <RadioButton.Group
                onValueChange={newValue => {
                  changeFormData('recurring_status', newValue);
                  changeStatusData('reminder_date', newValue == 1);
                }}
                value={formData.recurring_status}>
                <View style={{flexDirection: 'row'}}>
                  {[
                    {name: 'Yes', value: 1},
                    {name: 'No', value: 2},
                  ].map(item => (
                    <View
                      key={item.value}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text>{item.name}</Text>
                      <RadioButton value={item.value} />
                    </View>
                  ))}
                </View>
              </RadioButton.Group>
            </>
          )}
          {statusData.reminder_date && (
            <>
              <DateTimePicker
                style={Styles.backgroundColorWhite}
                isError={errorData.reminder_date}
                label={`${
                  fullData?.pck_transtype_refno?.find(
                    item =>
                      item.pck_transtype_refno == formData.pck_transtype_refno,
                  )?.pck_transtype_name == 'Expenses'
                    ? 'Recurring '
                    : 'Repayment '
                }Reminder Date *`}
                type="date"
                value={formData?.reminder_date}
                onChangeDate={date => {
                  changeFormData('reminder_date', date);
                }}
              />
              <HelperText type="error" visible={errorData.reminder_date}>
                Please select a valid date
              </HelperText>
            </>
          )}
          {statusData.notes && (
            <>
              <TextInput
                mode="outlined"
                label="Notes"
                value={formData.notes}
                returnKeyType="next"
                onChangeText={text => {
                  changeFormData('notes', text);
                }}
                style={{backgroundColor: 'white'}}
              />
            </>
          )}

          {statusData.document && (
            <>
              <View
                style={[
                  Styles.flexRow,
                  Styles.flexAlignEnd,
                  Styles.marginTop16,
                ]}>
                <Image
                  source={
                    image == 'doc'
                      ? require('./icons/doc.png')
                      : image == 'pdf'
                      ? require('./icons/pdf.png')
                      : image == 'xls'
                      ? require('./icons/xls.png')
                      : {uri: image}
                  }
                  style={[Styles.width104, Styles.height96, Styles.border1]}
                />
                <Button mode="text" onPress={() => setIsVisible(true)}>
                  {file !== null || image !== null
                    ? 'Replace'
                    : 'Attachment / Slip Copy'}
                </Button>
              </View>
            </>
          )}
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
          {statusData.view_status && (
            <>
              <View style={{width: 160}}>
                <Checkbox.Item
                  label="Display"
                  position="leading"
                  style={{paddingHorizontal: 2}}
                  labelStyle={{textAlign: 'left', paddingLeft: 8}}
                  color={theme.colors.primary}
                  status={formData.view_status ? 'checked' : 'unchecked'}
                  onPress={() => {
                    changeFormData('view_status', !formData.view_status);
                  }}
                />
              </View>
            </>
          )}
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
            disabled={isButtonLoading ? isButtonLoading : buttonStatus}
            loading={isButtonLoading}
            onPress={checkValidation}>
            Submit
          </Button>
        </Card.Content>
      </View>
      {/* <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        dragFromTopOnly={true}
        height={640}
        animationType="fade"
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
          draggableIcon: { backgroundColor: "#000" },
        }}
      >
        <ScrollView
          style={[Styles.flex1, Styles.backgroundColor]}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <View
            style={[Styles.flex1, Styles.backgroundColor, Styles.padding16]}
          >
            <View style={[Styles.flexColumn]}>
              <AutocompleteDropdown
                clearOnFocus={false}
                closeOnBlur={true}
                direction="down"
                suggestionsListContainerStyle={{
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                }}
                inputContainerStyle={{
                  backgroundColor: theme.colors.textLight,
                  borderBottomColor: errorCON
                    ? theme.colors.error
                    : theme.colors.textfield,
                  borderBottomWidth: 1,
                }}
                textInputProps={{
                  placeholder: "Company Name",
                  value: companyName,
                  placeholderTextColor: errorCON
                    ? theme.colors.error
                    : theme.colors.textSecondary,
                  onChangeText: onCompanyNameSelected,
                }}
                renderItem={(item) => (
                  <View style={[Styles.paddingVertical16]}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        paddingHorizontal: 16,
                      }}
                    >
                      {item ? item.title : ""}
                    </Text>
                  </View>
                )}
                onClear={() => {
                  setIsButtonDisabled(true);
                  setCompanyName("");
                  setCompanyData([]);
                }}
                onSelectItem={(item) => {
                  if (item) {
                    setIsButtonDisabled(false);
                    setCompanyName(item.title);
                  }
                }}
                dataSet={companyData}
              />
              <HelperText type="error" visible={errorCON}>
                {communication.InvalidClient}
              </HelperText>
              <AutocompleteDropdown
                clearOnFocus={false}
                closeOnBlur={true}
                direction="down"
                suggestionsListContainerStyle={{
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                }}
                inputContainerStyle={{
                  backgroundColor: theme.colors.textLight,
                  borderBottomColor: errorMN
                    ? theme.colors.error
                    : theme.colors.textfield,
                  borderBottomWidth: 1,
                }}
                textInputProps={{
                  keyboardType: "number-pad",
                  placeholder: "Mobile No",
                  value: mobileno,
                  placeholderTextColor: errorMN
                    ? theme.colors.error
                    : theme.colors.textSecondary,
                  onChangeText: onMobileNumberSelected,
                }}
                renderItem={(item) => (
                  <View style={[Styles.paddingVertical8]}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        paddingHorizontal: 16,
                      }}
                    >
                      {item ? item.title : ""}
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.textSecondary,
                        paddingHorizontal: 16,
                      }}
                    >
                      {item ? item.contact : ""}
                    </Text>
                  </View>
                )}
                onClear={() => {
                  setIsButtonDisabled(true);
                  setMobileNo("");
                  setMobileNoData([]);
                }}
                onSelectItem={(item) => {
                  if (item) {
                    setIsButtonDisabled(false);
                    setMobileNo(item.title);
                  }
                }}
                dataSet={mobilenoData}
              />
              <HelperText type="error" visible={errorMN}>
                {communication.InvalidClient}
              </HelperText>
            </View>
            <Button
              mode="contained"
              disabled={isButtonDisabled}
              loading={isButtonDisabled}
              style={[Styles.marginTop32, { zIndex: -1 }]}
              onPress={SearchClient}
            >
              Search
            </Button>
            <View
              style={[Styles.flexColumn, Styles.border1, Styles.marginTop16]}
            >
              {otherClients &&
                otherClients.map((v, k) => {
                  return (
                    <View
                      style={[
                        Styles.flexRow,
                        Styles.padding16,
                        Styles.flexAlignCenter,
                        Styles.borderBottom1,
                        { justifyContent: "space-between" },
                      ]}
                    >
                      <View style={[Styles.flexColumn]}>
                        <Text style={{ color: theme.colors.text }}>
                          {v.Search_company_name}
                        </Text>
                        <Text style={{ color: theme.colors.text }}>
                          {v.Search_mobile_no}
                        </Text>
                      </View>
                      <Button
                        mode="contained"
                        disabled={isButtonDisabled}
                        onPress={() => InsertOtherClient(v.Search_user_refno)}
                      >
                        Add
                      </Button>
                    </View>
                  );
                })}
            </View>
          </View>
        </ScrollView>
      </RBSheet> */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: snackbarColor}}>
        {snackbarText}
      </Snackbar>
    </View>
  );
};

export default AddCompany;