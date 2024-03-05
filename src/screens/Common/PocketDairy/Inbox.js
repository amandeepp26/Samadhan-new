import {useEffect, useRef, useState} from 'react';
import {View, Dimensions, ScrollView} from 'react-native';
import {
  FAB,
  Title,
  List,
  ActivityIndicator,
  Button,
  Card,
  Snackbar,
} from 'react-native-paper';
import {TabBar, TabView} from 'react-native-tab-view';
import {RNS3} from 'react-native-aws3';
import * as ImagePicker from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';

import moment from 'moment';
import Provider from '../../../api/Provider';
import {Styles} from '../../../styles/styles';
import {theme} from '../../../theme/apptheme';
import {communication} from '../../../utils/communication';
import {creds} from '../../../utils/credentials';
import {AWSImagePath} from '../../../utils/paths';
import {NullOrEmpty} from '../../../utils/validations';
import {BloodGroup} from '../../../utils/validations';
import NoItems from '../../../components/NoItems';
import RBSheet from 'react-native-raw-bottom-sheet';
import Search from '../../../components/Search';

export const selectValidator = value => {
  if (!value || value.length <= 0) {
    return 'Please select a value.';
  }

  return '';
};

let st_ID = 0,
  ct_ID = 0,
  bg_ID = 0,
  b_ID = 0,
  d_ID = 0,
  de_ID = 0;
let rpt = 0;

const windowWidth = Dimensions.get('window').width;
let userID = 0;

