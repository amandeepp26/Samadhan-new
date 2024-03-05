import { useEffect, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  ActivityIndicator,
  View,
  RefreshControl,
  LogBox,
  ScrollView,
  Text,
  Image,
  Pressable,
} from "react-native";
import {
  FAB,
  List,
  Snackbar,
  Title,
  Dialog,
  Portal,
  TextInput,
  Card,
  HelperText,
  IconButton,
  Button,
} from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import RBSheet from "react-native-raw-bottom-sheet";
import Provider from "../../../api/Provider";
import Header from "../../../components/Header";
import NoItems from "../../../components/NoItems";
import { theme } from "../../../theme/apptheme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RenderHiddenItemsConditional } from "../../../components/ListActions";
import { Styles } from "../../../styles/styles";
import { NullOrEmpty } from "../../../utils/validations";
import { communication } from "../../../utils/communication";

import DFButton from "../../../components/Button";
import Search from "../../../components/Search";
import ButtonComponent from "../../../components/Button";

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);
let userID = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_designation_refno = 0;
let Sess_group_refno_extra_1 = 0;
const EmployeeListScreen = ({ navigation }) => {
  //#region Variables
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeID, setEmployeeID] = useState("");
  const [otp, setOTP] = useState("");
  const [otpError, setOtpError] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);
  const [empcode, setEmpCode] = useState("");
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [employeeName, setEmployeeName] = useState("");

  const [mobileNo, setMobileNo] = useState("");
  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");

  const [profileStatus, setProfileStatus] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [verifyStatus, setVerifyStatus] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const refRBSheet = useRef();

  //#endregion

  //#region Functions
  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      Sess_company_refno = JSON.parse(userData).Sess_company_refno;
      Sess_branch_refno = JSON.parse(userData).Sess_branch_refno;
      Sess_designation_refno = JSON.parse(userData).Sess_designation_refno;
      Sess_group_refno_extra_1 = JSON.parse(userData).Sess_group_refno_extra_1;
      FetchData();
    }
  };

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

  const FetchData = (from) => {
    console.log('start data');
    if (from === "add" || from === "update") {
      setSnackbarText(
        "Employee " + (from === "add" ? "added" : "updated") + " successfully"
      );
      setSnackbarColor(theme.colors.success);
      setSnackbarVisible(true);
    }
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: Sess_company_refno,
        Sess_branch_refno: Sess_branch_refno,
        Sess_designation_refno: Sess_designation_refno,
        Sess_group_refno_extra_1: Sess_group_refno_extra_1,
        OutputType: "2"
      },
    };
    //console.log('EMP params:**********', params, "*======================*");
    Provider.createDFCommon(Provider.API_URLS.myemployeelist, params)
      .then((response) => {
        //console.log('employee resp===========:', response.data.data, "=======================");
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            const lisData = [...response.data.data];
            lisData.map((k, i) => {
              k.key = (parseInt(i) + 1).toString();
            });
            setListData(response.data.data);
            setListSearchData(response.data.data);
          }
        } else {
          setListData([]);
          setSnackbarText("No data found");
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
        }
        setIsLoading(false);
        setRefreshing(false);
      })
      .catch((e) => {
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        setRefreshing(false);
      });
  };

  const SubmitVerify = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        employee_otp_no: otp,
        employee_mobile_no: current.employee_mobile_no,
        myemployee_refno: current.myemployee_refno,
        Sess_company_refno: Sess_company_refno,
        Sess_branch_refno: Sess_branch_refno,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.employeeotpverify, params)
      .then((response) => {
        setIsButtonLoading(false);
        if (response.data && response.data.code === 200) {
          FetchData();
          hideDialog();
          setSnackbarText(communication.UpdateSuccess);
          setSnackbarVisible(true);
        } else if (response.data.code === 304) {
          setSnackbarText(communication.UpdateError);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.UpdateError);
          setSnackbarVisible(true);
        }
      })
      .catch((e) => {
        console.log(e);
        setIsButtonLoading(false);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      GetUserID();
    }
  }, [isFocused]);

  const AddCallback = () => {
    navigation.navigate("SearchNAdd", { type: "add", fetchData: FetchData });
  };
  const SearchEmployee = () => {
    navigation.navigate("SearchEmployee", {
      type: "add",
      fetchData: FetchData,
    });
  };
  const AddEmployee = () => {
    navigation.navigate("AddEmployee", { type: "add", fetchData: FetchData });
  };
  const [current, setCurrent] = useState();
  const EditCallback = (data, rowMap, buttonType) => {
    if (buttonType == "otp") {
      let params = {
        data: {
          Sess_UserRefno: userID,
          myemployee_refno: data.item.myemployee_refno,
          employee_mobile_no: data.item.employee_mobile_no,
        },
      };
      Provider.createDFCommon(Provider.API_URLS.sendotptoemployee, params)
        .then((response) => {
          if (response && response.data && response.data.status === "Success") {
            let x =
              response.data.data["OTP Send"] == 1
                ? response.data.data.employee_otp_no
                : "";
            console.log(x);
            setOTP(x.toString());
            setCurrent(data.item);
            setEmployeeID(data.item.employee_user_refno);
            showDialog();
          }
        })
        .catch((e) => console.log(e));
    } else {
      rowMap[data.item.key].closeRow();
      navigation.navigate("EmployeeEditScreen", {
        type: "edit",
        fetchData: FetchData,
        data: {
          myemployee_refno: data.item.myemployee_refno,
          Sess_UserRefno: userID,
        },
        call: () => {
          setSnackbarColor(theme.colors.success);
          setSnackbarText("Data updated successfully");
          setSnackbarVisible(true);
          navigation.navigate("EmployeeListScreen");
        },
      });
    }
  };

  const RenderItems = (data) => {
    return (
      <View
        style={[
          Styles.backgroundColor,
          Styles.paddingHorizontal16,
          Styles.flexJustifyCenter,
          Styles.flex1,
          Styles.marginBottom12,
        ]}>
        <View
          style={[
            {
              backgroundColor: '#eee',
              borderRadius: 8,
              elevation: 5,
            },
            Styles.paddingHorizontal8,
            Styles.paddingVertical12,
            Styles.flexRow,
          ]}>
          <View style={[Styles.flex1]}>
            <View style={[Styles.flex1, Styles.flexRow]}>
              <View style={[Styles.flexColumn, Styles.flex1]}>
                <View style={[Styles.flex1, Styles.flexRow]}>
                  <View style={[Styles.flex1]}>
                    {data.item.profile_photo_url != '' ? (
                      <Image
                        source={{uri: data.item.profile_photo_url}}
                        style={[Styles.flex1, {width: 48, height: 48}]}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={require('../../../../assets/defaultIcon.png')}
                        style={[Styles.flex1, {width: 48, height: 48}]}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                  <View style={[Styles.flexColumn, Styles.flex2_5]}>
                    <Text style={[Styles.fontSize12]}>
                      {data.item.employee_name}
                    </Text>
                    <Text style={[Styles.fontSize10, Styles.blueFontColor]}>
                      {data.item.common_employee_code}
                    </Text>
                    <View
                      style={[
                        Styles.width100per,
                        Styles.marginVertical4,
                        {backgroundColor: '#d3d3d3', height: 1},
                      ]}></View>
                    <Text style={[Styles.fontSize10]}>
                      {data.item.designationname}
                    </Text>
                  </View>
                  <View style={[Styles.flex1]}>
                    <Text style={[Styles.fontSize12, Styles.textCenter]}>
                      Status
                    </Text>
                    <Text
                      style={[
                        Styles.fontSize12,
                        Styles.fontBold,
                        Styles.primaryColor,
                        Styles.textCenter,
                      ]}>
                      {data.item.salarystatus_button[0].salarystatus}
                    </Text>

                    <Pressable
                      mode="text"
                      uppercase={false}
                      onPress={() => {
                        navigation.navigate('SingleEmployeeAttendanceReport', {
                          type: 'status',
                          headerTitle: data.item.employee_name,
                          employeeID:
                            data.item.salarystatus_button[0]
                              .employee_user_refno,
                        });
                      }}
                      style={[
                        Styles.borderred,
                        Styles.marginTop8,
                        {
                          borderWidth: 2, // Border width
                          borderColor: '#45916b', // Border color
                          borderRadius: 4,
                        },
                      ]}>
                      <Text
                        style={[
                          Styles.fontSize10,
                          Styles.textCenter,
                          Styles.padding2,
                        ]}>
                        Status Details
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <View
                  style={[
                    Styles.flex1,
                    Styles.flexRow,
                    Styles.flexSpaceAround,
                    Styles.marginTop24,
                  ]}>
                  <Button
                    style={{backgroundColor: '#3ab09e'}}
                    labelStyle={[Styles.fontSize12]}
                    mode="contained">
                    ID Card
                  </Button>
                  <Button
                    style={{backgroundColor: '#3ab09e'}}
                    labelStyle={[Styles.fontSize12]}
                    onPress={() => {
                      refRBSheet.current.open();
                      setEmpCode(data.item.common_employee_code);
                      setEmployeeName(data.item.employee_name);
                      setMobileNo(data.item.employee_mobile_no);
                      setBranch(data.item.branchname);
                      setDepartment(data.item.departmentname);
                      setDesignation(data.item.designationname);
                      setProfileStatus(data.item.profie_update_status);
                      setLoginStatus(data.item.employee_active_status);
                      setVerifyStatus(data.item.mobile_OTP_verify_status);
                    }}
                    mode="contained">
                    Profile
                  </Button>
                  <Button
                    style={{backgroundColor: '#3ab09e'}}
                    labelStyle={[Styles.fontSize12]}
                    mode="contained">
                    Edit
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      // <View
      //   style={[
      //     Styles.backgroundColor,
      //     Styles.borderBottom1,
      //     Styles.paddingStart16,
      //     Styles.flexJustifyCenter,
      //     { height: 80 },
      //   ]}
      // >
      //   <List.Item
      //     title={data.item.employee_name}
      //     titleStyle={{ fontSize: 18 }}
      //     description={`Mob.: ${
      //       NullOrEmpty(data.item.employee_mobile_no)
      //         ? ""
      //         : data.item.employee_mobile_no
      //     }\nProfile Status: ${
      //       NullOrEmpty(data.item.profie_update_status)
      //         ? ""
      //         : data.item.profie_update_status == "0"
      //         ? "incomplete"
      //         : "complete"
      //     } `}
      //     onPress={() => {
      //       refRBSheet.current.open();
      //       setEmpCode(data.item.common_employee_code);
      //       setEmployeeName(data.item.employee_name);
      //       setMobileNo(data.item.employee_mobile_no);
      //       setBranch(data.item.branchname);
      //       setDepartment(data.item.departmentname);
      //       setDesignation(data.item.designationname);
      //       setProfileStatus(data.item.profie_update_status);
      //       setLoginStatus(data.item.employee_active_status);
      //       setVerifyStatus(data.item.mobile_OTP_verify_status);
      //     }}
      //     left={() => (
      //       <Icon
      //         style={{ marginVertical: 12, marginRight: 12 }}
      //         size={30}
      //         color={theme.colors.textSecondary}
      //         name="account-group"
      //       />
      //     )}
      //     right={() => (
      //       <Icon
      //         style={{ marginVertical: 18, marginRight: 12 }}
      //         size={30}
      //         color={theme.colors.textSecondary}
      //         name="eye"
      //       />
      //     )}
      //   />
      // </View>
    );
  };

  const OnOTPSend = () => {
    let isValid = true;

    if (otp.trim() === "") {
      setOtpError(true);
      isValid = false;
    }
    if (isValid) {
      setIsButtonLoading(true);
      SubmitVerify();
    }
  };

  const onOTPChange = (text) => {
    setOTP(text);
    setOtpError(false);
  };

  const [state, setState] = useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;
  return (
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="My Employee List" />
      {isLoading ? (
        <View
          style={[
            Styles.flex1,
            Styles.flexJustifyCenter,
            Styles.flexAlignCenter,
          ]}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : listData.length > 0 ? (
        <View style={[Styles.flex1, Styles.flexColumn, Styles.backgroundColor]}>
          <Search
            data={listData}
            setData={setListSearchData}
            filterFunction={[
              "branchname",
              "common_employee_code",
              "departmentname",
              "designationname",
              "employee_mobile_no",
              "display",
              "employee_name",
            ]}
          />
          {listSearchData?.length > 0 ? (
            <SwipeListView
              previewDuration={1000}
              previewOpenValue={-160}
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
              useFlatList={true}
              disableRightSwipe={true}
              rightOpenValue={-160}
              renderItem={(data) => RenderItems(data)}
              renderHiddenItem={(data, rowMap) =>
                RenderHiddenItemsConditional(data, rowMap, [EditCallback])
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

      {/* <FAB style={[Styles.margin16, Styles.primaryBgColor, { position: "absolute", right: 16, bottom: 16 }]} icon="account-search" onPress={AddCallback} /> */}
      <FAB.Group
        open={open}
        icon={open ? "window-minimize" : "account-search"}
        actions={[
          {
            icon: "magnify-plus",
            label: "Search Employee",
            onPress: SearchEmployee,
          },
          {
            icon: "account-plus",
            label: "Add Employee",
            onPress: AddEmployee,
          },
        ]}
        onStateChange={onStateChange}
        onPress={() => {
          if (open) {
            // do something if the speed dial is open
          }
        }}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: snackbarColor }}
      >
        {snackbarText}
      </Snackbar>

      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        dragFromTopOnly={true}
        height={620}
        animationType="fade"
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
          draggableIcon: { backgroundColor: "#000" },
        }}
      >
        <View>
          <Title style={[Styles.paddingHorizontal16]}>{employeeName}</Title>
          <ScrollView style={{ marginBottom: 64 }}>
            <List.Item title="Mobile No" description={mobileNo} />
            <List.Item title="Branch" description={branch} />
            <List.Item title="Department" description={department} />
            <List.Item title="Designation" description={designation} />
            <List.Item title="Employee Code" description={empcode} />
            <List.Item
              title="Profile Status"
              description={
                NullOrEmpty(profileStatus)
                  ? ""
                  : profileStatus
                    ? "Complete"
                    : "Incomplete"
              }
            />
            <List.Item
              title="Login Status"
              description={
                NullOrEmpty(loginStatus) ? "" : loginStatus ? "Yes" : "No"
              }
            />
            <List.Item
              title="Verify Status"
              description={
                NullOrEmpty(verifyStatus)
                  ? ""
                  : verifyStatus == "1"
                    ? "Verified"
                    : "Not Verified"
              }
            />
          </ScrollView>
        </View>
      </RBSheet>

      <Portal>
        <Dialog
          visible={visible}
          onDismiss={hideDialog}
          style={[Styles.borderRadius8]}
        >
          <Dialog.Title style={[Styles.fontSize16, Styles.textCenter]}>
            EMPLOYEE OTP NO VERIFICATION & LOGIN ACTIVATION
          </Dialog.Title>
          <Dialog.Content>
            <View
              style={[
                Styles.flexRow,
                Styles.flexJustifyCenter,
                Styles.flexAlignCenter,
                Styles.marginTop16,
              ]}
            >
              <Text>Enter OTP No:</Text>
              <TextInput
                mode="outlined"
                value={otp}
                onChangeText={onOTPChange}
                error={otpError}
                style={[
                  Styles.marginHorizontal12,
                  Styles.width80,
                  Styles.height40,
                  Styles.borderRadius4,
                  Styles.backgroundSecondaryColor,
                ]}
              />
            </View>
            <View>
              <HelperText
                type="error"
                visible={otpError}
                style={[Styles.textCenter]}
              >
                {communication.InvalidOTP}
              </HelperText>
            </View>
            <Card.Content style={[Styles.marginTop16]}>
              {/* <Button mode="contained" onPress={OnOTPSend}>
                Submit & Verify
              </Button> */}
              <DFButton
                mode="contained"
                onPress={OnOTPSend}
                title="Submit & Verify"
                loader={isButtonLoading}
              />
            </Card.Content>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
};

export default EmployeeListScreen;
