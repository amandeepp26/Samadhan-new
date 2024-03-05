import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  RefreshControl,
  ScrollView,
  Text,
} from "react-native";
import {
  List,
  Searchbar,
  Snackbar,
  Title,
  HelperText,
  Card,
} from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import { theme } from "../../../../theme/apptheme";
import { Styles } from "../../../../styles/styles";

import { NullOrEmpty } from "../../../../utils/validations";
import { communication } from "../../../../utils/communication";
import Provider from "../../../../api/Provider";
import { RenderHiddenItemGeneric } from "../../../../components/ListActions";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RBSheet from "react-native-raw-bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NoItems from "../../../../components/NoItems";
import Autocomplete from "./Autocomplete";
import DFButton from "../../../../components/Button";
import Search from "../../../../components/Search";
import Header from "../../../../components/Header";
import ButtonComponent from "../../../../components/Button";

let userID = 0;
let companyID = 0;
let Sess_branch_refno = 0;
const SearchEmployee = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [displayLoader, setDisplayLoader] = useState(false);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);
  const [aadharNo, setAadharNo] = useState("");
  const [aadharNoInvalid, setAadharNoInvalid] = useState("");
  const aadharNoRef = useRef({});

  const [mobileNo, setMobileNo] = useState("");
  const [mobileNoInvalid, setMobileNoInvalid] = useState("");
  const mobileNoRef = useRef({});
  const [companyName, setCompanyName] = useState("");
  const [RBEmployeeName, setRBEmployeeName] = useState("");
  const [RBMobileNo, setRBMobileNo] = useState("");
  const [RBAadharNo, setRBAadharNo] = useState("");

  const refRBSheet = useRef();

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      companyID = JSON.parse(userData).Sess_company_refno;
      Sess_branch_refno = JSON.parse(userData).Sess_branch_refno;
    }
  };

  const FetchData = (from) => {
    if (from === "add" || from === "update") {
      setSnackbarText(
        "Item " + (from === "add" ? "added" : "updated") + " successfully"
      );
      setSnackbarColor(theme.colors.success);
      setSnackbarVisible(true);
    }
    let params = {
      AddedByUserID: userID,
    };
    Provider.getAll(`master/getuseremployeelist?${new URLSearchParams(params)}`)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            const lisData = [...response.data.data];
            lisData.map((k, i) => {
              k.key = (parseInt(i) + 1).toString();
            });
            console.log(response.data.data);
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

  useEffect(() => {
    GetUserID();
  }, []);

  const onAadharNoChanged = (text) => {
    setAadharNo(text);
    setAadharNoInvalid(false);
  };

  const onMobileNoChanged = (text) => {
    setMobileNo(text);
    setMobileNoInvalid(false);
  };

  const InsertExistingEmployee = (ID) => {
    const params = {
      data: {
        Sess_UserRefno: userID,
        employee_user_refno: ID,
        Sess_company_refno: companyID,
        Sess_branch_refno: Sess_branch_refno,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.employeeadd, params)
      .then((response) => {
        if (
          response.data &&
          response.data.code === 200 &&
          response.data.data.Added === 1
        ) {
          route.params.fetchData("add");
          navigation.navigate("EmployeeListScreen");
        } else {
          setSnackbarColor(theme.colors.error);
          setSnackbarText(response.data.message);
          setSnackbarVisible(true);
        }
      })
      .catch((e) => {
        console.log(e);
        setSnackbarColor(theme.colors.error);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const OnSearchEmployee = () => {
    setIsButtonLoading(true);
    let isValid = false;
    if (!NullOrEmpty(aadharNo.trim()) || !NullOrEmpty(mobileNo.trim())) {
      isValid = true;
    } else {
      if (NullOrEmpty(aadharNo.trim())) {
        setAadharNoInvalid(true);
      }

      if (NullOrEmpty(mobileNo.trim())) {
        setMobileNoInvalid(true);
      }
    }

    if (isValid) {
      FetchSearchEmployee();
    }
  };

  const FetchSearchEmployee = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        aadhar_no_s: aadharNo.trim(),
        mobile_no_s: mobileNo.trim(),
      },
    };
    setIsButtonLoading(true);
    Provider.createDFCommon(Provider.API_URLS.employeesearch, params)
      .then((response) => {
        setIsButtonLoading(false);
        if (
          response.data &&
          response.data.code === 200 &&
          response.data !== null
        ) {
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
          setListSearchData([]);
          setSnackbarText("No data found");
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
        }
        setIsLoading(false);
        setRefreshing(false);
      })
      .catch((e) => {
        setIsButtonLoading(false);
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        setRefreshing(false);
      })
      .finally(() => {
        setIsButtonLoading(false);
      });
  };
  const EditCallback = (data) => {
    InsertExistingEmployee(data.item.Search_employee_refno);
  };

  const RenderItems = (data) => {
    return (
      <View
        style={[
          Styles.backgroundColor,
          Styles.borderBottom1,
          Styles.paddingStart16,
          Styles.flexJustifyCenter,
          { height: 80 },
        ]}
      >
        <List.Item
          title={data.item.Search_employee_name}
          titleStyle={{ fontSize: 18 }}
          description={`Mob.: ${
            NullOrEmpty(data.item.Search_employee_mobile_no)
              ? ""
              : data.item.Search_employee_mobile_no
          }\nAadhar No: ${
            NullOrEmpty(data.item.Search_employee_aadhar_no)
              ? ""
              : data.item.Search_employee_aadhar_no
          } `}
          onPress={() => {
            refRBSheet.current.open();
            setCompanyName(data.item.Search_employee_company_name);
            setRBEmployeeName(data.item.Search_employee_name);
            setRBMobileNo(data.item.Search_employee_mobile_no);
            setRBAadharNo(data.item.Search_employee_aadhar_no);
          }}
          left={() => (
            <Icon
              style={{ marginVertical: 12, marginRight: 12 }}
              size={30}
              color={theme.colors.textSecondary}
              name="account-group"
            />
          )}
          right={() => (
            <Icon
              style={{ marginVertical: 18, marginRight: 12 }}
              size={30}
              color={theme.colors.textSecondary}
              name="eye"
            />
          )}
        />
      </View>
    );
  };
  const [numbers, setNumbers] = useState([]);
  useEffect(() => {
    if (mobileNo.length > 0) {
      let params = {
        data: {
          Sess_UserRefno: userID.toString(),
          mobile_no: mobileNo,
        },
      };
      setNumbers([]);
      Provider.createDFCommon(Provider.API_URLS.mobilenoautocomplete, params)
        .then((response) => {
          if (response.data?.data) {
            setNumbers(() => {
              return response.data?.data;
            });
          }
        })
        .catch((e) => {});
    }
  }, [mobileNo]);

  const [aadhar, setAadhar] = useState([]);
  useEffect(() => {
    if (aadharNo.length > 0) {
      let params = {
        data: {
          Sess_UserRefno: userID.toString(),
          aadhar_no: aadharNo,
        },
      };
      setAadhar([]);
      Provider.createDFCommon(Provider.API_URLS.aadharnoautocomplete, params)
        .then((response) => {
          if (response.data?.data) {
            setAadhar(response.data?.data);
          }
        })
        .catch((e) => {});
    }
  }, [aadharNo]);
  return (
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Search Employee" />
      <ScrollView
        style={[Styles.flex1, Styles.backgroundColor, { marginBottom: 0 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[Styles.padding16]}>
          {/* <View
            style={[
              Styles.width100per,
              Styles.borderBottom2,
              Styles.borderBottom2,
              Styles.marginBottom8,
            ]}
          >
            <Text
              style={[
                Styles.fontSize20,
                Styles.fontBold,
                Styles.marginBottom4,
                Styles.blueFontColor,
              ]}
            >
              Search Employee
            </Text>
          </View> */}
          <Autocomplete
            value={aadharNo}
            label="Employee Aadhar No"
            data={aadhar}
            menuStyle={{ backgroundColor: "white" }}
            onChange={onAadharNoChanged}
            ref={aadharNoRef}
            onSubmitEditing={() => aadharNoRef.current.focus()}
            error={aadharNoInvalid}
          />
          {/* <TextInput
            ref={aadharNoRef}
            mode="outlined"
            dense
            label="Employee Aadhar No"
            value={aadharNo}
            returnKeyType="next"
            onSubmitEditing={() => aadharNoRef.current.focus()}
            onChangeText={onAadharNoChanged}
            style={{ backgroundColor: "white" }}
            error={aadharNoInvalid}
          /> */}
          <HelperText type="error" visible={aadharNoInvalid}>
            {communication.InvalidAadharNo}
          </HelperText>

          {/* <TextInput
            ref={mobileNoRef}
           mode="outlined"
            dense
            keyboardType="number-pad"
            label="Mobile No"
            value={mobileNo}
            returnKeyType="next"
            onSubmitEditing={() => mobileNoRef.current.focus()}
            onChangeText={onMobileNoChanged}
            style={{ backgroundColor: "white" }}
            error={mobileNoInvalid}
          /> */}
          <Autocomplete
            value={mobileNo}
            label="Mobile No"
            data={numbers}
            menuStyle={{ backgroundColor: "white" }}
            onChange={onMobileNoChanged}
            ref={mobileNoRef}
            onSubmitEditing={() => mobileNoRef.current.focus()}
            error={mobileNoInvalid}
            keyboardType="number-pad"
          />
          <HelperText type="error" visible={mobileNoInvalid}>
            {communication.InvalidMobileNumber}
          </HelperText>

          {/* <TouchableOpacity
            onPress={OnSearchEmployee}
            style={[
              Styles.marginTop32,
              Styles.primaryBgColor,
              Styles.padding10,
              Styles.flexAlignCenter,
            ]}
          >
            <Text style={[Styles.fontSize14, Styles.textColorWhite]}>
              SEARCH EMPLOYEE
            </Text>
          </TouchableOpacity> */}
          <Card.Content>
            {/* <Button
              mode="contained"
              onPress={OnSearchEmployee}
              loading={isButtonLoading}
              disabled={isButtonLoading}
            >
              SEARCH EMPLOYEE
            </Button> */}
            <ButtonComponent
              mode="contained"
              onPress={OnSearchEmployee}
              text="SEARCH EMPLOYEE"
              loader={isButtonLoading}
            />
          </Card.Content>
        </View>
        <View style={[Styles.padding16]}>
          <View
            style={[
              Styles.width100per,
              Styles.borderBottom2,
              Styles.borderBottom2,
              Styles.marginTop8,
            ]}
          >
            <Text
              style={[
                Styles.fontSize20,
                Styles.fontBold,
                Styles.marginBottom4,
                Styles.blueFontColor,
              ]}
            >
              Employee Search Result
            </Text>
          </View>
          {isLoading ? (
            <View
              style={[
                Styles.flex1,
                Styles.flexJustifyCenter,
                Styles.flexAlignCenter,
              ]}
            >
              {displayLoader ? (
                <ActivityIndicator
                  size="large"
                  color={theme.colors.secondary}
                />
              ) : null}
            </View>
          ) : listData.length > 0 ? (
            <View
              style={[Styles.flex1, Styles.flexColumn, Styles.backgroundColor]}
            >
              <Search
                data={listData}
                setData={setListSearchData}
                filterFunction={["mobile_no"]}
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
                  useFlatList={true}
                  disableRightSwipe={true}
                  rightOpenValue={-72}
                  renderItem={(data) => RenderItems(data)}
                  renderHiddenItem={(data, rowMap) =>
                    RenderHiddenItemGeneric("eye", data, rowMap, [EditCallback])
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
            <NoItems icon="format-list-bulleted" text="No records found" />
          )}
        </View>
      </ScrollView>
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
          <Title style={[Styles.paddingHorizontal16]}>{companyName}</Title>
          <ScrollView style={{ marginBottom: 64 }}>
            <List.Item title="Employee Name" description={RBEmployeeName} />
            <List.Item title="Mobile Number" description={RBMobileNo} />
            <List.Item title="Aadhar Number" description={RBAadharNo} />
          </ScrollView>
        </View>
      </RBSheet>
    </View>
  );
};

export default SearchEmployee;
