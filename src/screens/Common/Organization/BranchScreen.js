import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  RefreshControl,
  LogBox,
  ScrollView,
} from "react-native";
import { FAB, List, Snackbar, Title } from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import RBSheet from "react-native-raw-bottom-sheet";
import Provider from "../../../api/Provider";
import Header from "../../../components/Header";
import NoItems from "../../../components/NoItems";
import { theme } from "../../../theme/apptheme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RenderHiddenItemGeneric } from "../../../components/ListActions";
import { Styles } from "../../../styles/styles";
import { NullOrEmpty } from "../../../utils/validations";
import { APIConverter } from "../../../utils/apiconverter";
import Search from "../../../components/Search";

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);
let userID = 0,
  companyID = 0,
  groupID = 0;

const BranchListScreen = ({ navigation }) => {
  //#region Variables
  const [isLoading, setIsLoading] = useState(true);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [locationType, setLocationType] = useState("");

  const [locationName, setLocationName] = useState("");
  const [inchargeName, setInchargeName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [address, setAddress] = useState("");
  const [gstNo, setGSTNo] = useState("");

  const [panNo, setPANNo] = useState("");
  const [display, setDispaly] = useState("");

  const refRBSheet = useRef();
  //#endregion

  //#region Functions

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      companyID = JSON.parse(userData).Sess_company_refno;
      groupID = JSON.parse(userData).Sess_group_refno;
      FetchData();
    }
  };

  // const showDialog = () => setVisible(true);

  // const hideDialog = () => setVisible(false);

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
      data: {
        Sess_UserRefno: userID,
        branch_refno: "all",
        Sess_company_refno: companyID,
        Sess_group_refno: groupID,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.MyBranchRefnocheck, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(
              response.data.data,
              false,
              "addbranch"
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

  useEffect(() => {
    GetUserID();
  }, []);

  const AddCallback = () => {
    navigation.navigate("BranchEditScreen", {
      type: "add",
      fetchData: FetchData,
    });
  };

  const EditCallback = (data, rowMap, buttonType) => {
    rowMap[data.item.key].closeRow();
    navigation.navigate("BranchEditScreen", {
      type: "edit",
      fetchData: FetchData,
      data: {
        id: data.item.id,
        accountNo: data.item.accountNumber,
        address: data.item.addressLine,
        bankBranchName: data.item.branchName,
        bankName: data.item.bankName,
        branchAdmin: data.item.branchInchargeName,
        branchAdminID: data.item.branchAdminID,
        branchType: data.item.branchType,

        branchTypeID: data.item.branchTypeID,
        cityID: data.item.cityID,
        contactPersonNo: data.item.branchInchargeContactNo,
        display: data.item.display,
        gstNo: data.item.gstNo,
        id: data.item.id,
        ifscCode: data.item.ifscCode,
        key: data.item.key,
        locationName: data.item.locationName,
        panNo: data.item.panNo,
        pincode: data.item.pincode,
        regionalOfficeID: data.item.regionalOfficeID,
        stateID: data.item.stateID,
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
          title={data.item.branchInchargeName}
          titleStyle={{ fontSize: 18 }}
          description={`Mobile: ${
            NullOrEmpty(data.item.branchInchargeContactNo)
              ? ""
              : data.item.branchInchargeContactNo
          }\nLocation Type: ${
            NullOrEmpty(data.item.branchType) ? "" : data.item.branchType
          } `}
          onPress={() => {
            refRBSheet.current.open();
            setInchargeName(data.item.branchInchargeName);
            setMobileNo(data.item.branchInchargeContactNo);
            setLocationName(data.item.locationName);
            setLocationType(data.item.branchType);
            setAddress(data.item.addressLine);
            setGSTNo(data.item.gstNo);
            setPANNo(data.item.panNo);
            setDispaly(data.item.display ? "Yes" : "No");
          }}
          left={() => (
            <Icon
              style={{ marginVertical: 12, marginRight: 12 }}
              size={30}
              color={theme.colors.textSecondary}
              name="office-building"
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

  //#endregion

  return (
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="My Branch List" />
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
              "accountNumber",
              "addressLine",
              "bankName",
              "branchInchargeContactNo",
              "branchInchargeName",
              "branchName",
              "branchType",
              "cityName",
              "companyName",
              "display",
              "gstNo",
              "head_office",
              "ifscCode",
              "locationName",
              "panNo",
              "pincode",
              "regionalOfficeID",
              "stateName",
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
                RenderHiddenItemGeneric("edit", data, rowMap, [EditCallback])
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
        height={480}
        animationType="fade"
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
          draggableIcon: { backgroundColor: "#000" },
        }}
      >
        <View>
          <Title style={[Styles.paddingHorizontal16]}>{inchargeName}</Title>
          <ScrollView style={{ marginBottom: 64 }}>
            <List.Item title="Mobile No" description={mobileNo} />
            <List.Item title="Location Type" description={locationType} />
            <List.Item title="Address" description={address} />
            <List.Item title="GST No" description={gstNo} />
            <List.Item title="PAN No" description={panNo} />
            <List.Item title="Dispaly" description={display} />
          </ScrollView>
        </View>
      </RBSheet>
    </View>
  );
};

export default BranchListScreen;
