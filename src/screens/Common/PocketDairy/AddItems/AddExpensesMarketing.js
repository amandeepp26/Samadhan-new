import moment from "moment";
import uuid from "react-native-uuid";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  Image,
  View,
  LogBox,
  Modal,
  Platform,
  PermissionsAndroid,
  Pressable,
} from "react-native";
// import * as Location from 'expo-location';
import Geolocation from "react-native-geolocation-service";
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
  FAB,
} from "react-native-paper";
import RBSheet from "react-native-raw-bottom-sheet";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import Provider from "../../../../api/Provider";
import Dropdown from "../../../../components/Dropdown";
import { Styles } from "../../../../styles/styles";
import { theme } from "../../../../theme/apptheme";
import { communication } from "../../../../utils/communication";
import { DateTimePicker } from "@hashiprobr/react-native-paper-datetimepicker";
import * as ImagePicker from "react-native-image-picker";
import { AWSImagePath } from "../../../../utils/paths";
import RadioGroup from "react-native-radio-buttons-group";
import { PaperSelect } from "react-native-paper-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APIConverter } from "../../../../utils/apiconverter";
import {
  projectVariables,
  projectLoginTypes,
} from "../../../../utils/credentials";
import * as Contacts from "react-native-contacts";
import * as DocumentPicker from "react-native-document-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Geocoder from "react-native-geocoding";
let userID = 0,
  groupID = 0,
  groupExtra = 0,
  companyID = 0,
  branchID = 0,
  _pktEntryTypeID = 0,
  designID = 0,
  companyAdminID = 0;

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
  "Material-UI: The `css` function is deprecated. Use the `styleFunctionSx` instead",
  "source.uri should not be an empty string",
]);

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

