import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  LogBox,
  RefreshControl,
  ScrollView,
  Dimensions, Text
} from "react-native";
import {
  Button,
  List,
  Snackbar,
  Portal,
  Dialog,
  Title,
  Card,
} from "react-native-paper";
import RBSheet from "react-native-raw-bottom-sheet";
import { SwipeListView } from "react-native-swipe-list-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TabBar, TabView } from "react-native-tab-view";

import { theme } from "./../../../../theme/apptheme";
import { Styles } from "./../../../../styles/styles";
import Header from "./../../../../components/Header";
import { hasValue } from "../../../../utils/Helper";
import Provider from "./../../../../api/Provider";
import NoItems from "./../../../../components/NoItems";
import Search from "./../../../../components/Search";
import LabelInput from "../../../Marketing/EmployeeActivity/common/LabelInput";
import HDivider from "../../../Marketing/EmployeeActivity/common/HDivider";
import TouchableOpacity from "../../../../components/TouchableOpacity";

let userID = 0,
  companyID = 0,
  branchID = 0;
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

const windowWidth = Dimensions.get("window").width;

const PocketDiaryInbox = ({ route, navigation }) => {
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const refRBSheet = useRef();
  const [RemoveSettlementDialogue, setRemoveSettlementDialogue] = useState(false);

  const [settlementData, setSettlementData] = useState([]);
  const [settlementSearchData, setSettlementSearchData] = useState([]);
  const [lendingData, setLendingData] = useState([]);
  const [lendingSearchData, setLendingSearchData] = useState([]);
  const [sheetFormData, setSheetFormData] = useState(null);

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      companyID = JSON.parse(userData).Sess_company_refno;
      branchID = JSON.parse(userData).Sess_branch_refno;
      fetchSettlement();
      fetchLending();
    }
  };

  const LoadAll = () => {
    fetchSettlement();
    fetchLending();
  };

  useEffect(() => {
    GetUserID();
  }, []);

  // Settlement
  const fetchSettlement = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString()
      },
    };
    //console.log('*******PD params:**********', params, "*======================*");
    Provider.createDFPocketDairy(Provider.API_URLS.pck_inbox_cash_borrowing_list, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            const lisData = [...response.data.data];
            lisData.map((k, i) => {
              k.key = (parseInt(i) + 1).toString();
            });
            setSettlementData(response.data.data);
            setSettlementSearchData(response.data.data);
          }
        } else {
          setSettlementSearchData([]);
          //setSnackbarText("No Self data found");
          // setSnackbarColor(theme.colors.error);
          // setSnackbarVisible(true);
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
  const onUpdateSettlement = (item, received_status) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        pck_trans_refno: item?.pck_trans_refno ?? "",
        amount: item?.amount ?? "",
        received_status: received_status
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.pck_inbox_cash_receivedstatus_update, params)
      .then((response) => {
        //console.log(response, 'pck_inbox_cash_receivedstatus_update');
        const status = response?.data?.status ?? null
        if (status === "Success") {
          const Created = response?.data?.data?.Created ?? null
          const Updated = response?.data?.data?.Updated ?? null
          const Removed = response?.data?.data?.Removed ?? null
          const Cancel = response?.data?.data?.Cancel ?? null
          if (Created === 1 || Updated === 1 || Removed === 1 || Cancel === 1) {
            if (hasValue(response?.data?.message ?? "")) {
              setSnackbarText(response.data.message);
              setSnackbarColor(theme.colors.success);
              setSnackbarVisible(true);
            }
            LoadAll();
          } else {
            if (hasValue(response?.data?.message ?? "")) {
              setSnackbarText(response.data.message);
              setSnackbarColor(theme.colors.error);
              setSnackbarVisible(true);
            }
          }
        } else {
          if (hasValue(response?.data?.message ?? "")) {
            setSnackbarText(response.data.message);
            setSnackbarColor(theme.colors.error);
            setSnackbarVisible(true);
          }
        }
        setIsLoading(false);
        setRefreshing(false);
      }).catch((e) => {
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        setRefreshing(false);
      });
  };
  const onRemoveSettlement = (item) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        pck_trans_refno: sheetFormData?.pck_trans_refno ?? "",
        remove_status: "1"
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.pck_inbox_removestatus_update, params)
      .then((response) => {
        //console.log(response, 'pck_inbox_removestatus_update');
        const status = response?.data?.status ?? null
        if (status === "Success") {
          const Created = response?.data?.data?.Created ?? null
          const Updated = response?.data?.data?.Updated ?? null
          const Removed = response?.data?.data?.Removed ?? null
          const Cancel = response?.data?.data?.Cancel ?? null
          if (Created === 1 || Updated === 1 || Removed === 1 || Cancel === 1) {
            if (hasValue(response?.data?.message ?? "")) {
              setSnackbarText(response.data.message);
              setSnackbarColor(theme.colors.success);
              setSnackbarVisible(true);
            }
            LoadAll();
          } else {
            if (hasValue(response?.data?.message ?? "")) {
              setSnackbarText(response.data.message);
              setSnackbarColor(theme.colors.error);
              setSnackbarVisible(true);
            }
          }
        } else {
          if (hasValue(response?.data?.message ?? "")) {
            setSnackbarText(response.data.message);
            setSnackbarColor(theme.colors.error);
            setSnackbarVisible(true);
          }
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
  const SettlementCard = ({
    item, onUpdateSettlement, onCancelSettlement
  }) => {
    const item_data = {
      sheet_title: "Settlement",
      ...item
    }
    return (
      <TouchableOpacity activeOpacity={0.8}
        style={[
          { backgroundColor: "#eee", borderRadius: 8, elevation: 5, },
          Styles.paddingHorizontal8, Styles.paddingVertical12,
        ]}
        onPress={() => {
          refRBSheet.current.open();
          setSheetFormData(item_data)
        }}>
        <LabelInput label="Transaction Date" value={item?.pck_trans_date ?? ""} lg />
        <HDivider />
        <LabelInput label="Payment Mode Type" value={item?.pck_mode_name ?? ""} />
        <HDivider />
        <LabelInput label="Re-Payment Date" value={item?.repayment_reminder_date ?? ""} />
        <HDivider />
        <LabelInput label="Amount" value={item?.amount ?? ""} />
        <HDivider />
        <Text style={[Styles.marginBottom8, Styles.fontSize10, Styles.textSecondaryColor,]}>Action</Text>
        <View style={[Styles.flexRow, Styles.flexSpaceBetween]}>
          {item.received_status === "0" ?
            (<>
              <Button mode="outlined" labelStyle={[Styles.fontSize10]}
                onPress={onUpdateSettlement}
                style={{ borderWidth: 2, borderRadius: 4, borderColor: theme.colors.greenBorder, width: '48%' }}>Receive</Button>
              <Button mode="outlined"
                labelStyle={[Styles.fontSize10, { color: theme.colors.error }]}
                onPress={onCancelSettlement}
                style={{ borderWidth: 2, borderRadius: 4, borderColor: theme.colors.error, width: '48%' }}>Cancel</Button>
            </>) :
            (
              <Button mode="outlined"
                labelStyle={[Styles.fontSize10, { color: theme.colors.error }]}
                onPress={() => {
                  setSheetFormData(item_data)
                  setRemoveSettlementDialogue(true)
                }}
                style={{ borderWidth: 2, borderRadius: 4, borderColor: theme.colors.error, width: '100%' }}>Remove from Inbox</Button>
            )
          }
        </View>
      </TouchableOpacity>
    );
  };
  const renderSettlementItems = (data) => {
    return (
      <View style={[Styles.backgroundColor, Styles.paddingHorizontal16,
      Styles.flexJustifyCenter, Styles.flex1, Styles.marginBottom12]}>
        <SettlementCard
          key={data.item.key}
          item={data.item}
          display={data.item.view_status}
          navigation={navigation}
          onUpdateSettlement={() => { onUpdateSettlement(data.item, "1") }}
          onCancelSettlement={() => { onUpdateSettlement(data.item, "2") }}
        />
      </View>
    );
  };

  // Lending
  const fetchLending = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString()
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.pck_inbox_cash_lending_list, params)
      .then((response) => {
        //console.log(response, 'pck_inbox_cash_lending_list');
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            const lisData = [...response.data.data];
            lisData.map((k, i) => {
              k.key = (parseInt(i) + 1).toString();
            });
            setLendingData(response.data.data);
            setLendingSearchData(response.data.data);
          }
        } else {
          setLendingSearchData([]);
          //setSnackbarText("No Self data found");
          // setSnackbarColor(theme.colors.error);
          // setSnackbarVisible(true);
        }
        setIsLoading(false);
        setRefreshing(false);
      }).catch((e) => {
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        setRefreshing(false);
      });
  };
  const LendingCard = ({
    item,
  }) => {
    const item_data = {
      sheet_title: "Lending",
      ...item
    }
    return (
      <TouchableOpacity activeOpacity={0.8}
        style={[
          { backgroundColor: "#eee", borderRadius: 8, elevation: 5, },
          Styles.paddingHorizontal8, Styles.paddingVertical12,
        ]}
        onPress={() => {
          refRBSheet.current.open();
          setSheetFormData(item_data)
        }}>
        <LabelInput label="Date" value={item?.pck_trans_date ?? ""} lg />
        <HDivider />
        <LabelInput label="Payment Mode Type" value={item?.pck_mode_name ?? ""} />
        <HDivider />
        <LabelInput label="Recurring Date" value={item?.recurring_reminder_date ?? ""} />
        <HDivider />
        <LabelInput label="Amount" value={item?.amount ?? ""} />
        {item.received_status === "1" && <>
          <HDivider />
          <Text style={[Styles.marginBottom8, Styles.fontSize10, Styles.textSecondaryColor,]}>Action</Text>
          <View style={[Styles.flexRow, Styles.flexSpaceBetween]}>
            <Button mode="outlined"
              labelStyle={[Styles.fontSize10, { color: theme.colors.error }]}
              onPress={() => {
                setSheetFormData(item_data)
                setRemoveSettlementDialogue(true)
              }}
              style={{ borderWidth: 2, borderRadius: 4, borderColor: theme.colors.error, width: '100%' }}>Remove from Inbox</Button>

          </View>
        </>}
      </TouchableOpacity>
    );
  };
  const renderLendingItems = (data) => {
    return (
      <View style={[Styles.backgroundColor, Styles.paddingHorizontal16,
      Styles.flexJustifyCenter, Styles.flex1, Styles.marginBottom12]}>
        <LendingCard
          key={data.item.key}
          item={data.item}
          display={data.item.view_status}
          navigation={navigation}
        />
      </View>
    );
  };
  const renderScene = ({ route }) => {
    switch (route.key) {
      case "settlementTab":
        return (
          <View style={[Styles.flex1]}>
            <ScrollView
              style={[Styles.flex1, Styles.backgroundColor]}
              keyboardShouldPersistTaps="handled"
            >
              <View>
                {settlementSearchData.length > 0 ? (
                  <View
                    style={[
                      Styles.flex1,
                      Styles.flexColumn,
                      Styles.backgroundColor,
                    ]}
                  >
                    <Search
                      data={settlementSearchData}
                      setData={setSettlementData}
                      filterFunction={[
                        "amount",
                        "notes",
                        "pck_mode_name",
                        "pck_trans_date",
                        "pck_trans_refno",
                        "received_status",
                        "receivedfrom_mobileno",
                        "receivedfrom_name",
                        "repayment_reminder_date",
                      ]}
                    />
                    {settlementData?.length > 0 ? (
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
                              fetchSettlement();
                            }}
                          />
                        }
                        data={settlementData}
                        disableRightSwipe={true}
                        rightOpenValue={-72}
                        renderItem={(data) => renderSettlementItems(data)}
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
                    text="No records found."
                  />
                )}
              </View>
            </ScrollView>
          </View>
        );
      case "lendingTab":
        return (
          <View style={[Styles.flex1]}>
            <ScrollView
              style={[Styles.flex1, Styles.backgroundColor]}
              keyboardShouldPersistTaps="handled"
            >
              <View>
                {lendingSearchData.length > 0 ? (
                  <View
                    style={[
                      Styles.flex1,
                      Styles.flexColumn,
                      Styles.backgroundColor,
                    ]}
                  >
                    <Search
                      data={lendingSearchData}
                      setData={setLendingData}
                      filterFunction={[
                        "amount",
                        "notes",
                        "paidto_mobileno",
                        "paidto_name",
                        "pck_mode_name",
                        "pck_mode_refno",
                        "pck_trans_date",
                        "pck_trans_refno",
                        "received_status",
                        "recurring_reminder_date",
                      ]}
                    />
                    {lendingData?.length > 0 ? (
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
                              fetchLending();
                            }}
                          />
                        }
                        data={lendingData}
                        disableRightSwipe={true}
                        rightOpenValue={-72}
                        renderItem={(data) => renderLendingItems(data)}
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
      tabStyle={{ width: windowWidth / 2 }}
      labelStyle={[Styles.fontSize12, Styles.fontBold]}
    />
  );

  const [routes] = useState([
    { key: "settlementTab", title: "Settlement" },
    { key: "lendingTab", title: "Lending" },
  ]);

  return (
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Pocket Diary Inbox" />
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
          swipeEnabled={false}
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
        height={720}
        animationType="fade"
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
          draggableIcon: { backgroundColor: "#000" },
        }}
      >
        <View>
          <Title style={[Styles.paddingHorizontal16]}>
            {sheetFormData?.sheet_title ?? ""}
          </Title>
          <ScrollView>
            {sheetFormData?.sheet_title ?? "" === "Settlement" ?
              (<>
                {hasValue(sheetFormData?.pck_trans_date ?? "") &&
                  <List.Item title="Transaction Date" description={sheetFormData.pck_trans_date} />
                }
                {hasValue(sheetFormData?.pck_mode_name ?? "") &&
                  <List.Item title="Payment Mode Type" description={sheetFormData.pck_mode_name} />
                }
                {hasValue(sheetFormData?.receivedfrom_name ?? "") &&
                  <List.Item title="Received From Name" description={sheetFormData.receivedfrom_name} />
                }
                {hasValue(sheetFormData?.receivedfrom_mobileno ?? "") &&
                  <List.Item title="Mobile No" description={sheetFormData.receivedfrom_mobileno} />
                }
                {hasValue(sheetFormData?.repayment_reminder_date ?? "") &&
                  <List.Item title="Re-Payment Date" description={sheetFormData.repayment_reminder_date} />
                }
                {hasValue(sheetFormData?.amount ?? "") &&
                  <List.Item title="Amount" description={sheetFormData.amount} />
                }
                {hasValue(sheetFormData?.notes ?? "") &&
                  <List.Item title="Remarks" description={sheetFormData.notes} />
                }
                {hasValue(sheetFormData?.received_status ?? "") &&
                  <List.Item title="Received Status" description={sheetFormData.received_status === "0" ? "Pending" : "Received"} />
                }
              </>) :
              (<>
                {hasValue(sheetFormData?.pck_trans_date ?? "") &&
                  <List.Item title="Date" description={sheetFormData.pck_trans_date} />
                }
                {hasValue(sheetFormData?.pck_mode_name ?? "") &&
                  <List.Item title="Payment Mode Type" description={sheetFormData.pck_mode_name} />
                }
                {hasValue(sheetFormData?.paidto_name ?? "") &&
                  <List.Item title="Paid To Name" description={sheetFormData.paidto_name} />
                }
                {hasValue(sheetFormData?.paidto_mobileno ?? "") &&
                  <List.Item title="Mobile No" description={sheetFormData.paidto_mobileno} />
                }
                {hasValue(sheetFormData?.recurring_reminder_date ?? "") &&
                  <List.Item title="Recurring Date" description={sheetFormData.recurring_reminder_date} />
                }
                {hasValue(sheetFormData?.amount ?? "") &&
                  <List.Item title="Amount" description={sheetFormData.amount} />
                }
                {hasValue(sheetFormData?.notes ?? "") &&
                  <List.Item title="Remarks" description={sheetFormData.notes} />
                }
                {hasValue(sheetFormData?.received_status ?? "") &&
                  <List.Item title="Received Status" description={sheetFormData.received_status === "0" ? "Pending" : "Received"} />
                }
              </>)
            }
          </ScrollView>
        </View>
      </RBSheet>
      <Portal>
        <Dialog
          visible={RemoveSettlementDialogue}
          onDismiss={() => setRemoveSettlementDialogue(false)}
          style={[Styles.borderRadius8]}
        >
          <Dialog.Title style={[Styles.fontSize16, Styles.textCenter]}>
            Confirm to Remove?
          </Dialog.Title>
          <Dialog.Content>
            <View
              style={[
                Styles.flexRow,
                Styles.flexJustifyCenter,
                Styles.flexAlignCenter,
                Styles.marginTop16,
              ]}
            ></View>
            <View></View>
            <Card.Content style={[Styles.marginTop16]}>
              <Button
                mode="contained"
                onPress={() => {
                  onRemoveSettlement();
                  setRemoveSettlementDialogue(false);
                }}
              >Ok</Button>
            </Card.Content>
            <Card.Content style={[Styles.marginTop16]}>
              <Button
                mode="contained"
                onPress={() => {
                  setRemoveSettlementDialogue(false);
                }}
              >Cancel</Button>
            </Card.Content>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
};

export default PocketDiaryInbox;
