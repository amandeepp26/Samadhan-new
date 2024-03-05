import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  LogBox,
  RefreshControl,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  Button,
  List,
  Snackbar,
  Searchbar,
  Title,
  Checkbox,
} from "react-native-paper";
import { SheetElement } from "./SheetElements";
import RBSheet from "react-native-raw-bottom-sheet";
import { SwipeListView } from "react-native-swipe-list-view";
import Provider from "../../../api/Provider";
import Header from "../../../components/Header";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import NoItems from "../../../components/NoItems";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import { NullOrEmpty } from "../../../utils/validations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { TabBar, TabView } from "react-native-tab-view";

let userID = 0,
  companyID = 0,
  branchID = 0,
  designID = 0;
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

const windowWidth = Dimensions.get("window").width;

const VerifyCompanyExpense = ({ route, navigation }) => {
  //#region Variables
  const isFocused = useIsFocused();
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  const [selected, setSelected] = useState([]);
  const [allcashData, setAllCashData] = React.useState([]);
  const [allupiData, setAllUpiData] = React.useState([]);
  const [allverifiedData, setAllVerifiedData] = React.useState([]);

  const [cashData, setCashData] = React.useState([]);
  const [upiData, setUpiData] = React.useState([]);
  const [verifiedData, setVerifiedData] = React.useState([]);

  const [cashquery, setCashQuery] = React.useState("");
  const [upiquery, setUpiQuery] = React.useState("");
  const [verifyquery, setVerifyQuery] = React.useState("");
  const [refreshing, setRefreshing] = React.useState(false);
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");
  const [snackbarColor, setSnackbarColor] = React.useState(
    theme.colors.success
  );
  const [current, setCurrent] = useState({});
  const [verified, setVerified] = React.useState(false);

  const refRBSheet = useRef();

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      companyID = JSON.parse(userData).Sess_company_refno;
      branchID = JSON.parse(userData).Sess_branch_refno;
      designID = JSON.parse(userData).Sess_designation_refno;
      CashVerifyCompanySource();
      BankVerifyCompanySource();
      VerifiedCompanySource();
    }
  };
  //320
  const CashVerifyCompanySource = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID?.toString(),
        Sess_branch_refno: branchID?.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.pck_companyexpenses_cash_verify_gridlist,
      params
    )
      .then((response) => {
        console.log("resp:", response.data.data);
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setAllCashData(response.data.data);
          }
        } else {
          setAllCashData([]);
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
  //321
  const BankVerifyCompanySource = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID?.toString(),
        Sess_branch_refno: branchID?.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.pck_companyexpenses_bank_verify_gridlist,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setAllUpiData(response.data.data);
          }
        } else {
          setAllUpiData([]);
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
  //320
  const VerifiedCompanySource = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID?.toString(),
        Sess_branch_refno: branchID?.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.pck_companyexpenses_all_verified_gridlist,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setAllVerifiedData(response.data.data);
          }
        } else {
          setAllVerifiedData([]);
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

  const LoadAll = (from) => {
    if (from === "update") {
      setSnackbarText("Record verified successfully");
      setSnackbarColor(theme.colors.success);
      setSnackbarVisible(true);
    } else if (from === "updates") {
      setSnackbarText("Records verified successfully");
      setSnackbarColor(theme.colors.success);
      setSnackbarVisible(true);
    }
    CashVerifyCompanySource();
    BankVerifyCompanySource();
    VerifiedCompanySource();
  };

  useEffect(() => {
    if (isFocused) {
      GetUserID();
    }
  }, [isFocused]);
  useEffect(() => {
    setSelected([]);
  }, [index]);

  useEffect(() => {
    setCashData(
      allcashData.filter((item) => {
        return item.pck_category_name
          ?.toString()
          .toLowerCase()
          .includes(cashquery.toLowerCase());
      })
    );
  }, [allcashData, cashquery]);

  useEffect(() => {
    setUpiData(
      allupiData.filter((item) => {
        return item.pck_category_name
          ?.toString()
          .toLowerCase()
          .includes(upiquery.toLowerCase());
      })
    );
  }, [allupiData, upiquery]);

  useEffect(() => {
    setVerifiedData(
      allverifiedData.filter((item) => {
        return item.pck_category_name
          ?.toString()
          .toLowerCase()
          .includes(verifyquery.toLowerCase());
      })
    );
  }, [allverifiedData, verifyquery]);

  const QuickVerify = () => {
    setIsLoading(true);
    const params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        Sess_designation_refno: designID,
        pck_trans_refno: selected,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.pckcompanyexpenses_quickverify_update,
      params
    )
      .then((response) => {
        console.log("API - 679");
        console.log("params", params);
        console.log("response", response.data);
        if (
          response.data &&
          response.data.data &&
          response.data.data.Verified === 1
        ) {
          setSelected([]);
          LoadAll("updates");
        } else {
          setSnackbarText(response?.data?.message);
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setSnackbarText("Something went wrong");
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        setIsLoading(false);
      });
  };
  const RenderItems = (data, isVerified) => {
    return (
      <View
        style={[
          Styles.backgroundColor,
          Styles.borderBottom1,
          Styles.paddingStart16,
          Styles.flexJustifyCenter,
          { height: 72 },
        ]}
      >
        <List.Item
          title={data.item.pck_mode_name}
          titleStyle={{ fontSize: 14 }}
          description={`Employee Name/Code: ${
            data.item.employee_name + " "+ data.item?.employee_code
              
          }\nAmount: ${NullOrEmpty(data.item.amount) ? "" : data.item.amount} `}
          onPress={() => {
            setVerified(isVerified);
            setCurrent(data.item);
            refRBSheet.current.open();
          }}
          left={() => (
            <>
              {isVerified ? (
            <Icon
              style={{ marginVertical: 12, marginRight: 12 }}
              size={30}
              color={theme.colors.textSecondary}
              name="file-tree"
            />
              ) : (
                <Checkbox.Item
                  style={{ marginVertical: 12, marginRight: 0, marginLeft: 0 }}
                  size={10}
                  status={
                    selected.includes(data.item.pck_trans_refno)
                      ? "checked"
                      : "unchecked"
                  }
                  onPress={() => {
                    setSelected((prev) => {
                      var temp = JSON.parse(JSON.stringify(prev)).filter(
                        (item) => item !== data.item.pck_trans_refno
                      );
                      return temp.length === prev.length
                        ? [...prev, data.item.pck_trans_refno]
                        : temp;
                    });
                  }}
                />
              )}
            </>
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

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "cash":
        return (
          <View style={[Styles.flex1]}>
            <ScrollView
              style={[Styles.flex1, Styles.backgroundColor]}
              keyboardShouldPersistTaps="handled"
            >
              <View>
                {allcashData.length > 0 ? (
                  <View
                    style={[
                      Styles.flex1,
                      Styles.flexColumn,
                      Styles.backgroundColor,
                    ]}
                  >
                    <Searchbar
                      style={[Styles.margin16]}
                      placeholder="Search"
                      onChangeText={(query) => {
                        setCashQuery(query);
                      }}
                      value={cashquery}
                    />
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginLeft: "5%",
                        marginRight: "5%",
                      }}
                    >
                      <Checkbox.Item
                        style={{ width: "20%" }}
                        status={
                          selected.length === cashData.length
                            ? "checked"
                            : "unchecked"
                        }
                        onPress={() => {
                          setSelected((prev) => {
                            if (cashData.length === prev.length) {
                              return [];
                            } else {
                              return cashData.map(
                                (item) => item.pck_trans_refno
                              );
                            }
                          });
                        }}
                      />
                      <Button
                        icon={"cash-refund"}
                        mode="contained"
                        style={{ width: 150, height: 40 }}
                        onPress={QuickVerify}
                        disabled={selected.length === 0}
                      >
                        Quick Verify
                      </Button>
                    </View>
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
                            CashVerifyCompanySource();
                          }}
                        />
                      }
                      data={cashData}
                      disableRightSwipe={true}
                      rightOpenValue={-72}
                      renderItem={(data) => RenderItems(data, false)}
                    />
                  </View>
                ) : (
                  <NoItems
                    icon="format-list-bulleted"
                    text="No records found."
                  />
                )}
              </View>
            </ScrollView>
          </View>
        );
      case "upi":
        return (
          <View style={[Styles.flex1]}>
            <ScrollView
              style={[Styles.flex1, Styles.backgroundColor]}
              keyboardShouldPersistTaps="handled"
            >
              <View>
                {allupiData.length > 0 ? (
                  <View
                    style={[
                      Styles.flex1,
                      Styles.flexColumn,
                      Styles.backgroundColor,
                    ]}
                  >
                    <Searchbar
                      style={[Styles.margin16]}
                      placeholder="Search"
                      onChangeText={(query) => {
                        setUpiQuery(query);
                      }}
                      value={upiquery}
                    />
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginLeft: "5%",
                        marginRight: "5%",
                      }}
                    >
                      <Checkbox.Item
                        style={{ width: "20%" }}
                        status={
                          selected.length === upiData.length
                            ? "checked"
                            : "unchecked"
                        }
                        onPress={() => {
                          setSelected((prev) => {
                            if (upiData.length === prev.length) {
                              return [];
                            } else {
                              return upiData.map(
                                (item) => item.pck_trans_refno
                              );
                            }
                          });
                        }}
                      />
                      <Button
                        icon={"cash-refund"}
                        mode="contained"
                        style={{ width: 150, height: 40 }}
                        onPress={QuickVerify}
                        disabled={selected.length === 0}
                      >
                        Quick Verify
                      </Button>
                    </View>
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
                            BankVerifyCompanySource();
                          }}
                        />
                      }
                      data={upiData}
                      disableRightSwipe={true}
                      rightOpenValue={-72}
                      renderItem={(data) => RenderItems(data, false)}
                    />
                  </View>
                ) : (
                  <NoItems
                    icon="format-list-bulleted"
                    text="No records found."
                  />
                )}
              </View>
            </ScrollView>
          </View>
        );
      case "verified":
        return (
          <View style={[Styles.flex1]}>
            <ScrollView
              style={[Styles.flex1, Styles.backgroundColor]}
              keyboardShouldPersistTaps="handled"
            >
              <View>
                {allverifiedData.length > 0 ? (
                  <View
                    style={[
                      Styles.flex1,
                      Styles.flexColumn,
                      Styles.backgroundColor,
                    ]}
                  >
                    <Searchbar
                      style={[Styles.margin16]}
                      placeholder="Search"
                      onChangeText={(query) => {
                        setVerifyQuery(query);
                      }}
                      value={verifyquery}
                    />
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
                            VerifiedCompanySource();
                          }}
                        />
                      }
                      data={verifiedData}
                      disableRightSwipe={true}
                      rightOpenValue={-72}
                      renderItem={(data) => RenderItems(data, true)}
                    />
                  </View>
                ) : (
                  <NoItems
                    icon="format-list-bulleted"
                    text="No records found."
                  />
                )}
              </View>
            </ScrollView>
          </View>
        );
      default:
        return null;
    }
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.colors.primary }}
      style={{ backgroundColor: theme.colors.textLight }}
      inactiveColor={theme.colors.textSecondary}
      activeColor={theme.colors.primary}
      scrollEnabled={true}
      tabStyle={{ width: windowWidth / 3 }}
      labelStyle={[Styles.fontSize12, Styles.fontBold]}
    />
  );

  const [routes] = React.useState([
    { key: "cash", title: "Cash" },
    { key: "upi", title: "UPI/NEFT/Cheque" },
    { key: "verified", title: "Verified" },
  ]);

  return (
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Verify Company Expenses" />
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
      ) : (
        <TabView
          swipeEnabled={true}
          renderTabBar={renderTabBar}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
        />
      )}
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
        height={600}
        animationType="fade"
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
          draggableIcon: { backgroundColor: "#000" },
        }}
      >
        <View>
          <Title style={[Styles.paddingHorizontal16]}>
            {current.pck_entrytype_name}
          </Title>
          <ScrollView>
            <SheetElement current={current} type="fin-list" />
            <View
              style={[
                Styles.width100per,
                Styles.paddingTop24,
                Styles.paddingHorizontal32,
                Styles.marginBottom64,
                { elevation: 3 },
              ]}
            >
              {verified == false && (
                <>
                  <Button
                    icon={"cash-refund"}
                    mode="contained"
                    onPress={() => {
                      navigation.navigate("VerifySource", {
                        type: "verify",
                        mode: "Expenses",
                        data: current,
                        fetchData: LoadAll,
                      });
                      refRBSheet.current.close();
                    }}
                  >
                    Verify
                  </Button>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </RBSheet>
    </View>
  );
};

export default VerifyCompanyExpense;
