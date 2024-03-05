import React, {useEffect, useRef, useState} from 'react';
import {View, Dimensions, ScrollView, Image, Keyboard, SafeAreaView} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  HelperText,
  Snackbar,
  Subheading,
  Switch,
  TextInput,
  Checkbox,
  RadioButton,
  Text,
} from 'react-native-paper';
import {TabBar, TabView} from 'react-native-tab-view';
import {RNS3} from 'react-native-aws3';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import RadioGroup from 'react-native-radio-buttons-group';
import moment from 'moment';
import Provider from '../../../api/Provider';
import Header from '../../../components/Header';
import {Styles} from '../../../styles/styles';
import {theme} from '../../../theme/apptheme';
import {communication} from '../../../utils/communication';
import {creds} from '../../../utils/credentials';
import {AWSImagePath} from '../../../utils/paths';
import {NullOrEmpty} from '../../../utils/validations';
import {BloodGroup} from '../../../utils/validations';
import {styles} from 'react-native-image-slider-banner/src/style';
import {DateTimePicker} from '@hashiprobr/react-native-paper-datetimepicker';
import {PaperSelect} from 'react-native-paper-select';
import DFButton from '../../../components/Button';

export const selectValidator = value => {
  if (!value || value.length <= 0) {
    return 'Please select a value.';
  }

  return '';
};

let st_ID = 0;
let ct_ID = 0;
let bg_ID = 0;
let b_ID = 0;
let d_ID = 0;
let de_ID = 0;
let rpt = [];

const windowWidth = Dimensions.get('window').width;
let userID = 0;
let Sess_company_refno = 0;
let Sess_group_refno = 0;
let Sess_FName = 0;
let Sess_designation_refno = 0;
let Sess_CompanyAdmin_UserRefno = 0;

