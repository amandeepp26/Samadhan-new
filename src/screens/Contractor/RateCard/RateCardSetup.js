import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  RefreshControl,
  LogBox,
  ScrollView,
  SafeAreaView,
} from "react-native";
import {
  FAB,
  List,
  Snackbar,
  Title,
  Button,
  DataTable,
} from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import RBSheet from "react-native-raw-bottom-sheet";
import Provider from "../../../api/Provider";
import Header from "../../../components/Header";
import NoItems from "../../../components/NoItems";
import { theme } from "../../../theme/apptheme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RenderHiddenItems } from "../../../components/ListActions";
import { Styles } from "../../../styles/styles";
import { NullOrEmpty } from "../../../utils/validations";

import { communication } from "../../../utils/communication";
import { APIConverter } from "../../../utils/apiconverter";
import Search from "../../../components/Search";

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);
let userID = 0,
  groupID = 0;

const RateCardSetup = ({ navigation }) => {
  // !there are many state which are not being set or use. you should review them
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeID, setEmployeeID] = useState("");
  const [otp, setOTP] = useState("");

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [serviceName, setServiceName] = useState("");

  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");

  const [unit, setUnit] = useState("");

  const [rateWithMaterials, setRateWithMaterials] = useState("");
  const [rateWithoutMaterials, setRateWithoutMaterials] = useState("");

  const [altRateWithMaterials, setAltRateWithMaterials] = useState("");
  const [altRateWithoutMaterials, setAltRateWithoutMaterials] = useState("");

  const [altRateWithMaterialsUnit, setAltRateWithMaterialsUnit] = useState("");
  const [altRateWithoutMaterialsUnit, setAltRateWithoutMaterialsUnit] =
    useState("");

  const [shortSpecification, setShortSpecification] = useState("");

  const [display, setDispaly] = useState("");

  const refRBSheet = useRef();

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      groupID = JSON.parse(userData).Sess_group_refno;
      FetchData();
    }
  };

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

  const FetchData = (from) => {
    if (from === "add" || from === "update") {
      setSnackbarText(
        "Item " + (from === "add" ? "added" : "updated") + " successfully"
      );
      setSnackbarColor(theme.colors.success);
      setSnackbarVisible(true);
    }
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        contractor_product_refno: "all",
      },
    };
    Provider.createDFContractor(
      Provider.API_URLS.contractorproductrefnocheck,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(
              response.data.data,
              false,
              "ratecard"
            );
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
    Provider.create("master/updateemployeeverification", {
      EmployeeID: employeeID,
      OTP: otp,
    })
      .then((response) => {
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
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  useEffect(() => {
    GetUserID();
  }, []);

  const AddCallback = () => {
    navigation.navigate("AddRateCard", { type: "add", fetchData: FetchData });
  };

  const EditCallback = (data, rowMap) => {
    rowMap[data.item.key].closeRow();
    navigation.navigate("AddRateCard", {
      type: "edit",
      fetchData: FetchData,
      data: {
        contractorProductID: data.item.contractorProductID,
        // rateCardID: data.item.id,
        // id: data.item.productID,
        // activityRoleName: data.item.activityRoleName,
        // activityID: data.item.activityID,
        // serviceName: data.item.serviceName,
        // serviceID: data.item.serviceID,
        // unitName: data.item.unitName,
        // unitOfSalesID: data.item.unitOfSalesID,
        // categoryName: data.item.categoryName,
        // productName: data.item.productName,
        // categoryID: data.item.categoryID,
        // hsnsacCode: data.item.hsnsacCode,
        // unit1ID: data.item.unit1ID,
        // unit2ID: data.item.unit2ID,
        // unit1Name: data.item.unit1Name,
        // unit2Name: data.item.unit2Name,
        // selectedUnitID: data.item.selectedUnitID,
        // // gstRate: data.item.gstRate.toFixed(2),
        // rateWithMaterials: data.item.rateWithMaterials.toFixed(2),
        // rateWithoutMaterials: data.item.rateWithoutMaterials.toFixed(2),
        // altRateWithMaterials: data.item.altRateWithMaterials.toFixed(2),
        // altRateWithoutMaterials: data.item.altRateWithoutMaterials.toFixed(2),
        // shortSpecification: data.item.shortSpecification,
        // specification: data.item.specification,
        // display: data.item.display,
      },
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
          { height: 80 },
        ]}
      >
        <List.Item
          title={data.item.productName}
          titleStyle={{ fontSize: 18 }}
          description={`Service Name: ${
            NullOrEmpty(data.item.serviceName) ? "" : data.item.serviceName
          }\nCategory Name: ${
            NullOrEmpty(data.item.categoryName) ? "" : data.item.categoryName
          } `}
          onPress={() => {
            refRBSheet.current.open();

            setServiceName(data.item.serviceName);
            setCategory(data.item.categoryName);
            setProductName(data.item.productName);
            //setServiceProductName(data.item.serviceProductName);

            //setSpecification(data.item.specification);
            setShortSpecification(data.item.shortSpecification);
            setUnit(data.item.actualUnitName);

            setRateWithMaterials(data.item.rateWithMaterials);
            setRateWithoutMaterials(data.item.rateWithoutMaterials);

            setAltRateWithMaterials(data.item.with_material_rate_alternate_rate);
            setAltRateWithoutMaterials(
              data.item.without_material_rate_alternate_rate
            );

            setAltRateWithMaterialsUnit(
              data.item.with_material_rate_alternate_unit
            );
            setAltRateWithoutMaterialsUnit(
              data.item.without_material_rate_alternate_unit
            );

            // setRate(data.item.rate);
            // setAlternativeRate(data.item.alternativeRate);
            // setMaterial(data.item.material);
            setDispaly(data.item.display == true ? "Yes" : "No");
          }}
          left={() => (
            <Icon
              style={{ marginVertical: 12, marginRight: 12 }}
              size={30}
              color={theme.colors.textSecondary}
              name="cards"
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

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Rate Card List" />
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
            filterFunction={(text) => (item) =>
              item?.category_name
                ?.toLowerCase()
                ?.includes(text?.toLowerCase()) ||
              item?.service_name?.toLowerCase()?.includes(text?.toLowerCase())}
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
                RenderHiddenItems(data, rowMap, [EditCallback])
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
        height={620}
        animationType="fade"
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
          draggableIcon: { backgroundColor: "#000" },
        }}
      >
        <View>
          <Title style={[Styles.paddingHorizontal16]}>{productName}</Title>
          <ScrollView style={{ marginBottom: 64 }}>
            <List.Item title="Service Name" description={serviceName} />
            <List.Item title="Category" description={category} />
            <List.Item title="Unit" description={unit} />
            <View style={[Styles.padding16]}>
              <DataTable
                style={[
                  Styles.backgroundSecondaryColor,
                  Styles.borderRadius4,
                  Styles.flexJustifyCenter,
                  Styles.borderred,
                ]}
              >
                <DataTable.Header>
                  <DataTable.Title
                    style={[{ flex: 1, justifyContent: "flex-start" }]}
                  >
                    Rate Unit
                  </DataTable.Title>
                  <DataTable.Title
                    style={[{ flex: 1, justifyContent: "flex-start" }]}
                    numeric
                  >
                    Alt Rate Unit
                  </DataTable.Title>
                  <DataTable.Title
                    style={[{ flex: 1, justifyContent: "center" }]}
                    numeric
                  >
                    Material
                  </DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                  <DataTable.Cell
                    style={[{ flex: 1, justifyContent: "flex-start" }]}
                  >
                    {rateWithMaterials}
                  </DataTable.Cell>
                  <DataTable.Cell
                    style={[
                      { flex: 1, justifyContent: "flex-start", width: 150 },
                    ]}
                    numeric
                  >
                    {altRateWithMaterials} / {altRateWithMaterialsUnit}
                  </DataTable.Cell>
                  <DataTable.Cell
                    style={[{ flex: 1, justifyContent: "center" }]}
                    numeric
                  >
                    <Button
                      mode="contained"
                      labelStyle={[{ textTransform: "capitalize" }]}
                      style={[Styles.marginStart4, Styles.greenBgColor]}
                      icon={() => (
                        <Icon
                          name="checkbox-marked-circle"
                          size={18}
                          color={theme.colors.textLight}
                        />
                      )}
                    >
                      Yes
                    </Button>
                  </DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                  <DataTable.Cell
                    style={[{ flex: 1, justifyContent: "flex-start" }]}
                  >
                    {rateWithoutMaterials}
                  </DataTable.Cell>
                  <DataTable.Cell
                    style={[{ flex: 1, justifyContent: "flex-start" }]}
                    numeric
                  >
                    {altRateWithoutMaterials} / {altRateWithoutMaterialsUnit}
                  </DataTable.Cell>
                  <DataTable.Cell
                    style={[{ flex: 1, justifyContent: "center" }]}
                    numeric
                  >
                    <Button
                      mode="contained"
                      labelStyle={[{ textTransform: "capitalize" }]}
                      style={[Styles.marginStart4, Styles.redBgColor]}
                      icon={() => (
                        <Icon
                          name="close-circle"
                          size={18}
                          color={theme.colors.textLight}
                        />
                      )}
                    >
                      No
                    </Button>
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable>
            </View>
            <List.Item
              title="Short Specification"
              description={shortSpecification}
            />
            {/* <List.Item title="Specification" description={specification} /> */}
            <List.Item title="Display" description={display} />
            {/* <List.Item title="Verify Status" description={NullOrEmpty(action) ? "" : verifyStatus ? "Verified":"Not Verified"} /> */}
          </ScrollView>
        </View>
      </RBSheet>
    </View>
    </SafeAreaView>
  );
};

export default RateCardSetup;
