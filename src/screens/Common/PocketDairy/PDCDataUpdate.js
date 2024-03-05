import moment from "moment";
import uuid from "react-native-uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Image, View, Platform, PermissionsAndroid, Pressable, Modal } from "react-native";
import {
  Button,
  Card,
  Checkbox,
  HelperText,
  Snackbar,
  Subheading,
  Text,
  TextInput,
} from "react-native-paper";
import Provider from "../../../api/Provider";
import Dropdown from "../../../components/Dropdown";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import { communication } from "../../../utils/communication";
import { DateTimePicker } from "@hashiprobr/react-native-paper-datetimepicker";
import * as ImagePicker from "react-native-image-picker";
import { AWSImagePath } from "../../../utils/paths";
import { APIConverter } from "../../../utils/apiconverter";
import { common } from "@material-ui/core/colors";
//#region camera related changes
import * as DocumentPicker from "react-native-document-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
//#endregion

let userID = 0,
  groupID = 0,
  companyID = 0,
  branchID = 0,
  designID = 0,
  roleID = 0;

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

const PDCDataUpdate = ({ route, navigation }) => {
  //#region Variables

  // const [entryTypeError, setEntryTypeError] = React.useState(false);
  // const [entryType, setEntryType] = React.useState("");

  const [myBankListFullData, setMyBankListFullData] = React.useState([]);
  const [myBankListData, setMyBankListData] = React.useState([]);
  const [myBankList, setMyBankList] = React.useState([]);
  const [myBankListEditID, setMyBankListEditID] = React.useState([]);
  const [errorBL, setBLError] = React.useState(false);

  const [depositDate, setDepositDate] = useState(new Date());
  const [depositDateInvalid, setDepositDateInvalid] = useState("");
  const [depositDateError, setDepositDateError] = React.useState(false);
  const depositDateRef = useRef({});

  const [image, setImage] = React.useState(null);
  const [filePath, setFilePath] = React.useState(null);

  const [errorDI, setDIError] = React.useState(false);

  const [notes, setNotes] = React.useState("");

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");
  const ref_input2 = useRef();
  const ref_input3 = useRef();

  const [transactionID, setTransactionID] = React.useState(
    route.params.data.transactionID
  );
  const [pktEntryTypeID, setPktEntryTypeID] = React.useState(route.params.data?.entryTypeID == undefined ? "1" : route.params.data?.entryTypeID);
  const [pktTransactionTypeID, setPktTransactionTypeID] = React.useState(route.params.data?.transactionType == undefined ? "1" : route.params.data?.transactionType);
  const [isImageReplaced, setIsImageReplaced] = React.useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);

  //#endregion


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

  //#region Functions

  useEffect(() => {
    GetUserID();
  }, []);

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      groupID = JSON.parse(userData).Sess_group_refno;
      companyID = JSON.parse(userData).Sess_company_refno;
      branchID = JSON.parse(userData).Sess_branch_refno;
      designID = JSON.parse(userData).Sess_designation_refno;
      roleID = JSON.parse(userData).RoleID;
      FetchBankList();
    }
  };

  const FetchBankList = (bankID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        Sess_group_refno: groupID.toString(),
        Sess_designation_refno: designID.toString(),
        pck_entrytype_refno: pktEntryTypeID,
        pck_transtype_refno: pktTransactionTypeID,
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckmybankname, params)
      .then((response) => {

        if (response.data && response.data.code === 200) {
          if (response.data.data) {

            const newArray = response.data.data.map(item => ({
              ...item,
              displayName: `${item.bank_name}(${item.bank_account_no}) - ${item.company_branch_name}`
            }));

            setMyBankListFullData(newArray);

            const bank = newArray.map((data) => data.displayName);
            setMyBankListData(bank);
            if (bankID != null) {
              setMyBankList(
                newArray.filter((el) => {
                  return el.bank_refno === bankID;
                })[0].displayName
              );
            }
          }
        }
      })
      .catch((e) => { });
  };

  const onNotesChange = (text) => {
    setNotes(text);
  };

  const onBankListChanged = (text) => {
    setMyBankList(text);
    setBLError(false);
  };

  const UpdateData = () => {
    setIsButtonDisabled(true);
    let bankID = "";

    if (myBankListFullData.length > 0) {
      bankID = myBankListFullData.filter((el) => {
        return el.displayName === myBankList;
      })[0].bank_refno;
    }

    const datas = new FormData();
    const params = {
      Sess_UserRefno: userID,
      pck_trans_refno: transactionID,
      pck_mybank_refno: bankID,
      deposit_date:
        depositDate == "" ? "" : moment(depositDate).format("DD-MM-YYYY"),
      narration: notes.trim(),
    };

    // params.bankchallan_slip =
    //   filePath != null && filePath != undefined
    //     ? {
    //       name: 'receipt',
    //       type: filePath.type || filePath.mimeType,
    //       uri: filePath.uri,
    //     }
    //     : null;
    // Object.keys(params).forEach(key => {
    //   if (params[key] === null) {
    //     delete params[key];
    //   }
    // });
    datas.append("data", JSON.stringify(params));
    datas.append(
      "bankchallan_slip",
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
    Provider.createDFPocketDairyWithHeader(
      Provider.API_URLS.pckaddsource_pdc_cheque_update,
      datas
    )
      .then((response) => {
        setIsButtonDisabled(false);
        if (response.data && response.data.code === 200) {
          console.log('Update resp===========:', response.data, "=======================");
          //route.params.fetchData("update");
          //navigation.goBack();
          if (roleID == 3) {
            navigation.navigate("SourceListGeneralUserScreen", {
              type: "update",
              fetchData: null,
            });
          } else {
            route.params.fetchData("update");
            navigation.goBack();
            //navigation.navigate("AddSourceList", { type: "update", fetchData: null });
          }
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.UpdateError);
          setSnackbarVisible(true);
        }
      })
      .catch((e) => {
        setIsButtonDisabled(false);
        console.log(e);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const ValidateData = () => {
    let isValid = true;

    if (depositDate == "") {
      isValid = false;
      setDepositDateError(true);
    }

    if (myBankList == "") {
      isValid = false;
      setBLError(true);
    }

    if (isValid) {
      if (route.params.type === "pdc") {
        UpdateData();
      }
    }
  };

  //#endregion

  return (
    <View style={[Styles.flex1]}>
      <ScrollView
        style={[Styles.flex1, Styles.backgroundColor, { marginBottom: 0 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[Styles.padding16]}>
          <DateTimePicker
            style={Styles.backgroundColorWhite}
            label="Date of Deposit"
            type="date"
            value={depositDate}
            onChangeDate={setDepositDate}
          />
          <HelperText type="error" visible={depositDateError}>
            Please enter a valid date
          </HelperText>

          <View
            style={[
              Styles.border1,
              Styles.borderRadius4,
              Styles.padding4,
              Styles.marginTop8,
            ]}
          >
            <Dropdown
              label="Bank Name"
              data={myBankListData}
              onSelected={onBankListChanged}
              isError={errorBL}
              selectedItem={myBankList}
            />
            <HelperText type="error" visible={errorBL}>
              {communication.InvalidBankName}
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

          <View
            style={[Styles.flexRow, Styles.flexAlignEnd, Styles.marginTop16]}
          >
            <Image
              source={{ uri: image }}
              style={[Styles.width104, Styles.height96, Styles.border1]}
            />
            <Button mode="text" onPress={() => setIsVisible(true)}>
              {filePath !== null || image !== null ? "Replace" : "Attachment / Slip Copy"}
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
          <HelperText type="error" visible={errorDI}>
            {communication.InvalidDesignImage}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Notes"
            value={notes}
            returnKeyType="next"
            onSubmitEditing={() => ref_input2.current.focus()}
            onChangeText={onNotesChange}
            style={{ backgroundColor: "white" }}
          />
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
          <Button mode="contained" onPress={ValidateData} disabled={isButtonDisabled}
            loading={isButtonDisabled}>
            Update
          </Button>
        </Card.Content>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: theme.colors.error }}
      >
        {snackbarText}
      </Snackbar>
    </View>
  );
};

export default PDCDataUpdate;