const BasicDetailsOnlyViewScreen = ({route, navigation}) => {
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

  function onPressWagesRadioButton(radioButtonsArray) {
    setWagesRadioButtons(radioButtonsArray);

    radioButtonsArray.map(r => {
      if (r.selected === true) {
        setWagesTypeID(r.value);
      }
    });
  }

  const [showDropDown, setShowDropDown] = useState(false);
  const [showMultiSelectDropDown, setShowMultiSelectDropDown] = useState(false);
  const [selectedReportingEmployee, setSelectedReportingEmployee] =
    React.useState('');

  const isFocused = useIsFocused();
  const [index, setIndex] = useState(
    route.params && route.params.from === 'brand' ? 2 : 0,
  );

  const [empType, setEmpType] = React.useState();

  const [reporting, setReporting] = useState({
    value: '',
    list: [],
    selectedList: [],
    error: '',
  });

  const [wType, setWType] = React.useState();

  //#region Input Variables

  const [companyName, setCompanyName] = useState('');

  const [employeeName, setEmployeeName] = useState('');
  const [employeeNameInvalid, setEemployeeNameInvalid] = useState('');
  const employeeNameRef = useRef({});

  const [employeeCode, setEemployeeCode] = useState('');
  const [employeeCodeInvalid, setEemployeeCodeInvalid] = useState('');
  const employeeCodeRef = useRef({});

  const [mobileNo, setMobileNo] = useState('');
  const [mobileNoInvalid, setMobileNoInvalid] = useState('');
  const mobileNoRef = useRef({});

  const [aadharNo, setAadharNo] = useState('');
  const [aadharNoInvalid, setAadharNoInvalid] = useState('');
  const aadharNoRef = useRef({});

  const [fatherName, setFatherName] = useState('');
  const [fatherNameInvalid, setFatherNameInvalid] = useState('');
  const fatherNameRef = useRef({});

  const [address, setAddress] = useState('');
  const [addressInvalid, setAddressInvalid] = useState('');
  const addressRef = useRef({});

  const [statesFullData, setStatesFullData] = React.useState([]);
  const [statesData, setStatesData] = React.useState([]);
  const [statesID, setStatesID] = React.useState([]);
  const [stateName, setStateName] = React.useState('');
  const [errorSN, setSNError] = React.useState(false);
  const stateRef = useRef({});

  const [cityFullData, setCityFullData] = React.useState([]);
  const [cityData, setCityData] = React.useState([]);
  const [cityID, setCityID] = React.useState([]);
  const [cityName, setCityName] = React.useState('');
  const [errorCN, setCNError] = React.useState(false);
  const cityRef = useRef({});

  const [pincode, setPincode] = useState('');
  const [pincodeInvalid, setPincodeInvalid] = useState('');
  const pincodeRef = useRef({});

  const [bloodGroupFullData, setBloodGroupFullData] = React.useState([]);
  const [bloodGroupData, setBloodGroupData] = React.useState([]);
  const [bloodGroupID, setBloodGroupID] = React.useState([]);
  const [bloodGroup, setBloodGroup] = React.useState('');
  const [errorBloodGroup, setBloodGroupError] = React.useState(false);
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

  const [branchFullData, setBranchFullData] = React.useState([]);
  const [branchData, setBranchData] = React.useState([]);
  const [branchID, setBranchID] = React.useState([]);
  const [branchName, setBranchName] = React.useState('');
  const [errorBranch, setBranchError] = React.useState(false);
  const branchRef = useRef({});

  const [departmentFullData, setDepartmentFullData] = React.useState([]);
  const [departmentData, setDepartmentData] = React.useState([]);
  const [departmentID, setDepartmentID] = React.useState([]);
  const [departmentName, setDepartmentName] = React.useState('');
  const [errorDepartment, setDepartmentError] = React.useState(false);
  const departmentRef = useRef({});

  const [designationFullData, setDesignationFullData] = React.useState([]);
  const [designationData, setDesignationData] = React.useState([]);
  const [designationID, setDesignationID] = React.useState([]);
  const [designationName, setDesignationName] = React.useState('');
  const [errorDesignation, setDesignationError] = React.useState(false);
  const designationRef = useRef({});

  const [reportingFullData, setReportingFullData] = React.useState([]);
  const [reportingData, setReportingData] = React.useState([]);
  const [reportingID, setReportingID] = React.useState([]);
  const [reportingName, setReportingName] = React.useState('');
  const [errorReporting, setReportingError] = React.useState(false);
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

  const [profilePhoto, setProfilePhoto] = useState('');
  const [image, setImage] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const [errorLogo, setLogoError] = useState(false);

  const [isImageReplaced, setIsImageReplaced] = React.useState(false);
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarColor, setSnackbarColor] = React.useState(theme.colors.error);
  const [snackbarText, setSnackbarText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [id, setId] = useState(0);
  //#endregion

  //#region Functions
  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      setId(userID);
      Sess_company_refno = JSON.parse(userData).Sess_company_refno;
      Sess_group_refno = JSON.parse(userData).Sess_group_refno;
      Sess_FName = JSON.parse(userData).Sess_FName;
      Sess_designation_refno = JSON.parse(userData).Sess_designation_refno;
      Sess_CompanyAdmin_UserRefno =
        JSON.parse(userData).Sess_CompanyAdmin_UserRefno;
      setBloodGroupFullData(BloodGroup);
      FetchBasicDetails();
    }
  };
  let tempStateName = '';
  const [work, setWork] = useState({});
  useEffect(() => {
    FetchStates();
    BloodGroupDropdown();
    FetchBranch();
    FetchDepartments();
    FetchDesignations();
    // setIsLoading(false);
  }, [work]);
  // const call = (work_data) => {

  // };
  const FetchBasicDetails = async () => {
    try {
      let params = {
        data: {
          Sess_UserRefno: userID,
          Sess_company_refno: Sess_company_refno,
          Sess_group_refno: Sess_group_refno,
          myemployee_refno: '0',
        },
      };
      const data = await Provider.getEmployeebasicDetailsWithoutReporting(
        params,
        () => setIsLoading(false),
      );

      if (data.empbasicdata) {
        let employee_data = data.empbasicdata[0];
        let reporting_data = {};
        let bankDetails_data = data.payDetails[0];
        let work_data = data.workdata[0];
        if (!NullOrEmpty(employee_data)) {
          setCompanyName(
            !NullOrEmpty(employee_data.company_name)
              ? employee_data.company_name
              : '',
          );
          setEmployeeName(
            !NullOrEmpty(employee_data.firstname)
              ? employee_data.firstname
              : '',
          );
          setEemployeeCode(
            !NullOrEmpty(employee_data.common_employee_code)
              ? employee_data.common_employee_code
              : '',
          );
          setMobileNo(
            !NullOrEmpty(employee_data.mobile_no)
              ? employee_data.mobile_no
              : '',
          );
          setAadharNo(
            !NullOrEmpty(employee_data.aadhar_no)
              ? employee_data.aadhar_no
              : '',
          );
          setFatherName(
            !NullOrEmpty(employee_data.father_name)
              ? employee_data.father_name
              : '',
          );
          setAddress(
            !NullOrEmpty(employee_data.address) ? employee_data.address : '',
          );
          setPincode(
            NullOrEmpty(employee_data.pincode)
              ? ''
              : employee_data.pincode !== 0
              ? employee_data.pincode.toString()
              : '',
          );

          if (!NullOrEmpty(employee_data.state_refno)) {
            setStatesID(employee_data.state_refno);
            st_ID = employee_data.state_refno;
          }

          if (!NullOrEmpty(employee_data.district_refno)) {
            setCityID(employee_data.district_refno);
            ct_ID = employee_data.district_refno;
          }
          if (!NullOrEmpty(employee_data.bloodgroup_refno)) {
            setBloodGroupID(employee_data.bloodgroup_refno);
            bg_ID = employee_data.bloodgroup_refno;
          }

          if (!NullOrEmpty(employee_data.dob)) {
            setDob(
              new Date(
                employee_data.dob.substring(6, 11) +
                  '/' +
                  employee_data.dob.substring(3, 5) +
                  '/' +
                  employee_data.dob.substring(0, 2),
              ),
            );
          }

          if (!NullOrEmpty(employee_data.doj)) {
            setDoj(
              new Date(
                employee_data.doj.substring(6, 11) +
                  '/' +
                  employee_data.doj.substring(3, 5) +
                  '/' +
                  employee_data.doj.substring(0, 2),
              ),
            );
          }

          if (!NullOrEmpty(employee_data.idcard_valid_date)) {
            setCardValidity(
              new Date(
                employee_data.idcard_valid_date.substring(6, 11) +
                  '/' +
                  employee_data.idcard_valid_date.substring(3, 5) +
                  '/' +
                  employee_data.idcard_valid_date.substring(0, 2),
              ),
            );
          }

          if (!NullOrEmpty(work_data.dol)) {
            setLwd(
              new Date(
                work_data.dol.substring(6, 11) +
                  '/' +
                  work_data.dol.substring(3, 5) +
                  '/' +
                  work_data.dol.substring(0, 2),
              ),
            );
          }

          setEmergencyContactName(
            !NullOrEmpty(employee_data.emergency_contact_name)
              ? employee_data.emergency_contact_name
              : '',
          );
          setEmergencyContactNo(
            !NullOrEmpty(employee_data.emergency_contact_no)
              ? employee_data.emergency_contact_no
              : '',
          );

          setLoginActiveStatus(
            !NullOrEmpty(employee_data.login_active_status)
              ? employee_data.login_active_status
              : '',
          );

          if (!NullOrEmpty(work_data.branch_refno)) {
            setBranchID(work_data.branch_refno);
            b_ID = work_data.branch_refno;
          }
          if (!NullOrEmpty(work_data.department_refno)) {
            setDepartmentID(work_data.department_refno);
            d_ID = work_data.department_refno;
          }
          if (!NullOrEmpty(work_data.designation_refno)) {
            setDesignationID(work_data.designation_refno);
            de_ID = work_data.designation_refno;
          }

          if (!NullOrEmpty(work_data.employee_type_refno)) {
            {
              ETRadioButtons.map(r => {
                r.selected = false;
                if (r.value === work_data.employee_type_refno.toString()) {
                  r.selected = true;
                }
              });
            }
            
            setEmployeeTypeID(
              !NullOrEmpty(work_data.employee_type_refno)
                ? work_data.employee_type_refno
                : 0,
            );
          }
          if (!NullOrEmpty(bankDetails_data.wages_type_refno)) {
            {
              wagesRadioButtons.map(r => {
                r.selected = false;
                if (r.value === bankDetails_data.wages_type_refno.toString()) {
                  r.selected = true;
                }
              });
            }

            onPressWagesRadioButton(wagesRadioButtons);
            setWagesTypeID(
              !NullOrEmpty(bankDetails_data.wages_type_refno)
                ? bankDetails_data.wages_type_refno
                : '',
            );
          }

          setSalary(
            !NullOrEmpty(bankDetails_data.salary) ? bankDetails_data.salary : 0,
          );
          console.log('images ', employee_data.profile_photo_url);
          setImage(
            employee_data.profile_photo_url.includes('.jpg') ||
              employee_data.profile_photo_url.includes('.png') ||
              employee_data.profile_photo_url.includes('.jpeg')
              ? employee_data.profile_photo_url
              : null,
          );

          setFilePath(
            employee_data.profile_photo_url
              ? employee_data.profile_photo_url
              : null,
          );
        }
        // no idea
        if (!NullOrEmpty(work_data)) {
          setReportingID(work_data.reporting_user_refno);
          rpt = reporting_data.reporting_user_refno;
        }

        if (!NullOrEmpty(bankDetails_data)) {
          setAccountHolderName(
            !NullOrEmpty(bankDetails_data.bank_ac_holder_name)
              ? bankDetails_data.bank_ac_holder_name.toString()
              : '',
          );
          setAccountNo(
            bankDetails_data.bank_ac_no
              ? bankDetails_data.bank_ac_no.toString()
              : '',
          );
          setBankName(
            bankDetails_data.bank_name ? bankDetails_data.bank_name : '',
          );
          setBankBranchName(
            bankDetails_data.branch_name ? bankDetails_data.branch_name : '',
          );
          setIfscCode(
            bankDetails_data.ifsc_code ? bankDetails_data.ifsc_code : '',
          );
          setWork(work_data);
        }
        setIsLoading(false);
      }
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  //#region Dropdown Functions

  const FetchCities = stateID => {
    let params = {
      data: {
        Sess_UserRefno: id,
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
            if (ct_ID > 0) {
              let a = response.data.data.filter(el => {
                return el.district_refno === ct_ID;
              });
              setCityName(a[0].district_name);
              setCityID(a[0].district_refno);
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
    Provider.createDFCommon(Provider.API_URLS.GetStateDetails)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setStatesFullData(response.data.data);
            const states = response.data.data.map(data => data.state_name);

            setStatesData(states);
            if (st_ID > 0) {
              let s = response.data.data.filter(el => {
                return el.state_refno === st_ID;
              });
              setStateName(s[0].state_name);
              setStatesID(s[0].state_refno);
              tempStateName = s[0].state_name;
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
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: Sess_company_refno,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.getbranchnamebankform, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setBranchFullData(response.data.data);

            const branch = response.data.data.map(data => data.location_name);
            setBranchData(branch);

            if (b_ID > 0) {
              let b = response.data.data.filter(el => {
                return el.branch_refno === b_ID;
              });

              setBranchName(b[0].location_name);
              setBranchID(b[0].branch_refno);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchDepartments = () => {
    let params = {
      data: {
        Sess_UserRefno: id,
        Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.getdepartmentnameemployeeworkform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setDepartmentFullData(response.data.data);
            const department = response.data.data.map(
              data => data.department_name,
            );
            setDepartmentData(department);
            if (d_ID > 0) {
              let d = response.data.data.filter(el => {
                return el.department_refno === d_ID;
              });

              setDepartmentName(d[0].department_name);
              setDepartmentID(d[0].department_refno);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchDesignations = () => {
    let params = {
      data: {
        Sess_UserRefno: id,
        Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.getdesignationnameemployeeworkform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setDesignationFullData(response.data.data);
            const designation = response.data.data.map(
              data => data.designation_name,
            );
            setDesignationData(designation);

            if (de_ID > 0) {
              let b = response.data.data.filter(el => {
                return el.designation_refno === de_ID;
              });

              setDesignationName(b[0].designation_name);
              setDesignationID(b[0].designation_refno);
            }
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
      return el.state_name === selectedItem;
    });
    FetchCities(a[0].state_refno);
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
    let d = departmentFullData.filter(el => {
      return el.department_name === selectedItem;
    });

    setDepartmentName(d[0].department_name);
    setDepartmentID(d[0].department_refno);
    setDepartmentError(false);
  };

  const onDesignationChanged = selectedItem => {
    let b = designationFullData.filter(el => {
      return el.designation_name === selectedItem;
    });

    setDesignationName(b[0].designation_name);
    setDesignationID(b[0].designation_refno);
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

  const renderScene = ({route}) => {
    switch (route.key) {
      case 'basicDetails':
        return (
          <ScrollView style={[Styles.flex1, Styles.backgroundColor]}>
            <View style={[Styles.padding16]}>
              <TextInput
                mode="outlined"
                dense
                label="Company Name"
                value={companyName}
                returnKeyType="next"
                editable={false}
                selectTextOnFocus={false}
              />
              <View style={[Styles.marginTop16]}>
                <TextInput
                  ref={employeeNameRef}
                  mode="outlined"
                  dense
                  label="Employee Name"
                  value={employeeName}
                  returnKeyType="next"
                  onSubmitEditing={() => employeeNameRef.current.focus()}
                  editable={false}
                  selectTextOnFocus={false}
                  error={employeeNameInvalid}
                />
                <HelperText type="error" visible={employeeNameInvalid}>
                  {communication.InvalidEmployeeName}
                </HelperText>
              </View>
              <TextInput
                ref={employeeCodeRef}
                mode="outlined"
                dense
                label="Employee Code"
                value={employeeCode}
                returnKeyType="next"
                editable={false}
                selectTextOnFocus={false}
                onSubmitEditing={() => employeeCodeRef.current.focus()}
                error={employeeCodeInvalid}
              />

              <HelperText type="error" visible={employeeCodeInvalid}>
                {communication.InvalidEmployeeCode}
              </HelperText>

              <TextInput
                ref={mobileNoRef}
                mode="outlined"
                dense
                editable={false}
                maxLength={10}
                keyboardType="number-pad"
                label="Mobile No"
                value={mobileNo}
                returnKeyType="next"
                onSubmitEditing={() => mobileNoRef.current.focus()}
                error={mobileNoInvalid}
              />
              <HelperText type="error" visible={mobileNoInvalid}>
                {communication.mobileNoInvalid}
              </HelperText>
              <TextInput
                ref={aadharNoRef}
                mode="outlined"
                dense
                label="Aadhar No"
                editable={false}
                maxLength={12}
                keyboardType={'number-pad'}
                value={aadharNo}
                returnKeyType="next"
                onSubmitEditing={() => aadharNoRef.current.focus()}
                error={aadharNoInvalid}
              />
              <HelperText type="error" visible={aadharNoInvalid}>
                {communication.InvalidAadharNo}
              </HelperText>
              <TextInput
                ref={fatherNameRef}
                mode="outlined"
                label="Father Name"
                value={fatherName}
                editable={false}
                returnKeyType="next"
                onSubmitEditing={() => fatherNameRef.current.focus()}
                error={fatherNameInvalid}
              />
              <HelperText type="error" visible={fatherNameInvalid}>
                {communication.InvalidFatherName}
              </HelperText>
              <TextInput
                ref={addressRef}
                mode="outlined"
                dense
                label="Address"
                value={address}
                editable={false}
                returnKeyType="next"
                onSubmitEditing={() => addressRef.current.focus()}
                style={[Styles.marginBottom16, {backgroundColor: 'white'}]}
                error={addressInvalid}
              />

              <Dropdown
                label="State"
                forceDisable={true}
                data={statesData}
                onSelected={onStateNameSelected}
                isError={errorSN}
                selectedItem={stateName}
              />
              <View style={[Styles.height24]}></View>
              <Dropdown
                forceDisable={true}
                label="District"
                data={cityData}
                onSelected={onCityNameSelected}
                isError={errorCN}
                selectedItem={cityName}
                reference={cityRef}
              />

              <TextInput
                ref={pincodeRef}
                mode="outlined"
                dense
                keyboardType="number-pad"
                label="Pincode"
                editable={false}
                maxLength={6}
                value={pincode}
                returnKeyType="done"
                style={[
                  Styles.marginTop24,
                  Styles.marginBottom16,
                  {backgroundColor: 'white'},
                ]}
                error={pincodeInvalid}
              />

              <Dropdown
                label="Blood Group"
                data={bloodGroupData}
                onSelected={onBloodGroupSelected}
                isError={errorBloodGroup}
                selectedItem={bloodGroup}
                reference={bloodGroupRef}
                forceDisable={true}
              />

              <View>
                <DateTimePicker
                  style={Styles.backgroundColorWhite}
                  label="Date of Birth"
                  type="date"
                  value={dob}
                  onChangeDate={setDob}
                />
              </View>

              <View>
                <DateTimePicker
                  style={Styles.backgroundColorWhite}
                  label="Date of Joining"
                  type="date"
                  value={doj}
                  onChangeDate={setDoj}
                />
              </View>

              <TextInput
                ref={emergencyContactNameRef}
                mode="outlined"
                dense
                editable={false}
                label="Emergency Contact Name"
                value={emergencyContactName}
                returnKeyType="next"
                onSubmitEditing={() => emergencyContactNameRef.current.focus()}
                style={[Styles.marginTop16, {backgroundColor: 'white'}]}
                error={emergencyContactNameInvalid}
              />

              <TextInput
                ref={emergencyContactNoRef}
                mode="outlined"
                dense
                editable={false}
                label="Emergency Contact No"
                maxLength={10}
                value={emergencyContactNo}
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => emergencyContactNoRef.current.focus()}
                style={[Styles.marginTop16, {backgroundColor: 'white'}]}
                error={emergencyContactNoInvalid}
              />

              <View>
                <DateTimePicker
                  style={Styles.backgroundColorWhite}
                  label="ID Card Valid Upto"
                  type="date"
                  value={cardValidity}
                  onChangeDate={setCardValidity}
                />
              </View>

              <Checkbox.Item
                style={Styles.marginTop8}
                label="Login Active Status"
                status={loginActiveStatus ? 'checked' : 'unchecked'}
                
              />
            </View>
          </ScrollView>
        );
      case 'workDetails':
        return (
          <ScrollView style={[Styles.flex1, Styles.backgroundColor]}>
            <View style={[Styles.padding16]}>
              <Dropdown
                label="Branch"
                data={branchData}
                onSelected={onBranchChanged}
                isError={errorBranch}
                selectedItem={branchName}
                reference={branchRef}
                forceDisable={true}
              />

              <View style={[Styles.marginTop16]}>
                <Dropdown
                  label="Department"
                  data={departmentData}
                  onSelected={onDepartmentChanged}
                  isError={errorDepartment}
                  selectedItem={departmentName}
                  reference={departmentRef}
                  forceDisable={true}
                />
              </View>
              <View style={[Styles.marginTop16]}>
                <Dropdown
                  label="Designation"
                  data={designationData}
                  onSelected={onDesignationChanged}
                  isError={errorDesignation}
                  selectedItem={designationName}
                  reference={designationRef}
                  forceDisable={true}
                />
              </View>
              <View style={Styles.marginTop16}>
                <Text>Employee Type</Text>
              </View>

              <RadioGroup
                containerStyle={[Styles.marginTop16]}
                layout="row"
                radioButtons={ETRadioButtons}
              />

              <View style={[Styles.marginTop24, Styles.marginBottom8]}>
                <Text>Reporting to</Text>
              </View>

              <PaperSelect
                label="Reporting Employees To"
                value={reporting.value}
                onSelection={value => {
                  setReporting({
                    ...reporting,
                    value: value.text,
                    selectedList: value.selectedList,
                    error: '',
                  });
                }}
                arrayList={[...reporting.list]}
                selectedArrayList={reporting.selectedList}
                errorText={reporting.error}
                multiEnable={true}
                textInputMode="flat"
                searchStyle={{iconColor: '#6c736e'}}
                searchPlaceholder="Search Employee"
                modalCloseButtonText="Cancel"
                modalDoneButtonText="Done"
              />

              <View>
                <DateTimePicker
                  style={Styles.backgroundColorWhite}
                  label="Last Working Date"
                  type="date"
                  value={lwd}
                  onChangeDate={setLwd}
                />
              </View>
            </View>
          </ScrollView>
        );
      case 'payDetails':
        return (
          <ScrollView style={[Styles.flex1, Styles.backgroundColor]}>
            <View style={[Styles.padding16]}>
              <View style={Styles.marginTop16}>
                <Text>Wages Type</Text>
              </View>

              <RadioGroup
                containerStyle={[Styles.marginTop16]}
                layout="row"
                radioButtons={wagesRadioButtons}
              />

              <TextInput
                ref={salaryRef}
                mode="outlined"
                dense
                editable={false}
                keyboardType="number-pad"
                label="Salary"
                value={salary}
                returnKeyType="next"
                onSubmitEditing={() => salaryRef.current.focus()}
                style={{backgroundColor: 'white'}}
                error={salaryInvalid}
              />

              <TextInput
                ref={accountHolderNameRef}
                mode="outlined"
                dense
                editable={false}
                label="Account Holder Name"
                value={accountHolderName}
                returnKeyType="next"
                onSubmitEditing={() => accountHolderNameRef.current.focus()}
                style={{backgroundColor: 'white'}}
                error={accountHolderNameInvalid}
              />

              <TextInput
                ref={accountNoRef}
                mode="outlined"
                dense
                editable={false}
                label="Account Number"
                keyboardType={'number-pad'}
                value={accountNo}
                returnKeyType="next"
                onSubmitEditing={() => bankNameRef.current.focus()}
                style={{backgroundColor: 'white'}}
                error={accountNoInvalid}
              />
              {/* <HelperText type="error" visible={accountNoInvalid}>
                {communication.InvalidActivityName}
              </HelperText> */}
              <TextInput
                ref={bankNameRef}
                mode="outlined"
                dense
                editable={false}
                label="Bank Name"
                value={bankName}
                returnKeyType="next"
                onSubmitEditing={() => bankBranchNameRef.current.focus()}
                style={{backgroundColor: 'white'}}
                error={bankNameInvalid}
              />
              {/* <HelperText type="error" visible={bankNameInvalid}>
                {communication.InvalidActivityName}
              </HelperText> */}
              <TextInput
                ref={bankBranchNameRef}
                mode="outlined"
                dense
                editable={false}
                label="Bank Branch Name"
                value={bankBranchName}
                returnKeyType="next"
                onSubmitEditing={() => ifscCodeRef.current.focus()}
                style={{backgroundColor: 'white'}}
                error={bankBranchNameInvalid}
              />
              {/* <HelperText type="error" visible={bankBranchNameInvalid}>
                {communication.InvalidActivityName}
              </HelperText> */}
              <TextInput
                ref={ifscCodeRef}
                mode="outlined"
                dense
                editable={false}
                label="IFSC Code"
                value={ifscCode}
                returnKeyType="done"
                style={{backgroundColor: 'white'}}
                error={ifscCodeInvalid}
              />
              {/* <HelperText type="error" visible={ifscCodeInvalid}>
                {communication.InvalidActivityName}
              </HelperText> */}
            </View>
          </ScrollView>
        );
      case 'photo':
        return (
          <ScrollView style={[Styles.flex1, Styles.backgroundColor]}>
            <View
              style={[Styles.flexRow, Styles.flexAlignEnd, Styles.marginTop16]}>
              <Image
                source={
                  image != null
                    ? {uri: image}
                    : require('../../../../assets/no-photos.png')
                }
                style={[Styles.width104, Styles.height104, Styles.border1]}
              />
            </View>
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
      indicatorStyle={{backgroundColor: theme.colors.primary}}
      style={{backgroundColor: theme.colors.textLight}}
      inactiveColor={theme.colors.textSecondary}
      activeColor={theme.colors.primary}
      scrollEnabled={true}
      tabStyle={{width: windowWidth / 4}}
      labelStyle={[Styles.fontSize13, Styles.fontBold]}
    />
  );
  const [routes] = React.useState([
    {key: 'basicDetails', title: 'Basic Details'},
    {key: 'workDetails', title: 'Work Details'},
    {key: 'payDetails', title: 'Pay Details'},
    {key: 'photo', title: 'Profile Photo'},
  ]);

  return (
    isFocused && (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
      <View style={[Styles.flex1]}>
        <Header
          navigation={navigation}
          title="EMPLOYEE BASIC DETAILS"
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
            navigationState={{index, routes}}
            renderScene={renderScene}
            onIndexChange={setIndex}
          />
        )}

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{backgroundColor: snackbarColor}}>
          {snackbarText}
        </Snackbar>
      </View>
      </SafeAreaView>
    )
  );
};

export default BasicDetailsOnlyViewScreen;