const AddExpensesMarketing = ({ route, navigation }) => {
  const [file, setFile] = useState(null);
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
      setFile(documentPickerResult[0]);
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
    if (!result.canceled) {
      setFile(result.assets[0]);
      getFileType(result.assets[0], setImage);
      setIsVisible(false);
      if (route.params.type === "edit" || route.params.type === "verify") {
        setIsImageReplaced(true);
      }
    }
  };
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);

  const [RecurringRadioButtons, setRecurringRadioButtons] = useState([
    {
      id: "1", // acts as primary key, should be unique and non-empty string
      label: "Yes",
      selected: true,
      value: "1",
    },
    {
      id: "2",
      label: "No",
      selected: false,
      value: "2",
    },
  ]);

  function onPressRecurringRadioButton(radioButtonsArray) {
    setRecurringRadioButtons(radioButtonsArray);

    radioButtonsArray.map((r) => {
      if (r.selected === true) {
        setrecurringDateFlag(r.value);

        if (r.label == "No") {
          setRecurringReminderDateStatus(false);
        } else {
          setRecurringReminderDateStatus(true);
        }
      }
    });
  }

  //#region Variables

  const [date, setDate] = useState(new Date());
  const [dateInvalid, setDateInvalid] = useState("");
  const dateRef = useRef({});

  const [visitLocation, setVisitLocation] = React.useState(
    route?.params?.data?.activitydata?.visit_location_name
      ? route?.params?.data?.activitydata?.visit_location_name
      : ""
  );
  const [visitLocationError, setVisitLocationError] = React.useState(false);

  const [activityRemarks, setActivityRemarks] = React.useState(
    route?.params?.data?.activitydata?.activity_remarks
      ? route?.params?.data?.activitydata?.activity_remarks
      : ""
  );
  const [invoiceNoError, setInvoiceNoError] = React.useState(false);
  const [invoiceNo, setInvoiceNo] = React.useState("");

  const [invoiceStatus, setInvoiceStatus] = React.useState(false);
  const [paymentTypeStatus, setPaymentTypeStatus] = React.useState(false);
  const [paymentGroupStatus, setPaymentGroupStatus] = React.useState(false);
  const [errorPG, setErrorPG] = React.useState(false);
  const [errorPTT, setErrorPTT] = React.useState(false);
  const [paymentTypeID, setPaymentTypeID] = useState(0);
  const [paymentGroupID, setPaymentGroupID] = useState(0);
  const [paymentRB, setPaymentRB] = useState([
    {
      id: "1",
      label: "Part",
      selected: false,
      value: "1",
    },
    {
      id: "2",
      label: "Full Amount with invoice close",
      selected: false,
      value: "2",
    },
  ]);
  const [paymentGroup, setPaymentGroup] = useState([
    {
      id: "1", // acts as primary key, should be unique and non-empty string
      label: "Advance Amount",
      selected: true,
      value: "1",
    },
    {
      id: "2",
      label: "Invoice Amount",
      selected: false,
      value: "2",
    },
  ]);
  const [referenceData, setReferenceData] = React.useState([]);
  const [referenceFullData, setReferenceFullData] = React.useState([]);
  const [reference, setReference] = React.useState("");

  const [supportPersonData, setSupportPersonData] = React.useState([]);
  const [supportPersonFullData, setSupportPersonFullData] = React.useState([]);
  const [supportPerson, setSupportPerson] = React.useState("");

  const [nextVisitDayData, setNextVisitDayData] = React.useState([]);
  const [nextVisitDayFullData, setNextVisitDayFullData] = React.useState([]);
  const [nextVisitDay, setNextVisitDay] = React.useState("");

  const [nextVisitMonthData, setNextVisitMonthData] = React.useState([]);
  const [nextVisitMonthFullData, setNextVisitMonthFullData] = React.useState(
    []
  );
  const [nextVisitMonth, setNextVisitMonth] = React.useState("");

  const [activityTypeData, setActivityTypeData] = React.useState([]);
  const [activityTypeFullData, setActivityTypeFullData] = React.useState([]);
  const [activityTypeError, setActivityTypeError] = React.useState(false);
  const [activityType, setActivityType] = React.useState("");

  const [sourceFullData, setSourceFullData] = React.useState([]);
  const [sourceData, setSourceData] = React.useState([]);
  const [source, setSource] = React.useState([]);
  const [errorSS, setSSError] = React.useState(false);
  const [sourceStatus, setSourceStatus] = React.useState(false);

  const [valueData, setvalueData] = React.useState([]);
  const [valueFullData, setvalueFullData] = React.useState([]);
  const [valueError, setvalueError] = React.useState(false);

  const [clientTypeData, setClientTypeData] = React.useState([]);
  const [clientTypeFullData, setClientTypeFullData] = React.useState([]);
  const [clientTypeError, setClientTypeError] = React.useState(false);
  const [clientType, setClientType] = React.useState("");
  const [clientTypeID, setClientTypeID] = React.useState("");

  const [activityStatusData, setActivityStatusData] = React.useState([]);
  const [activityStatusFullData, setActivityStatusFullData] = React.useState(
    []
  );
  const [activityStatusError, setActivityStatusError] = React.useState(false);
  const [activityStatus, setActivityStatus] = React.useState("");

  const [marketingData, setMarketingData] = React.useState([]);
  const [marketingFullData, setMarketingFullData] = React.useState([]);
  const [marketingError, setMarketingError] = React.useState(false);
  const [marketing, setMarketing] = React.useState("");

  const [clientListtData, setClientListtData] = React.useState([]);
  const [clientListtFullData, setClientListtFullData] = React.useState([]);
  const [clienttError, setClienttError] = React.useState(false);
  const [clientt, setClientt] = React.useState("");

  const [contactPersonData, setContactPersonData] = React.useState([]);
  const [contactPersonFullData, setContactPersonFullData] = React.useState([]);
  const [contactPersonError, setContactPersonError] = React.useState(false);
  const [contactPerson, setContactPerson] = React.useState("");

  const [epaData, setEpaData] = React.useState([]);
  const [epaFullData, setEpaFullData] = React.useState([]);
  const [epaError, setEpaError] = React.useState(false);
  const [epa, setEpa] = React.useState("");

  const [entryTypeData, setEntryTypeData] = React.useState([]);
  const [entryTypeFullData, setEntryTypeFullData] = React.useState([]);
  const [entryTypeError, setEntryTypeError] = React.useState(false);
  const [entryType, setEntryType] = React.useState(
    route.params?.data?.entryType
  );
  const [entryTypeDisable, setEntryTypeDisable] = React.useState(true);

  const [subCategoryNameFullData, setSubCategoryNameFullData] = React.useState(
    []
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
  const [cardRepaymentInvalid, setCardRepaymentInvalid] = useState("");
  const [errorCRPayment, setErrorCRPayment] = React.useState(false);
  const cardRepaymentRef = useRef({});

  const [expensesFullData, setExpensesFullData] = React.useState([]);
  const [expensesData, setExpensesData] = React.useState([]);
  const [expenses, setExpenses] = React.useState([]);
  const [errorEX, setEXError] = React.useState(false);

  const [amountError, setAmountError] = React.useState(false);
  const [amount, settAmount] = React.useState("");
  const [amountInvalidBalance, setAmountInvalidBalance] = React.useState(
    "Amount can not be more then balance amount"
  );

  const [paidToFullData, setPaidToFullData] = React.useState([]);
  const [paidToData, setPaidToData] = React.useState([]);
  const [paidTo, setPaidTo] = React.useState([]);
  const [errorPT, setPTError] = React.useState(false);

  const [recurringDate, setRecurringDate] = useState(new Date());
  const [recurringDateInvalid, setRecurringDateInvalid] = useState("");
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
  const [clientList, setClientList] = React.useState([]);
  const [errorCL, setErrorCL] = React.useState(false);

  const [projectListFullData, setProjectListFullData] = React.useState([]);
  const [projectListData, setProjectListData] = React.useState([]);
  const [projectList, setProjectList] = React.useState([]);
  const [errorPL, setErrorPL] = React.useState(false);

  const [projectExpenseFullData, setProjectExpenseFullData] = React.useState(
    []
  );
  const [projectExpenseData, setProjectExpenseData] = React.useState([]);
  const [projectExpense, setProjectExpense] = React.useState([]);
  const [errorPE, setErrorPE] = React.useState(false);

  const [chequeNoError, setChequeNoError] = React.useState(false);
  const [chequeNo, setChequeNo] = React.useState("");

  const [utrNoError, setUtrNoError] = React.useState(false);
  const [utrNo, setUtrNo] = React.useState("");

  const [chequeDate, setChequeDate] = useState(new Date());
  const [chequeDateInvalid, setChequeDateInvalid] = useState("");
  const chequeDateRef = useRef({});

  const [image, setImage] = React.useState(null);
  const [filePath, setFilePath] = React.useState(
    route.params.type === "edit" || route.params.type === "verify"
      ? { name: route.params?.data?.designImage }
      : null
  );
  const [designImage, setDesignImage] = React.useState(
    route.params?.data?.designImage
  );
  const [errorDI, setDIError] = React.useState(false);

  const [notesError, setNotesError] = React.useState(false);
  const [notes, setNotes] = React.useState(
    route?.params?.data?.notes ? route?.params?.data?.notes : ""
  );

  const [checked, setChecked] = React.useState(
    route.params.type === "edit" || route.params.type === "verify"
      ? route.params?.data?.view_status === "1"
        ? true
        : false
      : true
  );

  const [contactTypeFullData, setContactTypeFullData] = React.useState([]);
  const [contactTypeData, setContactTypeData] = React.useState([]);
  const [contactType, setContactType] = React.useState([]);
  const [errorContactType, setErrorContactType] = React.useState(false);

  const [contactName, setContactName] = React.useState("");

  const [mobileNumber, setMobileNumber] = React.useState("");

  const [recurring, setRecurring] = useState({
    value: "",
    list: [],
    selectedList: [],
    error: "",
  });

  const [pktEntryTypeID, setPktEntryTypeID] = React.useState("1");

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");
  const [snackbarColor, setSnackbarColor] = React.useState(
    theme.colors.success
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
  const [recurringDateFlat, setrecurringDateFlag] = useState("1");
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

  const [collectedAmount, setcollectedAmount] = React.useState("");
  const [paidAmount, setpaidAmount] = React.useState("");
  const [balanceAmount, setbalanceAmount] = React.useState("");
  const [personalBankName, setPersonalBankName] = React.useState("");
  const [personalBankAccNo, setPersonalBankAccNo] = React.useState("");
  const [bankRefNo, setBankRefNo] = React.useState("");

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
    []
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

  const [clientsFullData, setClientsFullData] = React.useState([]);
  const [clientData, setClientData] = React.useState([]);
  const [clientName, setClientName] = React.useState("");
  const [errorCN, setCNError] = React.useState(false);

  const refRBSheet = useRef();

  const [companyData, setCompanyData] = React.useState([]);
  const [companyName, setCompanyName] = React.useState("");
  const [errorCON, setCONError] = React.useState(false);

  const [otherClients, setOtherClients] = React.useState([]);
  const [selectedData, setSelectedData] = React.useState([]);
  const [selectedClient, setSelectedClient] = React.useState("");
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);

  const [mobilenoData, setMobileNoData] = React.useState([]);
  const [mobileno, setMobileNo] = React.useState("");
  const [errorMN, setMNError] = React.useState(false);

  //#endregion

  //#region Functions

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
  const FetchReceptCategory = (categoryID, receiptModeID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        pck_mode_refno: receiptModeID,
        Sess_designation_refno: designID.toString(),
        pck_entrytype_refno: _pktEntryTypeID,
        Sess_group_refno_extra_1: groupExtra.toString(),
      },
    };

    Provider.createDFPocketDairy(
      Provider.API_URLS.getcategoryname_pckaddsourceform,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setSourceFullData(response.data.data);
            const category = response.data.data.map(
              (data) => data.categoryName
            );
            setSourceData(category);
            if (categoryID != null) {
              setSource(
                response.data.data.filter((el) => {
                  return el.pckCategoryID === categoryID;
                })[0].categoryName
              );
            }
          }
        }
      })
      .catch((e) => { });
  };

  const onSourceChanged = (text) => {
    setSource(text);
    setSSError(false);
    setClientList("");
    setClientListData([]);
    setClientListFullData([]);

    let a = sourceFullData.filter((el) => {
      return el.categoryName === text;
    });

    if (text == "Clients") {
      setClientListstatus(true);
      FetchClientList();
    }
  };
  const FetchPaymentType = (editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckpaymenttype, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            const pType = [];
            response.data.data.map((data) => {
              pType.push({
                label: data.payment_type_name,
                id: data.payment_type_refno,
                selected: editID == data.payment_type_refno,
                value: data.payment_type_refno,
              });
            });
            setPaymentRB(pType);
            if (editID !== null) {
              setPaymentTypeID(editID);
            }
          }
        }
      })
      .catch((e) => { });
  };

  const paymentGroupCallback = (editID) => {
    // Handle the result or perform actions based on the result
    setPaymentGroupID(editID);
  };

  const FetchPaymentGroup = (editID, callback) => {

    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckpaymentgroup, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {

            const pType = [];
            response.data.data.map((data, idx) => {
              pType.push({
                key: idx,
                label: data.payment_group_name,
                id: data.payment_group_refno,
                selected: editID == data.payment_group_refno ? true : false,
                value: data.payment_group_refno,
              });
            });
            setPaymentGroup(pType);
            if (editID !== null) {

              if (typeof callback === 'function') {
                // The callback is a function
                callback(editID); // Call the function if needed
              }

            }
          }
        }
      })
      .catch((e) => { });
  };

  const getLocation = async (x) => {
    let status;
    if (Platform.OS === "ios") {
      const permissionResult = await request(
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      );
      status = permissionResult === "granted";
    } else if (Platform.OS === "android") {
      const permissionResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      status = permissionResult === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (!status) {
      setSnackbarText("Please grant permission to submit form.");
      setSnackbarColor(theme.colors.error);
      setSnackbarVisible(true);
      return;
    }
    try {
      Geolocation.getCurrentPosition(
        async (locationGps) => {
          if (locationGps) {
            const address = await Geocoder.from(
              locationGps.coords.latitude,
              locationGps?.coords?.longitude
            )
              .then((json) => {
                var addressComponent = json;
                return addressComponent;
              })
              .catch((error) => console.warn(error));
            await Provider.createDFEmployee(
              Provider.API_URLS.get_employee_last_markactivity_gprs_data,
              {
                data: {
                  Sess_UserRefno: userID,
                },
              }
            )
              .then((res) => {
                let kilometer = calcKm(
                  res?.data?.data[0]?.latitude,
                  res?.data?.data[0]?.longitude,
                  locationGps?.coords?.latitude,
                  locationGps?.coords?.longitude
                );
                let currentLoc = {
                  last_gprs_activitytrack_refno:
                    res?.data?.data[0]?.last_gprs_activitytrack_refno,
                  latitude: locationGps?.coords?.latitude,
                  longitude: locationGps?.coords?.longitude,
                  kilometer: kilometer,
                  gprs_location_name: address.results[0].formatted_address,
                };
                setLoc(currentLoc);
              })
              .catch((error) => {
                console.log(error);
              });
            if (x !== null && x !== undefined && x !== "") {
              if (
                locationGps?.coords?.latitude == null ||
                locationGps?.coords?.latitude == undefined
              ) {
                return false;
              } else {
                return true;
              }
            }
            // latitude: locationGps?.coords?.latitude,
            //   longitude: locationGps?.coords?.longitude,
            //   gprs_location_name: `${address[0]?.street}, ${address[0]?.district}, ${address[0]?.city}, ${address[0]?.region == "" ? address[0]?.subregion == "" ? "" : address[0]?.subregion : address[0]?.region}, ${address[0]?.country}`,
            return;
          }
        },
        (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getLocation();
    GetUserID();
  }, []);
  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      groupID = JSON.parse(userData).Sess_group_refno;
      groupExtra = JSON.parse(userData).Sess_group_refno_extra_1;
      companyID = JSON.parse(userData).Sess_company_refno;
      branchID = JSON.parse(userData).Sess_branch_refno;
      designID = JSON.parse(userData).Sess_designation_refno;
      companyAdminID = JSON.parse(userData).Sess_CompanyAdmin_UserRefno;
      FetchClients();
      FetchEntryType();
      if (route.params.type === "edit") {
        route.params.data = {
          ...route.params?.data,
          ...route.params?.data?.activitydata,
        };
        SetEditData(route.params.data);
      } else if (route.params.type === "verify") {
        FetchPayToCompanyData(route.params.data.pck_trans_refno);
      } else if (
        route.params.type ===
        projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
      ) {
        FetchPayToCompanyData(route.params.data.transactionID);
      }
    }
  };

  const FetchPayToCompanyData = (transactionID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_trans_refno: transactionID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        pck_transtype_refno:
          route.params.type === "edit"
            ? projectVariables.DEF_PCKDIARY_TRANSTYPE_SOURCE_REFNO
            : route.params.type === "verify"
              ? projectVariables.DEF_PCKDIARY_TRANSTYPE_EXPENSES_REFNO
              : route.params.type ===
                projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
                ? projectVariables.DEF_PCKDIARY_TRANSTYPE_SOURCE_REFNO
                : 0,
        pck_entrytype_refno:
          projectVariables.DEF_PCKDIARY_ENTRYTYPE_COMPANY_REFNO,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.pcktransrefnocheck, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            SetEditData(response.data.data[0]);
          }
        } else {
          setSnackbarText("No Company data found");
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
        }
      })
      .catch((e) => {
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        setRefreshing(false);
      });
  };

  const SetEditData = (data) => {
    if (
      route?.params?.type !=
      projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
    ) {
      if (data?.attach_receipt_url != "") {
        getFileType(data.attach_receipt_url, setImage);
        setFilePath(data.attach_receipt_url);
        setFile(data.attach_receipt_url);
        getFileType(data.attach_receipt_url, setDesignImage);
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
      settAmount(data.BalanceUnPaidPayment.replace(/,/g, ""));
    } else {
      settAmount(data.amount);
    }

    setPckTransID(data.pck_trans_refno);
    _pktEntryTypeID = data.pck_entrytype_refno;
    setPktEntryTypeID(data.pck_entrytype_refno);
    FetchPaymentMode(data.pck_mode_refno, data.pck_transtype_refno);

    if (data.cardtype_refno != "" && data.cardtype_refno != "0") {
      setCardTypeStatus(true);
      FetchCardType(data.cardtype_refno);
    }

    if (data.pck_card_mybank_refno != "" && data.pck_card_mybank_refno != "0") {
      setCardBankNameStatus(true);
      FetchCardBankList(data.cardtype_refno, data.pck_card_mybank_refno);
    }

    if (data.due_date != "" && data.due_date != "0" && data.due_date != null) {
      setCardRepaymentDateStatus(true);
      let dateBreakup = data.due_date.split("-");
      setCardRepayment(
        new Date(dateBreakup[2] + "/" + dateBreakup[1] + "/" + dateBreakup[0])
      );
    }

    FetchExpenseCategory(data.pck_mode_refno, data.pck_category_refno);
    if (
      data.pck_sub_category_refno != "" &&
      data.pck_sub_category_refno != "0"
    ) {
      setSubCategoryName(data.pck_sub_category_name);
      FetchExpenseSubCategory(
        data.pck_category_refno,
        data.pck_sub_category_refno
      );
    } else {
      setSubCatStatus(false);
    }

    if (data.pck_contacttype_refno != "" && data.pck_contacttype_refno != "0") {
      setContactTypeStatus(true);
      FetchContactType(data.pck_contacttype_refno);
    }
    if (data.pck_mycontact_refno != "" && data.pck_mycontact_refno != "0") {
      setPaidToStatus(true);
      FetchReceiverList(
        data.pck_mycontact_refno,
        null,
        data.pck_sub_category_refno,
        data.pck_contacttype_refno
      );
    }
    if (data.recurring_status != "" && data.recurring_status != "0") {
      setRecurringStatus(true);

      let recc = [...RecurringRadioButtons];
      recc.map((r) => {
        if (r.id == data.recurring_status) {
          setrecurringDateFlag(r.value);

          if (r.label == "No") {
            setRecurringReminderDateStatus(false);
          } else {
            setRecurringReminderDateStatus(true);
          }
        }
      });

      setRecurringRadioButtons(recc);
    }

    if (
      data.reminder_date != "" &&
      data.reminder_date != "0" &&
      data.reminder_date != null
    ) {
      let dateBreakup = data.reminder_date.split("-");
      setRecurringDate(
        new Date(dateBreakup[2] + "/" + dateBreakup[1] + "/" + dateBreakup[0])
      );
    }

    if (data.deposit_type_refno != "" && data.deposit_type_refno != "0") {
      setDepositTypeStatus(true);
      FetchDepositType(data.deposit_type_refno);
    }

    if (data.pck_mybank_refno != "" && data.pck_mybank_refno != "0") {

      if (data.deposit_type_refno != "" && data.deposit_type_refno != "0" && data.deposit_type_refno != "1") {
        setBankStatus(true);
        FetchBankList(
          data.pck_mybank_refno,
          data.pck_mode_refno,
          data.pck_transtype_refno
        );
      }
    }

    if (
      route.params.type === "verify" &&
      data.banktype_refno != null &&
      data.banktype_refno == "1"
    ) {
      setPersonalBankStatus(true);
      setBankStatus(false);
      setPersonalBankName(data.personal_bank_name);
      setPersonalBankAccNo(data.personal_bank_account_no);
      setBankRefNo(data.pck_mybank_refno);
    }

    if (data.utr_no != "" && data.utr_no != "0") {
      setUtrNoStatus(true);
      setUtrNo(data.utr_no);
    }

    if (data.cheque_no != "" && data.cheque_no != "0") {
      setChequeNoStatus(true);
      setChequeNo(data.cheque_no);
    }

    if (
      data.cheque_date != "" &&
      data.cheque_date != "0" &&
      data.cheque_date != null
    ) {
      let dateBreakup = data.cheque_date.split("-");
      setChequeDateStatus(true);
      setChequeDate(
        new Date(
          dateBreakup[2],
          Number(dateBreakup[1]) - 1,
          dateBreakup[0],
          0,
          0,
          0,
          0
        )
      );
    }

    if (
      data.myclient_refno != null &&
      data.myclient_refno != "0" &&
      data.pck_transtype_refno == "1"
    ) {
      setClientListstatus(true);
      FetchClientList(data.myclient_refno);
    }

    if (data.payment_group_refno != null && data.payment_group_refno != "0") {
      setPaymentGroupID(data.payment_group_refno);
      setPaymentGroupStatus(true);
      FetchPaymentGroup(data.payment_group_refno, paymentGroupCallback);
    }

    if (data.payment_type_refno != null && data.payment_type_refno != "0") {
      setPaymentTypeStatus(true);
      FetchPaymentType(data.payment_type_refno);
    }

    if (data.invoice_no != null && data.invoice_no != "") {
      setInvoiceStatus(true);
      setInvoiceNo(data.invoice_no);
    }

    if (data.cont_project_refno != null && data.cont_project_refno != "0") {
      setProjectListstatus(true);
      FetchProjectList(data.myclient_refno, data.cont_project_refno);
    }

    if (
      (data.dynamic_expenses_refno != null &&
        data.dynamic_expenses_refno != "0") ||
      route.params.type ===
      projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
    ) {
      setProjectExpenseStatus(true);
      FetchProjectExpense(data.pck_category_refno, data.dynamic_expenses_refno);
    } else if (
      data.dynamic_expenses_refno != null &&
      data.dynamic_expenses_refno != "0" &&
      data.exp_branch_refno != "" &&
      data.exp_branch_refno != "0"
    ) {
      setUsageListstatus(true);
      FetchUsageList(data.dynamic_expenses_refno, data.pck_category_refno);
    }

    setCommonDisplayStatus(true);
    setNotes(data.notes);

    setChecked(data.view_status == "1" ? true : false);

    if (data.exp_branch_refno != "" && data.exp_branch_refno != "0") {
      setBranchListstatus(true);
      FetchBranchList(data.exp_branch_refno);
    }

    if (data.exp_designation_refno != "" && data.exp_designation_refno != "0") {
      setDesignationListstatus(true);
      FetchDesignationList(data.exp_designation_refno);
    }

    if (data.myemployee_refno != "" && data.myemployee_refno != "0") {
      setEmployeeListstatus(true);
      FetchEmployeeList(data.myemployee_refno, data.exp_designation_refno);
    }

    if (data.pck_mode_refno != "" && data.pck_category_refno != "") {
      FetchReceptCategory(data.pck_category_refno, data.pck_mode_refno);
    }
  };

  useEffect(() => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        Sess_designation_refno: designID,
        Sess_group_refno_extra_1: groupExtra.toString(),
        pck_sub_category_refno: "0",
        activity_entry_type: "2",
      },
    };
    if (entryType === "Company" && valueFullData?.length === 0) {
      Provider.createDFPocketDairy(
        Provider.API_URLS.gettransactiontype_pckcategoryform_user,
        params
      ).then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setvalueFullData(response.data.data);
            const category = response.data.data.map(
              (data) => data.pck_transtype_name
            );
            setvalueData(category);

            if (route.params.tabIndex != null && route.params.type === "add") {
              //setValue(route.params.tabIndex + 1);
              setValue(
                response.data.data.find(
                  (data) =>
                    data.pck_transtype_refno == route.params.tabIndex + 1
                )?.pck_transtype_name
              );
            }

            if (route?.params?.type === "edit") {
              setValue(
                response.data.data.find(
                  (data) =>
                    data.pck_transtype_refno ==
                    route.params.data?.pck_transtype_refno
                )?.pck_transtype_name
              );
            }
          }
        }
      });
    }
  }, [entryType, valueFullData]);

  useEffect(() => {
    if (
      ((entryType !== "Self" &&
        value === "Expenses" &&
        subCategoryName !== "" &&
        subCategoryName !== null &&
        subCategoryName !== undefined) ||
        (entryType !== "Self" &&
          value === "Activity" &&
          activityType !== "Office Work" &&
          activityType !== "") ||
        route?.params?.type === "edit") &&
      epaData.length === 0
    ) {
      let params = {
        data: {
          Sess_UserRefno: userID,
          Sess_group_refno: groupID,
          Sess_company_refno: companyID,
          Sess_branch_refno: branchID,
          Sess_designation_refno: designID,
          Sess_group_refno_extra_1: groupExtra.toString(),
          pck_sub_category_refno: "0",
          activity_entry_type: "2",
        },
      };
      Provider.createDFPocketDairy(
        Provider.API_URLS.getexpensesto_pckaddexpensesform,
        params
      ).then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setEpaFullData(response.data.data);
            const category = response.data.data.map(
              (data) => data.category_name
            );
            setEpaData(category);

            if (route?.params?.type === "edit") {
              setEpa(
                response.data.data.find(
                  (data) =>
                    data.pck_custom_category_refno ===
                    route.params.data?.pck_custom_category_refno
                )?.category_name
              );
            }
          }
        }
      });
    }
  }, [entryType, value, subCategoryName, activityType, epaData, route.params]);

  useEffect(() => {
    if (
      entryType === "Company" &&
      activityType !== "Office Work" &&
      clientTypeData.length === 0
    ) {
      let params = {
        data: {
          Sess_UserRefno: userID,
          Sess_group_refno: groupID,
          Sess_company_refno: companyID,
          Sess_branch_refno: branchID,
          Sess_designation_refno: designID,
          Sess_group_refno_extra_1: groupExtra.toString(),
          pck_sub_category_refno: "0",
          activity_entry_type: "2",
        },
      };
      Provider.createDFPocketDairy(
        Provider.API_URLS.getclienttype_pckaddexpensesform,
        params
      ).then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setClientTypeFullData(response.data.data);
            const types = response.data.data.map(
              (data) => data?.activity_entry_type_name
            );

            setClientTypeData(types);

            if (route?.params?.type === "edit") {
              let x = response.data.data.find(
                (data) =>
                  data?.activity_entry_type ==
                  route.params.data?.activity_entry_type
              );

              setClientType(x?.activity_entry_type_name);
              setClientTypeID(x?.activity_entry_type);

              if (x?.activity_entry_type == "1") {
                getClientList();
              } else if (x?.activity_entry_type == 2) {
                getClientList(route.params?.data?.refer_user_refno);
              }
            }
          }
        }
      });
    }
  }, [entryType, activityType, clientTypeData]);

  useEffect(() => {
    if (
      entryType === "Company" &&
      clientTypeID == 2 &&
      marketingFullData?.length === 0
    ) {
      let params = {
        data: {
          Sess_UserRefno: userID,
          Sess_group_refno: groupID,
          Sess_company_refno: companyID,
          Sess_branch_refno: branchID,
          Sess_designation_refno: designID,
          Sess_group_refno_extra_1: groupExtra.toString(),
          pck_sub_category_refno: "0",
          activity_entry_type: "2",
        },
      };
      Provider.createDFEmployee(
        Provider.API_URLS.get_marketingexecutivename_employeeactivityform,
        params
      ).then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setMarketingFullData(response.data.data);
            const marketing = response.data.data.map(
              (data) => data.employee_name
            );
            setMarketingData(marketing);
            if (
              route?.params?.type == "edit" &&
              route?.params?.data?.activitydata?.refer_user_refno !== null &&
              route?.params?.data?.activitydata?.refer_user_refno !==
              undefined &&
              route?.params?.data?.activitydata?.refer_user_refno !== ""
            ) {
              getClientList(
                route?.params?.data?.activitydata?.refer_user_refno
              );
              setMarketing(
                response.data.data.filter(
                  (item) =>
                    item.refer_user_refno ==
                    route?.params?.data?.activitydata?.refer_user_refno
                )[0].employee_name
              );
            }
          }
        }
      });
    }
  }, [entryType, clientType, clientTypeID, marketingFullData]);

  useEffect(() => {
    if (
      entryType !== "Self" &&
      (activityStatusData.length === 0 ||
        nextVisitDayData.length === 0 ||
        nextVisitMonthData.length === 0)
    ) {
      let params = {
        data: {
          Sess_UserRefno: userID,
          Sess_group_refno: groupID,
          Sess_company_refno: companyID,
          Sess_branch_refno: branchID,
          Sess_designation_refno: designID,
          Sess_group_refno_extra_1: groupExtra.toString(),
          pck_sub_category_refno: "0",
          activity_entry_type: "2",
        },
      };
      Provider.createDFEmployee(
        Provider.API_URLS.get_activitystatus_employeeactivityform,
        params
      ).then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setActivityStatusFullData(response.data.data);
            const status = response.data.data.map(
              (data) => data.activity_status_name
            );
            setActivityStatusData(status);

            if (
              route?.params?.type === "edit" &&
              route.params?.data?.activitydata.activity_status !== null &&
              route.params?.data?.activitydata.activity_status !== undefined &&
              route.params?.data?.activitydata.activity_status !== ""
            ) {
              setActivityStatus(
                response.data.data.find(
                  (t) =>
                    t.activity_status ==
                    route.params?.data?.activitydata.activity_status
                ).activity_status_name
              );
            }
          }
        }
      });

      Provider.createDFEmployee(
        Provider.API_URLS.get_nextvisitno_employeeactivityform,
        params
      ).then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setNextVisitDayFullData(response.data.data);
            const data = response.data.data.map(
              (data) => data.next_visit_no_name
            );
            setNextVisitDayData(data);

            if (
              route?.params?.type === "edit" &&
              route.params?.data?.activitydata.next_visit_no !== null &&
              route.params?.data?.activitydata.next_visit_no !== undefined &&
              route.params?.data?.activitydata.next_visit_no !== ""
            ) {
              setNextVisitDay(
                response.data.data.find(
                  (t) =>
                    t.next_visit_no ==
                    route.params?.data?.activitydata.next_visit_no
                ).next_visit_no_name
              );
            }
          }
        }
      });

      Provider.createDFEmployee(
        Provider.API_URLS.get_daysmonthsrefno_employeeactivityform,
        params
      ).then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setNextVisitMonthFullData(response.data.data);
            const data = response.data.data.map((data) => data.daysmonths_name);
            setNextVisitMonthData(data);
            if (
              route?.params?.type === "edit" &&
              route.params?.data?.activitydata.daysmonths_refno !== null &&
              route.params?.data?.activitydata.daysmonths_refno !== undefined &&
              route.params?.data?.activitydata.daysmonths_refno !== ""
            ) {
              setNextVisitMonth(
                response.data.data.find(
                  (t) =>
                    t.daysmonths_refno ==
                    route.params?.data?.activitydata.daysmonths_refno
                ).daysmonths_name
              );
            }
          }
        }
      });
    }
  }, [entryType, activityStatusData, nextVisitDayData, nextVisitMonth]);

  const FetchEntryType = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        Sess_designation_refno: designID,
        Sess_group_refno_extra_1: groupExtra.toString(),
        pck_sub_category_refno: "0",
        activity_entry_type: "2",
      },
    };
    if (route?.params?.type == "edit") {
      setCommonDisplayStatus(true);
    }
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckentrytype, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setEntryTypeFullData(response.data.data);
            const entryTypeData = response.data.data.map(
              (data) => data.pck_entrytype_name
            );

            setEntryTypeData(entryTypeData);
            setEntryTypeStatus(true);
            response.data.data.map((item) => {
              if (item.pck_entrytype_name == "Company") {
                setEntryType(item.pck_entrytype_name);
                setEntryTypeDisable(true);
                setPktEntryTypeID(item.pck_entrytype_refno);
                _pktEntryTypeID = item.pck_entrytype_refno;
              }
            });
            Provider.createDFEmployee(
              Provider.API_URLS.get_activitytype_employeeactivityform,
              params
            ).then((response) => {
              if (response.data && response.data.code === 200) {
                if (response.data.data) {
                  setActivityTypeFullData(response.data.data);
                  const activityTypeData = response.data.data.map(
                    (data) => data?.activity_name
                  );
                  setActivityTypeData(activityTypeData);

                  if (route?.params?.type === "edit") {

                    setActivityType(
                      response.data.data.filter((el) => {
                        return (
                          el.activity_refno ==
                          route?.params?.data.activity_refno
                        );
                      })[0]?.activity_name
                    );
                  }
                }
              }
            });

            Provider.createDFEmployee(
              Provider.API_URLS.get_referencerefno_employeeactivityform,
              params
            ).then((response) => {
              if (response.data && response.data.code === 200) {
                if (response.data.data) {
                  setReferenceFullData(response.data.data);
                  const data = response.data.data.map(
                    (data) => data?.reference_name
                  );
                  setReferenceData(data);

                  if (
                    route?.params?.type === "edit" &&
                    route.params?.data?.activitydata.reference_refno !== null &&
                    route.params?.data?.activitydata.reference_refno !==
                    undefined &&
                    route.params?.data?.activitydata.reference_refno !== ""
                  ) {
                    setReference(
                      response.data.data.find(
                        (t) =>
                          t.reference_refno ==
                          route.params?.data?.activitydata.reference_refno
                      )?.reference_name
                    );
                  }
                }
              }
            });

            Provider.createDFEmployee(
              Provider.API_URLS.get_helpperson_employeeactivityform,
              params
            ).then((response) => {
              if (response.data && response.data.code === 200) {
                if (response.data.data) {
                  setSupportPersonFullData(response.data.data);
                  const data = response.data.data.map(
                    (data) => data.employee_user_name
                  );
                  setSupportPersonData(data);
                  if (
                    route?.params?.type === "edit" &&
                    route.params?.data?.activitydata
                      .help_employee_user_refno !== null &&
                    route.params?.data?.activitydata
                      .help_employee_user_refno !== undefined &&
                    route.params?.data?.activitydata
                      .help_employee_user_refno !== ""
                  ) {
                    setSupportPerson(
                      response.data.data.find(
                        (t) =>
                          t.employee_user_refno ==
                          route.params?.data?.activitydata
                            .help_employee_user_refno
                      )?.employee_user_name
                    );
                  }
                }
              }
            });

            if (route.params.type != "edit" && route.params.type != "verify") {
              FetchPaymentMode("", route.params.tabIndex + 1);
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchPaymentMode = (editID, pck_transtype_refno) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_transtype_refno: pck_transtype_refno,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.get_pckpaymentmodetype,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setPayModeFullData(response.data.data);
            const receiptMode = response.data.data.map(
              (data) => data.pckModeName
            );
            setPayModeData(receiptMode);
            if (editID != "") {
              setPayMode(
                response.data.data.filter((el) => {
                  return el.pckModeID == editID;
                })[0].pckModeName
              );
            }

            if (editID == 1) {
              if (value !== "Source" && data.pck_mode_name !== "Source") {
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
      .catch((e) => { });
  };

  const FetchClientList = (clientID) => {
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
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setClientListFullData(response.data.data);

            const clientList = response.data.data.map(
              (data) => data.companyName
            );
            setClientListData(clientList);

            if (clientID != null) {
              setClientList(
                response.data.data.filter((el) => {
                  return el.myclient_refno === clientID;
                })[0].companyName
              );
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchMKTClientList = (clientID) => {
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
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setMKT_ClientListFullData(response.data.data);

            const clientList = response.data.data.map(
              (data) => data.companyName
            );
            setMKT_ClientListData(clientList);

            if (clientID != null) {
              setMKT_ClientList(
                response.data.data.filter((el) => {
                  return el.myclient_refno === clientID;
                })[0].companyName
              );
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchFollowUpCustomerList = (editID) => {
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
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let custData = [];
            response.data.data.map((data) => {
              custData.push({
                company_name: data.company_name,
                contact_person: data.contact_person,
                mycustomer_refno: data.mycustomer_refno,
                displayName:
                  data.contact_person == "" || data.contact_person == null
                    ? data.company_name
                    : data.contact_person + " (" + data.company_name + ")",
              });
            });

            setFollowupFullData(custData);

            const customer = custData.map((data) => data.displayName);
            setFollowupData(customer);

            if (editID != null) {
              setFollowup(
                custData.filter((el) => {
                  return el.mycustomer_refno === editID;
                })[0].displayName
              );
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchPurposeList = (editID) => {
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
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setPurposeFullData(response.data.data);

            const purpose = response.data.data.map(
              (data) => data?.activity_name
            );
            setPurposeData(purpose);

            if (editID != null) {
              setPurpose(
                response.data.data.filter((el) => {
                  return el.activity_refno === editID;
                })[0]?.activity_name
              );
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchExpenseCategory = (receiptModeID, editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        pck_mode_refno: receiptModeID,
        pck_entrytype_refno: _pktEntryTypeID,
        Sess_group_refno_extra_1: groupExtra.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getcategoryname_pckaddexpensesform,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setExpensesFullData(response.data.data);
            const category = response.data.data.map(
              (data) => data.categoryName
            );
            setExpensesData(category);

            if (editID != null) {
              setExpenses(
                response.data.data.filter((el) => {
                  return el.pckCategoryID === editID;
                })[0].categoryName
              );
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchContactType = (editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_contacttype, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setContactTypeFullData(response.data.data);
            const ct = response.data.data.map(
              (data) => data.pck_contacttype_name
            );
            setContactTypeData(ct);

            if (editID != null) {
              setContactType(
                response.data.data.filter((el) => {
                  return el.pck_contacttype_refno == editID;
                })[0].pck_contacttype_name
              );
            }
          }
        }
      })
      .catch((e) => { });
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
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data, "pkt_subcat");
            setSubCategoryNameFullData(response.data.data);
            const subCategory = response.data.data.map(
              (data) => data.subCategoryName
            );
            setSubCategoryNameData(subCategory);

            if (editID != null) {
              setSubCategoryName(
                response.data.data.filter((el) => {
                  return el.subcategoryID === editID;
                })[0].subCategoryName
              );
            }
          }
        }
      })
      .catch((e) => { });
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
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data, "pkt_subcat");
            setProjectExpenseFullData(response.data.data);
            if (
              route.params.type !=
              projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText &&
              route.params.type != "verify"
            ) {
              response.data.data = response.data.data.filter((el) => {
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
                response.data.data = response.data.data.filter((el) => {
                  return (
                    el.subcategoryID ==
                    projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_REFNO
                  );
                });
              }
            }
            const subCategory = response.data.data.map(
              (data) => data.subCategoryName
            );
            setProjectExpenseData(subCategory);

            if (
              route.params.type ==
              projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
            ) {
              setProjectExpense(
                response.data.data.filter((el) => {
                  return (
                    el.subcategoryID ===
                    projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_REFNO
                  );
                })[0].subCategoryName
              );
              setProjectExpenseDisable(true);
            }

            if (editID != null) {
              setProjectExpense(
                response.data.data.filter((el) => {
                  return el.subcategoryID === editID;
                })[0].subCategoryName
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
      .catch((e) => { });
  };

  const FetchBankList = (editID, mode, pck_transtype_refno) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        Sess_group_refno: groupID.toString(),
        Sess_designation_refno: designID.toString(),
        pck_entrytype_refno: _pktEntryTypeID,
        pck_transtype_refno: pck_transtype_refno,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckmybankname, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data, "pkt_subcat");
            setMyBankFullData(response.data.data);

            const bank = response.data.data.map((data) => data.bankName);
            setMyBankData(bank);

            if (editID != null) {
              setMyBank(
                response.data.data.filter((el) => {
                  return el.bank_refno === editID;
                })[0].bankName
              );
            }

            if (mode == 2 || mode == 3 || mode == 4) {
              if (value !== "Source" && data.pck_mode_name !== "Source") {
                setBankBalanceStatus(true);
                FetchBankCurrentBalance(editID);
              }
            } else {
              setBankBalanceStatus(false);
              setBankBalance(0);
            }
          }
        }
      })
      .catch((e) => { });
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
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setCashBalance(response.data.data[0].cashinhand.toString());
            let amt = amount == "" ? 0 : parseFloat(amount);
            let cashAmt =
              response.data.data[0].cashinhand == ""
                ? 0
                : parseFloat(response.data.data[0].cashinhand);
            if (amt > cashAmt) {
              settAmount("");
              setSnackbarText(
                "Your entered amount is greater than for available balance."
              );
              setSnackbarColor(theme.colors.error);
              setSnackbarVisible(true);
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchBankCurrentBalance = (bankID) => {
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
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setBankBalance(response.data.data[0].cashinbank.toString());

            let amt = amount == "" ? 0 : parseFloat(amount);
            let bankAmt =
              response.data.data[0].cashinbank == ""
                ? 0
                : parseFloat(response.data.data[0].cashinbank);

            if (amt > bankAmt) {
              settAmount("");
              setSnackbarText(
                "Your entered amount is greater than for available balance."
              );
              setSnackbarColor(theme.colors.error);
              setSnackbarVisible(true);
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchDepositType = (editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckdeposittype, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data, "pkt_subcat");
            setDepositeTypeFullData(response.data.data);
            const depostiType = response.data.data.map(
              (data) => data.deposit_type_name
            );
            setDepositeTypeData(depostiType);

            if (editID != null) {
              setDepositeType(
                response.data.data.filter((el) => {
                  return el.deposit_type_refno == editID;
                })[0].deposit_type_name
              );
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchReceiverList = (
    editID,
    contactName,
    subCategoryID,
    contactTypeID
  ) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_sub_category_refno: subCategoryID?.toString(),
        pck_contacttype_refno:
          contactTypeID == null
            ? 0
            : contactTypeID == ""
              ? 0
              : contactTypeID.toString(),
        AddNew: "NO",
        UserPhoneBookAllContactList: "",
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckmycontactname, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data, "pkt_subcat");

            setPaidToFullData(response.data.data);

            const receiverList = response.data.data.map(
              (data) => data.contactName
            );
            setPaidToData(receiverList);

            if (editID != null) {
              setPaidTo(
                response.data.data.filter((el) => {
                  return el.mycontactID === editID;
                })[0].contactName
              );
            }

            if (contactName != null && contactName != "") {
              setPaidTo(
                response.data.data.filter((el) => {
                  return el.contactName === contactName;
                })[0].contactName
              );
            }
            return;
          }
        }
      })
      .catch((e) => { });
  };

  const FetchCardType = (editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getcardtype_pckaddexpensesform,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setCardTypeFullData(response.data.data);
            const cardType = response.data.data.map(
              (data) => data.cardtype_name
            );
            setCardTypeData(cardType);

            if (editID != "") {
              setCardType(
                response.data.data.filter((el) => {
                  return el.cardtype_refno == editID;
                })[0].cardtype_name
              );
            }
          }
        }
      })
      .catch((e) => { });
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
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data, "pkt_subcat");
            setCardBankFullData(response.data.data);

            const bank = response.data.data.map((data) => data.bankName);
            setCardBankData(bank);

            if (editID != null) {
              setCardBank(
                response.data.data.filter((el) => {
                  return el.bank_refno === editID;
                })[0].bankName
              );
            }
          }
        }
      })
      .catch((e) => { });
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
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);

            setProjectListFullData(response.data.data);

            const projectList = response.data.data.map(
              (data) => data.project_name
            );
            setProjectListData(projectList);

            if (editID != null) {
              setProjectList(
                response.data.data.filter((el) => {
                  return el.cont_project_refno == editID;
                })[0].project_name
              );
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchBranchList = (editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getbranchlist_pckaddexpensesform,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let listData = [];
            response.data.data.map((data) => {
              listData.push({
                exp_branch_refno: data.exp_branch_refno,
                location_name: data.location_name,
                locationtype_name: data.locationtype_name,
                displayName:
                  data.location_name + " >> " + data.locationtype_name,
              });
            });

            setBranchFullData(listData);

            const branch = listData.map((data) => data.displayName);

            setBranchData(branch);
            if (editID != null) {
              setBranch(
                listData.filter((el) => {
                  return el.exp_branch_refno === editID;
                })[0].displayName
              );
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchDesignationList = (editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getdesignationlist_pckaddexpensesform,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setDesignationFullData(response.data.data);

            const designation = response.data.data.map(
              (data) => data.designation_name
            );

            setDesignationData(designation);

            if (editID != null) {
              setDesignation(
                response.data.data.filter((el) => {
                  return el.designation_refno === editID;
                })[0].designation_name
              );
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchEmployeeList = (editID, designationID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        exp_designation_refno: designationID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getemployeelist_pckaddexpensesform,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let listData = [];
            response.data.data.map((data) => {
              listData.push({
                myemployee_refno: data.myemployee_refno,
                employee_name: data.employee_name,
                employee_code: data.employee_code,
                displayName: data.employee_name + " / " + data.employee_code,
              });
            });

            setEmployeeFullData(listData);

            const employee = listData.map((data) => data.displayName);

            setEmployeeData(employee);

            if (editID != null) {
              setEmployee(
                listData.filter((el) => {
                  return el.myemployee_refno === editID;
                })[0].displayName
              );
            }
          }
        }
      })
      .catch((e) => { });
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
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data, "pkt_subcat");
            setUsageFullData(response.data.data);
            const subCategory = response.data.data.map(
              (data) => data.subCategoryName
            );
            setUsageData(subCategory);

            if (editID != null) {
              setUsage(
                response.data.data.filter((el) => {
                  return el.subcategoryID === editID;
                })[0].subCategoryName
              );
            }
          }
        }
      })
      .catch((e) => { });
  };

  const ShowContactList = () => {
    setIsContactLoading(true);
    (async () => {
      const { status } = await Contacts.requestPermission();
      if (status === "granted") {
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
                    k.phoneNumbers[0].number == ""
                      ? ""
                      : k.phoneNumbers[0].number
                        .replace(/\s+/g, "")
                        .replace(/[^0-9]/g, "").length <= 10
                        ? k.phoneNumbers[0].number
                          .replace(/\s+/g, "")
                          .replace(/[^0-9]/g, "")
                        : k.phoneNumbers[0].number
                          .replace(/\s+/g, "")
                          .replace(/[^0-9]/g, "")
                          .slice(-10)
                  );
                  arrDisplayNumbers.push(k.phoneNumbers[0].number);
                }
              } else {
                if (k.phoneNumbers.number != null) {
                  arrNumbers.push(
                    k.phoneNumbers.number == ""
                      ? ""
                      : k.phoneNumbers.number
                        .replace(/\s+/g, "")
                        .replace(/[^0-9]/g, "").length <= 10
                        ? k.phoneNumbers.number
                          .replace(/\s+/g, "")
                          .replace(/[^0-9]/g, "")
                        : k.phoneNumbers.number
                          .replace(/\s+/g, "")
                          .replace(/[^0-9]/g, "")
                          .slice(-10)
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

  const PhoneClicked = (contact) => {
    if (contact != null) {
      InsertNewContact(contact.name, contact.number);
    }
  };

  const CheckContactList = (contactList, originalList) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_sub_category_refno: "0",
        pck_contacttype_refno: "0",
        AddNew: "YES",
        UserPhoneBookAllContactList: contactList,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckmycontactname, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            var margedList = [];
            let ct = 0;
            if (contactTypeStatus) {
              ct = contactTypeFullData.filter((el) => {
                return el.pck_contacttype_name === contactType;
              })[0].pck_contacttype_refno;
            }

            originalList.map((data) => {
              let n = response.data.data.find((el) => {
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
            navigation.navigate("PhoneContactDirectUpload", {
              phoneNumbers: margedList,
              callback: PhoneClicked,
            });
          }
        }
      })
      .catch((e) => { });
  };

  const FetchExpenseTo = (editID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        Sess_designation_refno: designID,
        Sess_group_refno_extra_1: groupExtra.toString(),
        pck_sub_category_refno: subCategoryNameFullData.filter((el) => {
          return el.subCategoryName === subCategoryName;
        })[0].subcategoryID,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.getexpensesto_pckaddexpensesform,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setExpenseToFullData(response.data.data);
            const expenseTo = response.data.data.map(
              (data) => data.category_name
            );
            setExpenseToData(expenseTo);

            if (editID != null) {
              setExpenseToName(
                response.data.data.filter((el) => {
                  return el.pck_custom_category_refno == editID;
                })[0].category_name
              );
            }
          }
        }
      })
      .catch((e) => { });
  };

  const InsertNewContact = (name, mobileNo) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        contact_name: name,
        contact_phoneno:
          mobileNo.length > 10
            ? mobileNo
              .replace(/\s+/g, "")
              .replace(/[^0-9]/g, "")
              .slice(-10)
            : mobileNo,
        remarks: "",
        view_status: "1",
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.pckmycontactscreate, params)
      .then((response) => {
        setIsContactLoading(false);
        if (response.data && response.data.code === 200) {
          let subcatID = 0,
            ct = 0;
          if (subCatStatus) {
            subcatID = subCategoryNameFullData.filter((el) => {
              return el.subCategoryName === subCategoryName;
            })[0].subcategoryID;
          }
          if (contactTypeStatus) {
            ct = contactTypeFullData.filter((el) => {
              return el.pck_contacttype_name === contactType;
            })[0].pck_contacttype_refno;
          }

          FetchReceiverList(null, name, subcatID, ct);
          setSnackbarText("New Contact Added");
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
      .catch((e) => {
        console.log(e);
        setIsContactLoading(false);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const onPayModeChanged = (text) => {
    setPayMode(text);
    setPMError(false);
    resetFields("mode");

    setExpensesData([]);
    setExpenses("");

    setSubCategoryNameData([]);
    setSubCategoryName("");

    let a = payModeFullData.filter((el) => {
      return el.pckModeName === text;
    });
    FetchExpenseCategory(a[0].pckModeID);
    FetchReceptCategory(null, a[0].pckModeID);
    if (a[0].pckModeID == 5) {
      setCardTypeStatus(true);
      FetchCardType();
    }

    if (a[0].pckModeID == 1 && value !== "Source") {
      setCashBalanceStatus(true);
      FetchAvailableCashBalance();
    } else {
      setCashBalanceStatus(false);
      setCashBalance(0);
    }
    if (value === "Source") {
      setSourceStatus(true);
    }
  };

  const onNewContactChange = (text) => {
    setContactName(text);
  };

  const onMobileNoChange = (text) => {
    setMobileNumber(text);
  };

  const onContactTypeDataChanged = (text) => {
    setContactType(text);
    setErrorContactType(false);

    setPaidToFullData([]);
    setPaidToData([]);
    setPaidTo([]);

    setSCNError(false);
    setCommonDisplayStatus(true);
    setButtonStatus(false);

    let contact = contactTypeFullData.filter((el) => {
      return el.pck_contacttype_name === text;
    });

    let mode = payModeFullData.filter((el) => {
      return el.pckModeName === payMode;
    });

    let category = expensesFullData.filter((el) => {
      return el.categoryName === expenses;
    });

    let subcat = subCategoryNameFullData.filter((el) => {
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

    if (category[0].pckCategoryID == 4) {
      setRecurringReminderDateStatus(true);
      setRecurringStatus(true);
    } else {
      setRecurringReminderDateStatus(false);
      setRecurringStatus(false);
    }

    if (mode[0]?.pckModeID == "2" || mode[0]?.pckModeID == "4") {
      setBankStatus(true);
      FetchBankList(null, null, value == "Source" ? "1" : "2");
      setUtrNoStatus(true);
    }
    if (mode[0]?.pckModeID == "3") {
      setDepositTypeStatus(true);
      FetchDepositType();
    }
  };

  const onProjectExpenseChanged = (text) => {
    setProjectExpense(text);
    setErrorPE(false);
  };

  const onProjectListChanged = (text) => {
    setProjectList(text);
    setErrorPL(false);

    setCommonDisplayStatus(true);
    setButtonStatus(false);

    setProjectExpenseStatus(true);

    let mode = payModeFullData.filter((el) => {
      return el.pckModeName === payMode;
    });

    let a = expensesFullData.filter((el) => {
      return el.categoryName === expenses;
    });

    if (
      a[0].pckCategoryID == projectVariables.DEF_PCKDIARY_CATEGORY_Clients_REFNO
    ) {
      FetchProjectExpense(a[0].pckCategoryID);
    }

    if (
      mode[0]?.pckModeID == projectVariables.DEF_PCKDIARY_MODE_Upi_REFNO ||
      mode[0]?.pckModeID == projectVariables.DEF_PCKDIARY_MODE_RtgsNeft_REFNO
    ) {
      FetchBankList(null, null, value == "Source" ? "1" : "2");
      setBankStatus(true);
      setUtrNoStatus(true);
    } else if (
      mode[0]?.pckModeID == projectVariables.DEF_PCKDIARY_MODE_Cheque_REFNO
    ) {
      setDepositTypeStatus(true);
      FetchDepositType();
    }

    // if (a[0].pckCategoryID == projectVariables.DEF_PCKDIARY_CATEGORY_Clients_REFNO || a[0].pckCategoryID == "4") {

    // }
    // else if (a[0].pckModeID == "3") {
    //   setDepositTypeStatus(true);
    //   FetchDepositType();
    // }
  };

  const onBranchListChanged = (text) => {
    setBranch(text);
    setErrorBR(false);

    setEmployeeData([]);
    setEmployee("");

    setDesignationData([]);
    setDesignation("");

    setDesignationListstatus(true);
    FetchDesignationList();
  };

  const onDesignationListChanged = (text) => {
    setDesignation(text);
    setErrorDesg(false);

    setEmployeeData([]);
    setEmployee("");

    let d = designationFullData.filter((el) => {
      return el.designation_name === text;
    });

    setEmployeeListstatus(true);
    FetchEmployeeList(null, d[0].designation_refno);
  };

  const onEmployeeListChanged = (text) => {
    setEmployee(text);
    setErrorEmp(false);

    let category = expensesFullData.filter((el) => {
      return el.categoryName === expenses;
    });

    setUsageListstatus(true);
    FetchUsageList(null, category[0].pckCategoryID);

    ////////////

    setCommonDisplayStatus(true);
    setButtonStatus(false);

    let mode = payModeFullData.filter((el) => {
      return el.pckModeName === payMode;
    });

    let a = expensesFullData.filter((el) => {
      return el.categoryName === expenses;
    });

    if (
      a[0].pckCategoryID == projectVariables.DEF_PCKDIARY_CATEGORY_Clients_REFNO
    ) {
      FetchProjectExpense(a[0].pckCategoryID);
    }

    if (
      mode[0]?.pckModeID == projectVariables.DEF_PCKDIARY_MODE_Upi_REFNO ||
      mode[0]?.pckModeID == projectVariables.DEF_PCKDIARY_MODE_RtgsNeft_REFNO
    ) {
      FetchBankList(null, null, value == "Source" ? "1" : "2");
      setBankStatus(true);
      setUtrNoStatus(true);
    } else if (
      mode[0]?.pckModeID == projectVariables.DEF_PCKDIARY_MODE_Cheque_REFNO
    ) {
      setDepositTypeStatus(true);
      FetchDepositType();
    }
  };

  const onPerticularListChanged = (text) => {
    setUsage(text);
    setErrorUsage(false);
  };

  const onExpensesChanged = (text) => {
    setExpenses(text);
    setEXError(false);
    resetFields_Level_1();

    setSubCategoryNameData([]);
    setSubCategoryName("");

    let a = expensesFullData.filter((el) => {
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

  const onCardTypeChanged = (text) => {
    setCardType(text);
    setCTError(false);
    setCardBankNameStatus(true);

    let cardID = cardTypeFullData.filter((el) => {
      return el.cardtype_name === text;
    })[0].cardtype_refno;

    FetchCardBankList(cardID);

    if (cardID == 2) {
      setCardRepaymentDateStatus(true);
    } else {
      setCardRepaymentDateStatus(false);
    }
  };

  const onCardBankNameChanged = (text) => {
    setCardBank(text);
    setCBError(false);
  };

  const onSubCategoryNameChanged = (text) => {
    setSubCategoryName(text);
    setSCNError(false);

    setCommonDisplayStatus(true);
    setButtonStatus(false);

    let mode = payModeFullData.filter((el) => {
      return el.pckModeName === payMode;
    });

    let subcat = subCategoryNameFullData.filter((el) => {
      return el.subCategoryName === text;
    });

    let deposit = depositeTypeFullData.filter((el) => {
      return el.deposit_type_name === depositeType;
    });

    if (mode[0]?.pckModeID == "1") {
      if (subcat[0].subcategoryID == "8") {
        setPaidToStatus(true);
        //FetchReceiverList();
        setContactTypeStatus(true);
        FetchContactType();

        setRecurringStatus(true);
        setRecurringReminderDateStatus(true);
      } else {
        setPaidToStatus(false);
        setRecurringStatus(false);
        setRecurringReminderDateStatus(false);
      }
    } else if (mode[0]?.pckModeID == "2" || mode[0]?.pckModeID == "4") {
      FetchBankList(null, null, value == "Source" ? "1" : "2");
      setUtrNoStatus(true);
      setBankStatus(true);

      if (subcat[0].subcategoryID == "8") {
        // setPaidToStatus(true);
        // //FetchReceiverList();
        // setContactTypeStatus(true);
        // FetchContactType();

        setRecurringStatus(true);
        setRecurringReminderDateStatus(true);
      } else {
        // setPaidToStatus(false);
        // //FetchReceiverList();
        // setContactTypeStatus(true);
        // FetchContactType();

        setRecurringStatus(false);
        setRecurringReminderDateStatus(false);
      }
    } else if (mode[0]?.pckModeID == "3") {
      setDepositTypeStatus(true);
      FetchDepositType();

      if (subcat[0].subcategoryID == "8") {
        //FetchBankList();
        //setUtrNoStatus(true);
        //setBankStatus(true);

        // setPaidToStatus(true);
        // //FetchReceiverList();
        // setContactTypeStatus(true);
        // FetchContactType();
        setRecurringStatus(true);
        setRecurringReminderDateStatus(true);
      } else {
        // setPaidToStatus(false);
        // //FetchReceiverList();
        // setContactTypeStatus(true);
        // FetchContactType();
        setRecurringStatus(false);
        setRecurringReminderDateStatus(false);
      }
    }
  };

  const onFollowupChanged = (text) => {
    setFollowup(text);
    setFollowupError(false);
    setPurposeStatus(true);
    FetchPurposeList();
  };

  const displayCommonFields_MKT = () => {
    setCommonDisplayStatus(true);
    setButtonStatus(false);

    let mode = payModeFullData.filter((el) => {
      return el.pckModeName === payMode;
    });

    let category = expensesFullData.filter((el) => {
      return el.categoryName === expenses;
    });

    if (category[0].pckCategoryID == 4) {
      setRecurringReminderDateStatus(true);
      setRecurringStatus(true);
    } else {
      setRecurringReminderDateStatus(false);
      setRecurringStatus(false);
    }

    if (mode[0]?.pckModeID == "2" || mode[0]?.pckModeID == "4") {
      setBankStatus(true);
      FetchBankList(null, null, value == "Source" ? "1" : "2");
      setUtrNoStatus(true);
    }
    if (mode[0]?.pckModeID == "3") {
      setDepositTypeStatus(true);
      FetchDepositType();
    }
  };

  const onPurposeChanged = (text) => {
    setPurpose(text);
    setPurposeError(false);
    displayCommonFields_MKT();
  };

  const onExpenseToChanged = (text) => {
    setExpenseToName(text);
    setExpenseToError(false);
    setPurposeStatus(false);

    let category = expenseToFullData.filter((el) => {
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
      setFollowupStatus(true);
    }
  };

  const onDepositeTypeChanged = (text) => {
    setDepositeType(text);
    setDTError(false);

    let mode = payModeFullData.filter((el) => {
      return el.pckModeName === payMode;
    });

    let subcat = subCategoryNameFullData.filter((el) => {
      return el.subCategoryName === subCategoryName;
    });

    let deposit = depositeTypeFullData.filter((el) => {
      return el.deposit_type_name === text;
    });

    console.log('deposit type:', deposit[0].deposit_type_refno);

    if (deposit[0].deposit_type_refno == 1) {
      setMyBank("");
      setMyBankData([]);
      setMyBankFullData([]);
      FetchBankList(null, null, value == "Source" ? "1" : "2");
      setBankStatus(true);
    }
    else {
      setMyBank("");
      setMyBankData([]);
      setMyBankFullData([]);
      setBankStatus(false);
    }

    setChequeNoStatus(true);
    setChequeDateStatus(true);

    if (mode[0]?.pckModeID == "3" && subCatStatus) {
      if (subcat[0]?.subcategoryID == "8") {
        //setUtrNoStatus(true);

        setPaidToStatus(true);
        FetchReceiverList();

        setRecurringStatus(true);
        setRecurringReminderDateStatus(true);
      } else {
        setPaidToStatus(false);
        FetchReceiverList();

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
    setrecurringDateFlag("1");
    setSubCatStatus(true);
    setContactTypeStatus(false);
    setNewContactNameStatus(false);
    setNewMobileNumberStatus(false);

    setContactTypeData([]);
    setContactType("");

    setPaidToData([]);
    setPaidTo("");

    setBankBalanceStatus(false);
    setBankBalance("");

    setMyBankData([]);
    setMyBank("");

    setBranchListstatus(false);
    setBranchData([]);
    setBranch("");

    setDesignationListstatus(false);
    setDesignationData([]);
    setDesignation("");

    setEmployeeListstatus(false);
    setEmployeeData([]);
    setEmployee("");

    setUsageListstatus(false);
    setUsageData([]);
    setUsage("");

    setProjectListstatus(false);
    setProjectListData([]);
    setProjectList("");

    setClientListstatus(false);
    setClientListData([]);
    setClientList("");

    setProjectExpenseStatus(false);
    setProjectExpenseData([]);
    setProjectExpense("");
  };

  const refill = () => {
    setPayModeData(payModeFullData.map((data) => data.pckModeName));
    // setExpensesData(expensesFullData.map((data) => data.categoryName));
  };
  const resetFields = (temp) => {
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
    setrecurringDateFlag("1");
    setSubCatStatus(true);
    setContactTypeStatus(false);
    setNewContactNameStatus(false);
    setNewMobileNumberStatus(false);

    setContactTypeData([]);
    setContactType("");

    setPaidToData([]);
    setPaidTo("");

    setBankBalanceStatus(false);
    setBankBalance("");

    setCashBalanceStatus(false);
    setCashBalance("");

    setMyBankData([]);
    setMyBank("");

    setBranchListstatus(false);
    setBranchData([]);
    setBranch("");

    setDesignationListstatus(false);
    setDesignationData([]);
    setDesignation("");

    setEmployeeListstatus(false);
    setEmployeeData([]);
    setEmployee("");

    setUsageListstatus(false);
    setUsageData([]);
    setUsage("");

    setProjectListstatus(false);
    setProjectListData([]);
    setProjectList("");

    setClientListstatus(false);
    setClientListData([]);
    setClientList("");

    setProjectExpenseStatus(false);
    setProjectExpenseData([]);
    setProjectExpense("");

    setExpenseToStatus(false);
    setExpenseToFullData([]);
    setExpenseToData([]);
    setExpenseToName("");
    setExpenseToError(false);

    setMKT_ClientListFullData([]);
    setMKT_ClientListData([]);
    setMKT_ClientList("");
    setErrorMKT_CL(false);
    setMKT_ClientListstatus(false);

    setFollowupFullData([]);
    setFollowupData([]);
    setFollowup("");
    setFollowupError(false);
    setFollowupStatus(false);

    setPurposeFullData([]);
    setPurposeData([]);
    setPurpose("");
    setPurposeError(false);
    setPurposeStatus(false);
    //setActivityType("");
    setActivityTypeError("");
    setCommonDisplayStatus(false);

    setVisitLocation("");
    setVisitLocationError(false);
    setActivityRemarks("");

    setEpa("");
    setEpaError(false);
    setEpaData([]);

    setClientType("");
    setClientTypeID("");
    setClientTypeError(false);

    setClienttError(false);
    setClientListtData([]);
    setClientListFullData([]);
    setClientt("");

    setContactPerson("");
    setContactPersonData([]);
    setContactPersonFullData([]);
    setContactPersonError(false);

    setMarketing("");
    setMarketingError(false);

    setActivityStatusError(false);
    setActivityStatus("");

    setNextVisitDay("");
    setNextVisitMonth("");
    setReference("");
    setSupportPerson("");

    setSource("");
    setSourceStatus(false);
    setSourceData([]);
    setSourceFullData([]);

    setDepositeType("");
    setDepositeTypeData([]);
    setDepositeTypeFullData([]);

    setPaymentGroupStatus(false);
    setPaymentTypeStatus(false);
    setInvoiceStatus(false);

    if (temp !== "mode") {
      settAmount("");
      setAmountInvalidBalance(false);
      setAmountError(false);
      setPayModeData([]);
      setPayMode("");
      setExpensesData([]);
      setExpenses("");
      setSubCategoryNameData([]);
      setSubCategoryName("");
      setTimeout(refill, 20);
    }
  };

  const onEntryTypeChanged = (selectedItem) => {
    FetchPaymentMode("", 2);
    setEntryType(selectedItem);
    resetFields();

    setExpensesData([]);
    setExpenses("");

    setSubCategoryNameData([]);
    setSubCategoryName("");

    setValue("");

    let a = entryTypeFullData.filter((el) => {
      return el.pck_entrytype_name === selectedItem;
    });

    setPktEntryTypeID(a[0].pck_entrytype_refno);
    _pktEntryTypeID = a[0].pck_entrytype_refno;
  };

  const onAmount = (tex) => {
    const text = tex.replace(/[^0-9.]/g, "");
    const dotCount = text.split(".").length - 1;
    if (dotCount > 1) {
      return;
    }
    let mode = payModeFullData.filter((el) => {
      return el.pckModeName === payMode;
    });

    if (mode.length > 0 && mode[0]?.pckModeID == 1 && cashBalanceStatus) {
      if (parseFloat(text) > parseFloat(cashBalance.replace(/,/g, ""))) {
        settAmount("");
        setAmountError(true);
        setAmountInvalidBalance("Amount can not be more then balance amount");
      } else {
        settAmount(text);
        setAmountError(false);
      }
    } else if (
      mode.length > 0 &&
      (mode[0]?.pckModeID == 2 ||
        mode[0]?.pckModeID == 3 ||
        mode[0]?.pckModeID == 4) &&
      bankBalanceStatus
    ) {
      if (parseFloat(text) > parseFloat(bankBalance.replace(/,/g, ""))) {
        settAmount("");
        setAmountError(true);
        setAmountInvalidBalance("Amount can not be more then balance amount");
      } else {
        settAmount(text);
        setAmountError(false);
      }
    } else {
      settAmount(text);
      setAmountError(false);
    }
  };

  const onChequeNO = (tex) => {
    const text = tex.replace(/[^a-zA-Z0-9]/g, "");
    setChequeNo(text);
    setChequeNoError(false);
  };

  const onUtrNo = (text) => {
    const filteredText = text.replace(/[^a-zA-Z0-9]/g, "");
    setUtrNo(filteredText);
    setUtrNoError(false);
  };

  const onNotes = (text) => {
    setNotes(text);
    setNotesError(false);
  };

  const onPaidToChanged = (text) => {
    setPaidTo(text);
    setPTError(false);
  };

  const onMyBankChanged = (text) => {
    setMyBank(text);
    setMBError(false);

    let mode = payModeFullData.filter((el) => {
      return el.pckModeName === payMode;
    });

    if (
      mode[0]?.pckModeID == 2 ||
      mode[0]?.pckModeID == 3 ||
      mode[0]?.pckModeID == 4
    ) {
      if (value !== "Source") {
        setBankBalanceStatus(true);

        let bankID = myBankFullData.filter((el) => {
          return el.bankName === text;
        })[0].bank_refno;

        FetchBankCurrentBalance(bankID);
      }
    } else {
      setBankBalanceStatus(false);
      setBankBalance(0);
    }
  };

  const onClientListChanged = (text) => {
    setClientList(text);
    setErrorCL(false);

    let a = clientListFullData.filter((el) => {
      return el.companyName === text;
    });
    let mode = payModeFullData.filter((el) => {
      return el.pckModeName === payMode;
    });
    if (value !== "Source") {
      setProjectListstatus(true);
      FetchProjectList(a[0].myclient_refno);
    } else {
      setCommonDisplayStatus(true);

      setPaymentGroupStatus(true);
      FetchPaymentGroup();
      FetchPaymentType();

      if (mode[0]?.pckModeID == "2" || mode[0]?.pckModeID == "4") {
        setBankStatus(true);
        FetchBankList(null, null, value == "Source" ? "1" : "2");
        setUtrNoStatus(true);
      } else if (mode[0]?.pckModeID == "3") {
        setDepositTypeStatus(true);
        FetchDepositType();
      }
    }
  };

  const onMKT_ClientListChanged = (text) => {
    setMKT_ClientList(text);
    setErrorMKT_CL(false);
    displayCommonFields_MKT();
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

  const getClientList = (id) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        activity_entry_type: "1",
        refer_user_refno: id,
      },
    };
    if (id == undefined || id == null) {
      Provider.createDFEmployee(
        Provider.API_URLS.get_myclient_companyname_employeeactivityform,
        params
      ).then((response) => {
        if (response.data.data) {
          setClientListtFullData(response.data.data);
          const list = response.data.data.map((data) => data.company_name);
          setClientListtData(list);
          if (route?.params?.type === "edit") {
            let x = response.data.data?.find(
              (data) =>
                data.myclient_refno == route.params?.data?.myclient_refno
            );
            setClientt(x ? x?.company_name : "");
            getContactPersonList(route.params?.data?.myclient_refno);
          }
        }
      });
    } else {
      Provider.createDFEmployee(
        Provider.API_URLS.get_otherclient_companyname_employeeactivityform,
        params
      ).then((response) => {
        if (response.data.data) {
          setClientListtFullData(response.data.data);
          const list = response.data.data.map((data) => data.company_name);
          setClientListtData(list);
          if (route?.params?.type === "edit") {
            let x = response.data.data?.find(
              (data) =>
                data.myclient_refno == route.params?.data?.myclient_refno
            );
            setClientt(x ? x?.company_name : "");
            getContactPersonList(route.params?.data?.myclient_refno);
          }
        }
      });
    }
  };
  const getContactPersonList = (id) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        myclient_refno: id.toString(),
      },
    };
    Provider.createDFEmployee(
      Provider.API_URLS.get_contactpersonname_employeeactivityform,
      params
    ).then((response) => {
      if (response.data.data) {
        setContactPersonFullData(response.data.data);
        const list = response.data.data.map((data) => {
          return `${data.contact_person} (${data.designation} >> ${data.mobile_no})`;
        });
        setContactPersonData(list);

        if (route?.params?.type !== "edit") {
          if (list?.length == 1) {
            setContactPerson(list[0]);
          }
        }

        if (route?.params?.type === "edit") {
          let x = response.data.data?.find(
            (data) =>
              data.myclient_detail_refno ==
              route.params?.data?.activitydata?.myclient_detail_refno
          );
          setContactPerson(
            x ? `${x.contact_person} (${x.designation} >> ${x.mobile_no})` : ""
          );
        }
      }
    });
  };
  const InsertData = () => {
    const datas = new FormData();
    let params = {
      Sess_UserRefno: userID,
      Sess_company_refno: companyID.toString(),
      Sess_branch_refno: branchID.toString(),
      Sess_group_refno: groupID.toString(),
      Sess_designation_refno: designID.toString(),
      pck_entrytype_refno: pktEntryTypeID,

      pck_sub_category_notes: "",
      notes: notes.trim(),
      invoice_no: "",
      view_status: checked ? "1" : "0",
      activity_date_time: moment(new Date()).format("DD-MM-YYYY H:mm:ss"),
      last_gprs_activitytrack_refno:
        loc?.last_gprs_activitytrack_refno?.toString(),
      latitude: loc?.latitude?.toString(),
      longitude: loc?.longitude?.toString(),
      kilometer: loc?.kilometer?.toString(),
      gprs_location_name: loc?.gprs_location_name?.toString(),
    };

    if (
      entryType === "Self" ||
      (entryType === "Company" && (value === "Expenses" || value === "Source"))
    ) {
      params.pck_mode_refno = payModeFullData
        .filter((el) => {
          return el.pckModeName === payMode;
        })[0]
        .pckModeID.toString();
    }
    if (paymentTypeStatus) {
      params.payment_type_refno = paymentTypeID;
    }

    if (paymentGroupStatus) {
      params.payment_group_refno = paymentGroupID.toString();
    }
    if (invoiceStatus) {
      params.invoice_no = invoiceNo.trim() == "" ? "" : invoiceNo.trim();
    }
    if (
      entryType === "Self" ||
      (entryType === "Company" && (value === "Expenses" || value == "Source"))
    ) {
      params.amount = amount.trim().toString();
    } else {
      params.amount = "0";
    }

    if (
      entryType === "Self" ||
      (entryType === "Company" && value === "Expenses")
    ) {
      params.pck_category_refno = expensesFullData
        .filter((el) => {
          return el.categoryName === expenses;
        })[0]
        .pckCategoryID.toString();
    }
    if (value === "Source") {
      params.pck_category_refno = sourceFullData
        .filter((el) => {
          return el.categoryName === source;
        })[0]
        .pckCategoryID.toString();
    }

    if (subCatStatus && value !== "Activity" && value !== "Source") {
      params.pck_sub_category_refno = subCategoryNameFullData
        .filter((el) => {
          return el.subCategoryName === subCategoryName;
        })[0]
        .subcategoryID.toString();
    }

    if (cardTypeStatus) {
      params.cardtype_refno = cardTypeFullData
        .filter((el) => {
          return el.cardtype_name === cardType;
        })[0]
        .cardtype_refno.toString();
    }

    if (cardBankNameStatus) {
      params.pck_card_mybank_refno = cardBankFullData
        .filter((el) => {
          return el.bankName === cardBank;
        })[0]
        .bank_refno.toString();
    }

    if (cardRepaymentDateStatus) {
      params.due_date =
        cardRepayment == "" ? "" : moment(cardRepayment).format("DD-MM-YYYY");
    }

    if (paidToStatus) {
      params.pck_mycontact_refno = paidToFullData
        .filter((el) => {
          return el.contactName === paidTo;
        })[0]
        .mycontactID.toString();
    }

    if (bankStatus) {
      params.pck_mybank_refno = myBankFullData
        .filter((el) => {
          return el.bankName === MyBank;
        })[0]
        .bank_refno.toString();
    }

    if (utrNoStatus) {
      params.utr_no = utrNo == "" ? "" : utrNo.trim();
    }

    if (chequeNoStatus) {
      params.cheque_no = chequeNo == "" ? "" : chequeNo.trim();
    }

    if (depositTypeStatus) {
      params.deposit_type_refno = depositeTypeFullData
        .filter((el) => {
          return el.deposit_type_name === depositeType;
        })[0]
        .deposit_type_refno.toString();
    }

    if (chequeDateStatus) {
      params.cheque_date =
        chequeDate == "" ? "" : moment(chequeDate).format("DD-MM-YYYY");
    }

    if (recurringReminderDateStatus) {
      params.reminder_date =
        recurringDate == "" ? "" : moment(recurringDate).format("DD-MM-YYYY");
    }

    if (recurringStatus) {
      params.recurring_status = recurringDateFlat.toString();
    }

    // if (
    //   groupID == projectLoginTypes.DEF_EMPLOYEE_GROUP_REFNO &&
    //   designID ==
    //     projectFixedDesignations.DEF_MARKETINGEXECUTIVE_DESIGNATION_REFNO &&
    //   _pktEntryTypeID == projectVariables.DEF_PCKDIARY_ENTRYTYPE_COMPANY_REFNO
    // ) {
    //   if (MKT_clientListStatus) {
    //     params.myclient_refno = MKT_clientListFullData.filter((el) => {
    //       return el.companyName === MKT_clientList;
    //     })[0].myclient_refno;
    //   }
    // } else {
    //   if (clientListStatus) {
    //     params.myclient_refno = clientListFullData.filter((el) => {
    //       return el.companyName === clientList;
    //     })[0].myclient_refno;
    //   }
    // }
    if (entryType == "Source") {
      params.pck_transtype_refno = valueFullData
        .filter((t) => t.pck_transtype_name === value)[0]
        .pck_transtype_refno.toString();
    }

    if (entryType === "Company") {
      params.visit_location_name = visitLocation;

      params.pck_transtype_refno = valueFullData
        .filter((t) => t.pck_transtype_name === value)[0]
        .pck_transtype_refno.toString();

      if (value === "Source") {
        params.myclient_refno = clientListFullData.filter((el) => {
          return el.companyName === clientList;
        })[0].myclient_refno;
      }

      if (activityType !== "Office Work" && value !== "Source") {
        params.activity_status = activityStatusFullData
          .filter((t) => t.activity_status_name === activityStatus)[0]
          ?.activity_status.toString();

        params.activity_entry_type = clientTypeFullData
          .filter((temp) => temp?.activity_entry_type_name === clientType)[0]
          ?.activity_entry_type.toString();

        params.myclient_refno = clientListtFullData
          .filter((el) => el.company_name === clientt)[0]
          ?.myclient_refno.toString();

        params.pck_custom_category_refno = epaFullData
          .filter((el) => {
            return el.category_name === epa;
          })[0]
          ?.pck_custom_category_refno.toString();

        params.myclient_detail_refno = contactPersonFullData
          .filter(
            (data) =>
              `${data.contact_person} (${data.designation} >> ${data.mobile_no})` ===
              contactPerson
          )[0]
          ?.myclient_detail_refno.toString();
      }

      if (clientTypeID == 2) {
        params.refer_user_refno = marketingFullData
          .filter((t) => t.employee_name === marketing)[0]
          .refer_user_refno.toString();
      }

      if (nextVisitDay !== "") {
        params.next_visit_no = nextVisitDayFullData
          .filter((t) => t.next_visit_no_name === nextVisitDay)[0]
          .next_visit_no.toString();
      }

      if (nextVisitMonth !== "") {
        params.daysmonths_refno = nextVisitMonthFullData
          .filter((t) => t.daysmonths_name === nextVisitMonth)[0]
          .daysmonths_refno.toString();
      }

      if (reference !== "" && clientTypeID == 1) {
        params.reference_refno = referenceFullData
          .filter((t) => t?.reference_name === reference)[0]
          .reference_refno.toString();
      }

      if (
        clientTypeID == 1 &&
        supportPerson !== "" &&
        supportPerson !== null &&
        supportPerson !== undefined
      ) {
        params.help_employee_user_refno = supportPersonFullData
          .filter((t) => t.employee_user_name === supportPerson)[0]
          .employee_user_refno.toString();
      }

      params.activity_remarks = activityRemarks;
    }

    if (followupStatus) {
      params.mycustomer_refno = followupFullData
        .filter((el) => {
          return el.displayName === followup;
        })[0]
        .mycustomer_refno.toString();
    } else {
      params.mycustomer_refno = "0";
    }

    if (value === "Activity" || value === "Expenses") {
      params.activity_refno = activityTypeFullData
        .filter((el) => {
          return el?.activity_name === activityType;
        })[0]
        .activity_refno.toString();
    } else {
      params.activity_refno = "0";
    }

    if (projectListStatus) {
      params.cont_project_refno = projectListFullData
        .filter((el) => {
          return el.project_name === projectList;
        })[0]
        .cont_project_refno.toString();
    }

    if (projectExpenseStatus) {
      params.dynamic_expenses_refno = projectExpenseFullData
        .filter((el) => {
          return el.subCategoryName === projectExpense;
        })[0]
        .subcategoryID.toString();
    } else if (usageListStatus) {
      params.dynamic_expenses_refno = usageFullData
        .filter((el) => {
          return el.subCategoryName === usage;
        })[0]
        .subcategoryID.toString();
    }

    if (
      route.params.type ===
      projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
    ) {
      params.pck_master_trans_refno = route.params.data.transactionID;
    }

    if (contactTypeStatus) {
      params.pck_contacttype_refno = contactTypeFullData
        .filter((el) => {
          return el.pck_contacttype_name === contactType;
        })[0]
        .pck_contacttype_refno.toString();
    } else {
      params.pck_contacttype_refno = "0";
    }

    if (newContactNameStatus) {
      params.contact_name = contactName.trim() == "" ? "" : contactName.trim();
    }

    if (newMobileNumberStatus) {
      params.contact_phoneno =
        mobileNumber.trim() == "" ? "" : mobileNumber.trim();
    }

    if (branchListStatus) {
      params.exp_branch_refno = branchFullData
        .filter((el) => {
          return el.displayName === branch;
        })[0]
        .exp_branch_refno.toString();
    }

    if (designationListStatus) {
      params.exp_designation_refno = designationFullData
        .filter((el) => {
          return el.designation_name === designation;
        })[0]
        .designation_refno.toString();
    }

    if (employeeListStatus) {
      params.myemployee_refno = employeeFullData
        .filter((el) => {
          return el.displayName === employee;
        })[0]
        .myemployee_refno.toString();
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


    Provider.createDFPocketDairyWithHeader(
      Provider.API_URLS.pckadd_source_expenses_activity_create,
      datas
    )
      .then((response) => {
        setIsButtonLoading(false);
        if (
          response.data &&
          response.data.code === 200 &&
          response.data.data.Created == 1
        ) {
          route.params.fetchData("add");
          navigation.goBack();
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.InsertError);
          setSnackbarVisible(true);
        }
      })
      .catch((e) => {
        setIsButtonLoading(false);
        console.log(e);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const UpdateData = (type, mode) => {
    const datas = new FormData();
    let params = {
      pck_trans_refno_edit: pckTransID,
      Sess_UserRefno: userID,
      Sess_company_refno: companyID.toString(),
      Sess_branch_refno: branchID.toString(),
      Sess_group_refno: groupID.toString(),
      Sess_designation_refno: designID.toString(),
      pck_entrytype_refno: pktEntryTypeID,
      pck_sub_category_notes: "",
      notes: notes.trim(),
      invoice_no: "",
      view_status: checked ? "1" : "0",
      activity_date_time: moment(new Date()).format("DD-MM-YYYY H:mm:ss"),
      last_gprs_activitytrack_refno:
        loc?.last_gprs_activitytrack_refno?.toString(),
      latitude: loc?.latitude?.toString(),
      longitude: loc?.longitude?.toString(),
      kilometer: loc?.kilometer?.toString(),
      gprs_location_name: loc?.gprs_location_name?.toString(),
    };

    if (
      entryType === "Self" ||
      (entryType === "Company" && (value === "Expenses" || value === "Source"))
    ) {
      params.pck_mode_refno = payModeFullData
        .filter((el) => {
          return el.pckModeName === payMode;
        })[0]
        .pckModeID.toString();
    }
    if (paymentTypeStatus) {
      params.payment_type_refno = paymentTypeID;
    }

    if (paymentGroupStatus) {
      params.payment_group_refno = paymentGroupID.toString();
    }
    if (invoiceStatus) {
      params.invoice_no = invoiceNo.trim() == "" ? "" : invoiceNo.trim();
    }
    if (
      entryType === "Self" ||
      (entryType === "Company" && (value === "Expenses" || value == "Source"))
    ) {
      params.amount = amount.trim().toString();
    } else {
      params.amount = "0";
    }

    if (
      entryType === "Self" ||
      (entryType === "Company" && value === "Expenses")
    ) {
      params.pck_category_refno = expensesFullData
        .filter((el) => {
          return el.categoryName === expenses;
        })[0]
        .pckCategoryID.toString();
    }
    if (value === "Source") {
      params.pck_category_refno = sourceFullData
        .filter((el) => {
          return el.categoryName === source;
        })[0]
        .pckCategoryID.toString();
    }

    if (subCatStatus && value !== "Activity" && value !== "Source") {
      params.pck_sub_category_refno = subCategoryNameFullData
        .filter((el) => {
          return el.subCategoryName === subCategoryName;
        })[0]
        .subcategoryID.toString();
    }

    if (cardTypeStatus) {
      params.cardtype_refno = cardTypeFullData
        .filter((el) => {
          return el.cardtype_name === cardType;
        })[0]
        .cardtype_refno.toString();
    }

    if (cardBankNameStatus) {
      params.pck_card_mybank_refno = cardBankFullData
        .filter((el) => {
          return el.bankName === cardBank;
        })[0]
        .bank_refno.toString();
    }

    if (cardRepaymentDateStatus) {
      params.due_date =
        cardRepayment == "" ? "" : moment(cardRepayment).format("DD-MM-YYYY");
    }

    if (paidToStatus) {
      params.pck_mycontact_refno = paidToFullData
        .filter((el) => {
          return el.contactName === paidTo;
        })[0]
        .mycontactID.toString();
    }

    if (bankStatus) {
      params.pck_mybank_refno = myBankFullData
        .filter((el) => {
          return el.bankName === MyBank;
        })[0]
        .bank_refno.toString();
    }

    if (utrNoStatus) {
      params.utr_no = utrNo == "" ? "" : utrNo.trim();
    }

    if (chequeNoStatus) {
      params.cheque_no = chequeNo == "" ? "" : chequeNo.trim();
    }

    if (depositTypeStatus) {
      params.deposit_type_refno = depositeTypeFullData
        .filter((el) => {
          return el.deposit_type_name === depositeType;
        })[0]
        .deposit_type_refno.toString();
    }

    if (chequeDateStatus) {
      params.cheque_date =
        chequeDate == "" ? "" : moment(chequeDate).format("DD-MM-YYYY");
    }

    if (recurringReminderDateStatus) {
      params.reminder_date =
        recurringDate == "" ? "" : moment(recurringDate).format("DD-MM-YYYY");
    }

    if (recurringStatus) {
      params.recurring_status = recurringDateFlat.toString();
    }

    // if (
    //   groupID == projectLoginTypes.DEF_EMPLOYEE_GROUP_REFNO &&
    //   designID ==
    //     projectFixedDesignations.DEF_MARKETINGEXECUTIVE_DESIGNATION_REFNO &&
    //   _pktEntryTypeID == projectVariables.DEF_PCKDIARY_ENTRYTYPE_COMPANY_REFNO
    // ) {
    //   if (MKT_clientListStatus) {
    //     params.myclient_refno = MKT_clientListFullData.filter((el) => {
    //       return el.companyName === MKT_clientList;
    //     })[0].myclient_refno;
    //   }
    // } else {
    //   if (clientListStatus) {
    //     params.myclient_refno = clientListFullData.filter((el) => {
    //       return el.companyName === clientList;
    //     })[0].myclient_refno;
    //   }
    // }
    if (entryType == "Source") {
      params.pck_transtype_refno = valueFullData
        .filter((t) => t.pck_transtype_name === value)[0]
        .pck_transtype_refno.toString();
    }

    if (entryType === "Company") {
      params.visit_location_name = visitLocation;

      params.pck_transtype_refno = valueFullData
        .filter((t) => t.pck_transtype_name === value)[0]
        .pck_transtype_refno.toString();

      if (value === "Source") {
        params.myclient_refno = clientListFullData.filter((el) => {
          return el.companyName === clientList;
        })[0].myclient_refno;
      }

      if (activityType !== "Office Work" && value !== "Source") {
        params.activity_status = activityStatusFullData
          .filter((t) => t.activity_status_name === activityStatus)[0]
          ?.activity_status.toString();

        params.activity_entry_type = clientTypeFullData
          .filter((temp) => temp?.activity_entry_type_name === clientType)[0]
          ?.activity_entry_type.toString();

        params.myclient_refno = clientListtFullData
          .filter((el) => el.company_name === clientt)[0]
          ?.myclient_refno.toString();

        params.pck_custom_category_refno = epaFullData
          .filter((el) => {
            return el.category_name === epa;
          })[0]
          ?.pck_custom_category_refno.toString();

        params.myclient_detail_refno = contactPersonFullData
          .filter(
            (data) =>
              `${data.contact_person} (${data.designation} >> ${data.mobile_no})` ===
              contactPerson
          )[0]
          ?.myclient_detail_refno.toString();
      }

      if (clientTypeID == 2) {
        params.refer_user_refno = marketingFullData
          .filter((t) => t.employee_name === marketing)[0]
          .refer_user_refno.toString();
      }

      if (nextVisitDay !== "") {
        params.next_visit_no = nextVisitDayFullData
          .filter((t) => t.next_visit_no_name === nextVisitDay)[0]
          .next_visit_no.toString();
      }

      if (nextVisitMonth !== "") {
        params.daysmonths_refno = nextVisitMonthFullData
          .filter((t) => t.daysmonths_name === nextVisitMonth)[0]
          .daysmonths_refno.toString();
      }

      if (reference !== "" && clientTypeID == 1) {
        params.reference_refno = referenceFullData
          .filter((t) => t?.reference_name === reference)[0]
          .reference_refno.toString();
      }

      if (
        clientTypeID == 1 &&
        supportPerson !== "" &&
        supportPerson !== null &&
        supportPerson !== undefined
      ) {
        params.help_employee_user_refno = supportPersonFullData
          .filter((t) => t.employee_user_name === supportPerson)[0]
          .employee_user_refno.toString();
      }

      params.activity_remarks = activityRemarks;
    }

    if (followupStatus) {
      params.mycustomer_refno = followupFullData
        .filter((el) => {
          return el.displayName === followup;
        })[0]
        .mycustomer_refno.toString();
    } else {
      params.mycustomer_refno = "0";
    }

    if (value === "Activity" || value === "Expenses") {
      params.activity_refno = activityTypeFullData
        .filter((el) => {
          return el?.activity_name === activityType;
        })[0]
        .activity_refno.toString();
    } else {
      params.activity_refno = "0";
    }

    if (projectListStatus) {
      params.cont_project_refno = projectListFullData
        .filter((el) => {
          return el.project_name === projectList;
        })[0]
        .cont_project_refno.toString();
    }

    if (projectExpenseStatus) {
      params.dynamic_expenses_refno = projectExpenseFullData
        .filter((el) => {
          return el.subCategoryName === projectExpense;
        })[0]
        .subcategoryID.toString();
    } else if (usageListStatus) {
      params.dynamic_expenses_refno = usageFullData
        .filter((el) => {
          return el.subCategoryName === usage;
        })[0]
        .subcategoryID.toString();
    }

    if (
      route.params.type ===
      projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
    ) {
      params.pck_master_trans_refno = route.params.data.transactionID;
    }

    if (contactTypeStatus) {
      params.pck_contacttype_refno = contactTypeFullData
        .filter((el) => {
          return el.pck_contacttype_name === contactType;
        })[0]
        .pck_contacttype_refno.toString();
    } else {
      params.pck_contacttype_refno = "0";
    }

    if (newContactNameStatus) {
      params.contact_name = contactName.trim() == "" ? "" : contactName.trim();
    }

    if (newMobileNumberStatus) {
      params.contact_phoneno =
        mobileNumber.trim() == "" ? "" : mobileNumber.trim();
    }

    if (branchListStatus) {
      params.exp_branch_refno = branchFullData
        .filter((el) => {
          return el.displayName === branch;
        })[0]
        .exp_branch_refno.toString();
    }

    if (designationListStatus) {
      params.exp_designation_refno = designationFullData
        .filter((el) => {
          return el.designation_name === designation;
        })[0]
        .designation_refno.toString();
    }

    if (employeeListStatus) {
      params.myemployee_refno = employeeFullData
        .filter((el) => {
          return el.displayName === employee;
        })[0]
        .myemployee_refno.toString();
    }

    datas.append("data", JSON.stringify(params));
    datas.append(
      "attach_receipt",
      isImageReplaced
        ? {
          name: file.name,
          //type: file.mimeType,
          type: file.type || file.mimeType,
          uri: file.uri,
        }
        : ""
    );

    Provider.createDFPocketDairyWithHeader(
      Provider.API_URLS.pckadd_source_expenses_activity_update,
      datas
    )

      .then((response) => {
        setIsButtonLoading(false);
        if (
          response.data &&
          response.data.code === 200 &&
          response.data.data.Updated == 1
        ) {
          route.params.fetchData("update");
          navigation.goBack();
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.UpdateError);
          setSnackbarVisible(true);
        }
      })
      .catch((e) => {
        setIsButtonLoading(false);
        console.log(e);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const ValidateData = async () => {
    let isValid = true;
    if (clientTypeID == 1 && contactPerson === "") {
      isValid = false;
      setContactPersonError(true);
      return;
    }
    if (entryType !== "Self" && visitLocation === "" && value !== "Source") {
      isValid = false;
      setVisitLocationError(true);
      // return;
    }
    if (loc?.latitude == null || loc?.latitude == undefined) {
      const temp = await getLocation("validate");
      if (!temp) {
        setSnackbarText("Please turn on GPS location.");
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        isValid = false;
        return;
      }
    }

    if (entryType == "") {
      isValid = false;
      setEntryTypeError(true);
    }

    if (value !== "Activity" && (amount.trim() == "0" || amount.trim() == "")) {
      setAmountError(true);
      isValid = false;
      setAmountInvalidBalance("Please enter a valid amount");
    }

    if (
      entryType === "Company" &&
      (activityStatus === "" ||
        activityStatus === null ||
        activityStatus === undefined)
    ) {
      if (value === "Activity" && activityType !== "Office Work") {
        isValid = false;
        setActivityStatusError(true);
      }
    }

    if (payMode == "" && value !== "Activity") {
      isValid = false;
      setPMError(true);
    }

    if (cardTypeStatus && cardType == "") {
      setCTError(true);
      isValid = false;
    }

    if (cardBankNameStatus && cardBank == "") {
      setCBError(true);
      isValid = false;
    }

    if (cardRepaymentDateStatus && cardRepayment == "") {
      setErrorCRPayment(true);
      isValid = false;
    }

    if (expenses == "" && value !== "Activity" && value !== "Source") {
      setEXError(true);
      isValid = false;
    }

    if (
      subCatStatus &&
      subCategoryName == "" &&
      value !== "Activity" &&
      value !== "Source"
    ) {
      setSCNError(true);
      isValid = false;
    }

    if (paidToStatus && paidTo == "") {
      setPTError(true);
      isValid = false;
    }

    if (recurringReminderDateStatus && recurringDate == "") {
      setErrorRD(true);
      isValid = false;
    }

    if (bankStatus && MyBank == "") {
      setMBError(true);
      isValid = false;
    }

    if (chequeNoStatus && chequeNo.trim() == "") {
      setChequeNoError(true);
      isValid = false;
    }

    if (chequeDateStatus && chequeDate == "") {
      setChequeDateInvalid(true);
      isValid = false;
    }

    if (clientListStatus && clientList == "") {
      setErrorCL(true);
      isValid = false;
    }

    if (projectListStatus && projectList == "") {
      setErrorPL(true);
      isValid = false;
    }

    if (sourceStatus && source == "") {
      setSSError(true);
      isValid = false;
    }

    if (paymentTypeStatus && paymentTypeID == 0) {
      isValid = false;
      setErrorPTT(true);
    }

    if (paymentGroupStatus && paymentGroupID == 0) {
      isValid = false;
      setErrorPG(true);
    }

    if (invoiceStatus && invoiceNo.trim() == "") {
      isValid = false;
      setInvoiceNoError(true);
    }

    if (isValid) {
      setIsButtonLoading(true);
      if (route.params.type === "edit" || route.params.type === "verify") {
        UpdateData(route.params.type, route.params.mode);
      } else {
        InsertData();
      }
    } else {
      setSnackbarText("Please fill all mandatory fields");
      setSnackbarColor(theme.colors.error);
      setSnackbarVisible(true);
    }
  };

  const FetchClients = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        Sess_group_refno: groupID,
        Sess_group_refno_extra_1: groupExtra,
        client_user_refno: "all",
      },
    };
    Provider.createDFCommon(Provider.API_URLS.MyClientUserRefNoCheck, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setClientsFullData(response.data.data);
            let clientData = response.data.data.map(
              (data) => data.company_name
            );
            setClientData(clientData);
          }
        } else {
          setClientData([]);
          setClientsFullData([]);
        }
      })
      .catch((e) => {
        setClientData([]);
        setClientsFullData([]);
      });
  };

  const FetchOtherClients = (selectedItem, type) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
      },
    };
    if (type === "company") {
      params.data.company_name = selectedItem;
    } else {
      params.data.mobile_no = selectedItem;
    }
    Provider.createDFCommon(
      type === "company"
        ? Provider.API_URLS.CompanyNameAutocompleteClientSearch
        : Provider.API_URLS.MobileNoAutocompleteClientSearch,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let clientData = [];
            response.data.data.map((data, i) => {
              clientData.push({
                id: i,
                title:
                  type === "company"
                    ? data.companyname_Result
                    : data.mobile_no_Result,
              });
            });
            if (type === "company") {
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
      .catch((e) => {
        setCompanyData([]);
        setMobileNoData([]);
      });
  };

  const onCompanyNameSelected = (selectedItem) => {
    setCompanyName(selectedItem);
    setCONError(false);
    FetchOtherClients(selectedItem, "company");
  };
  const onInvoiceNoChange = (tex) => {
    const text = tex.replace(/[^0-9]/g, "");
    setInvoiceNo(text);
    setInvoiceNoError(false);
  };

  function onPaymentTypeChange(radioButtonsArray) {
    setPaymentRB(radioButtonsArray);

    radioButtonsArray.map((r) => {
      if (r.selected === true) {
        setPaymentTypeID(r.value);
      }
    });
  }

  function onPaymentGroupChange(radioButtonsArray) {
    setPaymentTypeStatus(true);
    setInvoiceStatus(true);
    setPaymentGroupID(radioButtonsArray);
  }

  const onMobileNumberSelected = (selectedItem) => {
    setMobileNo(selectedItem);
    setMNError(false);
    FetchOtherClients(selectedItem, "mobile");
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
      .then((response) => {
        setIsButtonDisabled(false);
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setOtherClients(response.data.data);
          }
        } else {
          setOtherClients([]);
        }
      })
      .catch((e) => {
        setIsButtonDisabled(false);
        setOtherClients([]);
      });
  };

  const InsertOtherClient = (selectedID) => {
    const params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        client_user_refno: selectedID,
        search_client_role_refnos: ["8"], // for client TBD
      },
    };
    Provider.createDFCommon(Provider.API_URLS.ClientAdd, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          refRBSheet.current.close();
          getClientList();
        } else {
          setSnackbarText(communication.InsertError);
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
        }
      })
      .catch((e) => {
        console.log(e);
        setSnackbarText(communication.NetworkError);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
      });
  };

  const [value, setValue] = React.useState("");
  //#endregion

  const [state, setState] = useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  return (
    <View style={[Styles.flex1]}>
      <ScrollView
        style={[Styles.flex1, Styles.backgroundColor, { marginBottom: 64 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[Styles.padding16]}>
          {entryTypeStatus && (
            <>
              <Dropdown
                label="Entry Type *"
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
          {entryType !== "Self" && (
            <View>
              <Text>Transaction Type:</Text>
              <RadioButton.Group
                onValueChange={(newValue) => {
                  setValue(newValue);
                  resetFields();
                  setNotes("");
                  setNotesError("");
                  setFilePath(null);
                  setFile(null);
                  setImage(null);
                  setChecked(true);
                  FetchPaymentMode("", newValue == "Source" ? 1 : 2);
                }}
                value={value}
              >
                <View style={{ flexDirection: "row" }}>
                  {valueData.map((item) => (
                    <View
                      key={item}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text>{item}</Text>
                      <RadioButton value={item} />
                    </View>
                  ))}
                </View>
              </RadioButton.Group>
            </View>
          )}
          {entryType !== "Self" &&
            (value === "Activity" || value === "Expenses") && (
              <>
                <View style={[Styles.marginTop16]}>
                  <Dropdown
                    label="Activity Type *"
                    data={activityTypeData}
                    onSelected={(type) => {
                      setActivityType(type);
                      setActivityTypeError(false);
                      if (route?.params?.type === "add") {
                        setCommonDisplayStatus(true);
                        setVisitLocation("");
                        setVisitLocationError(false);
                      }
                    }}
                    isError={activityTypeError}
                    selectedItem={activityType}
                  />
                  <HelperText type="error" visible={activityTypeError}>
                    Please select a Type
                  </HelperText>
                </View>
              </>
            )}
          {(entryType === "Self" || value !== "Activity") && (
            <TextInput
              mode="outlined"
              label="Amount *"
              value={amount}
              returnKeyType="next"
              keyboardType="number-pad"
              onSubmitEditing={() => ref_input2.current.focus()}
              onChangeText={onAmount}
              style={{ backgroundColor: "white", marginTop: 10 }}
              error={amountError}
            />
          )}
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
                    ]}
                  >
                    <DataTable.Header>
                      <DataTable.Title
                        style={[{ flex: 1, justifyContent: "center" }]}
                      >
                        Collected
                      </DataTable.Title>
                      <DataTable.Title
                        style={[
                          Styles.borderLeft1,
                          { flex: 1, justifyContent: "center" },
                        ]}
                        numeric
                      >
                        Paid
                      </DataTable.Title>
                      <DataTable.Title
                        style={[
                          Styles.borderLeft1,
                          { flex: 1, justifyContent: "center" },
                        ]}
                        numeric
                      >
                        Balance
                      </DataTable.Title>
                    </DataTable.Header>

                    <DataTable.Row style={[Styles.backgroundColor]}>
                      <DataTable.Cell
                        style={[{ flex: 1, justifyContent: "center" }]}
                      >
                        {collectedAmount}
                      </DataTable.Cell>
                      <DataTable.Cell
                        style={[
                          Styles.borderLeft1,
                          { flex: 1, justifyContent: "center" },
                        ]}
                      >
                        {paidAmount}
                      </DataTable.Cell>
                      <DataTable.Cell
                        style={[
                          Styles.borderLeft1,
                          { flex: 1, justifyContent: "center" },
                        ]}
                      >
                        {balanceAmount}
                      </DataTable.Cell>
                    </DataTable.Row>
                  </DataTable>
                </View>
              </>
            )}
          {(entryType === "Self" || value !== "Activity") && (
            <>
              <Dropdown
                label="Payment Mode *"
                data={payModeData}
                onSelected={onPayModeChanged}
                isError={errorPM}
                selectedItem={payMode}
              />
              <HelperText type="error" visible={errorPM}>
                Please select a valid payment mode
              </HelperText>
            </>
          )}
          {cashBalanceStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Available Balance *"
                value={cashBalance}
                returnKeyType="next"
                outlineColor={theme.colors.primary}
                keyboardType="number-pad"
                onSubmitEditing={() => ref_input2.current.focus()}
                disabled={true}
                style={[
                  Styles.marginTop8,
                  Styles.marginBottom16,
                  { backgroundColor: "white" },
                ]}
              />
            </>
          )}
          {cardTypeStatus && (
            <>
              <Dropdown
                label="Card Type *"
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
                label="Card Bank Name *"
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
                  label="Credit Card Repayment Due Date *"
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
          {(entryType === "Self" || value === "Expenses") && (
            <>
              <Dropdown
                label="Expenses / Payment *"
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

          {branchListStatus && (
            <>
              <Dropdown
                label="Branch List *"
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
                label="Designation List *"
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
                label="Employee List *"
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
          {usageListStatus && (
            <>
              <Dropdown
                label="Select Particular *"
                data={usageData}
                onSelected={onPerticularListChanged}
                isError={errorUsage}
                selectedItem={usage}
              />
              <HelperText type="error" visible={errorUsage}>
                Please select a perticular
              </HelperText>
            </>
          )}
          {/* {projectListStatus && (
            <>
              <Dropdown
                label="Project List *"
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
          {sourceStatus && (
            <>
              <Dropdown
                label="Source / Receipt"
                data={sourceData}
                onSelected={onSourceChanged}
                isError={errorSS}
                selectedItem={source}
              />
              <HelperText type="error" visible={epaError}>
                Please select a category
              </HelperText>
            </>
          )}

          {clientListStatus && (
            <>
              <View
                style={[Styles.border1, Styles.borderRadius4, Styles.padding4]}
              >
                <Dropdown
                  label="My Client List **"
                  data={clientListData}
                  onSelected={onClientListChanged}
                  isError={errorCL}
                  selectedItem={clientList}
                />
                <HelperText type="error" visible={errorCL}>
                  Please select a client
                </HelperText>
                <Button
                  icon={"plus"}
                  mode="contained"
                  onPress={() => {
                    navigation.navigate("AddClientScreen", {
                      type: "expenses_client",
                      data: {
                        serviceType: "8",
                      },
                      fetchClientList: FetchClientList,
                    });
                  }}
                >
                  Add New Client
                </Button>
              </View>
            </>
          )}
          {paymentGroupStatus && (
            <>
              <View
                style={[
                  Styles.marginTop8,
                  Styles.bordergray,
                  Styles.borderRadius4,
                ]}
              >
                <Text>Payment Group * :</Text>

                {/* <RadioButton.Group
                  onValueChange={value => {
                    setPaymentGroupID(value);
                  }}
                  value={paymentGroupID}>
                  {paymentGroup?.map((item, idx) => (
                    <RadioButton.Item
                      key={idx}
                      position="leading"
                      style={[Styles.paddingVertical2]}
                      labelStyle={[Styles.textLeft, Styles.paddingStart4]}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </RadioButton.Group> */}

                <RadioGroup
                  key={paymentGroupID}
                  containerStyle={[Styles.marginTop16]}
                  layout="row"
                  isError={errorPG}
                  radioButtons={paymentGroup}
                  selectedId={paymentGroupID}
                  onPress={setPaymentGroupID}
                />
                <HelperText type="error" visible={errorPG}>
                  Please select payment group
                </HelperText>
              </View>
            </>
          )}

          {paymentTypeStatus && (
            <>
              <View
                style={[
                  Styles.marginTop16,
                  Styles.bordergray,
                  Styles.borderRadius4,
                ]}
              >
                <Text>Payment Type * :</Text>
                <RadioGroup
                  containerStyle={[Styles.marginTop16]}
                  layout="row"
                  isError={errorPTT}
                  radioButtons={paymentRB}
                  onPress={onPaymentTypeChange}
                />
                <HelperText type="error" visible={errorPTT}>
                  Please select payment type
                </HelperText>
              </View>
            </>
          )}

          {invoiceStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Invoice No *"
                keyboardType="number-pad"
                value={invoiceNo}
                returnKeyType="next"
                onSubmitEditing={() => ref_input2.current.focus()}
                onChangeText={onInvoiceNoChange}
                style={{ backgroundColor: "white" }}
                error={invoiceNoError}
              />
              <HelperText type="error" visible={invoiceNoError}>
                Please enter a valid Invoice number
              </HelperText>
            </>
          )}

          {projectListStatus && (
            <>
              <Dropdown
                label="Project List *"
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
          {projectExpenseStatus && (
            <>
              <Dropdown
                label="Project Expenses *"
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
          {(entryType === "Self" || value === "Expenses") && subCatStatus && (
            <>
              <Dropdown
                label="Sub Category Name *"
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

          {((entryType !== "Self" &&
            value === "Expenses" &&
            subCategoryName !== "" &&
            subCategoryName !== null &&
            subCategoryName !== undefined) ||
            (entryType !== "Self" &&
              value === "Activity" &&
              activityType !== "Office Work" &&
              activityType !== "")) && (
              <>
                <Dropdown
                  label="Expenses / Payment / Activity *"
                  data={epaData}
                  onSelected={(text) => {
                    setEpa(text);
                  }}
                  isError={epaError}
                  selectedItem={epa}
                />
                <HelperText type="error" visible={epaError}>
                  Please select a category
                </HelperText>
              </>
            )}
          {entryType !== "Self" && epa && (
            <RadioButton.Group
              onValueChange={(newValue) => {
                if (newValue !== clientType) {
                  let x = clientTypeFullData.find(
                    (data) => data?.activity_entry_type_name == newValue
                  );

                  setClientType(newValue);
                  setClientTypeID(x?.activity_entry_type);
                  setClientTypeError(false);
                  setClientListtData([]);
                  setClientListtFullData([]);
                  setClientt("");
                  setClienttError(false);
                  setContactPerson("");
                  setContactPersonData([]);
                  setContactPersonFullData([]);
                  setContactPersonError(false);
                  setMarketing("");
                  setMarketingError(false);
                  setActivityStatus("");
                  setActivityStatusError(false);
                  setVisitLocation("");
                  setVisitLocationError(false);
                  setNextVisitDay("");
                  setNextVisitMonth("");
                  setReference("");
                  setSupportPerson("");
                  if (x?.activity_entry_type == 1) {
                    getClientList();
                  }
                }
              }}
              value={clientType}
            >
              <Text>Client Type</Text>
              <View style={{ flexDirection: "row" }}>
                {clientTypeData.map((item, idx) => (
                  <View
                    key={idx}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <RadioButton value={item} />
                    <Text>{item}</Text>
                  </View>
                ))}
              </View>
            </RadioButton.Group>
          )}
          {entryType !== "Self" && clientTypeID == 2 && (
            <>
              <View style={[Styles.marginTop16]}>
                <Dropdown
                  label="Marketing Executive Name *"
                  data={marketingData}
                  onSelected={(val) => {
                    if (marketing !== val) {
                      setMarketing(val);
                      setClientListtData([]);
                      setClientListtFullData([]);
                      setClientt("");
                      setContactPersonData([]);
                      setContactPersonFullData([]);
                      setContactPerson("");
                      getClientList(
                        marketingFullData.find(
                          (item) => item.employee_name === val
                        ).refer_user_refno
                      );
                    }
                  }}
                  isError={marketingError}
                  selectedItem={marketing}
                />
                <HelperText type="error" visible={marketingError}>
                  Please select a marketing executive.
                </HelperText>
              </View>
            </>
          )}
          {((entryType !== "Self" && clientTypeID == 1) ||
            (entryType !== "Self" &&
              clientTypeID == 2 &&
              marketing !== null &&
              marketing !== "")) &&
            (
              <>
                <View
                  style={[
                    Styles.padding8,
                    Styles.border1,
                    Styles.borderRadius4,
                    { zIndex: 10 },
                  ]}
                >
                  <Dropdown
                    label="Client List *"
                    data={clientListtData}
                    onSelected={(client) => {
                      if (client !== clientt) {
                        if (payMode === "Cheque") {
                          setDepositTypeStatus(true);
                          FetchDepositType();
                        }
                        setClientt(client);
                        setContactPerson("");
                        setContactPersonData([]);
                        setContactPersonFullData([]);
                        getContactPersonList(
                          clientListtFullData.find(
                            (item) => item.company_name === client
                          ).myclient_refno
                        );
                      }
                    }}
                    isError={clienttError}
                    selectedItem={clientt}
                  />

                  <HelperText type="error" visible={clienttError}>
                    Please select a client
                  </HelperText>
                  {clientTypeID == 1 && (
                    <View
                      style={[
                        Styles.flexRow,
                        Styles.marginTop4,
                        { justifyContent: "space-between" },
                      ]}
                    >
                      <Button
                        mode="outlined"
                        onPress={() => {
                          setCompanyName("");
                          setCONError(false);
                          setMobileNo("");
                          setMNError(false);

                          setOtherClients([]);
                          setIsButtonDisabled(false);

                          setMobileNoData([]);
                          setCompanyData([]);

                          refRBSheet.current.open();
                        }}
                      >
                        Search & Add
                      </Button>
                      <Button
                        mode="contained"
                        onPress={() => {
                          navigation.navigate("EmployeeCustomerForm", {
                            type: "client",
                            fetchData: getClientList,
                          });
                        }}
                      >
                        Create New
                      </Button>
                    </View>
                  )}
                </View>

                <View style={[Styles.marginTop16]}>
                  <View
                    style={[
                      Styles.padding8,
                      Styles.border1,
                      Styles.borderRadius4,
                      { zIndex: 10 },
                    ]}
                  >
                    <Dropdown
                      label="Contact Person *"
                      data={contactPersonData}
                      onSelected={(selected) => {
                        setContactPerson(selected);
                        setContactPersonError(false);
                      }}
                      isError={contactPersonError}
                      selectedItem={contactPerson}
                    />
                    <HelperText type="error" visible={contactPersonError}>
                      Please select a contact person.
                    </HelperText>
                    <View style={[Styles.marginTop4]}>
                      <Button
                        icon={"plus"}
                        mode="contained"
                        onPress={() => {
                          navigation.navigate("AddMeetingPerson", {
                            type: "newContact",
                            data: {
                              myclient_refno: clientListtFullData
                                .filter((el) => el.company_name === clientt)[0]
                                .myclient_refno.toString(),
                            },
                            contactPersonList: getContactPersonList,
                          });
                        }}
                      >
                        Add Contact Person
                      </Button>
                    </View>
                    {/* )} */}
                  </View>
                </View>
              </>
            )}
          {entryType !== "Self" && value !== "Source" && (
            <>
              <TextInput
                mode="outlined"
                label="Visit Location Name *"
                value={visitLocation}
                returnKeyType="next"
                keyboardType="default"
                onChangeText={(text) => {
                  const filteredText = text
                    .replace(/[^a-zA-Z\s]/g, "")
                    .replace(/\s+/g, " ")
                    .trimLeft();
                  setVisitLocation(filteredText);
                  setVisitLocationError(false);
                }}
                error={visitLocationError}
                style={{
                  backgroundColor: "white",
                  marginBottom: 20,
                  marginTop: 16,
                }}
              />
              <HelperText type="error" visible={visitLocationError}>
                Please enter visit locaion.
              </HelperText>
            </>
          )}
          {((entryType !== "Self" &&
            activityType !== "Office Work" &&
            activityType !== "" &&
            clientListtData.length !== 0) ||
            (entryType !== "Self" &&
              activityType !== "Office Work" &&
              activityType !== "" &&
              marketing !== "") ||
            (entryType !== "Self" &&
              subCategoryName !== "" &&
              subCategoryName !== null &&
              clientListtData.length !== 0) ||
            (entryType !== "Self" &&
              subCategoryName !== "" &&
              subCategoryName !== null &&
              marketing !== "")) && (
              <>
                <RadioButton.Group
                  onValueChange={(newValue) => {
                    if (newValue !== activityStatus) {
                      setActivityStatus(newValue);
                      setActivityStatusError(false);
                    }
                  }}
                  value={activityStatus}
                >
                  <Text>Activity Status *</Text>
                  <View style={{ flexDirection: "row" }}>
                    {activityStatusData.map((item, idx) => (
                      <View
                        key={idx}
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <RadioButton value={item} />
                        <Text>{item}</Text>
                      </View>
                    ))}
                  </View>
                </RadioButton.Group>
                {activityStatusError && (
                  <HelperText type="error" visible={activityStatusError}>
                    Please select activity status.
                  </HelperText>
                )}
                <View>
                  <Text> Next Visit</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ flex: 1, padding: 15 }}>
                    <Dropdown
                      data={nextVisitDayData}
                      onSelected={(selected) => {
                        setNextVisitDay(selected);
                      }}
                      selectedItem={nextVisitDay}
                    />
                  </View>
                  <View style={{ flex: 1, padding: 15 }}>
                    <Dropdown
                      data={nextVisitMonthData}
                      onSelected={(selected) => {
                        setNextVisitMonth(selected);
                      }}
                      selectedItem={nextVisitMonth}
                    />
                  </View>
                </View>
                {clientTypeID == 1 && (
                  <>
                    <Dropdown
                      label="Refernce *"
                      data={referenceData}
                      onSelected={(selected) => {
                        setReference(selected);
                      }}
                      selectedItem={reference}
                    />
                  </>
                )}
              </>
            )}
          {((entryType !== "Self" &&
            activityType !== "Office Work" &&
            activityType !== "" &&
            clientListtData.length !== 0 &&
            clientTypeID == 1) ||
            (entryType !== "Self" &&
              activityType !== "Office Work" &&
              activityType !== "" &&
              marketing !== "" &&
              clientTypeID == 1) ||
            (entryType !== "Self" &&
              subCategoryName !== "" &&
              subCategoryName !== null &&
              clientListtData.length !== 0 &&
              clientTypeID == 1) ||
            (entryType !== "Self" &&
              subCategoryName !== "" &&
              subCategoryName !== null &&
              marketing !== "" &&
              clientTypeID == 1)) && (
              <>
                <Dropdown
                  label="Help / Support Person *"
                  data={supportPersonData}
                  onSelected={(selected) => {
                    setSupportPerson(selected);
                  }}
                  style={{ marginTop: 10 }}
                  selectedItem={supportPerson}
                />
              </>
            )}

          {((entryType !== "Self" &&
            activityType !== "Office Work" &&
            activityType !== "" &&
            clientListtData.length !== 0) ||
            (entryType !== "Self" &&
              activityType !== "Office Work" &&
              activityType !== "" &&
              marketing !== "") ||
            (entryType !== "Self" && activityType === "Office Work") ||
            (entryType !== "Self" &&
              value === "Expenses" &&
              clientListtData.length > 0) ||
            (entryType !== "Self" &&
              value === "Expenses" &&
              marketing !== "" &&
              marketing !== null)) && (
              <>
                <TextInput
                  mode="outlined"
                  label="Activity Remarks"
                  value={activityRemarks}
                  returnKeyType="next"
                  keyboardType="default"
                  onChangeText={(text) => {
                    setActivityRemarks(text);
                  }}
                  style={{ backgroundColor: "white", marginBottom: 20 }}
                />
              </>
            )}
          {expenseToStatus && (
            <>
              <Dropdown
                label="Expense To *"
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

          {MKT_clientListStatus && (
            <>
              <View
                style={[Styles.border1, Styles.borderRadius4, Styles.padding4]}
              >
                <Dropdown
                  label="My Client List *"
                  data={MKT_clientListData}
                  onSelected={onMKT_ClientListChanged}
                  isError={errorMKT_CL}
                  selectedItem={MKT_clientList}
                />
                <HelperText type="error" visible={errorMKT_CL}>
                  Please select a client
                </HelperText>
                <Button
                  icon={"plus"}
                  mode="contained"
                  onPress={() => {
                    navigation.navigate("AddClientScreen", {
                      type: "expenses_client",
                      data: {
                        serviceType: "8",
                      },
                      fetchClientList: FetchMKTClientList,
                    });
                  }}
                >
                  Add New Client
                </Button>
              </View>
            </>
          )}
          {followupStatus && (
            <>
              <Dropdown
                label="Followup Customer List *"
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
                label="Purpose of Visit *"
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
                label="Contact Type *"
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
                ]}
              >
                <Dropdown
                  label="Paid To *"
                  data={paidToData}
                  onSelected={onPaidToChanged}
                  isError={errorPT}
                  selectedItem={paidTo}
                />
                <HelperText type="error" visible={errorPT}>
                  Please select a valid recepient
                </HelperText>
                <Button
                  icon={"card-account-phone-outline"}
                  mode="contained"
                  loading={isContactLoading}
                  disabled={isContactLoading}
                  onPress={ShowContactList}
                >
                  Add New Contact
                </Button>
              </View>
            </>
          )}
          {newContactNameStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Received From *"
                value={contactName}
                returnKeyType="next"
                keyboardType="default"
                onSubmitEditing={() => ref_input2.current.focus()}
                onChangeText={onNewContactChange}
                style={{ backgroundColor: "white" }}
              />
            </>
          )}
          {newMobileNumberStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Mobile No. *"
                value={mobileNumber}
                returnKeyType="next"
                keyboardType="number-pad"
                onSubmitEditing={() => ref_input2.current.focus()}
                onChangeText={onMobileNoChange}
                style={{ backgroundColor: "white" }}
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
                  label="Recurring Reminder Date *"
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
              <Dropdown
                label="Deposit Type *"
                data={depositeTypeData}
                onSelected={onDepositeTypeChanged}
                isError={errorDT}
                selectedItem={depositeType}
              />
              <HelperText type="error" visible={errorDT}>
                {communication.InvalidDepositeType}
              </HelperText>
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
                ]}
              >
                <Dropdown
                  label={`${value === "Source" && payMode == "Cheque" ? "Company" : "My"
                    } Bank List *`}
                  data={myBankData}
                  onSelected={onMyBankChanged}
                  isError={errorMB}
                  selectedItem={MyBank}
                />
                <HelperText type="error" visible={errorMB}>
                  Please select a valid bank
                </HelperText>
                <Button
                  icon={"plus"}
                  mode="contained"
                  onPress={() => {
                    navigation.navigate("AddGMyBankScreen", {
                      type: "newAccount",
                      fetchBankList: FetchBankList,
                    });
                  }}
                >
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
                style={[Styles.marginTop8, { backgroundColor: "white" }]}
              />
            </>
          )}
          {personalBankStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Employee Personal Bank *"
                value={personalBankName + ">>" + personalBankAccNo}
                disabled={true}
                returnKeyType="next"
                onSubmitEditing={() => ref_input2.current.focus()}
                style={{ backgroundColor: "white" }}
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
                style={{ backgroundColor: "white" }}
              />
            </>
          )}
          {chequeNoStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Cheque No *"
                maxLength={6}
                value={chequeNo}
                returnKeyType="next"
                onSubmitEditing={() => ref_input2.current.focus()}
                onChangeText={onChequeNO}
                style={{ backgroundColor: "white" }}
                error={chequeNoError}
              />
            </>
          )}
          {chequeDateStatus && (
            <>
              <View>
                <DateTimePicker
                  style={Styles.backgroundColorWhite}
                  label="Cheque Date *"
                  type="date"
                  value={chequeDate}
                  onChangeDate={(text) => {
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
          {commonDisplayStatus && (
            <>
              <TextInput
                mode="outlined"
                label="Notes"
                value={notes}
                returnKeyType="next"
                onSubmitEditing={() => ref_input2.current.focus()}
                onChangeText={onNotes}
                style={{ backgroundColor: "white" }}
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
                ]}
              >
                <Image
                  source={
                    image == "doc"
                      ? require("./icons/doc.png")
                      : image == "pdf"
                        ? require("./icons/pdf.png")
                        : image == "xls"
                          ? require("./icons/xls.png")
                          : { uri: image }
                  }
                  style={[Styles.width104, Styles.height96, Styles.border1]}
                  resizeMethod="scale"
                />
                <Button mode="text" onPress={() => setIsVisible(true)}>
                  {file !== null || image !== null
                    ? "Replace"
                    : "Attachment / Slip Copy"}
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
          {commonDisplayStatus && (
            <>
              <View style={{ width: 160 }}>
                <Checkbox.Item
                  label="Display"
                  position="leading"
                  style={{ paddingHorizontal: 2 }}
                  labelStyle={{ textAlign: "left", paddingLeft: 8 }}
                  color={theme.colors.primary}
                  status={checked ? "checked" : "unchecked"}
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
          { position: "absolute", bottom: 0, elevation: 3 },
        ]}
      >
        <Card.Content>
          <Button
            mode="contained"
            disabled={isButtonLoading}
            onPress={ValidateData}
            loading={isButtonLoading}
          >
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
      </RBSheet>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: snackbarColor }}
      >
        {snackbarText}
      </Snackbar>
    </View>
  );
};

export default AddExpensesMarketing;
