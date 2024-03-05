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
import { FAB, List, Snackbar, Searchbar, Title, Button, Modal } from "react-native-paper";
import RBSheet from "react-native-raw-bottom-sheet";
import { SwipeListView, SwipeRow } from "react-native-swipe-list-view";
import Provider from "../../../api/Provider";
import Header from "../../../components/Header";
import { RenderHiddenItems } from "../../../components/ListActions";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import NoItems from "../../../components/NoItems";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import { NullOrEmpty } from "../../../utils/validations";
import { useRadioGroup } from "@material-ui/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AWSImagePath } from "../../../utils/paths";
// zoom image code
import ImageViewer from 'react-native-image-zoom-viewer';
// zoom image code

import {
  creds,
  projectVariables,
  projectLoginTypes,
  projectFixedDesignations,
} from "../../../utils/credentials";
import { useIsFocused } from "@react-navigation/native";
import { TabBar, TabView } from "react-native-tab-view";
import { SheetElement } from "./SheetElements";

let userID = 0,
  companyID = 0,
  branchID = 0,
  groupID = 0,
  designID = 0;
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
  "source.uri should not be an empty string",
  `VirtualizedLists should never be nested inside plain ScrollViews with the 
  same orientation because it can break windowing and other functionality - 
  use another VirtualizedList-backed container instead.`,
]);

const windowWidth = Dimensions.get("window").width;