const EmployeeEditScreen = ({route, navigation}) => {
  //#region Variables
  const [ETRadioButtons, setETRadioButtons] = useState([
    {
      id: '1', // acts as primary key, should be unique and non-empty string
      label: 'Permanent',
      selected: true,
      value: '1',
    },
    {
      id: '2',
      label: 'Temporary',
      selected: false,
      value: '2',
    },
    {
      id: '3',
      label: 'Releave',
      selected: false,
      value: '3',
    },
  ]);

  const [wagesRadioButtons, setWagesRadioButtons] = useState([
    {
      id: '1', // acts as primary key, should be unique and non-empty string
      label: 'Daily',
      value: '1',
    },
    {
      id: '2',
      label: 'Monthly',
      value: '2',
    },
  ]);

  function onPressETRadioButton(radioButtonsArray) {
    setETRadioButtons(radioButtonsArray);

    radioButtonsArray.map(r => {
      if (r.selected === true) {
        setEmployeeTypeID(r.value);
      }
    });
  }

  function onPressWagesRadioButton(radioButtonsArray) {
    setWagesRadioButtons(radioButtonsArray);

    radioButtonsArray.map(r => {
      if (r.selected === true) {
        setWagesTypeID(r.value);
      }
    });
  }

  const isFocused = useIsFocused();
  const [index, setIndex] = useState(
    route.params && route.params.from === 'brand' ? 2 : 0,
  );

  const [empType, setEmpType] = useState();

  const [reporting, setReporting] = useState({
    value: '',
    list: [],
    selectedList: [],
    error: '',
  });

  //#region Input Variables
  // ! there're to many states can cause performance issues.
  const [employeeName, setEmployeeName] = useState('');
  const [employeeNameInvalid, setEemployeeNameInvalid] = useState('');

  const [employeeCode, setEemployeeCode] = useState('');
  const [employeeCodeInvalid, setEemployeeCodeInvalid] = useState('');
  const employeeCodeRef = useRef({});

  const [mobileNo, setMobileNo] = useState('');
  const [mobileNoInvalid, setMobileNoInvalid] = useState('');

  const [aadharNo, setAadharNo] = useState('');
  const [aadharNoInvalid, setAadharNoInvalid] = useState('');

  const [fatherName, setFatherName] = useState('');
  const [fatherNameInvalid, setFatherNameInvalid] = useState('');

  const [address, setAddress] = useState('');
  const [addressInvalid, setAddressInvalid] = useState('');

  const [statesFullData, setStatesFullData] = useState([]);
  const [statesData, setStatesData] = useState([]);
  const [statesID, setStatesID] = useState([]);
  const [stateName, setStateName] = useState('');
  const [errorSN, setSNError] = useState(false);
  const stateRef = useRef({});

  const [cityFullData, setCityFullData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [cityID, setCityID] = useState([]);
  const [cityName, setCityName] = useState('');
  const [errorCN, setCNError] = useState(false);
  const cityRef = useRef({});

  const [pincode, setPincode] = useState('');
  const [pincodeInvalid, setPincodeInvalid] = useState('');
  const pincodeRef = useRef({});

  const [bloodGroupFullData, setBloodGroupFullData] = useState([]);
  const [bloodGroupData, setBloodGroupData] = useState([]);
  const [bloodGroupID, setBloodGroupID] = useState([]);
  const [bloodGroup, setBloodGroup] = useState('');
  const [errorBloodGroup, setBloodGroupError] = useState(false);
  const bloodGroupRef = useRef({});

  const [dob, setDob] = useState(new Date());
  const [dobInvalid, setDobInvalid] = useState('');
  const dobRef = useRef({});

  const [doj, setDoj] = useState(new Date());
  const [dojInvalid, setDojInvalid] = useState(new Date());
  const dojRef = useRef({});

  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactNameInvalid, setEmergencyContactNameInvalid] =
    useState('');
  const emergencyContactNameRef = useRef({});

  const [emergencyContactNo, setEmergencyContactNo] = useState('');
  const [emergencyContactNoInvalid, setEmergencyContactNoInvalid] =
    useState('');
  const emergencyContactNoRef = useRef({});

  const [cardValidity, setCardValidity] = useState(new Date());
  const [cardValidityInvalid, setCardValidityInvalid] = useState('');
  const cardValidityRef = useRef({});

  const [loginActiveStatus, setLoginActiveStatus] = useState('');
  const [loginActiveStatusInvalid, setLoginActiveStatusInvalid] = useState('');
  const loginActiveStatusRef = useRef({});

  const [branchFullData, setBranchFullData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [branchID, setBranchID] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [errorBranch, setBranchError] = useState(false);
  const branchRef = useRef({});

  const [departmentFullData, setDepartmentFullData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [departmentID, setDepartmentID] = useState([]);
  const [departmentName, setDepartmentName] = useState('');
  const [errorDepartment, setDepartmentError] = useState(false);
  const departmentRef = useRef({});

  const [designationFullData, setDesignationFullData] = useState([]);
  const [designationData, setDesignationData] = useState([]);
  const [designationID, setDesignationID] = useState([]);
  const [designationName, setDesignationName] = useState('');
  const [errorDesignation, setDesignationError] = useState(false);
  const designationRef = useRef({});

  const [reportingFullData, setReportingFullData] = useState([]);
  const [reportingData, setReportingData] = useState([]);
  const [reportingID, setReportingID] = useState([]);
  const [reportingName, setReportingName] = useState('');
  const [errorReporting, setReportingError] = useState(false);
  const reportingRef = useRef({});

  const [employeeType, setEmployeeType] = useState(0);
  const [employeeTypeID, setEmployeeTypeID] = useState(0);
  const [employeeTypeInvalid, setEmployeeTypeInvalid] = useState('');
  const employeeTypeRef = useRef({});

  const [lwd, setLwd] = useState(new Date());
  const [lwdInvalid, setLwdInvalid] = useState('');
  const lwdRef = useRef({});

  const [wagesType, setWagesType] = useState(0);
  const [wagesTypeID, setWagesTypeID] = useState('');
  const [wagesTypeInvalid, setWagesTypeInvalid] = useState('');
  const wagesTypeRef = useRef({});

  const [salary, setSalary] = useState(0);
  const [salaryInvalid, setSalaryInvalid] = useState('');
  const salaryRef = useRef({});

  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountHolderNameInvalid, setAccountHolderNameInvalid] = useState('');
  const accountHolderNameRef = useRef({});

  const [accountNo, setAccountNo] = useState(0);
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

  const [logoImage, setLogoImage] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [image, setImage] = useState(AWSImagePath + 'placeholder-image.png');
  const [filePath, setFilePath] = useState(null);
  const [errorLogo, setLogoError] = useState(false);

  const [isImageReplaced, setIsImageReplaced] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  //#endregion

  //#region inbox variables
  const [isLoading, setIsLoading] = useState(false);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const [date, setDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhoneNo, setContactPhoneNo] = useState('');
  const [display, setDisplay] = useState('');

  const refRBSheet = useRef();

  //#endregion

  //#region Functions
  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      setBloodGroupFullData(BloodGroup);
      FetchBasicDetails();
    }
  };

  let tempStateName = '';
  const FetchBasicDetails = () => {
    let params = {
      ID: route.params.data.id,
      AddedByUserID: userID,
    };
    Provider.getAll(
      `master/getemployeedetailsbyid?${new URLSearchParams(params)}`,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let employee_data = response.data.data[0].employee[0];
            let reporting_data =
              response.data.data[0].employeeReportingAuthority[0];
            let bankDetails_data = response.data.data[0].bankDetails[0];
            if (!NullOrEmpty(employee_data)) {
              setEmployeeName(
                !NullOrEmpty(employee_data.employeeName)
                  ? employee_data.employeeName
                  : '',
              );
              setEemployeeCode(
                !NullOrEmpty(employee_data.employeeCode)
                  ? employee_data.employeeCode
                  : '',
              );
              setMobileNo(
                !NullOrEmpty(employee_data.mobileNo)
                  ? employee_data.mobileNo
                  : '',
              );
              setAadharNo(
                !NullOrEmpty(employee_data.aadharNo)
                  ? employee_data.aadharNo
                  : '',
              );
              setFatherName(
                !NullOrEmpty(employee_data.fatherName)
                  ? employee_data.fatherName
                  : '',
              );
              setAddress(
                !NullOrEmpty(employee_data.address)
                  ? employee_data.address
                  : '',
              );
              setPincode(
                NullOrEmpty(employee_data.pincode)
                  ? ''
                  : employee_data.pincode !== 0
                  ? employee_data.pincode.toString()
                  : '',
              );

              if (!NullOrEmpty(employee_data.stateID)) {
                setStatesID(employee_data.stateID);
                st_ID = employee_data.stateID;
              }

              if (!NullOrEmpty(employee_data.cityID)) {
                setCityID(employee_data.cityID);
                ct_ID = employee_data.cityID;
              }
              if (!NullOrEmpty(employee_data.bloodGroup)) {
                setBloodGroupID(employee_data.bloodGroup);
                bg_ID = employee_data.bloodGroup;
              }

              if (!NullOrEmpty(employee_data.dob)) {
                setDob(new Date(employee_data.dob));
              }

              if (!NullOrEmpty(employee_data.doj)) {
                setDoj(new Date(employee_data.doj));
              }

              if (!NullOrEmpty(employee_data.idCardValidity)) {
                setCardValidity(new Date(employee_data.idCardValidity));
              }

              if (!NullOrEmpty(employee_data.lastWorkDate)) {
                setLwd(new Date(employee_data.lastWorkDate));
              }

              setEmergencyContactName(
                !NullOrEmpty(employee_data.emergencyContactName)
                  ? employee_data.emergencyContactName
                  : '',
              );
              setEmergencyContactNo(
                !NullOrEmpty(employee_data.emergencyContactNo)
                  ? employee_data.emergencyContactNo
                  : '',
              );

              setLoginActiveStatus(
                !NullOrEmpty(employee_data.loginStatus)
                  ? employee_data.loginStatus
                  : '',
              );

              if (!NullOrEmpty(employee_data.branchID)) {
                setBranchID(employee_data.branchID);
                b_ID = employee_data.branchID;
              }
              if (!NullOrEmpty(employee_data.departmentID)) {
                setDepartmentID(employee_data.departmentID);
                d_ID = employee_data.departmentID;
              }
              if (!NullOrEmpty(employee_data.designationID)) {
                setDesignationID(employee_data.designationID);
                de_ID = employee_data.designationID;
              }

              if (!NullOrEmpty(employee_data.employeeType)) {
                {
                  ETRadioButtons.map(r => {
                    r.selected = false;
                    if (r.value === employee_data.employeeType.toString()) {
                      r.selected = true;
                    }
                  });
                }

                onPressETRadioButton(ETRadioButtons);
                setEmployeeTypeID(
                  !NullOrEmpty(employee_data.employeeType)
                    ? employee_data.employeeType
                    : 0,
                );
              }
              if (!NullOrEmpty(employee_data.wagesType)) {
                {
                  wagesRadioButtons.map(r => {
                    r.selected = false;
                    if (r.value === employee_data.wagesType.toString()) {
                      r.selected = true;
                    }
                  });
                }

                onPressWagesRadioButton(wagesRadioButtons);
                setWagesTypeID(
                  !NullOrEmpty(employee_data.wagesType)
                    ? employee_data.wagesType
                    : '',
                );
              }

              setSalary(
                !NullOrEmpty(employee_data.salary) ? employee_data.salary : 0,
              );

              setLogoImage(employee_data.profilePhoto);
              setImage(
                employee_data.profilePhoto
                  ? employee_data.profilePhoto
                  : AWSImagePath + 'placeholder-image.png',
              );
              setFilePath(
                employee_data.profilePhoto ? employee_data.profilePhoto : null,
              );
            }
            if (!NullOrEmpty(reporting_data)) {
              setReportingID(reporting_data.reportingAuthorityID);
              rpt = reporting_data.reportingAuthorityID;
            }

            if (!NullOrEmpty(bankDetails_data)) {
              setAccountHolderName(
                !NullOrEmpty(bankDetails_data.accountHolderName)
                  ? bankDetails_data.accountHolderName.toString()
                  : '',
              );
              setAccountNo(
                bankDetails_data.accountNumber !== 0
                  ? bankDetails_data.accountNumber.toString()
                  : '',
              );
              setBankName(
                bankDetails_data.bankName ? bankDetails_data.bankName : '',
              );
              setBankBranchName(
                bankDetails_data.branchName ? bankDetails_data.branchName : '',
              );
              setIfscCode(
                bankDetails_data.ifscCode ? bankDetails_data.ifscCode : '',
              );
            }
          }

          FetchStates();
          BloodGroupDropdown();
          FetchBranch();
          FetchDepartments();
          FetchDesignations();
          FetchReportingEmployee();
          setIsLoading(false);
        }
      })
      .catch(e => {
        console.log(e);
        setIsLoading(false);
      });
  };

  //#region Dropdown Functions

  const FetchCities = stateID => {
    let params = {
      ID: stateID,
    };
    Provider.getAll(`master/getcitiesbyid?${new URLSearchParams(params)}`)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setCityFullData(response.data.data);

            const cities = response.data.data.map(data => data.cityName);
            setCityData(cities);
            if (ct_ID > 0) {
              let a = response.data.data.filter(el => {
                return el.id === ct_ID;
              });
              setCityName(a[0].cityName);
              setCityID(a[0].id);
            } else {
              setCityName('');
              setCityID(0);
            }
          } else {
            setCityFullData([]);
            setCityData([]);
            setCityName('');
            setCity('');
            ct_ID = 0;
            setCityID(0);
          }
        } else {
          setCityFullData([]);
          setCityData([]);
          setCityName('');
          setCity('');
          ct_ID = 0;
          setCityID(0);
        }
      })
      .catch(e => {});
  };

  const FetchStates = () => {
    Provider.getAll('master/getstates')
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setStatesFullData(response.data.data);

            const states = response.data.data.map(data => data.stateName);
            setStatesData(states);
            if (st_ID > 0) {
              let s = response.data.data.filter(el => {
                return el.id === st_ID;
              });

              setStateName(s[0].stateName);
              setStatesID(s[0].id);
              tempStateName = s[0].stateName;
            }

            if (tempStateName !== '') {
              FetchCities(st_ID);
            }
          }
        }
      })
      .catch(e => {});
  };

  const BloodGroupDropdown = () => {
    let b = BloodGroup.filter(el => {
      return el.ID.toString() === bg_ID.toString();
    });

    const bg = BloodGroup.map(data => data.Name);
    setBloodGroupData(bg);
    if (!NullOrEmpty(b[0])) {
      setBloodGroup(b[0].Name);
    }
  };

  const FetchBranch = () => {
    let params = {
      AddedByUserID: userID,
    };
    Provider.getAll(
      `master/getuserbranchforemployee?${new URLSearchParams(params)}`,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setBranchFullData(response.data.data);

            const branch = response.data.data.map(data => data.locationName);
            setBranchData(branch);

            if (b_ID > 0) {
              let b = response.data.data.filter(el => {
                return el.id === b_ID;
              });

              setBranchName(b[0].locationName);
              setBranchID(b[0].id);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchDepartments = () => {
    let params = {
      AddedByUserID: userID,
    };
    Provider.getAll(
      `master/getuserdepartmentforbranchemployee?${new URLSearchParams(
        params,
      )}`,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setDepartmentFullData(response.data.data);

            const department = response.data.data.map(
              data => data.departmentName,
            );
            setDepartmentData(department);

            if (d_ID > 0) {
              let d = response.data.data.filter(el => {
                return el.departmentID === d_ID;
              });

              setDepartmentName(d[0].departmentName);
              setDepartmentID(d[0].departmentID);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchDesignations = () => {
    let params = {
      AddedByUserID: userID,
    };
    Provider.getAll(
      `master/getuserdesignationforbranchemployee?${new URLSearchParams(
        params,
      )}`,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setDesignationFullData(response.data.data);
            const designation = response.data.data.map(
              data => data.designationName,
            );
            setDesignationData(designation);

            if (de_ID > 0) {
              let b = response.data.data.filter(el => {
                return el.designationID === de_ID;
              });

              setDesignationName(b[0].designationName);
              setDesignationID(b[0].designationID);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchReportingEmployee = () => {
    let params = {
      AddedByUserID: userID,
    };
    Provider.getAll(
      `master/getreportingemployeelist?${new URLSearchParams(params)}`,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            const rd = [];
            response.data.data.map(data => {
              rd.push({_id: data.id.toString(), value: data.employee});
            });

            const ct = [];
            response.data.data.map(data => {
              if (data.id.toString() == rpt.toString()) {
                ct.push({_id: data.id.toString(), value: data.employee});
              }
            });
            setReporting({...reporting, list: rd, selectedList: ct});
            setReportingFullData(rd);
          }
        }
      })
      .catch(e => {});
  };

  //#endregion

  useEffect(() => {
    GetUserID();
  }, []);

  //#region OnChange Function

  const onEmployeeNameChanged = text => {
    setEmployeeName(text);
    setEemployeeNameInvalid(false);
  };
  const onEmployeeCodeChanged = text => {
    setEemployeeCode(text);
    setEemployeeCodeInvalid(false);
  };
  const onMobileNoChanged = text => {
    setMobileNo(text);
    setMobileNoInvalid(false);
  };
  const onAadharNoChanged = text => {
    setAadharNo(text);
    setAadharNoInvalid(false);
  };
  const onFatherNameChanged = text => {
    setFatherName(text);
    setFatherNameInvalid(false);
  };
  const onAddressChanged = text => {
    setAddress(text);
    setAddressInvalid(false);
  };
  const onStateNameSelected = selectedItem => {
    setStateName(selectedItem);
    setSNError(false);
    cityRef.current.reset();
    setCityName('');
    setCityData([]);
    setCityFullData([]);
    let a = statesFullData.filter(el => {
      return el.stateName === selectedItem;
    });
    FetchCities(a[0].id);
  };
  const onCityNameSelected = selectedItem => {
    setCityName(selectedItem);
    setCNError(false);
  };
  const onPincodeChanged = text => {
    setPincode(text);
    setPincodeInvalid(false);
  };
  const onBloodGroupSelected = selectedItem => {
    setBloodGroup(selectedItem);
    setBloodGroupError(false);
  };

  const onEmergencyContactNameChanged = text => {
    setEmergencyContactName(text);
    setEmergencyContactNameInvalid(false);
  };

  const onEmergencyContactNoChanged = text => {
    setEmergencyContactNo(text);
    setEmergencyContactNoInvalid(false);
  };

  const onLoginActiveStatusChanged = text => {
    setLoginActiveStatus(text);
    setLoginActiveStatusInvalid(false);
  };

  const onBranchChanged = selectedItem => {
    setBranchName(selectedItem);
    setBranchError(false);
  };

  const onDepartmentChanged = selectedItem => {
    setDepartmentName(selectedItem);
    setDepartmentError(false);
  };

  const onDesignationChanged = selectedItem => {
    setDesignationName(selectedItem);
    setDesignationError(false);
  };

  const onReportingChanged = selectedItem => {
    setReportingName(selectedItem);
    setReportingError(false);
  };

  const onWagesTypeChanged = selectedItem => {
    setWagesType(selectedItem);
    setWagesTypeInvalid(false);
  };

  const onSalaryChanged = selectedItem => {
    setSalary(selectedItem);
    setSalaryInvalid(false);
  };

  const onAccountHolderNameChanged = text => {
    setAccountHolderName(text);
    setAccountHolderNameInvalid(false);
  };

  const onAccountNoChanged = text => {
    setAccountNo(text);
    setAccountNoInvalid(false);
  };

  const onBankNameChanged = text => {
    setBankName(text);
    setBankNameInvalid(false);
  };

  const onBankBranchNameChanged = text => {
    setBankBranchName(text);
    setBankBranchNameInvalid(false);
  };
  const onIfscCodeChanged = text => {
    setIfscCode(text);
    setIfscCodeInvalid(false);
  };

  //#endregion

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

  const uploadFile = () => {
    if (!isImageReplaced) {
      UpdateData();
    } else {
      if (filePath.uri) {
        if (Object.keys(filePath).length == 0) {
          setSnackbarText(communication.NoImageSelectedError);
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
          return;
        }
        RNS3.put(
          {
            uri: filePath.uri,
            name: logoImage.split(AWSImagePath)[1],
            type: 'image/*',
          },
          {
            keyPrefix: '',
            bucket: creds.awsBucket,
            region: creds.awsRegion,
            accessKey: creds.awsAccessKey,
            secretKey: creds.awsSecretKey,
            successActionStatus: 201,
          },
        )
          .progress(progress => {
            setIsButtonLoading(true);
            setSnackbarText(
              `Uploading: ${progress.loaded / progress.total} (${
                progress.percent
              }%)`,
            );
          })
          .then(response => {
            setIsButtonLoading(false);
            if (response.status !== 201) {
              setSnackbarVisible(true);
              setSnackbarColor(theme.colors.error);
              setSnackbarText(communication.FailedUploadError);
            } else {
              UpdateData();
            }
          })
          .catch(ex => {
            console.log(ex);
            setIsButtonLoading(false);
            setSnackbarVisible(true);
            setSnackbarColor(theme.colors.error);
            setSnackbarText(communication.FailedUploadError);
          });
      } else {
        setSnackbarText(communication.NoImageSelectedError);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
      }
    }
  };

  const UpdateData = () => {
    const params = {
      ID: route.params.data.id,
      MobileNo: mobileNo.trim(),
      AadharNo: aadharNo.trim(),
      FatherName: fatherName,
      Address: address,
      StateID: stateName
        ? statesFullData.find(el => el.stateName === stateName).id
        : 0,
      CityID: cityName
        ? cityFullData.find(el => el.cityName === cityName).id
        : 0,
      Pincode: pincode ? pincode : 0,
      ProfilePhoto: logoImage ? logoImage : '',
      BloodGroup: bloodGroup
        ? bloodGroupFullData.find(el => el.Name === bloodGroup).ID
        : 0,
      DOB: moment(dob).format('YYYY-MM-DD'),
      DOJ: moment(doj).format('YYYY-MM-DD'),
      EmergencyContactName: emergencyContactName,
      EmergencyContactNo: emergencyContactNo,
      IDCardValidity: moment(cardValidity).format('YYYY-MM-DD'),
      LoginActiveStatus: true,
      BranchID: branchName
        ? branchFullData.find(el => el.locationName === branchName).id
        : 0,
      DepartmentID: departmentName
        ? departmentFullData.find(el => el.departmentName === departmentName)
            .departmentID
        : 0,
      DesignationID: designationName
        ? designationFullData.find(el => el.designationName === designationName)
            .designationID
        : 0,
      EmployeeType: employeeTypeID,
      LastWorkDate: moment(lwd).format('YYYY-MM-DD'),
      WagesType: NullOrEmpty(wagesTypeID) ? 0 : parseInt(wagesTypeID),
      Salary: salary,
      AccountHolderName: accountHolderName,
      AccountNumber: accountNo,
      BankName: bankName,
      BranchName: branchName,
      IFSCCode: ifscCode,
    };
    Provider.create('master/updateemployeedetails', params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          UpdateReportingAuthority();
          setSnackbarColor(theme.colors.success);
          setSnackbarText('Data updated successfully');
          setSnackbarVisible(true);
        } else {
          setSnackbarColor(theme.colors.error);
          setSnackbarText(communication.UpdateError);
          setSnackbarVisible(true);
        }
      })
      .catch(e => {
        console.log(e);
        setSnackbarColor(theme.colors.error);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const UpdateReportingAuthority = () => {
    let rptId = '';
    if (!NullOrEmpty(reporting.selectedList)) {
      reporting.selectedList.map(r => {
        rptId += r._id + ',';
      });
    }

    const params = {
      EmployeeID: route.params.data.id,
      AddedByUserID: userID,
      ReportingAuthorityID: rptId.replace(/,\s*$/, ''),
    };

    Provider.create('master/updateemployeereportingauthority', params)
      .then(response => {
        debugger;
        if (response.data && response.data.code === 200) {
        }
        setTimeout(() => {
          navigation.navigate('EmployeeListScreen');
        }, 500);
      })
      .catch(e => {
        console.log(e);
        setSnackbarType('error');
        setSnackMsg(communication.NetworkError);
        setOpen(true);
        setButtonLoading(false);
        setTimeout(() => {
          navigation.navigate('EmployeeListScreen');
        }, 500);
      });
  };

  const ValidateData = () => {
    const isValid = true;

    if (NullOrEmpty(employeeName.trim())) {
      isValid = false;
      setEemployeeNameInvalid(true);
    }
    if (NullOrEmpty(employeeCode.trim())) {
      isvalid = false;
      setEemployeeCodeInvalid(true);
    }
    if (NullOrEmpty(mobileNo.trim())) {
      isvalid = false;
      setMobileNoInvalid(true);
    }
    if (NullOrEmpty(aadharNo.trim())) {
      isvalid = false;
      setAadharNoInvalid(true);
    }
    if (NullOrEmpty(fatherName.trim())) {
      isvalid = false;
      setFatherNameInvalid(true);
    }

    if (isValid) {
      uploadFile();
    }
  };

  //#region datalist
  const RenderItems = data => {
    return (
      <View
        style={[
          Styles.backgroundColor,
          Styles.borderBottom1,
          Styles.paddingStart16,
          Styles.flexJustifyCenter,
          {height: 72},
        ]}>
        <List.Item
          title={data.item.modeTypeName}
          titleStyle={{fontSize: 18}}
          description={`Category Name.: ${
            NullOrEmpty(data.item.categoryName) ? '' : data.item.categoryName
          }\nSub Category Name: ${
            NullOrEmpty(data.item.subCategoryName)
              ? ''
              : data.item.subCategoryName
          } `}
          onPress={() => {
            refRBSheet.current.open();
            setModeTypeName(data.item.modeTypeName);
            setCategoryName(data.item.categoryName);
            setSubCategoryName(data.item.subCategoryName);
            setDisplay(data.item.display ? 'Yes' : 'No');
          }}
          left={() => (
            <Icon
              style={{marginVertical: 12, marginRight: 12}}
              size={30}
              color={theme.colors.textSecondary}
              name="file-tree"
            />
          )}
          right={() => (
            <Icon
              style={{marginVertical: 12, marginRight: 12}}
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
    navigation.navigate('AddSubCategoryName', {
      type: 'add',
      fetchData: FetchData,
    });
  };

  const EditCallback = (data, rowMap) => {
    rowMap[data.item.key].closeRow();
    navigation.navigate('AddSubCategoryName', {
      type: 'edit',
      fetchData: FetchData,
      data: {
        id: data.item.id,
        activityRoleName: data.item.activityRoleName,
        serviceName: data.item.serviceName,
        unitName: data.item.unitName,
        categoryName: data.item.categoryName,
        hsnsacCode: data.item.hsnsacCode,
        gstRate: data.item.gstRate.toFixed(2),
        display: data.item.display,
      },
    });
  };

  //#endregion

  const renderScene = ({route}) => {
    switch (route.key) {
      case 'settlement':
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
                    'activityRoleName',
                    'serviceName',
                    'unitName',
                    'categoryName',
                    'hsnsacCode',
                    'gstRate',
                    'display',
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
                {position: 'absolute', right: 16, bottom: 16},
              ]}
              icon="plus"
              onPress={AddCallback}
            />
            <Snackbar
              visible={snackbarVisible}
              onDismiss={() => setSnackbarVisible(false)}
              duration={3000}
              style={{backgroundColor: snackbarColor}}>
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
                wrapper: {backgroundColor: 'rgba(0,0,0,0.5)'},
                draggableIcon: {backgroundColor: '#000'},
              }}>
              <View>
                <Title style={[Styles.paddingHorizontal16]}>
                  {modeTypeName}
                </Title>
                <ScrollView>
                  <List.Item
                    title="Mode Type Name"
                    description={modeTypeName}
                  />
                  <List.Item title="Category Name" description={categoryName} />
                  <List.Item
                    title=" Sub Category Name"
                    description={subCategoryName}
                  />
                  <List.Item title="Display" description={display} />
                </ScrollView>
              </View>
            </RBSheet>
          </View>
        );
      case 'lending':
      // return (
      //   <ScrollView style={[Styles.flex1, Styles.backgroundColor]}>
      //     <View style={[Styles.padding16]}>
      //       <Dropdown label="Branch" data={branchData} onSelected={onBranchChanged} isError={errorBranch} selectedItem={branchName} reference={branchRef} />

      //       <Dropdown label="Department" data={departmentData} onSelected={onDepartmentChanged} isError={errorDepartment} selectedItem={departmentName} reference={departmentRef} />

      //       <Dropdown label="Designation" data={designationData} onSelected={onDesignationChanged} isError={errorDesignation} selectedItem={designationName} reference={designationRef} />

      //       <View style={Styles.marginTop16}>
      //         <Text>Employee Type</Text>
      //       </View>

      //       <RadioGroup containerStyle={[Styles.marginTop16]} layout="row" radioButtons={ETRadioButtons} onPress={onPressETRadioButton} />

      //       <View style={[Styles.marginTop24, Styles.marginBottom8]}>
      //         <Text>Reporting to</Text>
      //       </View>

      //       <PaperSelect
      //         label="Reporting Employees"
      //         value={reporting.value}
      //         onSelection={(value: any) => {
      //           setReporting({
      //             ...reporting,
      //             value: value.text,
      //             selectedList: value.selectedList,
      //             error: '',
      //           });
      //         }}
      //         arrayList={[...reporting.list]}
      //         selectedArrayList={reporting.selectedList}
      //         errorText={reporting.error}
      //         multiEnable={true}
      //         textInputMode="flat"
      //         searchStyle={{ iconColor: '#6c736e' }}
      //         searchPlaceholder="Search Employee"
      //         modalCloseButtonText="Cancel"
      //         modalDoneButtonText="Done"
      //       />

      //       <View>
      //         <DateTimePicker style={Styles.backgroundColorWhite} label="Last Working Date" type="date" value={lwd} onChangeDate={setLwd} />
      //       </View>
      //     </View>
      //   </ScrollView>
      // );
      case 'company':
      // return (
      //   <ScrollView style={[Styles.flex1, Styles.backgroundColor]}>
      //     <View style={[Styles.padding16]}>
      //       <View style={Styles.marginTop16}>
      //         <Text>Wages Type</Text>
      //       </View>

      //       <RadioGroup containerStyle={[Styles.marginTop16]} layout="row" radioButtons={wagesRadioButtons} onPress={onPressWagesRadioButton} />

      //       <TextInput ref={salaryRef} mode="outlined" dense keyboardType="number-pad" label="Salary" value={salary} returnKeyType="next" onSubmitEditing={() => salaryRef.current.focus()} onChangeText={onSalaryChanged} style={{ backgroundColor: "white" }} error={salaryInvalid} />

      //       <TextInput ref={accountHolderNameRef} mode="outlined" dense label="Account Holder Name" value={accountHolderName} returnKeyType="next" onSubmitEditing={() => accountHolderNameRef.current.focus()} onChangeText={onAccountHolderNameChanged} style={{ backgroundColor: "white" }} error={accountHolderNameInvalid} />

      //       <TextInput ref={accountNoRef} mode="outlined" dense label="Account Number" value={accountNo} returnKeyType="next" onSubmitEditing={() => bankNameRef.current.focus()} onChangeText={onAccountNoChanged} style={{ backgroundColor: "white" }} error={accountNoInvalid} />
      //       {/* <HelperText type="error" visible={accountNoInvalid}>
      //         {communication.InvalidActivityName}
      //       </HelperText> */}
      //       <TextInput ref={bankNameRef} mode="outlined" dense label="Bank Name" value={bankName} returnKeyType="next" onSubmitEditing={() => bankBranchNameRef.current.focus()} onChangeText={onBankNameChanged} style={{ backgroundColor: "white" }} error={bankNameInvalid} />
      //       {/* <HelperText type="error" visible={bankNameInvalid}>
      //         {communication.InvalidActivityName}
      //       </HelperText> */}
      //       <TextInput ref={bankBranchNameRef} mode="outlined" dense label="Bank Branch Name" value={bankBranchName} returnKeyType="next" onSubmitEditing={() => ifscCodeRef.current.focus()} onChangeText={onBankBranchNameChanged} style={{ backgroundColor: "white" }} error={bankBranchNameInvalid} />
      //       {/* <HelperText type="error" visible={bankBranchNameInvalid}>
      //         {communication.InvalidActivityName}
      //       </HelperText> */}
      //       <TextInput ref={ifscCodeRef} mode="outlined" dense label="IFSC Code" value={ifscCode} returnKeyType="done" onChangeText={onIfscCodeChanged} style={{ backgroundColor: "white" }} error={ifscCodeInvalid} />
      //       {/* <HelperText type="error" visible={ifscCodeInvalid}>
      //         {communication.InvalidActivityName}
      //       </HelperText> */}
      //     </View>
      //   </ScrollView>
      // );
      case 'photo':
      // return (
      //   <ScrollView style={[Styles.flex1, Styles.backgroundColor]}>
      //     <View style={[Styles.flexRow, Styles.flexAlignEnd, Styles.marginTop16]}>
      //       <Image source={{ uri: image }} style={[Styles.width104, Styles.height96, Styles.border1]} />
      //       <Button mode="text" onPress={chooseFile}>
      //         {filePath !== null ? "Replace" : "Choose Image"}
      //       </Button>
      //     </View>
      //     <HelperText type="error" visible={errorLogo}>
      //       {communication.InvalidDesignImage}
      //     </HelperText>
      //   </ScrollView>
      // );
      default:
        return null;
    }
  };
  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: theme.colors.primary}}
      style={{backgroundColor: theme.colors.textLight}}
      inactiveColor={theme.colors.textSecondary}
      activeColor={theme.colors.primary}
      scrollEnabled={true}
      tabStyle={{width: windowWidth / 3}}
      labelStyle={[Styles.fontSize13, Styles.fontBold]}
    />
  );
  const [routes] = useState([
    {key: 'settlement', title: 'Settlement'},
    {key: 'lending', title: 'Lending'},
    // { key: "company", title: "Company" },
  ]);

  return (
    isFocused && (
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
        ) : (
          <TabView
            style={{marginBottom: 64}}
            renderTabBar={renderTabBar}
            navigationState={{index, routes}}
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
            {position: 'absolute', bottom: 0, elevation: 3},
          ]}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={ValidateData}
              loading={isButtonLoading}>
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
    )
  );
};

export default EmployeeEditScreen;
