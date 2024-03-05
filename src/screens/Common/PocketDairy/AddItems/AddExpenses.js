import moment from 'moment';
import uuid from 'react-native-uuid';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Image, View, Pressable, LogBox, Modal } from 'react-native';
import {
  Button,
  Card,
  Checkbox,
  HelperText,
  Snackbar,
  Subheading,
  Text,
  RadioButton,
  TextInput,
  DataTable,
} from 'react-native-paper';
import Provider from '../../../../api/Provider';
import Dropdown from '../../../../components/Dropdown';
import { Styles } from '../../../../styles/styles';
import { theme } from '../../../../theme/apptheme';
import { communication } from '../../../../utils/communication';
import { DateTimePicker } from '@hashiprobr/react-native-paper-datetimepicker';
import * as ImagePicker from 'react-native-image-picker';
import { AWSImagePath } from '../../../../utils/paths';
import RadioGroup from 'react-native-radio-buttons-group';
import { PaperSelect } from 'react-native-paper-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIConverter } from '../../../../utils/apiconverter';
import {
  projectVariables,
  projectLoginTypes,
  projectFixedDesignations,
} from '../../../../utils/credentials';
import * as Contacts from 'react-native-contacts';
import { faL } from '@fortawesome/free-solid-svg-icons';
import RBSheet from 'react-native-raw-bottom-sheet';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import * as DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

let userID = 0,
  groupID = 0,
  groupExtraID = 0,
  companyID = 0,
  branchID = 0,
  _pktEntryTypeID = 0,
  designID = 0,
  companyAdminID = 0;

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Material-UI: The `css` function is deprecated. Use the `styleFunctionSx` instead',
  'source.uri should not be an empty string',
  `VirtualizedLists should never be nested inside plain ScrollViews with the 
  same orientation because it can break windowing and other functionality - 
  use another VirtualizedList-backed container instead`,
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