const AddExpensesList = ({ navigation }) => {
  //#region Variables
  const isFocused = useIsFocused();
  const [index, setIndex] = useState(0);
  const [attachmentImage, setAttachmentImage] = React.useState(null);
  const [searchQuery_Self, setSearchQuery_Self] = React.useState("");
  const [searchQuery_Company, setSearchQuery_Company] = React.useState("");

  // zoom image code
  const [viewerImagesZoomVisible, setViewerImagesZoomVisible] = useState(false);
  const [viewerImagesZoom, setViewerImagesZoom] = useState([]);
  const [zoomImagePath, setZoomImagePath] = React.useState(null);

  // zoom image code

  const [isLoading, setIsLoading] = React.useState(true);

  const listData_Self = React.useState([]);
  const listSearchData_Self = React.useState([]);

  const listData_Company = React.useState([]);
  const listSearchData_Company = React.useState([]);

  const [refreshing, setRefreshing] = React.useState(false);
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");
  const [snackbarColor, setSnackbarColor] = React.useState(
    theme.colors.success
  );

  const [date, setDate] = useState(new Date());
  const [dateInvalid, setDateInvalid] = useState("");
  const dateRef = useRef({});

  const [entryType, setEntryType] = React.useState("");
  const [categoryName, setCategoryName] = React.useState("");
  const [subCategoryName, setSubCategoryName] = React.useState("");
  const [receiptMode, setReceiptMode] = React.useState("");
  const [attachment, setAttachment] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [current, setCurrent] = useState({});
  const [display, setDisplay] = React.useState("");

  const [depositType, setDepositType] = useState("");
  const [PDCStatus, setPDCStatus] = useState("");
  const [PDCattachmentImage, setPDCAttachmentImage] = useState(null);

  const [PayToCompanyStatus, setPayToCompanyStatus] = useState(false);

  const refRBSheet = useRef();
  //#endregion

  //#region Functions

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      companyID = JSON.parse(userData).Sess_company_refno;
      branchID = JSON.parse(userData).Sess_branch_refno;
      groupID = JSON.parse(userData).Sess_group_refno;
      designID = JSON.parse(userData).Sess_designation_refno;
      FetchData_Self();
      FetchData_Company();
    }
  };

  const FetchData_Self = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_trans_refno: "all",
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        pck_transtype_refno: projectVariables.DEF_PCKDIARY_TRANSTYPE_SOURCE_REFNO,
        pck_entrytype_refno: projectVariables.DEF_PCKDIARY_ENTRYTYPE_COMPANY_REFNO,
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
            listData_Self[1](response.data.data);
            listSearchData_Self[1](response.data.data);
          }
        } else {
          listData_Self[1]([]);
          // setSnackbarText("No Self data found");
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
        pck_entrytype_refno: "2",
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
            listData_Company[1](response.data.data);
            listSearchData_Company[1](response.data.data);
          }
        } else {
          listData_Company[1]([]);
          // setSnackbarText("No Company data found");
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

  const LoadAll = (from) => {
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

  const onChangeSearch_Self = (query) => {
    setSearchQuery_Self(query);
    if (query === "") {
      listSearchData_Self[1](listData_Self[0]);
    } else {
      listSearchData_Self[1](
        listData_Self[0].filter((el) => {
          return el.categoryName
            .toString()
            .toLowerCase()
            .includes(query.toLowerCase());
        })
      );
    }
  };

  const onChangeSearch_Company = (query) => {
    setSearchQuery_Company(query);
    if (query === "") {
      listSearchData_Company[1](listData_Company[0]);
    } else {
      listSearchData_Company[1](
        listData_Company[0].filter((el) => {
          return el.categoryName
            .toString()
            .toLowerCase()
            .includes(query.toLowerCase());
        })
      );
    }
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
            setPDCAttachmentImage(data.item.bankchallan_slip_url);
            setDepositType(data.item.deposit_type_refno);
            setPDCStatus(data.item.pdc_cheque_status);
            setDisplay(data.item.view_status == "1" ? "Yes" : "No");
            setCurrent(data.item);

            if (data?.item?.BalanceUnPaidPayment != null && data?.item?.TotalPaidAmount != null && data.item.pck_category_refno == projectVariables.DEF_PCKDIARY_CATEGORY_Clients_REFNO) {

              if (parseFloat(data?.item?.BalanceUnPaidPayment) > 0) {
                setPayToCompanyStatus(true);
              }
              else { setPayToCompanyStatus(false); }
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
    if (
      groupID == projectLoginTypes.DEF_EMPLOYEE_GROUP_REFNO &&
      designID ==
      projectFixedDesignations.DEF_MARKETINGEXECUTIVE_DESIGNATION_REFNO
    ) {
      navigation.navigate("AddExpensesMarketing", {
        type: "add",
        fetchData: LoadAll,
        tabIndex: index,
      });
    } else {
      navigation.navigate("AddCompany", {
        type: "add",
        fetchData: LoadAll,
        tabIndex: index,
      });
    }
  };

  const EditCallback = (data, rowMap) => {
    rowMap[data.item.key].closeRow();
    if (
      groupID == projectLoginTypes.DEF_EMPLOYEE_GROUP_REFNO &&
      designID ==
      projectFixedDesignations.DEF_MARKETINGEXECUTIVE_DESIGNATION_REFNO
    ) {
      navigation.navigate("AddExpensesMarketing", {
        type: "edit",
        fetchData: LoadAll,
        data: data.item,
      });
    } else {
      navigation.navigate("AddCompany", {
        type: "edit",
        fetchData: LoadAll,
        data: data.item,
      });
    }
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
                {listData_Self[0].length > 0 ? (
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
                      onChangeText={onChangeSearch_Self}
                      value={searchQuery_Self}
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
                            FetchData_Self();
                          }}
                        />
                      }
                      data={listSearchData_Self[0]}
                      disableRightSwipe={true}
                      rightOpenValue={-72}
                      renderItem={(data) => RenderItems(data)}
                      renderHiddenItem={(data, rowMap) => {
                        if (!data.item.action_button.includes("Edit")) {
                          return null;
                        } else {
                          return RenderHiddenItems(data, rowMap, [
                            EditCallback,
                          ]);
                        }
                      }}
                    />
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
                {listData_Company[0].length > 0 ? (
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
                      onChangeText={onChangeSearch_Company}
                      value={searchQuery_Company}
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
                            FetchData_Company();
                          }}
                        />
                      }
                      data={listSearchData_Company[0]}
                      disableRightSwipe={true}
                      rightOpenValue={-72}
                      renderItem={(data) => RenderItems(data)}
                      renderHiddenItem={(data, rowMap) => {
                        if (!data.item.action_button.includes("Edit")) {
                          return null;
                        } else {
                          return RenderHiddenItems(data, rowMap, [
                            EditCallback,
                          ]);
                        }
                      }}
                    />
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

  const [routes] = React.useState([
    { key: "selfDetail", title: "Source Details" },
    { key: "companyDetail", title: "Expenses Details" },
  ]);

  return (
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Company List" />
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
        <View style={[Styles.marginBottom64]}>
          <Title style={[Styles.paddingHorizontal16]}>{entryType}</Title>
          <ScrollView>
            <SheetElement current={current} type="fin-list" />
            <View style={[Styles.width100per, Styles.height200]}>
              {/* zoom image code */}
              <TouchableOpacity
                style={[Styles.height100per, Styles.width100per]}
                onPress={() => {

                  if(zoomImagePath != "" && zoomImagePath != undefined) {
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
                  resizeMode="contain"
                  source={{ uri: attachmentImage }}
                  style={([Styles.borderred], { width: "100%", height: "100%" })}
                />
              </TouchableOpacity>
              {/* zoom image code */}
            </View>
            <List.Item title="Display" description={display} />

            {PayToCompanyStatus && (
              <View style={[Styles.paddingHorizontal16]}>
                <Button
                  icon={"cash-refund"}
                  mode="contained"
                  onPress={() => {
                    refRBSheet.current.close();
                    navigation.navigate("PayToCompany", {
                      fetchData: LoadAll,
                      type: projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText,
                      data: {
                        transactionID: current?.pck_trans_refno,
                      },
                    });
                  }}
                >
                  Pay To Company
                </Button>
              </View>
            )}

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
                          transactionID: current?.pck_trans_refno,
                          transactionType: projectVariables.DEF_PCKDIARY_TRANSTYPE_SOURCE_REFNO,
                          entryTypeID: projectVariables.DEF_PCKDIARY_ENTRYTYPE_COMPANY_REFNO,
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
                    resizeMode="contain"
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

export default AddExpensesList;
