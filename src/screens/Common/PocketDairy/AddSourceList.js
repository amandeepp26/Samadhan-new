import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  LogBox,
  RefreshControl,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity, // zoom image code
} from "react-native";
import {
  Button,
  FAB,
  List,
  Snackbar,
  Portal,
  Dialog,
  Title,
  Card,
  Modal,
} from "react-native-paper";
import RBSheet from "react-native-raw-bottom-sheet";
import { SwipeListView } from "react-native-swipe-list-view";
import Provider from "../../../api/Provider";
import Header from "../../../components/Header";
import { RenderHiddenItemsSourceExpense } from "../../../components/ListActions";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import NoItems from "../../../components/NoItems";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import { NullOrEmpty } from "../../../utils/validations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AWSImagePath } from "../../../utils/paths";
import { creds, projectVariables } from "../../../utils/credentials";
import { useIsFocused } from "@react-navigation/native";
import { TabBar, TabView } from "react-native-tab-view";
import { SheetElement } from "./SheetElements";
import Search from "../../../components/Search";
// zoom image code
import ImageViewer from 'react-native-image-zoom-viewer';
// zoom image code

let userID = 0,
  companyID = 0,
  branchID = 0;
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

const windowWidth = Dimensions.get("window").width;

const AddSourceList = ({ route, navigation }) => {
  //#region Variables
  const [index, setIndex] = useState(0);
  const [attachmentImage, setAttachmentImage] = useState(
    AWSImagePath + "placeholder-image.png"
  );
  const [PDCattachmentImage, setPDCAttachmentImage] = useState(
    AWSImagePath + "placeholder-image.png"
  );
  const [isLoading, setIsLoading] = useState(true);

  const [listData_Self, setListData_Self] = useState([]);
  const [listSearchData_Self, setListSearchData_Self] = useState([]);
  const [listData_Company, setlistData_Company] = useState([]);
  const [listSearchData_Company, setListSearchData_Company] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const [date, setDate] = useState(new Date());
  const [dateInvalid, setDateInvalid] = useState("");
  const dateRef = useRef({});
  const [current, setCurrent] = useState({});
  const [transactionID, setTransactionID] = useState("");
  const [entryType, setEntryType] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [receiptMode, setReceiptMode] = useState("");
  const [amount, setAmount] = useState("");
  const [attachment, setAttachment] = useState("");
  const [display, setDisplay] = useState("");
  const [depositType, setDepositType] = useState("");
  const [PDCStatus, setPDCStatus] = useState("");
  const [PayToCompanyStatus, setPayToCompanyStatus] = useState(false);
  // zoom image code
  const [viewerImagesZoomVisible, setViewerImagesZoomVisible] = useState(false);
  const [viewerImagesZoom, setViewerImagesZoom] = useState([]);
  const [zoomImagePath, setZoomImagePath] = React.useState(null);
  // zoom image code

  const refRBSheet = useRef();
  const [unitdialogue, setUnitDialogue] = useState(false);
  const [currentID, setCurrentID] = useState("");
  //#region Functions

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      companyID = JSON.parse(userData).Sess_company_refno;
      branchID = JSON.parse(userData).Sess_branch_refno;
      FetchData_Self();
      FetchData_Company();
    }
  };

  const ResetFields = () => {
    setPDCStatus(false);
    setPayToCompanyStatus(false);
  };

  const FetchData_Self = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_trans_refno: "all",
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        pck_transtype_refno: "1",
        pck_entrytype_refno: "1",
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.pcktransrefnocheck, params)
      .then((response) => {

        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            const lisData = [...response.data.data];
            lisData.map((k, i) => {
              k.key = (parseInt(i) + 1).toString();
            });
            setListData_Self(response.data.data);
            setListSearchData_Self(response.data.data);
          }
        } else {
          setListData_Self([]);
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
  const FetchData_Company = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_trans_refno: "all",
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        pck_transtype_refno: "2",
        pck_entrytype_refno: "1",
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.pcktransrefnocheck, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            const lisData = [...response.data.data];
            lisData.map((k, i) => {
              k.key = (parseInt(i) + 1).toString();
            });
            setlistData_Company(response.data.data);
            setListSearchData_Company(response.data.data);
          }
        } else {
          setlistData_Company([]);
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
    ResetFields();
    if (from === "add" || from === "update") {
      setSnackbarText(
        "Item " + (from === "add" ? "added" : "updated") + " successfully"
      );
      setSnackbarColor(theme.colors.success);
      setSnackbarVisible(true);
    }
    FetchData_Self();
    FetchData_Company();
  };

  useEffect(() => {
    GetUserID();
  }, []);

  const RemoveItem = () => {
    setIsLoading(true);
    setRefreshing(true);
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        pck_trans_refno: currentID,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.pck_transrefno_remove_recreate,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            LoadAll();
            setIsLoading(false);
            setRefreshing(false);
          }
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

  const RenderItems = (data) => {
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
          titleStyle={{ fontSize: 18 }}
          description={`Category Name.: ${NullOrEmpty(data.item.pck_category_name)
            ? ""
            : data.item.pck_category_name
            }\nAmount: ${NullOrEmpty(data.item.amount) ? "" : data.item.amount} `}
          onPress={() => {
            refRBSheet.current.open();
            setCurrent(data.item);
            setTransactionID(data.item.pck_trans_refno);
            setDate(data.item.pck_trans_date);
            setEntryType(data.item.pck_entrytype_name);
            setCategoryName(data.item.pck_category_name);
            setSubCategoryName(data.item.pck_sub_category_name);
            setReceiptMode(data.item.pck_mode_name);
            setAmount(data.item.amount);
            setAttachment(data.item.attach_receipt_url);
            setAttachmentImage(data.item.attach_receipt_url);
            //zoom image code
            setZoomImagePath(data.item.attach_receipt_url);
            //zoom image code
            console.log('open image:', data.item.attach_receipt_url);
            setPDCAttachmentImage(data.item.bankchallan_slip_url);
            setDisplay(data.item.view_status == "1" ? "Yes" : "No");
            setDepositType(data.item.deposit_type_refno);
            setPDCStatus(data.item.pdc_cheque_status);
            if (
              data.item.BalanceUnPaidPayment != null &&
              parseFloat(data.item.BalanceUnPaidPayment.replace(/,/g, "")) >
              0 &&
              data.item.pck_category_refno ==
              projectVariables.DEF_PCKDIARY_CATEGORY_Clients_REFNO
            ) {
              setPayToCompanyStatus(true);
            }
          }}
          left={() => (
            <Icon
              style={{ marginVertical: 12, marginRight: 12 }}
              size={30}
              color={theme.colors.textSecondary}
              name="file-tree"
            />
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

  const AddCallback = () => {
    navigation.navigate("AddSelf", {
      type: "add",
      fetchData: LoadAll,
      tabIndex: index,
    });
  };

  const EditCallback = (data, rowMap) => {
    rowMap[data.item.key].closeRow();
    navigation.navigate("AddSelf", {
      type: "edit",
      fetchData: LoadAll,
      data: {
        amount: data.item.amount,
        attach_receipt_url: data.item.attach_receipt_url,
        bankchallan_slip_url: data.item.bankchallan_slip_url,
        cheque_date: data.item.cheque_date,
        cheque_no: data.item.cheque_no,
        createby_user_refno: data.item.createby_user_refno,
        deposit_type_refno: data.item.deposit_type_refno,
        notes: data.item.notes,
        pck_category_name: data.item.pck_category_name,
        pck_category_refno: data.item.pck_category_refno,
        pck_entrytype_name: data.item.pck_entrytype_name,
        pck_entrytype_refno: data.item.pck_entrytype_refno,
        pck_mode_name: data.item.pck_mode_name,
        pck_mode_refno: data.item.pck_mode_refno,
        pck_mybank_refno: data.item.pck_mybank_refno,
        pck_mycontact_refno: data.item.pck_mycontact_refno,
        pck_sub_category_name: data.item.pck_sub_category_name,
        pck_sub_category_refno: data.item.pck_sub_category_refno,
        pck_trans_date: data.item.pck_trans_date,
        pck_trans_refno: data.item.pck_trans_refno,
        pdc_cheque_status: data.item.pdc_cheque_status,
        reminder_date: data.item.reminder_date,
        utr_no: data.item.utr_no,
        view_status: data.item.view_status,
        myclient_refno: data.item.myclient_refno,
        cont_project_refno: data.item.cont_project_refno,
        invoice_no: data.item.invoice_no,
        payment_type_refno: data.item.payment_type_refno,
        pck_contacttype_refno: data.item.pck_contacttype_refno,
        pck_sub_category_notes: data.item.pck_sub_category_notes,
        ...data.item,
      },
    });
  };

  //#endregion

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "selfDetail":
        return (
          <View style={[Styles.flex1]}>
            <ScrollView
              style={[Styles.flex1, Styles.backgroundColor]}
              keyboardShouldPersistTaps="handled"
            >
              <View>
                {listData_Self.length > 0 ? (
                  <View
                    style={[
                      Styles.flex1,
                      Styles.flexColumn,
                      Styles.backgroundColor,
                    ]}
                  >
                    <Search
                      data={listData_Self}
                      setData={setListSearchData_Self}
                      filterFunction={[
                        "amount",
                        "attach_receipt_url",
                        "bankchallan_slip_url",
                        "cheque_date",
                        "cheque_no",
                        "createby_user_refno",
                        "deposit_type_refno",
                        "notes",
                        "pck_category_name",
                        "pck_category_refno",
                        "pck_entrytype_name",
                        "pck_entrytype_refno",
                        "pck_mode_name",
                        "pck_mode_refno",
                        "pck_mybank_refno",
                        "pck_mycontact_refno",
                        "pck_sub_category_name",
                        "pck_sub_category_refno",
                        "pck_trans_date",
                        "pck_trans_refno",
                        "pdc_cheque_status",
                        "reminder_date",
                        "utr_no",
                        "view_status",
                        "myclient_refno",
                        "cont_project_refno",
                        "invoice_no",
                        "payment_type_refno",
                        "pck_contacttype_refno",
                        "pck_sub_category_notes",
                      ]}
                    />
                    {listSearchData_Self?.length > 0 ? (
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
                              FetchData_Self();
                            }}
                          />
                        }
                        data={listSearchData_Self}
                        disableRightSwipe={true}
                        rightOpenValue={-72}
                        renderItem={(data) => RenderItems(data)}
                        renderHiddenItem={(data, rowMap) =>
                          RenderHiddenItemsSourceExpense(data, rowMap, [
                            EditCallback,
                            (data) => {
                              setCurrentID(data);
                              setUnitDialogue(true);
                            },
                          ])
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
              </View>
            </ScrollView>
          </View>
        );
      case "companyDetail":
        return (
          <View style={[Styles.flex1]}>
            <ScrollView
              style={[Styles.flex1, Styles.backgroundColor]}
              keyboardShouldPersistTaps="handled"
            >
              <View>
                {listData_Company.length > 0 ? (
                  <View
                    style={[
                      Styles.flex1,
                      Styles.flexColumn,
                      Styles.backgroundColor,
                    ]}
                  >
                    <Search
                      data={listData_Company}
                      setData={setListSearchData_Company}
                      filterFunction={[
                        "amount",
                        "attach_receipt_url",
                        "bankchallan_slip_url",
                        "cheque_date",
                        "cheque_no",
                        "createby_user_refno",
                        "deposit_type_refno",
                        "notes",
                        "pck_category_name",
                        "pck_category_refno",
                        "pck_entrytype_name",
                        "pck_entrytype_refno",
                        "pck_mode_name",
                        "pck_mode_refno",
                        "pck_mybank_refno",
                        "pck_mycontact_refno",
                        "pck_sub_category_name",
                        "pck_sub_category_refno",
                        "pck_trans_date",
                        "pck_trans_refno",
                        "pdc_cheque_status",
                        "reminder_date",
                        "utr_no",
                        "view_status",
                        "myclient_refno",
                        "cont_project_refno",
                        "invoice_no",
                        "payment_type_refno",
                        "pck_contacttype_refno",
                        "pck_sub_category_notes",
                      ]}
                    />
                    {listSearchData_Company?.length > 0 ? (
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
                              FetchData_Self();
                            }}
                          />
                        }
                        data={listSearchData_Company}
                        disableRightSwipe={true}
                        rightOpenValue={-72}
                        renderItem={(data) => RenderItems(data)}
                        renderHiddenItem={(data, rowMap) =>
                          RenderHiddenItemsSourceExpense(data, rowMap, [
                            EditCallback,
                            (data) => {
                              setCurrentID(data);
                              setUnitDialogue(true);
                            },
                          ])
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
    { key: "selfDetail", title: "Source Details" },
    { key: "companyDetail", title: "Expenses Details" },
  ]);

  return (
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Self List" />
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
      <FAB
        style={[
          Styles.margin16,
          Styles.primaryBgColor,
          { position: "absolute", right: 16, bottom: 16 },
        ]}
        icon="plus"
        onPress={AddCallback}
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
        height={420}
        animationType="fade"
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
          draggableIcon: { backgroundColor: "#000" },
        }}
      >
        <View>
          <Title style={[Styles.paddingHorizontal16]}>{entryType}</Title>
          <ScrollView>
            <SheetElement current={current} type="fin-list" />

            {PayToCompanyStatus && (
              <>
                <View
                  style={[
                    Styles.width100per,
                    Styles.paddingTop24,
                    Styles.paddingHorizontal32,
                    { elevation: 3 },
                  ]}
                >
                  <Button
                    icon={"cash-refund"}
                    mode="contained"
                    onPress={() => {
                      refRBSheet.current.close();
                      navigation.navigate("AddExpenses", {
                        fetchData: LoadAll,
                        type: projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText,
                        data: {
                          transactionID: transactionID,
                        },
                      });
                    }}
                  >
                    Pay To Company
                  </Button>
                </View>
              </>
            )}

            {attachmentImage != "" && (
              <>
                <View style={[Styles.width100per, Styles.height200]}>
                  {/* zoom image code */}
                  <TouchableOpacity
                    style={[Styles.height100per, Styles.width100per]}
                    onPress={() => {

                      if (zoomImagePath != "" && zoomImagePath != undefined) {
                        setViewerImagesZoom([
                          {
                            url: zoomImagePath,
                          },
                        ]);
                        setViewerImagesZoomVisible(true);
                      }
                      else {
                        setViewerImagesZoomVisible(false);
                      }

                    }}>

                    <Image
                      source={{ uri: attachmentImage }}
                      style={
                        ([Styles.borderred], { width: "100%", height: "100%" })
                      }
                    />
                  </TouchableOpacity>
                  {/* zoom image code */}
                </View>
              </>
            )}

            <List.Item title="Display" description={display} />

            {depositType == "2" && PDCStatus == "0" && (
              <>
                <View
                  style={[
                    Styles.width100per,
                    Styles.paddingTop24,
                    Styles.paddingHorizontal32,
                    { elevation: 3 },
                  ]}
                >
                  <Button
                    icon={"plus"}
                    mode="contained"
                    onPress={() => {
                      refRBSheet.current.close();
                      navigation.navigate("PDCDataUpdate", {
                        fetchData: LoadAll,
                        type: "pdc",
                        data: {
                          transactionID: transactionID,
                        },
                      });
                    }}
                  >
                    Update PDC Details
                  </Button>
                </View>
              </>
            )}

            {depositType == "2" && PDCStatus == "1" && PDCattachmentImage && (
              <>
                <View style={[Styles.width100per, Styles.height200]}>
                  <Image
                    source={{ uri: PDCattachmentImage }}
                    style={
                      ([Styles.borderred], { width: "100%", height: "100%" })
                    }
                  />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </RBSheet>
      <Portal>
        <Dialog
          visible={unitdialogue}
          onDismiss={() => setUnitDialogue(false)}
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
                  RemoveItem();
                  setUnitDialogue(false);
                }}
              >
                Ok
              </Button>
            </Card.Content>
            <Card.Content style={[Styles.marginTop16]}>
              <Button
                mode="contained"
                onPress={() => {
                  setUnitDialogue(false);
                }}
              >
                Cancel
              </Button>
            </Card.Content>
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* zoom image code */}
      <Modal
        visible={viewerImagesZoomVisible}
        onRequestClose={() => setViewerImagesZoomVisible(false)}
        transparent={true}>
        <View
          style={[
            { backgroundColor: 'rgba(0,0,0,0.85)', position: 'relative', height: 500, width: 360 },
          ]}>

          <Button
            mode="outlined"
            style={{
              position: 'absolute',
              bottom: 16,
              zIndex: 20,
              right: 104,
              backgroundColor: 'white',
            }}
            onPress={() => setViewerImagesZoomVisible(false)}>
            Close
          </Button>
          <ImageViewer
            imageUrls={viewerImagesZoom}
            backgroundColor="transparent"
            style={[Styles.bordergreen, { height: 1920, }]}
            renderIndicator={() => null}
          />

        </View>
      </Modal>
      {/* zoom image code */}
    </View>
  );
};

export default AddSourceList;