const AddExpenses = ({ route, navigation }) => {
  const [file, setFile] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const getCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
    }
  };

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

  const [RecurringRadioButtons, setRecurringRadioButtons] = useState([
    {
      id: '1', // acts as primary key, should be unique and non-empty string
      label: 'Yes',
      selected: true,
      value: '1',
    },
    {
      id: '2',
      label: 'No',
      selected: false,
      value: '2',
    },
  ]);

  function onPressRecurringRadioButton(radioButtonsArray) {
    setRecurringRadioButtons(radioButtonsArray);

    radioButtonsArray.map(r => {
      if (r.selected === true) {
        setrecurringDateFlag(r.value);

        if (r.label == 'No') {
          setRecurringReminderDateStatus(false);
        } else {
          setRecurringReminderDateStatus(true);
        }
      }
    });
  }

  //#region Variables

  const [date, setDate] = useState(new Date());
  const [dateInvalid, setDateInvalid] = useState('');
  const dateRef = useRef({});

  const [entryTypeData, setEntryTypeData] = React.useState([]);
  const [entryTypeFullData, setEntryTypeFullData] = React.useState([]);
  const [entryTypeError, setEntryTypeError] = React.useState(false);
  const [entryType, setEntryType] = React.useState(
    route.params?.data?.entryType,
  );
  const [entryTypeDisable, setEntryTypeDisable] = React.useState(true);

  const [subCategoryNameFullData, setSubCategoryNameFullData] = React.useState(
    [],
  );
  const [subCategoryNameData, setSubCategoryNameData] = React.useState([]);
  const [subCategoryName, setSubCategoryName] = React.useState([]);
  const [errorSCN, setSCNError] = React.useState(false);

  const [payModeFullData, setPayModeFullData] = React.useState([]);
  const [payModeData, setPayModeData] = React.useState([]);
  const [payMode, setPayMode] = React.useState([]);
  const [errorPM, setPMError] = React.useState(false);

  const [cardTypeFullData, setCardTypeFullData] = React.useState([]);
  const [cardTypeData, setCardTypeData] = React.useState([]);
  const [cardType, setCardType] = React.useState([]);
  const [errorCT, setCTError] = React.useState(false);

  const [cardBankFullData, setCardBankFullData] = React.useState([]);
  const [cardBankData, setCardBankData] = React.useState([]);
  const [cardBank, setCardBank] = React.useState([]);
  const [errorCB, setCBError] = React.useState(false);

  const [cardRepayment, setCardRepayment] = useState(new Date());
  const [cardRepaymentInvalid, setCardRepaymentInvalid] = useState('');
  const [errorCRPayment, setErrorCRPayment] = React.useState(false);
  const cardRepaymentRef = useRef({});

  const [expensesFullData, setExpensesFullData] = React.useState([]);
  const [expensesData, setExpensesData] = React.useState([]);
  const [expenses, setExpenses] = React.useState([]);
  const [errorEX, setEXError] = React.useState(false);

  const [amountError, setAmountError] = React.useState(false);
  const [amount, settAmount] = React.useState('');
  const [amountInvalidBalance, setAmountInvalidBalance] = React.useState(
    'Amount can not be more then balance amount',
  );

  const [paidToFullData, setPaidToFullData] = React.useState([]);
  const [paidToData, setPaidToData] = React.useState([]);
  const [paidTo, setPaidTo] = React.useState([]);
  const [errorPT, setPTError] = React.useState(false);

  const [recurringDate, setRecurringDate] = useState(new Date());
  const [recurringDateInvalid, setRecurringDateInvalid] = useState('');
  const [errorRD, setErrorRD] = React.useState(false);
  const recurringDateRef = useRef({});

  const [depositeTypeFullData, setDepositeTypeFullData] = React.useState([]);
  const [depositeTypeData, setDepositeTypeData] = React.useState([]);
  const [depositeType, setDepositeType] = React.useState([]);
  const [errorDT, setDTError] = React.useState(false);

  const [myBankFullData, setMyBankFullData] = React.useState([]);
  const [myBankData, setMyBankData] = React.useState([]);
  const [MyBank, setMyBank] = React.useState([]);
  const [errorMB, setMBError] = React.useState(false);

  const [clientListFullData, setClientListFullData] = React.useState([]);
  const [clientListData, setClientListData] = React.useState([]);
  const [clientList, setClientList] = React.useState('');
  const [errorCL, setErrorCL] = React.useState(false);

  const [projectListFullData, setProjectListFullData] = React.useState([]);
  const [projectListData, setProjectListData] = React.useState([]);
  const [projectList, setProjectList] = React.useState([]);
  const [errorPL, setErrorPL] = React.useState(false);

  const [projectExpenseFullData, setProjectExpenseFullData] = React.useState(
    [],
  );
  const [projectExpenseData, setProjectExpenseData] = React.useState([]);
  const [projectExpense, setProjectExpense] = React.useState([]);
  const [errorPE, setErrorPE] = React.useState(false);

  const [chequeNoError, setChequeNoError] = React.useState(false);
  const [chequeNo, setChequeNo] = React.useState('');

  const [utrNoError, setUtrNoError] = React.useState(false);
  const [utrNo, setUtrNo] = React.useState('');

  const [chequeDate, setChequeDate] = useState(new Date());
  const [chequeDateInvalid, setChequeDateInvalid] = useState('');
  const chequeDateRef = useRef({});

  const [image, setImage] = React.useState(null);
  const [filePath, setFilePath] = React.useState(
    route.params.type === 'edit' || route.params.type === 'verify'
      ? { name: route.params?.data?.designImage }
      : null,
  );
  const [designImage, setDesignImage] = React.useState(
    route.params?.data?.designImage,
  );
  const [errorDI, setDIError] = React.useState(false);

  const [notesError, setNotesError] = React.useState(false);
  const [notes, setNotes] = React.useState('');

  const [checked, setChecked] = React.useState(
    route.params.type === 'edit' || route.params.type === 'verify'
      ? route.params?.data?.display
      : true,
  );

  const [contactTypeFullData, setContactTypeFullData] = React.useState([]);
  const [contactTypeData, setContactTypeData] = React.useState([]);
  const [contactType, setContactType] = React.useState([]);
  const [errorContactType, setErrorContactType] = React.useState(false);

  const [contactName, setContactName] = React.useState('');

  const [mobileNumber, setMobileNumber] = React.useState('');

  const [recurring, setRecurring] = useState({
    value: '',
    list: [],
    selectedList: [],
    error: '',
  });

  const [pktEntryTypeID, setPktEntryTypeID] = React.useState('1');

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState('');
  const [snackbarColor, setSnackbarColor] = React.useState(
    theme.colors.success,
  );

  const ref_input2 = useRef();
  const ref_input3 = useRef();

  const [cardTypeStatus, setCardTypeStatus] = React.useState(false);
  const [cardBankNameStatus, setCardBankNameStatus] = React.useState(false);
  const [cardRepaymentDateStatus, setCardRepaymentDateStatus] =
    React.useState(false);
  const [paidToStatus, setPaidToStatus] = React.useState(false);
  const [recurringStatus, setRecurringStatus] = React.useState(false);
  const [recurringReminderDateStatus, setRecurringReminderDateStatus] =
    React.useState(false);
  const [depositTypeStatus, setDepositTypeStatus] = React.useState(false);
  const [bankStatus, setBankStatus] = React.useState(false);
  const [personalBankStatus, setPersonalBankStatus] = React.useState(false);
  const [utrNoStatus, setUtrNoStatus] = React.useState(false);
  const [chequeNoStatus, setChequeNoStatus] = React.useState(false);
  const [chequeDateStatus, setChequeDateStatus] = React.useState(false);
  const [commonDisplayStatus, setCommonDisplayStatus] = React.useState(false);
  const [buttonStatus, setButtonStatus] = React.useState(true);
  const [recurringDateFlat, setrecurringDateFlag] = useState('1');
  const [pckTransID, setPckTransID] = React.useState([]);
  const [isImageReplaced, setIsImageReplaced] = React.useState(false);
  const [subCatStatus, setSubCatStatus] = React.useState(true);
  const [contactTypeStatus, setContactTypeStatus] = useState(false);
  const [newMobileNumberStatus, setNewMobileNumberStatus] =
    React.useState(false);
  const [newContactNameStatus, setNewContactNameStatus] = React.useState(false);
  const [clientListStatus, setClientListstatus] = React.useState(false);
  const [projectListStatus, setProjectListstatus] = React.useState(false);
  const [projectExpenseStatus, setProjectExpenseStatus] = React.useState(false);
  const [PayToCompanyStatus, setPayToCompanyStatus] = React.useState(false);
  const [projectExpenseDisable, setProjectExpenseDisable] =
    React.useState(false);
  const [entryTypeStatus, setEntryTypeStatus] = React.useState(false);
  const [isContactLoading, setIsContactLoading] = useState(false);

  const [collectedAmount, setcollectedAmount] = React.useState('');
  const [paidAmount, setpaidAmount] = React.useState('');
  const [balanceAmount, setbalanceAmount] = React.useState('');
  const [personalBankName, setPersonalBankName] = React.useState('');
  const [personalBankAccNo, setPersonalBankAccNo] = React.useState('');
  const [bankRefNo, setBankRefNo] = React.useState('');

  const [cashBalance, setCashBalance] = useState(0);
  const [cashBalanceStatus, setCashBalanceStatus] = React.useState(false);

  const [bankBalance, setBankBalance] = useState(0);
  const [bankBalanceStatus, setBankBalanceStatus] = React.useState(false);

  const [branchFullData, setBranchFullData] = React.useState([]);
  const [branchData, setBranchData] = React.useState([]);
  const [branch, setBranch] = React.useState([]);
  const [errorBR, setErrorBR] = React.useState(false);

  const [designationFullData, setDesignationFullData] = React.useState([]);
  const [designationData, setDesignationData] = React.useState([]);
  const [designation, setDesignation] = React.useState([]);
  const [errorDesg, setErrorDesg] = React.useState(false);

  const [employeeFullData, setEmployeeFullData] = React.useState([]);
  const [employeeData, setEmployeeData] = React.useState([]);
  const [employee, setEmployee] = React.useState([]);
  const [errorEmp, setErrorEmp] = React.useState(false);

  const [usageFullData, setUsageFullData] = React.useState([]);
  const [usageData, setUsageData] = React.useState([]);
  const [usage, setUsage] = React.useState([]);
  const [errorUsage, setErrorUsage] = React.useState(false);

  const [branchListStatus, setBranchListstatus] = React.useState(false);
  const [designationListStatus, setDesignationListstatus] =
    React.useState(false);
  const [employeeListStatus, setEmployeeListstatus] = React.useState(false);
  const [usageListStatus, setUsageListstatus] = React.useState(false);

  const [expenseToFullData, setExpenseToFullData] = React.useState([]);
  const [expenseToData, setExpenseToData] = React.useState([]);
  const [expenseTo, setExpenseToName] = React.useState([]);
  const [errorExpenseTo, setExpenseToError] = React.useState(false);
  const [expenseToStatus, setExpenseToStatus] = React.useState(false);

  const [MKT_clientListFullData, setMKT_ClientListFullData] = React.useState(
    [],
  );
  const [MKT_clientListData, setMKT_ClientListData] = React.useState([]);
  const [MKT_clientList, setMKT_ClientList] = React.useState([]);
  const [errorMKT_CL, setErrorMKT_CL] = React.useState(false);
  const [MKT_clientListStatus, setMKT_ClientListstatus] = React.useState(false);

  const [followupFullData, setFollowupFullData] = React.useState([]);
  const [followupData, setFollowupData] = React.useState([]);
  const [followup, setFollowup] = React.useState([]);
  const [errorFollowup, setFollowupError] = React.useState(false);
  const [followupStatus, setFollowupStatus] = React.useState(false);

  const [purposeFullData, setPurposeFullData] = React.useState([]);
  const [purposeData, setPurposeData] = React.useState([]);
  const [purpose, setPurpose] = React.useState([]);
  const [errorPurpose, setPurposeError] = React.useState(false);
  const [purposeStatus, setPurposeStatus] = React.useState(false);
  const [rb_clientType, setRB_ClientType] = React.useState('');

  //#endregion

  //#region RBSheet Variables
  const refRBSheet = useRef();

  const [companyData, setCompanyData] = React.useState([]);
  const [companyName, setCompanyName] = React.useState('');
  const [errorCON, setCONError] = React.useState(false);

  const [otherClients, setOtherClients] = React.useState([]);
  const [selectedData, setSelectedData] = React.useState([]);
  const [selectedClient, setSelectedClient] = React.useState('');
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);

  const [mobilenoData, setMobileNoData] = React.useState([]);
  const [mobileno, setMobileNo] = React.useState('');
  const [errorMN, setMNError] = React.useState(false);

  //#endregion
  //#endregion

  //#region Functions

  useEffect(() => {
    GetUserID();
    //console.log(route?.params?.data);
  }, []);

  const DisableInputsOnVerify = () => {
    setEntryTypeDisable(true);
  };

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
      console.log(JSON.parse(userData));
      FetchEntryType();

      if (route.params.type === 'verify') {
        DisableInputsOnVerify();
      }

      if (
        route.params.type ===
        projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
      ) {
        FetchPayToCompanyData(route.params.data.transactionID);
      } else if (route.params.type === 'edit') {
        SetEditData(route.params.data);
      } else if (route.params.type === 'verify') {
        FetchPayToCompanyData(route.params.data.pck_trans_refno);
      }
    }
  };

  const [payment, setPayment] = useState({
    payment_group_name: '',
    payment_type_name: '',
  });
  const FetchPaymentType = id => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckpaymenttype, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setPayment(prev => {
              return {
                ...prev,
                payment_type_name: response.data.data.filter(
                  data => data.payment_type_refno == id,
                )[0].payment_type_name,
              };
            });
          }
        }
      })
      .catch(e => { });
  };

  const FetchPaymentGroup = id => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckpaymentgroup, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setPayment(prev => {
              return {
                ...prev,
                payment_group_name: response.data.data.filter(
                  data => data.payment_group_refno == id,
                )[0].payment_group_name,
              };
            });
          }
        }
      })
      .catch(e => { });
  };

  const FetchPayToCompanyData = transactionID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_trans_refno: transactionID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        pck_transtype_refno:
          route.params.type === 'edit'
            ? projectVariables.DEF_PCKDIARY_TRANSTYPE_SOURCE_REFNO
            : route.params.type === 'verify'
              ? projectVariables.DEF_PCKDIARY_TRANSTYPE_EXPENSES_REFNO
              : route.params.type ===
                projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
                ? projectVariables.DEF_PCKDIARY_TRANSTYPE_SOURCE_REFNO
                : 0,
        pck_entrytype_refno:
          projectVariables.DEF_PCKDIARY_ENTRYTYPE_COMPANY_REFNO,
      },
    };
    // console.log("params", params.data);
    Provider.createDFPocketDairy(Provider.API_URLS.pcktransrefnocheck, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            console.log(response.data.data[0]);
            SetEditData(response.data.data[0]);
            setPayment(prev => {
              return {
                ...prev,
                ...response.data.data[0],
              };
            });
          }
        } else {
          setSnackbarText('No Company data found');
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
        }
      })
      .catch(e => {
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        setRefreshing(false);
      });
  };

  const SetEditData = data => {
    console.log('edit', data);
    if (route?.params?.type === 'ptc') {
      if (
        data?.payment_group_refno !== null &&
        data?.payment_group_refno !== '0'
      ) {
        FetchPaymentGroup(data.payment_group_refno);
      }
      if (
        data?.payment_type_refno !== null &&
        data?.payment_type_refno !== '0'
      ) {
        FetchPaymentType(data.payment_type_refno);
      }
    }
    setcollectedAmount(data.Collected_ActualAmount);
    setpaidAmount(data.TotalPaidAmount);
    setbalanceAmount(data.BalanceUnPaidPayment);

    setButtonStatus(false);
    setEntryType(data.pck_entrytype_name);

    if (
      route.params.type ===
      projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
    ) {
      settAmount(data.BalanceUnPaidPayment.replace(/,/g, ''));
    } else {
      settAmount(data.amount);
    }

    setPckTransID(data.pck_trans_refno);
    _pktEntryTypeID = data.pck_entrytype_refno;
    setPktEntryTypeID(data.pck_entrytype_refno);
    FetchPaymentMode(data.pck_mode_refno);

    if (
      data.cardtype_refno &&
      data.cardtype_refno != '' &&
      data.cardtype_refno != '0'
    ) {
      setCardTypeStatus(true);
      FetchCardType(data.cardtype_refno);
    }

    if (data.pck_card_mybank_refno != '' && data.pck_card_mybank_refno != '0') {
      setCardBankNameStatus(true);
      FetchCardBankList(data.cardtype_refno, data.pck_card_mybank_refno);
    }

    if (data.due_date != '' && data.due_date != '0' && data.due_date != null) {
      setCardRepaymentDateStatus(true);
      let dateBreakup = data.due_date.split('-');
      setCardRepayment(
        new Date(dateBreakup[2] + '-' + dateBreakup[1] + '-' + dateBreakup[0])
      );
    }

    FetchExpenseCategory(data.pck_mode_refno, data.pck_category_refno);

    if (
      data.pck_sub_category_refno != '' &&
      data.pck_sub_category_refno != '0'
    ) {
      setSubCategoryName(data.pck_sub_category_name);
      FetchExpenseSubCategory(
        data.pck_category_refno,
        data.pck_sub_category_refno,
      );
    } else {
      setSubCatStatus(false);
    }

    if (data.pck_contacttype_refno != '' && data.pck_contacttype_refno != '0') {
      setContactTypeStatus(true);
      FetchContactType(data.pck_contacttype_refno);
    }

    if (data.pck_mycontact_refno != '' && data.pck_mycontact_refno != '0') {
      setPaidToStatus(true);
      FetchReceiverList(
        data.pck_mycontact_refno,
        null,
        data.pck_sub_category_refno,
        data.pck_contacttype_refno,
      );
    }

    if (data.recurring_status != '' && data.recurring_status != '0') {
      setRecurringStatus(true);

      let recc = [...RecurringRadioButtons];
      recc.map(r => {
        if (r.id == data.recurring_status) {
          setrecurringDateFlag(r.value);

          if (r.label == 'No') {
            setRecurringReminderDateStatus(false);
          } else {
            setRecurringReminderDateStatus(true);
          }
        }
      });

      setRecurringRadioButtons(recc);
    }

    if (
      data.reminder_date != '' &&
      data.reminder_date != '0' &&
      data.reminder_date != null
    ) {
      let dateBreakup = data.reminder_date.split('-');
      setRecurringDate(
        new Date(dateBreakup[2] + '-' + dateBreakup[1] + '-' + dateBreakup[0])
      );
    }

    if (data.deposit_type_refno != '' && data.deposit_type_refno != '0') {
      setDepositTypeStatus(true);
      FetchDepositType(data.deposit_type_refno);
    }

    if (data.pck_mybank_refno != '' && data.pck_mybank_refno != '0') {
      setBankStatus(true);
      FetchBankList(data.pck_mybank_refno, data.pck_mode_refno);
    }

    if (
      route.params.type === 'verify' &&
      data.banktype_refno != null &&
      data.banktype_refno == '1'
    ) {
      setPersonalBankStatus(true);
      setBankStatus(false);
      setPersonalBankName(data.personal_bank_name);
      setPersonalBankAccNo(data.personal_bank_account_no);
      setBankRefNo(data.pck_mybank_refno);
    }

    if (data.utr_no != '' && data.utr_no != '0') {
      setUtrNoStatus(true);
      setUtrNo(data.utr_no);
    }

    if (data.cheque_no != '' && data.cheque_no != '0') {
      setChequeNoStatus(true);
      setChequeNo(data.cheque_no);
    }

    if (
      data.cheque_date != '' &&
      data.cheque_date != '0' &&
      data.cheque_date != null
    ) {
      let dateBreakup = data.cheque_date.split('-');
      setChequeDateStatus(true);
      setChequeDate(
        new Date(dateBreakup[2] + '-' + dateBreakup[1] + '-' + dateBreakup[0])
      );
    }
    if (
      data.pck_category_refno != null &&
      data.pck_category_refno != '0' &&
      route?.params?.type == 'ptc'
    ) {
      console.log('here2');
      setExpenseToStatus(true);
      FetchExpenseTo(
        data.pck_category_refno.toString(),
        data.pck_sub_category_refno,
      );
    }

    if (
      _pktEntryTypeID == projectVariables.DEF_PCKDIARY_ENTRYTYPE_COMPANY_REFNO
    ) {
      if (data.myclient_refno != null && data.myclient_refno != '0') {
        setMKT_ClientListstatus(true);
        FetchMKTClientList(data.myclient_refno);
      }

      if (
        data.pck_custom_category_refno != null &&
        data.pck_custom_category_refno != '0'
      ) {
        console.log('here');
        setExpenseToStatus(true);
        FetchExpenseTo(
          data.pck_custom_category_refno,
          data.pck_sub_category_refno,
        );
      }
    } else {
      if (data.myclient_refno != null && data.myclient_refno != '0') {
        setClientListstatus(true);
        FetchClientList(data.myclient_refno);
      }
    }

    if (data.cont_project_refno != null && data.cont_project_refno != '0') {
      setProjectListstatus(true);
      FetchProjectList(data.myclient_refno, data.cont_project_refno);
    }

    if (
      (data.dynamic_expenses_refno != null &&
        data.dynamic_expenses_refno != '0') ||
      route.params.type ===
      projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
    ) {
      if (route?.params?.type !== 'ptc') {
        setProjectExpenseStatus(true);
        FetchProjectExpense(
          data.pck_category_refno,
          data.dynamic_expenses_refno,
        );
      }
    } else if (
      data.dynamic_expenses_refno != null &&
      data.dynamic_expenses_refno != '0' &&
      data.exp_branch_refno != '' &&
      data.exp_branch_refno != '0'
    ) {
      setUsageListstatus(true);
      FetchUsageList(data.dynamic_expenses_refno, data.pck_category_refno);
    }

    setCommonDisplayStatus(true);

    setNotes(data.notes);

    setChecked(data.view_status == '1' ? true : false);

    if (
      route.params.type !=
      projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
    ) {
      getFileType(data.attach_receipt_url, setImage);
      setFilePath(data.attach_receipt_url);
      setFile(data.attach_receipt_url);
      getFileType(data.attach_receipt_url, setDesignImage);
    }

    if (
      data.exp_branch_refno &&
      data.exp_branch_refno != '' &&
      data.exp_branch_refno != '0'
    ) {
      setBranchListstatus(true);
      FetchBranchList(data.exp_branch_refno);
    }

    if (
      data.exp_designation_refno &&
      data.exp_designation_refno != '' &&
      data.exp_designation_refno != '0'
    ) {
      setDesignationListstatus(true);
      FetchDesignationList(data.exp_designation_refno);
    }

    if (
      data.myemployee_refno &&
      data.myemployee_refno != '' &&
      data.myemployee_refno != '0'
    ) {
      console.log(data.exp_designation_refno);
      console.log(data.exp_branch_refno);
      setEmployeeListstatus(true);
      FetchEmployeeList(
        data.myemployee_refno,
        data.exp_designation_refno,
        data.exp_branch_refno,
        data.pck_custom_category_refno,
      );
    }
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
            setEntryTypeFullData(response.data.data);
            const entryTypeData = response.data.data.map(
              data => data.pck_entrytype_name,
            );
            setEntryTypeData(entryTypeData);

            if (response.data.data.length == 1) {
              setEntryType(response.data.data[0].pck_entrytype_name);
              setEntryTypeDisable(true);
              setPktEntryTypeID(response.data.data[0].pck_entrytype_refno);
              _pktEntryTypeID = response.data.data[0].pck_entrytype_refno;
              setEntryTypeStatus(false);
            } else {
              if (route.params.type !== 'verify') {
                setEntryTypeDisable(false);
              }

              setEntryTypeStatus(true);

              if (route.params.type === 'add') {
                setEntryType(
                  response.data.data[route.params.tabIndex].pck_entrytype_name,
                );
                setPktEntryTypeID(
                  response.data.data[route.params.tabIndex].pck_entrytype_refno,
                );
                _pktEntryTypeID =
                  response.data.data[route.params.tabIndex].pck_entrytype_refno;
              }
            }

            if (route.params.type != 'edit' || route.params.type != 'verify') {
              FetchPaymentMode();
            }
          }
        }
      })
      .catch(e => { });
  };

  const FetchPaymentMode = editID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_transtype_refno: 2,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.get_pckpaymentmodetype,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setPayModeFullData(response.data.data);
            const receiptMode = response.data.data.map(
              data => data.pckModeName,
            );
            setPayModeData(receiptMode);
            if (editID != '') {
              setPayMode(
                response.data.data.filter(el => {
                  return el.pckModeID == editID;
                })[0].pckModeName,
              );
            }

            if (editID == 1) {
              if (route?.params?.type !== 'ptc') {
                setCashBalanceStatus(true);
                FetchAvailableCashBalance();
              }
            } else {
              setCashBalanceStatus(false);
              setCashBalance(0);
            }
          }
        }
      })
      .catch(e => { });
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
            response.data.data = APIConverter(response.data.data);
            setClientListFullData(response.data.data);

            const clientList = response.data.data.map(data => data.companyName);
            setClientListData(clientList);

            if (clientID != null) {
              setClientList(
                response.data.data.filter(el => {
                  return el.myclient_refno === clientID;
                })[0].companyName,
              );
            }
          }
        }
      })
      .catch(e => { });
  };

  const FetchMKTClientList = clientID => {
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
            response.data.data = APIConverter(response.data.data);
            setMKT_ClientListFullData(response.data.data);

            const clientList = response.data.data.map(data => data.companyName);
            setMKT_ClientListData(clientList);

            if (clientID != null) {
              setMKT_ClientList(
                response.data.data.filter(el => {
                  return el.myclient_refno === clientID;
                })[0].companyName,
              );
            }
          }
        }
      })
      .catch(e => { });
  };

  const FetchFollowUpCustomerList = editID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        Sess_group_refno: groupID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getfollowupcustomerlist_pckaddexpensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let custData = [];
            response.data.data.map(data => {
              custData.push({
                company_name: data.company_name,
                contact_person: data.contact_person,
                mycustomer_refno: data.mycustomer_refno,
                displayName:
                  data.contact_person == '' || data.contact_person == null
                    ? data.company_name
                    : data.contact_person + ' (' + data.company_name + ')',
              });
            });

            setFollowupFullData(custData);

            const customer = custData.map(data => data.displayName);
            setFollowupData(customer);
            setFollowupStatus(true);
            if (editID != null) {
              setFollowup(
                custData.filter(el => {
                  return el.mycustomer_refno === editID;
                })[0].displayName,
              );
            }
          }
        }
      })
      .catch(e => { });
  };

  const FetchPurposeList = editID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        Sess_group_refno: groupID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getpurposeofvisit_pckaddexpensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setPurposeFullData(response.data.data);

            const purpose = response.data.data.map(data => data.activity_name);
            setPurposeData(purpose);

            if (editID != null) {
              setPurpose(
                response.data.data.filter(el => {
                  return el.activity_refno === editID;
                })[0].activity_name,
              );
            }
          }
        }
      })
      .catch(e => { });
  };

  const FetchExpenseCategory = (receiptModeID, editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        pck_mode_refno: receiptModeID,
        pck_entrytype_refno: _pktEntryTypeID,
        Sess_group_refno_extra_1: groupExtraID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getcategoryname_pckaddexpensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setExpensesFullData(response.data.data);
            const category = response.data.data.map(data => data.categoryName);
            setExpensesData(category);

            if (editID != null) {
              setExpenses(
                response.data.data.filter(el => {
                  return el.pckCategoryID === editID;
                })[0].categoryName,
              );
            }
          }
        }
      })
      .catch(e => { });
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
            response.data.data = APIConverter(response.data.data);
            setContactTypeFullData(response.data.data);
            const ct = response.data.data.map(
              data => data.pck_contacttype_name,
            );
            setContactTypeData(ct);

            if (editID != null) {
              setContactType(
                response.data.data.filter(el => {
                  return el.pck_contacttype_refno == editID;
                })[0].pck_contacttype_name,
              );
            }
          }
        }
      })
      .catch(e => { });
  };

  const FetchExpenseSubCategory = (categoryID, editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        pck_category_refno: categoryID,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getsubcategoryname_pckaddexpensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data, 'pkt_subcat');
            setSubCategoryNameFullData(response.data.data);
            const subCategory = response.data.data.map(
              data => data.subCategoryName,
            );
            setSubCategoryNameData(subCategory);

            if (editID != null) {
              setSubCategoryName(
                response.data.data.filter(el => {
                  return el.subcategoryID === editID;
                })[0].subCategoryName,
              );
            }
          }
        }
      })
      .catch(e => { });
  };

  const FetchProjectExpense = (categoryID, editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        pck_category_refno: categoryID,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getsubcategoryname_pckaddexpensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data, 'pkt_subcat');
            setProjectExpenseFullData(response.data.data);
            if (
              route.params.type !=
              projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText &&
              route.params.type != 'verify'
            ) {
              response.data.data = response.data.data.filter(el => {
                return (
                  el.subcategoryID !=
                  projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_REFNO
                );
              });
              setProjectExpenseDisable(false);
            } else {
              if (
                route.params.type ==
                projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
              ) {
                response.data.data = response.data.data.filter(el => {
                  return (
                    el.subcategoryID ==
                    projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_REFNO
                  );
                });
              }
            }
            const subCategory = response.data.data.map(
              data => data.subCategoryName,
            );
            setProjectExpenseData(subCategory);

            if (
              route.params.type ==
              projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
            ) {
              setProjectExpense(
                response.data.data.filter(el => {
                  return (
                    el.subcategoryID ===
                    projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_REFNO
                  );
                })[0].subCategoryName,
              );
              setProjectExpenseDisable(true);
            }

            if (editID != null) {
              setProjectExpense(
                response.data.data.filter(el => {
                  return el.subcategoryID === editID;
                })[0].subCategoryName,
              );

              if (
                editID ==
                projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_REFNO
              ) {
                setProjectExpenseDisable(true);
              }
            }
          }
        }
      })
      .catch(e => { });
  };

  const FetchBankList = (editID, mode) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        Sess_group_refno: groupID.toString(),
        Sess_designation_refno: designID.toString(),
        pck_entrytype_refno: _pktEntryTypeID,
        pck_transtype_refno:
          projectVariables.DEF_PCKDIARY_TRANSTYPE_EXPENSES_REFNO,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckmybankname, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data, 'pkt_subcat');
            let bankData = [];
            response.data.data.map(data => {
              bankData.push({
                accountNumber: data.accountNumber,
                bankName: data.bankName,
                bank_refno: data.bank_refno,
                displayBank: data.bankName + ' (' + data.accountNumber + ')',
              });
            });

            setMyBankFullData(bankData);

            const bank = bankData.map(data => data.displayBank);
            setMyBankData(bank);

            if (editID != null) {
              setMyBank(
                bankData.filter(el => {
                  return el.bank_refno === editID;
                })[0].displayBank,
              );
            }

            if (mode == 2 || mode == 3 || mode == 4) {
              setBankBalanceStatus(true);
              FetchBankCurrentBalance(editID);
            } else {
              setBankBalanceStatus(false);
              setBankBalance(0);
            }
          }
        }
      })
      .catch(e => { });
  };

  const FetchAvailableCashBalance = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID.toString(),
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        pck_entrytype_refno: _pktEntryTypeID,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.get_availablebalance_cashinhand_expensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setCashBalance(response.data.data[0].cashinhand.toString());
            let amt = amount == '' ? 0 : parseFloat(amount);
            let cashAmt =
              response.data.data[0].cashinhand == ''
                ? 0
                : parseFloat(response.data.data[0].cashinhand);
            if (amt > cashAmt) {
              settAmount('');
              setSnackbarText(
                'Your entered amount is greater than for available balance.',
              );
              setSnackbarColor(theme.colors.error);
              setSnackbarVisible(true);
            }
          }
        }
      })
      .catch(e => { });
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
            setBankBalance(response.data.data[0].cashinbank.toString());

            let amt = amount == '' ? 0 : parseFloat(amount);
            let bankAmt =
              response.data.data[0].cashinbank == ''
                ? 0
                : parseFloat(response.data.data[0].cashinbank);

            if (amt > bankAmt) {
              settAmount('');
              setSnackbarText(
                'Your entered amount is greater than for available balance.',
              );
              setSnackbarColor(theme.colors.error);
              setSnackbarVisible(true);
            }
          }
        }
      })
      .catch(e => { });
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
            response.data.data = APIConverter(response.data.data, 'pkt_subcat');
            setDepositeTypeFullData(response.data.data);
            const depostiType = response.data.data.map(
              data => data.deposit_type_name,
            );
            setDepositeTypeData(depostiType);

            if (editID != null) {
              setDepositeType(
                response.data.data.filter(el => {
                  return el.deposit_type_refno == editID;
                })[0].deposit_type_name,
              );
            }
          }
        }
      })
      .catch(e => { });
  };

  const FetchReceiverList = (
    editID,
    contactName,
    subCategoryID,
    contactTypeID,
  ) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_sub_category_refno: subCategoryID?.toString(),
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
            response.data.data = APIConverter(response.data.data, 'pkt_subcat');

            setPaidToFullData(response.data.data);

            const receiverList = response.data.data.map(
              data => data.contactName,
            );
            setPaidToData(receiverList);

            if (editID != null) {
              setPaidTo(
                response.data.data.filter(el => {
                  return el.mycontactID === editID;
                })[0].contactName,
              );
            }

            if (contactName != null && contactName != '') {
              setPaidTo(
                response.data.data.filter(el => {
                  return el.contactName === contactName;
                })[0].contactName,
              );
            }
          }
        }
      })
      .catch(e => { });
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
            setCardTypeFullData(response.data.data);
            const cardType = response.data.data.map(data => data.cardtype_name);
            setCardTypeData(cardType);

            if (editID != '') {
              setCardType(
                response.data.data.filter(el => {
                  return el.cardtype_refno == editID;
                })[0].cardtype_name,
              );
            }
          }
        }
      })
      .catch(e => { });
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
            response.data.data = APIConverter(response.data.data, 'pkt_subcat');
            setCardBankFullData(response.data.data);

            const bank = response.data.data.map(data => data.bankName);
            setCardBankData(bank);

            if (editID != null) {
              setCardBank(
                response.data.data.filter(el => {
                  return el.bank_refno === editID;
                })[0].bankName,
              );
            }
          }
        }
      })
      .catch(e => { });
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
        console.log(response.data);
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);

            setProjectListFullData(response.data.data);

            const projectList = response.data.data.map(
              data => data.project_name,
            );
            setProjectListData(projectList);
            setProjectListstatus(true);
            if (editID != null) {
              setProjectList(
                response.data.data.filter(el => {
                  return el.cont_project_refno == editID;
                })[0].project_name,
              );
            }
          }
        }
      })
      .catch(e => { });
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
            let listData = [];
            response.data.data.map(data => {
              listData.push({
                exp_branch_refno: data.exp_branch_refno,
                location_name: data.location_name,
                locationtype_name: data.locationtype_name,
                displayName:
                  data.location_name + ' >> ' + data.locationtype_name,
              });
            });

            setBranchFullData(listData);

            const branch = listData.map(data => data.displayName);

            setBranchData(branch);
            if (editID != null) {
              setBranch(
                listData.filter(el => {
                  return el.exp_branch_refno === editID;
                })[0].displayName,
              );
            }
          }
        }
      })
      .catch(e => { });
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
            setDesignationFullData(response.data.data);

            const designation = response.data.data.map(
              data => data.designation_name,
            );

            setDesignationData(designation);

            if (editID != null) {
              setDesignation(
                response.data.data.filter(el => {
                  return el.designation_refno === editID;
                })[0].designation_name,
              );
            }
          }
        }
      })
      .catch(e => { });
  };

  const FetchEmployeeList = (
    editID,
    designationID = '0',
    branchID2 = '0',
    catID = expenseToFullData.find(i => i.category_name == expenseTo)
      ?.pck_custom_category_refno,
  ) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        exp_designation_refno: designationID.toString(),
        exp_branch_refno: branchID2,
        pck_custom_category_refno: catID,
      },
    };
    console.log(expenseToFullData);
    console.log(params);
    Provider.createDFPocketDairy(
      Provider.API_URLS.getemployeelist_pckaddexpensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let listData = [];
            response.data.data.map(data => {
              listData.push({
                myemployee_refno: data.myemployee_refno,
                employee_name: data.employee_name,
                employee_code: data.employee_code,
                displayName: data.employee_name + ' / ' + data.employee_code,
              });
            });

            setEmployeeFullData(listData);

            const employee = listData.map(data => data.displayName);

            setEmployeeData(employee);

            if (editID != null) {
              setEmployee(
                listData.filter(el => {
                  return el.myemployee_refno === editID;
                })[0].displayName,
              );
            }
          }
        }
      })
      .catch(e => { });
  };

  const FetchUsageList = (editID, categoryID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        pck_category_refno: categoryID,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getsubcategoryname_pckaddexpensesform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data, 'pkt_subcat');
            setUsageFullData(response.data.data);
            const subCategory = response.data.data.map(
              data => data.subCategoryName,
            );
            setUsageData(subCategory);

            if (editID != null) {
              setUsage(
                response.data.data.filter(el => {
                  return el.subcategoryID === editID;
                })[0].subCategoryName,
              );
            }
          }
        }
      })
      .catch(e => { });
  };

  const ShowContactList = () => {
    setIsContactLoading(true);
    (async () => {
      const { status } = await Contacts.requestPermission();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        if (data.length > 0) {
          const arrPhones = [],
            arrNumbers = [],
            arrDisplayNumbers = [];
          data.map((k, i) => {
            // if (i < 100) {
            if (Array.isArray(k.phoneNumbers)) {
              arrPhones.push(k);
              if (k.phoneNumbers.length > 1) {
                if (k.phoneNumbers[0].number != null) {
                  arrNumbers.push(
                    k.phoneNumbers[0].number == ''
                      ? ''
                      : k.phoneNumbers[0].number
                        .replace(/\s+/g, '')
                        .replace(/[^0-9]/g, '').length <= 10
                        ? k.phoneNumbers[0].number
                          .replace(/\s+/g, '')
                          .replace(/[^0-9]/g, '')
                        : k.phoneNumbers[0].number
                          .replace(/\s+/g, '')
                          .replace(/[^0-9]/g, '')
                          .slice(-10),
                  );
                  arrDisplayNumbers.push(k.phoneNumbers[0].number);
                }
              } else {
                if (k.phoneNumbers.number != null) {
                  arrNumbers.push(
                    k.phoneNumbers.number == ''
                      ? ''
                      : k.phoneNumbers.number
                        .replace(/\s+/g, '')
                        .replace(/[^0-9]/g, '').length <= 10
                        ? k.phoneNumbers.number
                          .replace(/\s+/g, '')
                          .replace(/[^0-9]/g, '')
                        : k.phoneNumbers.number
                          .replace(/\s+/g, '')
                          .replace(/[^0-9]/g, '')
                          .slice(-10),
                  );
                  arrDisplayNumbers.push(k.phoneNumbers.number);
                }
              }
            }
            // }
          });
          let obj = {};
          arrNumbers.map((key, index) => (obj[key] = arrDisplayNumbers[index]));
          CheckContactList(obj, arrPhones);
        }
      }
    })();
  };

  const PhoneClicked = contact => {
    if (contact != null) {
      InsertNewContact(contact.name, contact.number);
    }
  };

  const CheckContactList = (contactList, originalList) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_sub_category_refno: '0',
        pck_contacttype_refno: '0',
        AddNew: 'YES',
        UserPhoneBookAllContactList: contactList,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckmycontactname, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            var margedList = [];
            let ct = 0;
            if (contactTypeStatus) {
              ct = contactTypeFullData.filter(el => {
                return el.pck_contacttype_name === contactType;
              })[0].pck_contacttype_refno;
            }

            originalList.map(data => {
              let n = response.data.data.find(el => {
                return el.Actual_no === data.phoneNumbers[0].number;
              });

              if (n != null) {
                if (ct == 1 && n.Is_SamadhanUser == 1) {
                  margedList.push({
                    name: data.name,
                    number: data.phoneNumbers[0].number,
                    Is_MyContactList: n.Is_MyContactList,
                    Is_SamadhanUser: n.Is_SamadhanUser,
                  });
                } else if (ct == 2 && n.Is_SamadhanUser == 0) {
                  margedList.push({
                    name: data.name,
                    number: data.phoneNumbers[0].number,
                    Is_MyContactList: n.Is_MyContactList,
                    Is_SamadhanUser: n.Is_SamadhanUser,
                  });
                }
              }
            });

            setIsContactLoading(false);
            navigation.navigate('PhoneContactDirectUpload', {
              phoneNumbers: margedList,
              callback: PhoneClicked,
            });
          }
        }
      })
      .catch(e => { });
  };

  const FetchExpenseTo = (editID, subcategoryID) => {
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
            setExpenseToFullData(response.data.data);
            const expenseTo = response.data.data.map(
              data => data.category_name,
            );
            setExpenseToData(expenseTo);

            if (editID != null) {
              setExpenseToName(
                response.data.data.filter(el => {
                  return el.pck_custom_category_refno == editID;
                })[0].category_name,
              );
            }
          }
        }
      })
      .catch(e => { });
  };

  const InsertNewContact = (name, mobileNo) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        contact_name: name,
        contact_phoneno:
          mobileNo.length > 10
            ? mobileNo
              .replace(/\s+/g, '')
              .replace(/[^0-9]/g, '')
              .slice(-10)
            : mobileNo,
        remarks: '',
        view_status: '1',
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.pckmycontactscreate, params)
      .then(response => {
        setIsContactLoading(false);
        if (response.data && response.data.code === 200) {
          let subcatID = 0,
            ct = 0;
          if (subCatStatus) {
            subcatID = subCategoryNameFullData.filter(el => {
              return el.subCategoryName === subCategoryName;
            })[0].subcategoryID;
          }
          if (contactTypeStatus) {
            ct = contactTypeFullData.filter(el => {
              return el.pck_contacttype_name === contactType;
            })[0].pck_contacttype_refno;
          }

          FetchReceiverList(null, name, subcatID, ct);
          setSnackbarText('New Contact Added');
          setSnackbarColor(theme.colors.success);
          setSnackbarVisible(true);
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.InsertError);
          setSnackbarVisible(true);
        }
      })
      .catch(e => {
        console.log(e);
        setIsContactLoading(false);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const onPayModeChanged = text => {
    if (text !== 'Card') {
      setCardTypeStatus(false);
      setCardBankNameStatus(false);
    }
    setPayMode(text);
    setPMError(false);
    resetFields();

    setExpensesData([]);
    setExpenses('');

    setSubCategoryNameData([]);
    setSubCategoryName('');

    let a = payModeFullData.filter(el => {
      return el.pckModeName === text;
    });
    FetchExpenseCategory(a[0].pckModeID);

    if (a[0].pckModeID == 5) {
      setCardTypeStatus(true);
      FetchCardType();
    }

    if (a[0].pckModeID == 1) {
      if (route?.params?.type !== 'ptc') {
        setCashBalanceStatus(true);
        FetchAvailableCashBalance();
      }
    } else {
      setCashBalanceStatus(false);
      setCashBalance(0);
    }
  };

  const onNewContactChange = text => {
    setContactName(text);
  };

  const onMobileNoChange = text => {
    setMobileNumber(text);
  };

  const onContactTypeDataChanged = text => {
    setContactType(text);
    setErrorContactType(false);

    setPaidToFullData([]);
    setPaidToData([]);
    setPaidTo([]);

    setSCNError(false);
    setCommonDisplayStatus(true);
    setButtonStatus(false);

    let contact = contactTypeFullData.filter(el => {
      return el.pck_contacttype_name === text;
    });

    let mode = payModeFullData.filter(el => {
      return el.pckModeName === payMode;
    });

    let category = expensesFullData.filter(el => {
      return el.categoryName === expenses;
    });

    let subcat = subCategoryNameFullData.filter(el => {
      return el.subCategoryName === subCategoryName;
    });

    FetchReceiverList(null, null, 0, contact[0].pck_contacttype_refno);

    if (contact[0].pck_contacttype_refno == 3) {
      setNewMobileNumberStatus(true);
      setNewContactNameStatus(true);
      setPaidToStatus(false);
    } else {
      setNewMobileNumberStatus(false);
      setNewContactNameStatus(false);
      setPaidToStatus(true);
    }

    if (category[0]?.pckCategoryID == 4) {
      setRecurringReminderDateStatus(true);
      setRecurringStatus(true);
    } else {
      setRecurringReminderDateStatus(false);
      setRecurringStatus(false);
    }

    if (mode[0].pckModeID == '2' || mode[0].pckModeID == '4') {
      setBankStatus(true);
      FetchBankList();
      setUtrNoStatus(true);
    }
    if (mode[0].pckModeID == '3') {
      setDepositTypeStatus(true);
      FetchDepositType();
    }
  };

  const onProjectExpenseChanged = text => {
    setProjectExpense(text);
    setErrorPE(false);
  };

  const onProjectListChanged = text => {
    setProjectList(text);
    setErrorPL(false);

    setCommonDisplayStatus(true);
    setButtonStatus(false);

    let mode = payModeFullData.filter(el => {
      return el.pckModeName === payMode;
    });

    let a = expensesFullData.filter(el => {
      return el.categoryName === expenses;
    });

    if (
      a[0].pckCategoryID == projectVariables.DEF_PCKDIARY_CATEGORY_Clients_REFNO
    ) {
      if (route?.params?.type !== 'ptc') {
        setProjectExpenseStatus(true);
        FetchProjectExpense(a[0].pckCategoryID);
      }
    }

    if (
      mode[0].pckModeID == projectVariables.DEF_PCKDIARY_MODE_Upi_REFNO ||
      mode[0].pckModeID == projectVariables.DEF_PCKDIARY_MODE_RtgsNeft_REFNO
    ) {
      FetchBankList();
      setBankStatus(true);
      setUtrNoStatus(true);
    } else if (
      mode[0].pckModeID == projectVariables.DEF_PCKDIARY_MODE_Cheque_REFNO
    ) {
      setDepositTypeStatus(true);
      FetchDepositType();
    }
  };

  const onBranchListChanged = text => {
    setBranch(text);
    setErrorBR(false);

    setEmployeeData([]);
    setEmployee('');

    setDesignationData([]);
    setDesignation('');

    setDesignationListstatus(true);
    FetchDesignationList();
  };

  const onDesignationListChanged = text => {
    setDesignation(text);
    setErrorDesg(false);

    setEmployeeData([]);
    setEmployee('');

    let d = designationFullData.filter(el => {
      return el.designation_name === text;
    });
    let b = branchFullData.filter(el => {
      return el.displayName === branch;
    });
    setEmployeeListstatus(true);
    FetchEmployeeList(null, d[0].designation_refno, b[0].exp_branch_refno);
  };

  const onEmployeeListChanged = text => {
    setEmployee(text);
    setErrorEmp(false);

    let category = expensesFullData.filter(el => {
      return el.categoryName === expenses;
    });

    setUsageListstatus(true);
    FetchUsageList(null, category[0]?.pckCategoryID);

    setCommonDisplayStatus(true);
    setButtonStatus(false);

    let mode = payModeFullData.filter(el => {
      return el.pckModeName === payMode;
    });

    let a = expensesFullData.filter(el => {
      return el.categoryName === expenses;
    });

    if (
      a[0].pckCategoryID == projectVariables.DEF_PCKDIARY_CATEGORY_Clients_REFNO
    ) {
      FetchProjectExpense(a[0].pckCategoryID);
    }

    if (
      mode[0].pckModeID == projectVariables.DEF_PCKDIARY_MODE_Upi_REFNO ||
      mode[0].pckModeID == projectVariables.DEF_PCKDIARY_MODE_RtgsNeft_REFNO
    ) {
      FetchBankList();
      setBankStatus(true);
      setUtrNoStatus(true);
    } else if (
      mode[0].pckModeID == projectVariables.DEF_PCKDIARY_MODE_Cheque_REFNO
    ) {
      setDepositTypeStatus(true);
      FetchDepositType();
    }
  };

  const onPerticularListChanged = text => {
    setUsage(text);
    setErrorUsage(false);
  };

  const onExpensesChanged = text => {
    setExpenses(text);
    setEXError(false);
    resetFields_Level_1();
    setEmployeeListstatus(false);
    setSubCategoryNameData([]);
    setSubCategoryName('');

    let a = expensesFullData.filter(el => {
      return el.categoryName === text;
    });

    if (
      a[0].pckCategoryID == projectVariables.DEF_PCKDIARY_CATEGORY_Clients_REFNO
    ) {
      setSubCatStatus(false);
      setClientListstatus(true);
      FetchClientList();
    } else if (
      a[0].pckCategoryID == projectVariables.DEF_PCKDIARY_CATEGORY_Branch_REFNO
    ) {
      setBranchListstatus(true);
      setSubCatStatus(false);
      FetchBranchList();
    } else if (a[0].pckCategoryID == 4) {
      setSubCatStatus(false);
      setContactTypeStatus(true);
      FetchContactType();
    } else {
      setSubCatStatus(true);
      setClientListstatus(false);
      FetchExpenseSubCategory(a[0].pckCategoryID);
    }
  };

  const onCardTypeChanged = text => {
    setCardType(text);
    setCTError(false);
    setCardBankNameStatus(true);
    setCardBank('');
    setCardBankFullData([]);
    setCardBankData([]);
    let cardID = cardTypeFullData.filter(el => {
      return el.cardtype_name === text;
    })[0].cardtype_refno;

    FetchCardBankList(cardID);

    if (cardID == 2) {
      setCardRepaymentDateStatus(true);
    } else {
      setCardRepaymentDateStatus(false);
    }
  };

  const onCardBankNameChanged = text => {
    setCardBank(text);
    setCBError(false);
  };

  const onSubCategoryNameChanged = text => {
    setSubCategoryName(text);
    setSCNError(false);

    if (
      _pktEntryTypeID ==
      projectVariables.DEF_PCKDIARY_ENTRYTYPE_COMPANY_REFNO ||
      entryType == 'Company'
    ) {
      setExpenseToStatus(true);
      FetchExpenseTo(
        0,
        subCategoryNameFullData.filter(el => {
          return el.subCategoryName === text;
        })[0].subcategoryID,
      );
    } else {
      setExpenseToStatus(false);
      setCommonDisplayStatus(true);
      setButtonStatus(false);

      let mode = payModeFullData.filter(el => {
        return el.pckModeName === payMode;
      });

      let subcat = subCategoryNameFullData.filter(el => {
        return el.subCategoryName === text;
      });

      let deposit = depositeTypeFullData.filter(el => {
        return el.deposit_type_name === depositeType;
      });

      if (mode[0].pckModeID == '1') {
        if (subcat[0].subcategoryID == '8') {
          setPaidToStatus(true);
          setContactTypeStatus(true);
          FetchContactType();

          setRecurringStatus(true);
          setRecurringReminderDateStatus(true);
        } else {
          setPaidToStatus(false);
          setRecurringStatus(false);
          setRecurringReminderDateStatus(false);
        }
      } else if (mode[0].pckModeID == '2' || mode[0].pckModeID == '4') {
        FetchBankList();
        setUtrNoStatus(true);
        setBankStatus(true);

        if (subcat[0].subcategoryID == '8') {
          setRecurringStatus(true);
          setRecurringReminderDateStatus(true);
        } else {
          setRecurringStatus(false);
          setRecurringReminderDateStatus(false);
        }
      } else if (mode[0].pckModeID == '3') {
        setDepositTypeStatus(true);
        FetchDepositType();

        if (subcat[0].subcategoryID == '8') {
          setRecurringStatus(true);
          setRecurringReminderDateStatus(true);
        } else {
          setRecurringStatus(false);
          setRecurringReminderDateStatus(false);
        }
      }
    }
  };

  const onFollowupChanged = text => {
    setFollowup(text);
    setFollowupError(false);
    setPurposeStatus(true);
    FetchPurposeList();
  };

  const displayCommonFields_MKT = () => {
    setCommonDisplayStatus(true);
    setButtonStatus(false);

    let mode = payModeFullData.filter(el => {
      return el.pckModeName === payMode;
    });

    let category = expensesFullData.filter(el => {
      return el.categoryName === expenses;
    });

    if (category[0]?.pckCategoryID == 4) {
      setRecurringReminderDateStatus(true);
      setRecurringStatus(true);
    } else {
      setRecurringReminderDateStatus(false);
      setRecurringStatus(false);
    }

    if (mode[0].pckModeID == '2' || mode[0].pckModeID == '4') {
      setBankStatus(true);
      FetchBankList();
      setUtrNoStatus(true);
    }
    if (mode[0].pckModeID == '3') {
      setDepositTypeStatus(true);
      FetchDepositType();
    }
  };

  const onPurposeChanged = text => {
    setPurpose(text);
    setPurposeError(false);
    displayCommonFields_MKT();
  };

  const onExpenseToChanged = text => {
    // if (text === expenseTo) {
    //   return;
    // }
    if (text === 'Branch') {
      console.log('here');
      setBranchListstatus(true);
      setEmployeeListstatus(false);
      FetchBranchList();
    } else if (text === 'Employee') {
      console.log('here2');
      setEmployeeListstatus(true);
      FetchEmployeeList(
        null,
        '0',
        '0',
        expenseToFullData.find(i => i.category_name == text)
          ?.pck_custom_category_refno,
      );
      // setBranchListstatus(true);
      // setSubCatStatus(false);
      // FetchBranchList();
    } else {
      setEmployeeListstatus(false);
    }
    setClientList('');
    setClientListData([]);
    setClientListFullData([]);

    setMKT_ClientList('');
    setMKT_ClientListData([]);
    setMKT_ClientListFullData([]);

    setProjectListstatus(false);
    setProjectListData([]);
    setProjectListFullData([]);
    setProjectList('');

    setExpenseToName(text);
    setExpenseToError(false);
    setPurposeStatus(false);

    let category = expenseToFullData.filter(el => {
      return el.category_name === text;
    });

    if (
      category[0].pck_custom_category_refno ==
      projectVariables.DEF_PCKDIARY_CATEGORY_Clients_REFNO
    ) {
      setMKT_ClientListstatus(true);
      setFollowupStatus(false);
      FetchMKTClientList();
    } else {
      setMKT_ClientListstatus(false);
      FetchFollowUpCustomerList();
      displayCommonFields_MKT();
    }
  };

  const onDepositeTypeChanged = text => {
    console.log('started deposit');
    setDepositeType(text);
    setDTError(false);

    let mode = payModeFullData.filter(el => {
      return el.pckModeName === payMode;
    });

    let subcat = subCategoryNameFullData.filter(el => {
      return el.subCategoryName === subCategoryName;
    });

    let deposit = depositeTypeFullData.filter(el => {
      return el.deposit_type_name === text;
    });

    FetchBankList();
    setBankStatus(true);
    setChequeNoStatus(true);
    setChequeDateStatus(true);

    if (mode[0].pckModeID == '3' && subCatStatus) {
      if (subcat[0].subcategoryID == '8') {
        setPaidToStatus(true);

        if (
          groupID != projectLoginTypes.DEF_EMPLOYEE_GROUP_REFNO &&
          designID !=
          projectFixedDesignations.DEF_MARKETINGEXECUTIVE_DESIGNATION_REFNO
        ) {
          FetchReceiverList();
        }

        setRecurringStatus(true);
        setRecurringReminderDateStatus(true);
      } else {
        setPaidToStatus(false);

        if (
          groupID != projectLoginTypes.DEF_EMPLOYEE_GROUP_REFNO &&
          designID !=
          projectFixedDesignations.DEF_MARKETINGEXECUTIVE_DESIGNATION_REFNO
        ) {
          FetchReceiverList();
        }

        setRecurringStatus(false);
        setRecurringReminderDateStatus(false);
      }
    }
  };

  const resetFields_Level_1 = () => {
    setPaidToStatus(false);
    setRecurringStatus(false);
    setRecurringReminderDateStatus(false);
    setDepositTypeStatus(false);
    setBankStatus(false);
    setUtrNoStatus(false);
    setChequeNoStatus(false);
    setChequeDateStatus(false);
    setCommonDisplayStatus(false);
    setButtonStatus(true);
    setrecurringDateFlag('1');
    setSubCatStatus(true);
    setContactTypeStatus(false);
    setNewContactNameStatus(false);
    setNewMobileNumberStatus(false);

    setContactTypeData([]);
    setContactType('');

    setPaidToData([]);
    setPaidTo('');

    setBankBalanceStatus(false);
    setBankBalance('');

    setMyBankData([]);
    setMyBank('');

    setBranchListstatus(false);
    setBranchData([]);
    setBranch('');

    setDesignationListstatus(false);
    setDesignationData([]);
    setDesignation('');

    setEmployeeListstatus(false);
    setEmployeeData([]);
    setEmployee('');

    setUsageListstatus(false);
    setUsageData([]);
    setUsage('');

    setProjectListstatus(false);
    setProjectListData([]);
    setProjectList('');

    setClientListstatus(false);
    setClientListData([]);
    setClientList('');

    setProjectExpenseStatus(false);
    setProjectExpenseData([]);
    setProjectExpense('');
  };

  const resetFields = () => {
    setCardTypeStatus(false);
    setCardBankNameStatus(false);
    setCardRepaymentDateStatus(false);
    setPaidToStatus(false);
    setRecurringStatus(false);
    setRecurringReminderDateStatus(false);
    setDepositTypeStatus(false);
    setBankStatus(false);
    setUtrNoStatus(false);
    setChequeNoStatus(false);
    setChequeDateStatus(false);
    setCommonDisplayStatus(false);
    setButtonStatus(true);
    setrecurringDateFlag('1');
    setSubCatStatus(true);
    setContactTypeStatus(false);
    setNewContactNameStatus(false);
    setNewMobileNumberStatus(false);

    setContactTypeData([]);
    setContactType('');

    setPaidToData([]);
    setPaidTo('');

    setBankBalanceStatus(false);
    setBankBalance('');

    setCashBalanceStatus(false);
    setCashBalance('');

    setMyBankData([]);
    setMyBank('');

    setBranchListstatus(false);
    setBranchData([]);
    setBranch('');

    setDesignationListstatus(false);
    setDesignationData([]);
    setDesignation('');

    setEmployeeListstatus(false);
    setEmployeeData([]);
    setEmployee('');

    setUsageListstatus(false);
    setUsageData([]);
    setUsage('');

    setProjectListstatus(false);
    setProjectListData([]);
    setProjectList('');

    setClientListstatus(false);
    setClientListData([]);
    setClientList('');

    setProjectExpenseStatus(false);
    setProjectExpenseData([]);
    setProjectExpense('');

    setExpenseToStatus(false);
    setExpenseToFullData([]);
    setExpenseToData([]);
    setExpenseToName('');
    setExpenseToError(false);

    setMKT_ClientListFullData([]);
    setMKT_ClientListData([]);
    setMKT_ClientList('');
    setErrorMKT_CL(false);
    setMKT_ClientListstatus(false);

    setFollowupFullData([]);
    setFollowupData([]);
    setFollowup('');
    setFollowupError(false);
    setFollowupStatus(false);

    setPurposeFullData([]);
    setPurposeData([]);
    setPurpose('');
    setPurposeError(false);
    setPurposeStatus(false);
  };

  const onEntryTypeChanged = selectedItem => {
    setEntryType(selectedItem);
    resetFields();

    setExpensesData([]);
    setExpenses('');

    setSubCategoryNameData([]);
    setSubCategoryName('');

    let a = entryTypeFullData.filter(el => {
      return el.pck_entrytype_name === selectedItem;
    });

    setPktEntryTypeID(a[0].pck_entrytype_refno);
    _pktEntryTypeID = a[0].pck_entrytype_refno;
  };

  const onAmount = tex => {
    const text = tex.replace(/[^0-9.]/g, '');
    const dotCount = text.split('.').length - 1;
    if (dotCount > 1) {
      return;
    }
    let mode = payModeFullData.filter(el => {
      return el.pckModeName === payMode;
    });

    if (mode.length > 0 && mode[0].pckModeID == 1 && cashBalanceStatus) {
      if (parseFloat(text) > parseFloat(cashBalance.replace(/,/g, ''))) {
        settAmount('');
        setAmountError(true);
        setAmountInvalidBalance('Amount can not be more then balance amount');
      } else {
        settAmount(text);
        setAmountError(false);
      }
    } else if (
      mode.length > 0 &&
      (mode[0].pckModeID == 2 ||
        mode[0].pckModeID == 3 ||
        mode[0].pckModeID == 4) &&
      bankBalanceStatus
    ) {
      if (parseFloat(text) > parseFloat(bankBalance.replace(/,/g, ''))) {
        settAmount('');
        setAmountError(true);
        setAmountInvalidBalance('Amount can not be more then balance amount');
      } else {
        settAmount(text);
        setAmountError(false);
      }
    } else {
      settAmount(text);
      setAmountError(false);
    }
  };

  const onChequeNO = tex => {
    const text = tex.replace(/[^a-zA-Z0-9]/g, '');
    setChequeNo(text);
    setChequeNoError(false);
  };

  const onUtrNo = tex => {
    const text = tex.replace(/[^a-zA-Z0-9]/g, '');
    setUtrNo(text);
    setUtrNoError(false);
  };

  const onNotes = text => {
    setNotes(text);
    setNotesError(false);
  };

  const onPaidToChanged = text => {
    setPaidTo(text);
    setPTError(false);
  };

  const onMyBankChanged = text => {
    setMyBank(text);
    setMBError(false);

    let mode = payModeFullData.filter(el => {
      return el.pckModeName === payMode;
    });

    if (
      mode[0].pckModeID == 2 ||
      mode[0].pckModeID == 3 ||
      mode[0].pckModeID == 4
    ) {
      setBankBalanceStatus(true);

      let bankID = myBankFullData.filter(el => {
        return el.displayBank === text;
      })[0].bank_refno;

      FetchBankCurrentBalance(bankID);
    } else {
      setBankBalanceStatus(false);
      setBankBalance(0);
    }
  };

  const onClientListChanged = text => {
    setClientList(text);
    setErrorCL(false);
    let a = clientListFullData.filter(el => {
      return el.companyName === text;
    });
    if (userID != 3) {
      setProjectListstatus(true);
    }
    setProjectListData([]);
    setProjectListFullData([]);
    setProjectList('');
    FetchProjectList(a[0].myclient_refno);
  };

  const onMKT_ClientListChanged = text => {
    setMKT_ClientList(text);
    setErrorMKT_CL(false);
    displayCommonFields_MKT();

    let a = MKT_clientListFullData.filter(el => {
      return el.companyName === text;
    });
    if (userID != 3) {
      setProjectListstatus(true);
    }
    setProjectListData([]);
    setProjectListFullData([]);
    setProjectList('');
    FetchProjectList(a[0].myclient_refno);
  };

  // const chooseFile = async () => {
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });
  //   if (!result.cancelled) {
  //     setDIError(false);
  //     const arrExt = result.uri.split(".");
  //     const unique_id = uuid.v4();
  //     setDesignImage(
  //       AWSImagePath + unique_id + "." + arrExt[arrExt.length - 1]
  //     );
  //     setImage(result.uri);
  //     setFilePath(result);
  //     if (route.params.type === "edit" || route.params.type === "verify") {
  //       setIsImageReplaced(true);
  //     }
  //   }
  // };

  const InsertData = () => {
    const datas = new FormData();
    let params = {
      Sess_UserRefno: userID,
      Sess_company_refno: companyID.toString(),
      Sess_branch_refno: branchID.toString(),
      Sess_group_refno: groupID.toString(),
      Sess_designation_refno: designID.toString(),
      pck_entrytype_refno: pktEntryTypeID,
      pck_transtype_refno: projectVariables.DEF_PCKDIARY_TRANSTYPE_EXPENSES_REFNO,

      pck_mode_refno: payModeFullData.filter(el => {
        return el.pckModeName === payMode;
      })[0]?.pckModeID,

      pck_category_refno: expensesFullData.filter(el => {
        return el.categoryName === expenses;
      })[0]?.pckCategoryID,
      amount: amount.trim(),
      notes: notes.trim(),
      view_status: checked ? '1' : '0',
    };

    if (subCatStatus) {
      params.pck_sub_category_refno = subCategoryNameFullData.filter(el => {
        return el.subCategoryName === subCategoryName;
      })[0].subcategoryID;
    }

    if (cardTypeStatus) {
      params.cardtype_refno = cardTypeFullData.filter(el => {
        return el.cardtype_name === cardType;
      })[0].cardtype_refno;
    }

    if (cardBankNameStatus) {
      params.pck_card_mybank_refno = cardBankFullData.filter(el => {
        return el.bankName === cardBank;
      })[0].bank_refno;
    }

    if (cardRepaymentDateStatus) {
      params.due_date =
        cardRepayment == '' ? '' : moment(cardRepayment).format('DD-MM-YYYY');
    }

    if (paidToStatus) {
      params.pck_mycontact_refno = paidToFullData.filter(el => {
        return el.contactName === paidTo;
      })[0].mycontactID;
    }

    if (bankStatus) {
      params.pck_mybank_refno = myBankFullData.filter(el => {
        return el.displayBank === MyBank;
      })[0].bank_refno;
    }

    if (utrNoStatus) {
      params.utr_no = utrNo == '' ? '' : utrNo.trim();
    }

    if (chequeNoStatus) {
      params.cheque_no = chequeNo == '' ? '' : chequeNo.trim();
    }

    if (depositTypeStatus) {
      params.deposit_type_refno = depositeTypeFullData.filter(el => {
        return el.deposit_type_name === depositeType;
      })[0].deposit_type_refno;
    }

    if (chequeDateStatus) {
      params.cheque_date =
        chequeDate == '' ? '' : moment(chequeDate).format('DD-MM-YYYY');
    }

    if (recurringReminderDateStatus) {
      params.reminder_date =
        recurringDate == '' ? '' : moment(recurringDate).format('DD-MM-YYYY');
    }

    if (recurringStatus) {
      params.recurring_status = recurringDateFlat;
    }

    if (
      _pktEntryTypeID == projectVariables.DEF_PCKDIARY_ENTRYTYPE_COMPANY_REFNO
    ) {
      if (MKT_clientListStatus) {
        params.myclient_refno = MKT_clientListFullData.filter(el => {
          return el.companyName === MKT_clientList;
        })[0].myclient_refno;
      }
    } else {
      if (clientListStatus) {
        params.myclient_refno = clientListFullData.filter(el => {
          return el.companyName === clientList;
        })[0].myclient_refno;
      }
    }

    if (expenseToStatus) {
      params.pck_custom_category_refno = expenseToFullData.filter(el => {
        return el.category_name === expenseTo;
      })[0].pck_custom_category_refno;
    }

    if (followupStatus) {
      params.mycustomer_refno = followupFullData.filter(el => {
        return el.displayName === followup;
      })[0].mycustomer_refno;
    } else {
      params.mycustomer_refno = '0';
    }

    if (purposeStatus) {
      params.activity_refno = purposeFullData.filter(el => {
        return el.activity_name === purpose;
      })[0].activity_refno;
    } else {
      params.activity_refno = '0';
    }

    if (projectListStatus) {
      params.cont_project_refno = projectListFullData.filter(el => {
        return el.project_name === projectList;
      })[0].cont_project_refno;
    }

    if (projectExpenseStatus) {
      params.dynamic_expenses_refno = projectExpenseFullData.filter(el => {
        return el.subCategoryName === projectExpense;
      })[0].subcategoryID;
    } else if (usageListStatus) {
      params.dynamic_expenses_refno = usageFullData.filter(el => {
        return el.subCategoryName === usage;
      })[0]?.subcategoryID;
    }

    if (
      route.params.type ===
      projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
    ) {
      params.pck_master_trans_refno = route.params.data.transactionID;
    }

    if (contactTypeStatus) {
      params.pck_contacttype_refno = contactTypeFullData.filter(el => {
        return el.pck_contacttype_name === contactType;
      })[0].pck_contacttype_refno;
    } else {
      params.pck_contacttype_refno = '0';
    }

    if (newContactNameStatus) {
      params.contact_name = contactName.trim() == '' ? '' : contactName.trim();
    }

    if (newMobileNumberStatus) {
      params.contact_phoneno =
        mobileNumber.trim() == '' ? '' : mobileNumber.trim();
    }

    if (branchListStatus) {
      params.exp_branch_refno = branchFullData.filter(el => {
        return el.displayName === branch;
      })[0].exp_branch_refno;
    }

    if (designationListStatus) {
      params.exp_designation_refno = designationFullData.filter(el => {
        return el.designation_name === designation;
      })[0].designation_refno;
    }

    if (employeeListStatus) {
      params.myemployee_refno = employeeFullData.filter(el => {
        return el.displayName === employee;
      })[0].myemployee_refno;
    }

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
    
    console.log('paramsinsert:', params);
    Provider.createDFPocketDairyWithHeader(
      Provider.API_URLS.pckadd_source_expenses_activity_create,
      datas,
    )
      .then(response => {
        console.log('resp:', response.data.data);
        setIsButtonLoading(false);
        if (response.data && response.data.code === 200) {
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
        console.log(e);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const UpdateData = (type, mode) => {
    const datas = new FormData();
    let params = {
      Sess_UserRefno: userID,
      Sess_company_refno: companyID.toString(),
      Sess_branch_refno: branchID.toString(),
      Sess_group_refno: groupID.toString(),
      Sess_designation_refno: designID.toString(),
      pck_trans_refno_edit: pckTransID,
      //pck_trans_refno: pckTransID,
      pck_transtype_refno: projectVariables.DEF_PCKDIARY_TRANSTYPE_EXPENSES_REFNO,
      pck_entrytype_refno: pktEntryTypeID,
      pck_mode_refno: payModeFullData
        .filter(el => {
          return el.pckModeName === payMode;
        })[0]
        .pckModeID.toString(),

      pck_category_refno: expensesFullData.filter(el => {
        return el.categoryName === expenses;
      })[0].pckCategoryID,

      amount: amount.trim(),
      notes: notes == '' ? '' : notes.trim(),
      pck_sub_category_refno: null,
      due_date: null,
      utr_no: null,
      cheque_no: null,
      deposit_type_refno: null,
      cheque_date: null,
      reminder_date: null,
      recurring_status: null,
      activity_refno: null,
      cont_project_refno: null,
      dynamic_expenses_refno: null,
      pck_master_trans_refno: null,
      exp_designation_refno: null,
      myemployee_refno: null,
      view_status: checked ? '1' : '0',
    };

    if (subCatStatus) {
      params.pck_sub_category_refno = subCategoryNameFullData.filter(el => {
        return el.subCategoryName === subCategoryName;
      })[0].subcategoryID;
    }

    if (cardTypeStatus) {
      params.cardtype_refno = cardTypeFullData.filter(el => {
        return el.cardtype_name === cardType;
      })[0].cardtype_refno;
    }

    if (cardBankNameStatus) {
      params.pck_card_mybank_refno = cardBankFullData.filter(el => {
        return el.bankName === cardBank;
      })[0].bank_refno;
    }

    if (cardRepaymentDateStatus) {
      params.due_date =
        cardRepayment == '' ? '' : moment(cardRepayment).format('DD-MM-YYYY');
    }

    if (paidToStatus) {
      params.pck_mycontact_refno = paidToFullData.filter(el => {
        return el.contactName === paidTo;
      })[0].mycontactID;
    }

    if (bankStatus) {
      params.pck_mybank_refno = myBankFullData.filter(el => {
        return el.displayBank === MyBank;
      })[0].bank_refno;
    }

    if (personalBankStatus && route.params.type === 'verify') {
      params.pck_mybank_refno = bankRefNo;
    }

    if (utrNoStatus) {
      params.utr_no = utrNo.trim();
    }

    if (chequeNoStatus) {
      params.cheque_no = chequeNo == '' ? '' : chequeNo.trim();
    }

    if (depositTypeStatus) {
      params.deposit_type_refno = depositeTypeFullData.filter(el => {
        return el.deposit_type_name === depositeType;
      })[0].deposit_type_refno;
    }

    if (chequeDateStatus) {
      params.cheque_date =
        chequeDate == '' ? '' : moment(chequeDate).format('DD-MM-YYYY');
    }

    if (recurringReminderDateStatus) {
      params.reminder_date =
        recurringDate == '' ? '' : moment(recurringDate).format('DD-MM-YYYY');
    }

    if (recurringStatus) {
      params.recurring_status = recurringDateFlat;
    }

    if (
      _pktEntryTypeID == projectVariables.DEF_PCKDIARY_ENTRYTYPE_COMPANY_REFNO
    ) {
      if (MKT_clientListStatus) {
        params.myclient_refno = MKT_clientListFullData.filter(el => {
          return el.companyName === MKT_clientList;
        })[0].myclient_refno;
      }
    } else {
      if (clientListStatus) {
        params.myclient_refno = clientListFullData.filter(el => {
          return el.companyName === clientList;
        })[0].myclient_refno;
      }
    }

    if (expenseToStatus) {
      params.pck_custom_category_refno = expenseToFullData.filter(el => {
        return el.category_name === expenseTo;
      })[0].pck_custom_category_refno;
    }

    if (followupStatus) {
      params.mycustomer_refno = followupFullData.filter(el => {
        return el.displayName === followup;
      })[0].mycustomer_refno;
    } else {
      params.mycustomer_refno = '0';
    }

    if (purposeStatus) {
      params.activity_refno = purposeFullData.filter(el => {
        return el.activity_name === purpose;
      })[0].activity_refno;
    } else {
      params.activity_refno = '0';
    }

    if (projectListStatus) {
      params.cont_project_refno = projectListFullData
        .filter(el => {
          return el.project_name === projectList;
        })[0]
        .cont_project_refno.toString();
    }

    if (projectExpenseStatus) {
      params.dynamic_expenses_refno = projectExpenseFullData.filter(el => {
        return el.subCategoryName === projectExpense;
      })[0].subcategoryID;
    } else if (usageListStatus) {
      params.dynamic_expenses_refno = usageFullData.filter(el => {
        return el.subCategoryName === usage;
      })[0]?.subcategoryID;
    }

    if (route.params.type === 'verify') {
      params.pck_master_trans_refno = pckTransID;
    }

    if (contactTypeStatus) {
      params.pck_contacttype_refno = contactTypeFullData.filter(el => {
        return el.pck_contacttype_name === contactType;
      })[0].pck_contacttype_refno;
    } else {
      params.pck_contacttype_refno = '0';
    }

    if (newContactNameStatus) {
      params.contact_name = contactName.trim() == '' ? '' : contactName.trim();
    }

    if (branchListStatus) {
      params.exp_branch_refno = branchFullData.filter(el => {
        return el.displayName === branch;
      })[0].exp_branch_refno;
    }

    if (designationListStatus) {
      params.exp_designation_refno = designationFullData.filter(el => {
        return el.designation_name === designation;
      })[0].designation_refno;
    }

    if (employeeListStatus) {
      params.myemployee_refno = employeeFullData.filter(el => {
        return el.displayName === employee;
      })[0].myemployee_refno;
    }

    if (newMobileNumberStatus) {
      params.contact_phoneno =
        mobileNumber.trim() == '' ? '' : mobileNumber.trim();
    }

    console.log('paramsedit', params);

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
    Provider.createDFPocketDairyWithHeader(
      type == 'edit'
        ? Provider.API_URLS.pckadd_source_expenses_activity_update
        : mode == 'source'
          ? Provider.API_URLS.pck_companysource_verify_action
          : Provider.API_URLS.pck_companyexpenses_verify_action,
      datas,
    )

      .then(response => {
        setIsButtonLoading(false);
        if (response.data && response.data.code === 200) {
          route.params.fetchData('update');
          navigation.goBack();
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.UpdateError);
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

  const ValidateData = () => {
    let isValid = true;

    if (entryType == '') {
      isValid = false;
      setEntryTypeError(true);
    }

    if (amount.trim() == '0' || amount.trim() == '') {
      setAmountError(true);
      isValid = false;
      setAmountInvalidBalance('Please enter a valid amount');
    }

    if (payMode == '') {
      isValid = false;
      setPMError(true);
    }

    if (cardTypeStatus && cardType == '') {
      setCTError(true);
      isValid = false;
    }

    if (cardBankNameStatus && cardBank == '') {
      setCBError(true);
      isValid = false;
    }
    if (cardBankNameStatus && cardBank == '') {
      setCBError(true);
      isValid = false;
    }
    if (cardRepaymentDateStatus && cardRepayment == '') {
      setErrorCRPayment(true);
      isValid = false;
    }

    if (expenses == '' && route?.params?.type !== 'ptc') {
      setEXError(true);
      isValid = false;
    }

    if (subCatStatus && subCategoryName == '') {
      setSCNError(true);
      isValid = false;
    }

    if (paidToStatus && paidTo == '') {
      setPTError(true);
      isValid = false;
    }

    if (recurringReminderDateStatus && recurringDate == '') {
      setErrorRD(true);
      isValid = false;
    }

    if (bankStatus && MyBank == '') {
      setMBError(true);
      isValid = false;
    }

    if (chequeNoStatus && chequeNo.trim() == '') {
      setChequeNoError(true);
      isValid = false;
    }

    if (chequeDateStatus && chequeDate == '') {
      setChequeDateInvalid(true);
      isValid = false;
    }

    if (clientListStatus && clientList == '') {
      setErrorCL(true);
      isValid = false;
    }

    if (projectListStatus && projectList == '') {
      setErrorPL(true);
      isValid = false;
    }

    if (isValid) {
      setIsButtonLoading(true);
      if (route.params.type === 'edit' || route.params.type === 'verify') {
        UpdateData(route.params.type, route.params.mode);
      } else {
        InsertData();
      }
    } else {
      setSnackbarText('Please fill all mandatory fields');
      setSnackbarColor(theme.colors.error);
      setSnackbarVisible(true);
    }
  };

  //#endregion

  //#region RBSheet Functions
  const onCompanyNameSelected = selectedItem => {
    setCompanyName(selectedItem);
    setCONError(false);
    FetchOtherClients(selectedItem, 'company');
  };

  const onMobileNumberSelected = selectedItem => {
    setMobileNo(selectedItem);
    setMNError(false);
    FetchOtherClients(selectedItem, 'mobile');
  };

  const SearchClient = () => {
    setIsButtonDisabled(true);
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        company_name_s: companyName,
        mobile_no_s: mobileno,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.ClientSearch, params)
      .then(response => {
        setIsButtonDisabled(false);
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setOtherClients(response.data.data);
          }
        } else {
          setOtherClients([]);
        }
      })
      .catch(e => {
        setIsButtonDisabled(false);
        setOtherClients([]);
      });
  };

  const InsertOtherClient = selectedID => {
    const params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        client_user_refno: selectedID,
        search_client_role_refnos: ['8'], // for client TBD
      },
    };
    Provider.createDFCommon(Provider.API_URLS.ClientAdd, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          refRBSheet.current.close();
          if (rb_clientType == '2') {
            FetchMKTClientList();
          } else {
            FetchClientList();
          }
        } else {
          setSnackbarText(communication.InsertError);
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
        }
      })
      .catch(e => {
        console.log(e);
        setSnackbarText(communication.NetworkError);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
      });
  };

  const FetchOtherClients = (selectedItem, type) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        company_name: selectedItem,
      },
    };
    if (type === 'company') {
      params.data.company_name = selectedItem;
    } else {
      params.data.mobile_no = selectedItem;
    }
    Provider.createDFCommon(
      type === 'company'
        ? Provider.API_URLS.CompanyNameAutocompleteClientSearch
        : Provider.API_URLS.MobileNoAutocompleteClientSearch,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let clientData = [];
            response.data.data.map((data, i) => {
              clientData.push({
                id: i,
                title:
                  type === 'company'
                    ? data.companyname_Result
                    : data.mobile_no_Result,
              });
            });
            if (type === 'company') {
              setCompanyData(clientData);
            } else {
              setMobileNoData(clientData);
            }
          }
        } else {
          setCompanyData([]);
          setMobileNoData([]);
        }
      })
      .catch(e => {
        setCompanyData([]);
        setMobileNoData([]);
      });
  };
  //#endregion

  return (
    <View style={[Styles.flex1]}>
      <ScrollView
        style={[Styles.flex1, Styles.backgroundColor, { marginBottom: 64 }]}
        keyboardShouldPersistTaps="handled">
        <View style={[Styles.padding16]}>
          {entryTypeStatus && (
            <>
              <Dropdown
                label="Entry Type"
                forceDisable={entryTypeDisable}
                data={entryTypeData}
                isError={entryTypeError}
                onSelected={onEntryTypeChanged}
                selectedItem={entryType}
              />
              <HelperText type="error" visible={entryTypeError}>
                Please select a valid entry type
              </HelperText>
            </>
          )}

          <TextInput
            mode="outlined"
            label="Amount"
            value={amount}
            returnKeyType="next"
            keyboardType="number-pad"
            onSubmitEditing={() => ref_input2.current.focus()}
            onChangeText={onAmount}
            style={{ backgroundColor: 'white' }}
            error={amountError}
          />
          <HelperText type="error" visible={amountError}>
            {amountInvalidBalance}
          </HelperText>

          {route.params.type ===
            projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText && (
              <>
                <View style={[Styles.padding16]}>
                  <DataTable
                    style={[
                      Styles.backgroundSecondaryColor,
                      Styles.borderRadius4,
                      Styles.flexJustifyCenter,
                      Styles.bordergray,
                      Styles.fontBold,
                    ]}>
                    <DataTable.Header>
                      <DataTable.Title
                        style={[{ flex: 1, justifyContent: 'center' }]}>
                        Collected
                      </DataTable.Title>
                      <DataTable.Title
                        style={[
                          Styles.borderLeft1,
                          { flex: 1, justifyContent: 'center' },
                        ]}
                        numeric>
                        Paid
                      </DataTable.Title>
                      <DataTable.Title
                        style={[
                          Styles.borderLeft1,
                          { flex: 1, justifyContent: 'center' },
                        ]}
                        numeric>
                        Balance
                      </DataTable.Title>
                    </DataTable.Header>

                    <DataTable.Row style={[Styles.backgroundColor]}>
                      <DataTable.Cell
                        style={[{ flex: 1, justifyContent: 'center' }]}>
                        {collectedAmount}
                      </DataTable.Cell>
                      <DataTable.Cell
                        style={[
                          Styles.borderLeft1,
                          { flex: 1, justifyContent: 'center' },
                        ]}>
                        {paidAmount}
                      </DataTable.Cell>
                      <DataTable.Cell
                        style={[
                          Styles.borderLeft1,
                          { flex: 1, justifyContent: 'center' },
                        ]}>
                        {balanceAmount}
                      </DataTable.Cell>
                    </DataTable.Row>
                  </DataTable>
                </View>
              </>
            )}

          <Dropdown
            label="Payment Mode"
            data={payModeData}
            onSelected={onPayModeChanged}
            isError={errorPM}
            selectedItem={payMode}
          />
          <HelperText type="error" visible={errorPM}>
            Please select a valid payment mode
          </HelperText>
          {cashBalanceStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Available Balance"
                value={cashBalance}
                returnKeyType="next"
                outlineColor={theme.colors.primary}
                keyboardType="number-pad"
                onSubmitEditing={() => ref_input2.current.focus()}
                disabled={true}
                style={[
                  Styles.marginTop8,
                  Styles.marginBottom16,
                  { backgroundColor: 'white' },
                ]}
              />
            </>
          )}

          {cardTypeStatus && (
            <>
              <Dropdown
                label="Card Type"
                data={cardTypeData}
                onSelected={onCardTypeChanged}
                isError={errorCT}
                selectedItem={cardType}
              />
              <HelperText type="error" visible={errorCT}>
                Please select a valid card type
              </HelperText>
            </>
          )}

          {cardBankNameStatus && (
            <>
              <Dropdown
                label="Card Bank Name"
                data={cardBankData}
                onSelected={onCardBankNameChanged}
                isError={errorCB}
                selectedItem={cardBank}
              />
              <HelperText type="error" visible={errorCB}>
                Please select a valid bank
              </HelperText>
            </>
          )}

          {cardRepaymentDateStatus && (
            <>
              <View>
                <DateTimePicker
                  style={Styles.backgroundColorWhite}
                  isError={errorCRPayment}
                  label="Credit Card Repayment Due Date"
                  type="date"
                  value={cardRepayment}
                  onChangeDate={setCardRepayment}
                />
                <HelperText type="error" visible={errorCRPayment}>
                  Please select a valid date
                </HelperText>
              </View>
            </>
          )}

          {route?.params?.type !== 'ptc' && (
            <>
              <Dropdown
                label="Expenses / Payment"
                data={expensesData}
                onSelected={onExpensesChanged}
                isError={errorEX}
                selectedItem={expenses}
              />
              <HelperText type="error" visible={errorEX}>
                Please select a valid Expenses / Payment
              </HelperText>
            </>
          )}
          {subCatStatus && (
            <>
              <Dropdown
                label="Sub Category Name"
                data={subCategoryNameData}
                onSelected={onSubCategoryNameChanged}
                isError={errorSCN}
                selectedItem={subCategoryName}
              />
              <HelperText type="error" visible={errorSCN}>
                Please select a valid sub category
              </HelperText>
            </>
          )}
          {expenseToStatus && (
            <>
              <Dropdown
                label="Expenses / Payment / Activity"
                data={expenseToData}
                onSelected={onExpenseToChanged}
                isError={errorExpenseTo}
                selectedItem={expenseTo}
              />
              <HelperText type="error" visible={errorExpenseTo}>
                Please select a valid expense
              </HelperText>
            </>
          )}
          {branchListStatus && (
            <>
              <Dropdown
                label="Branch List"
                data={branchData}
                onSelected={onBranchListChanged}
                isError={errorBR}
                selectedItem={branch}
              />
              <HelperText type="error" visible={errorBR}>
                Please select a branch
              </HelperText>
            </>
          )}

          {designationListStatus && (
            <>
              <Dropdown
                label="Designation List"
                data={designationData}
                onSelected={onDesignationListChanged}
                isError={errorDesg}
                selectedItem={designation}
              />
              <HelperText type="error" visible={errorDesg}>
                Please select a designation
              </HelperText>
            </>
          )}

          {employeeListStatus && (
            <>
              <Dropdown
                label="Employee List"
                data={employeeData}
                onSelected={onEmployeeListChanged}
                isError={errorEmp}
                selectedItem={employee}
              />
              <HelperText type="error" visible={errorEmp}>
                Please select an employee
              </HelperText>
            </>
          )}

          {/* {usageListStatus && (
            <>
              <Dropdown
                label="Select Particular"
                data={usageData}
                onSelected={onPerticularListChanged}
                isError={errorUsage}
                selectedItem={usage}
              />
              <HelperText type="error" visible={errorUsage}>
                Please select a perticular
              </HelperText>
            </>
          )} */}

          {/* {projectListStatus && (
            <>
              <Dropdown
                label="Project List"
                data={projectListData}
                onSelected={onProjectListChanged}
                isError={errorPL}
                selectedItem={projectList}
              />
              <HelperText type="error" visible={errorPL}>
                Please select a project
              </HelperText>
            </>
          )} */}

          {clientListStatus && (
            <>
              <View
                style={[Styles.border1, Styles.borderRadius4, Styles.padding4]}>
                <Dropdown
                  label="My Client List"
                  data={clientListData}
                  onSelected={onClientListChanged}
                  isError={errorCL}
                  selectedItem={clientList}
                />
                <HelperText type="error" visible={errorCL}>
                  Please select a client
                </HelperText>
                <View
                  style={[
                    Styles.flexRow,
                    Styles.marginTop4,
                    { justifyContent: 'space-between' },
                  ]}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setCompanyName('');
                      setCONError(false);
                      setMobileNo('');
                      setMNError(false);

                      setOtherClients([]);
                      setIsButtonDisabled(false);

                      setMobileNoData([]);
                      setCompanyData([]);
                      setRB_ClientType('1');
                      refRBSheet.current.open();
                    }}>
                    Search & Add
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      navigation.navigate('AddClientScreen', {
                        type: 'expenses_client',
                        data: {
                          serviceType: '8',
                        },
                        fetchClientList: FetchClientList,
                      });
                    }}>
                    Create New
                  </Button>
                </View>
              </View>
            </>
          )}

          {projectExpenseStatus && (
            <>
              <Dropdown
                label="Project Expenses"
                data={projectExpenseData}
                forceDisable={projectExpenseDisable}
                onSelected={onProjectExpenseChanged}
                isError={errorPE}
                selectedItem={projectExpense}
              />
              <HelperText type="error" visible={errorPE}>
                Please select a project expense
              </HelperText>
            </>
          )}

          {MKT_clientListStatus && (
            <>
              <View
                style={[Styles.border1, Styles.borderRadius4, Styles.padding4]}>
                <Dropdown
                  label="My Client List"
                  data={MKT_clientListData}
                  onSelected={onMKT_ClientListChanged}
                  isError={errorMKT_CL}
                  selectedItem={MKT_clientList}
                />
                <HelperText type="error" visible={errorMKT_CL}>
                  Please select a client
                </HelperText>
                <View
                  style={[
                    Styles.flexRow,
                    Styles.marginTop4,
                    { justifyContent: 'space-between' },
                  ]}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setCompanyName('');
                      setCONError(false);
                      setMobileNo('');
                      setMNError(false);

                      setOtherClients([]);
                      setIsButtonDisabled(false);

                      setMobileNoData([]);
                      setCompanyData([]);
                      setRB_ClientType('2');
                      refRBSheet.current.open();
                    }}>
                    Search & Add
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      navigation.navigate('AddClientScreen', {
                        type: 'expenses_client',
                        data: {
                          serviceType: '8',
                        },
                        fetchClientList: FetchMKTClientList,
                      });
                    }}>
                    Create New
                  </Button>
                </View>
              </View>
            </>
          )}
          {route?.params?.type === 'ptc' &&
            payment?.payment_group_name !== '' && (
              <>
                <TextInput
                  mode="outlined"
                  label="Payment Group"
                  value={payment?.payment_group_name}
                  returnKeyType="next"
                  disabled
                  style={{ backgroundColor: 'white' }}
                />
              </>
            )}
          {route?.params?.type === 'ptc' &&
            payment?.payment_type_name !== '' && (
              <>
                <TextInput
                  mode="outlined"
                  label="Payment Type"
                  value={payment?.payment_type_name}
                  returnKeyType="next"
                  disabled
                  style={{ backgroundColor: 'white' }}
                />
              </>
            )}
          {route?.params?.type === 'ptc' &&
            payment?.invoice_no !== null &&
            payment?.invoice_no !== undefined &&
            payment?.invoice_no !== '' && (
              <>
                <TextInput
                  mode="outlined"
                  label="Invoice No"
                  value={payment?.invoice_no}
                  returnKeyType="next"
                  disabled
                  style={{ backgroundColor: 'white' }}
                />
              </>
            )}
          {projectListStatus && (
            <>
              <Dropdown
                label="Project List"
                data={projectListData}
                onSelected={onProjectListChanged}
                isError={errorPL}
                selectedItem={projectList}
              />
              <HelperText type="error" visible={errorPL}>
                Please select a project
              </HelperText>
            </>
          )}
          {followupStatus && (
            <>
              <Dropdown
                label="Followup Customer List"
                data={followupData}
                onSelected={onFollowupChanged}
                isError={errorFollowup}
                selectedItem={followup}
              />
              <HelperText type="error" visible={errorFollowup}>
                Please select a valid customer
              </HelperText>
            </>
          )}

          {purposeStatus && (
            <>
              <Dropdown
                label="Purpose of Visit"
                data={purposeData}
                onSelected={onPurposeChanged}
                isError={errorPurpose}
                selectedItem={purpose}
              />
              <HelperText type="error" visible={errorPurpose}>
                Please select a purpose
              </HelperText>
            </>
          )}

          {contactTypeStatus && (
            <>
              <Dropdown
                label="Contact Type"
                data={contactTypeData}
                onSelected={onContactTypeDataChanged}
                isError={errorContactType}
                selectedItem={contactType}
              />
              <HelperText type="error" visible={errorContactType}>
                Please select a valid contact type
              </HelperText>
            </>
          )}

          {paidToStatus && (
            <>
              <View
                style={[
                  Styles.border1,
                  Styles.borderRadius4,
                  Styles.padding4,
                  Styles.marginBottom16,
                ]}>
                <Dropdown
                  label="Paid To"
                  data={paidToData}
                  onSelected={onPaidToChanged}
                  isError={errorPT}
                  selectedItem={paidTo}
                />
                <HelperText type="error" visible={errorPT}>
                  Please select a valid recepient
                </HelperText>
                <Button
                  icon={'card-account-phone-outline'}
                  mode="contained"
                  loading={isContactLoading}
                  disabled={isContactLoading}
                  onPress={ShowContactList}>
                  Add New Contact
                </Button>
              </View>
            </>
          )}

          {newContactNameStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Received From"
                value={contactName}
                returnKeyType="next"
                keyboardType="default"
                onSubmitEditing={() => ref_input2.current.focus()}
                onChangeText={onNewContactChange}
                style={{ backgroundColor: 'white' }}
              />
            </>
          )}

          {newMobileNumberStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Mobile No."
                value={mobileNumber}
                returnKeyType="next"
                keyboardType="number-pad"
                onSubmitEditing={() => ref_input2.current.focus()}
                onChangeText={onMobileNoChange}
                style={{ backgroundColor: 'white' }}
              />
            </>
          )}

          {recurringStatus && (
            <>
              <View style={[Styles.marginTop0, Styles.marginBottom32]}>
                <Text>Recurring</Text>
                <RadioGroup
                  containerStyle={[Styles.marginTop16]}
                  layout="row"
                  radioButtons={RecurringRadioButtons}
                  onPress={onPressRecurringRadioButton}
                />
              </View>
            </>
          )}

          {recurringReminderDateStatus && (
            <>
              <View>
                <DateTimePicker
                  style={(Styles.backgroundColorWhite, Styles.marginBottom12)}
                  isError={errorRD}
                  label="Recurring Reminder Date"
                  type="date"
                  value={recurringDate}
                  onChangeDate={setRecurringDate}
                />
                <HelperText type="error" visible={errorRD}>
                  Please select a valid date
                </HelperText>
              </View>
            </>
          )}

          {depositTypeStatus && (
            <>
              <View style={[Styles.marginTop16]}>
                <Dropdown
                  label="Deposit Type"
                  data={depositeTypeData}
                  onSelected={onDepositeTypeChanged}
                  isError={errorDT}
                  selectedItem={depositeType}
                />
                <HelperText type="error" visible={errorDT}>
                  {communication.InvalidDepositeType}
                </HelperText>
              </View>
            </>
          )}

          {bankStatus && (
            <>
              <View
                style={[
                  Styles.border1,
                  Styles.borderRadius4,
                  Styles.padding4,
                  Styles.marginTop8,
                ]}>
                <Dropdown
                  label="My Bank List"
                  data={myBankData}
                  onSelected={onMyBankChanged}
                  isError={errorMB}
                  selectedItem={MyBank}
                />
                <HelperText type="error" visible={errorMB}>
                  Please select a valid bank
                </HelperText>
                <Button
                  icon={'plus'}
                  mode="contained"
                  onPress={() => {
                    navigation.navigate('AddGMyBankScreen', {
                      type: 'newAccount',
                      fetchBankList: FetchBankList,
                    });
                  }}>
                  Add Bank Account
                </Button>
              </View>
            </>
          )}

          {bankBalanceStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Available Balance"
                value={bankBalance}
                returnKeyType="next"
                outlineColor={theme.colors.primary}
                keyboardType="number-pad"
                onSubmitEditing={() => ref_input2.current.focus()}
                disabled={true}
                style={[Styles.marginTop8, { backgroundColor: 'white' }]}
              />
            </>
          )}

          {personalBankStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Employee Personal Bank"
                value={personalBankName + '>>' + personalBankAccNo}
                disabled={true}
                returnKeyType="next"
                onSubmitEditing={() => ref_input2.current.focus()}
                style={{ backgroundColor: 'white' }}
              />
            </>
          )}

          {utrNoStatus && (
            <>
              <TextInput
                mode="flat"
                label="UTR No"
                maxLength={22}
                value={utrNo}
                returnKeyType="next"
                onSubmitEditing={() => ref_input2.current.focus()}
                onChangeText={onUtrNo}
                style={{ backgroundColor: 'white' }}
              />
            </>
          )}

          {chequeNoStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Cheque No"
                maxLength={6}
                value={chequeNo}
                returnKeyType="next"
                onSubmitEditing={() => ref_input2.current.focus()}
                onChangeText={onChequeNO}
                style={{ backgroundColor: 'white' }}
                error={chequeNoError}
              />
            </>
          )}

          {chequeDateStatus && (
            <>
              <View>
                <DateTimePicker
                  style={Styles.backgroundColorWhite}
                  label="Cheque Date"
                  type="date"
                  value={chequeDate}
                  onChangeDate={text => {
                    const enteredDate = new Date(text).setHours(0, 0, 0, 0);
                    const currentDate = new Date().setHours(0, 0, 0, 0);
                    if (enteredDate >= currentDate) {
                      setChequeDate(text);
                    }
                  }}
                />
              </View>
            </>
          )}
          {route?.params?.type === 'ptc' && (
            <>
              <TextInput
                mode="outlined"
                label="Transaction Particular"
                value={'Client amount given to company'}
                returnKeyType="next"
                disabled
                style={{ backgroundColor: 'white' }}
              />
            </>
          )}
          {commonDisplayStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Notes"
                value={notes}
                returnKeyType="next"
                onSubmitEditing={() => ref_input2.current.focus()}
                onChangeText={onNotes}
                style={{ backgroundColor: 'white' }}
              />
            </>
          )}

          {commonDisplayStatus && (
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
                          : { uri: image }
                  }
                  style={[Styles.width104, Styles.height96, Styles.border1]}
                />
                {/* {console.log(filePath)} */}
                <Button mode="text" onPress={() => setIsVisible(true)}>
                  {file !== null || image !== null
                    ? 'Replace'
                    : 'Attachment / Slip Copy'}
                </Button>
              </View>
              <HelperText type="error" visible={errorDI}>
                {communication.InvalidDesignImage}
              </HelperText>
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
                    style={{ padding: 10, alignItems: 'center' }}>
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
                    style={{ padding: 10, alignItems: 'center' }}>
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
          {commonDisplayStatus && (
            <>
              <View style={{ width: 160 }}>
                <Checkbox.Item
                  label="Display"
                  position="leading"
                  style={{ paddingHorizontal: 2 }}
                  labelStyle={{ textAlign: 'left', paddingLeft: 8 }}
                  color={theme.colors.primary}
                  status={checked ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setChecked(!checked);
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
          { position: 'absolute', bottom: 0, elevation: 3 },
        ]}>
        <Card.Content>
          <Button
            mode="contained"
            disabled={isButtonLoading ? isButtonLoading : buttonStatus}
            onPress={ValidateData}
            loading={isButtonLoading}>
            Submit
          </Button>
        </Card.Content>
      </View>
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        dragFromTopOnly={true}
        height={640}
        animationType="fade"
        customStyles={{
          wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
          draggableIcon: { backgroundColor: '#000' },
        }}>
        <ScrollView
          style={[Styles.flex1, Styles.backgroundColor]}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled>
          <View
            style={[Styles.flex1, Styles.backgroundColor, Styles.padding16]}>
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
                  placeholder: 'Company Name',
                  value: companyName,
                  placeholderTextColor: errorCON
                    ? theme.colors.error
                    : theme.colors.textSecondary,
                  onChangeText: onCompanyNameSelected,
                }}
                renderItem={item => (
                  <View style={[Styles.paddingVertical16]}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        paddingHorizontal: 16,
                      }}>
                      {item ? item.title : ''}
                    </Text>
                  </View>
                )}
                onClear={() => {
                  setIsButtonDisabled(true);
                  setCompanyName('');
                  setCompanyData([]);
                }}
                onSelectItem={item => {
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
                  keyboardType: 'number-pad',
                  placeholder: 'Mobile No',
                  value: mobileno,
                  placeholderTextColor: errorMN
                    ? theme.colors.error
                    : theme.colors.textSecondary,
                  onChangeText: onMobileNumberSelected,
                }}
                renderItem={item => (
                  <View style={[Styles.paddingVertical8]}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        paddingHorizontal: 16,
                      }}>
                      {item ? item.title : ''}
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.textSecondary,
                        paddingHorizontal: 16,
                      }}>
                      {item ? item.contact : ''}
                    </Text>
                  </View>
                )}
                onClear={() => {
                  setIsButtonDisabled(true);
                  setMobileNo('');
                  setMobileNoData([]);
                }}
                onSelectItem={item => {
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
              onPress={SearchClient}>
              Search
            </Button>
            <View
              style={[Styles.flexColumn, Styles.border1, Styles.marginTop16]}>
              {otherClients &&
                otherClients.map((v, k) => {
                  return (
                    <View
                      style={[
                        Styles.flexRow,
                        Styles.padding16,
                        Styles.flexAlignCenter,
                        Styles.borderBottom1,
                        { justifyContent: 'space-between' },
                      ]}>
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
                        onPress={() => InsertOtherClient(v.Search_user_refno)}>
                        Add
                      </Button>
                    </View>
                  );
                })}
            </View>
          </View>
        </ScrollView>
      </RBSheet>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: snackbarColor }}>
        {snackbarText}
      </Snackbar>
    </View>
  );
};

export default AddExpenses;
