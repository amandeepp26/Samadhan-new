import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  LogBox,
  RefreshControl,
  ScrollView,
} from "react-native";
import { FAB, List, Searchbar, Snackbar, Title } from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import Provider from "../../../../api/Provider";
import Header from "../../../../components/Header";
import { RenderHiddenItems } from "../../../../components/ListActions";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import NoItems from "../../../../components/NoItems";
import { Styles } from "../../../../styles/styles";
import { theme } from "../../../../theme/apptheme";
import { APIConverter } from "../../../../utils/apiconverter";
import RBSheet from "react-native-raw-bottom-sheet";
import Search from "../../../../components/Search";
import { getStorage, hasValue } from "../../../../utils/Helper";

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);
let userID = 0, companyID = 0;

const GMyBankScreen = ({ navigation }) => {
  //#region Variables
  const [isLoading, setIsLoading] = useState(true);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const [bankName, setBankName] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [cardType, setCardType] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [remarks, setRemarks] = useState("");
  const [display, setDisplay] = useState(false);
  const refRBSheet = useRef();

  //#endregion

  //#region Functions
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
        // Sess_UserRefno: "2",
        // pck_category_refno: "all",
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        bank_refno: "all",
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.userbankrefnocheck,
      // Provider.API_URLS.pckcategoryrefnocheck_user,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
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
  const GetUserID = async () => {
    const userData = await getStorage("user");
    console.log(userData, 'userData');
    if (hasValue(userData)) {
      userID = userData.UserID;
      companyID = userData.Sess_company_refno;
      groupID = userData.Sess_group_refno;
      FetchData();
    }
  };

  useEffect(() => {
    GetUserID();
  }, []);

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
          title={data.item.bankName}
          titleStyle={{ fontSize: 18 }}
          description={`Bank Account No: ${data.item.bankAccountNo}\nDisplay: ${
            data.item.display ? "Yes" : "No"
          } `}
          onPress={() => {
            refRBSheet.current.open();
            setBankName(data.item.bankName);
            setBankAccountNo(data.item.bankAccountNo);
            setCardType(data.item.cardType);
            setOpeningBalance(data.item.openingBalance);
            setRemarks(data.item.remarks);
            setDisplay(data.item.display);
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
    navigation.navigate("AddGMyBankScreen", {
      type: "add",
      fetchData: FetchData,
    });
  };

  const EditCallback = (data, rowMap) => {
    rowMap[data.item.key].closeRow();
    navigation.navigate("AddGMyBankScreen", {
      type: "edit",
      fetchData: FetchData,
      data: {
        id: data.item.id,
        categoryName: data.item.categoryName,
        display: data.item.display,
        pckCategoryID: data.item.pckCategoryID,
        transactionTypeName: data.item.transactionTypeName,
      },
    });
  };
  //#endregion

  return (
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Bank List" />
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
              "categoryName",
              "display",
              "pckCategoryID",
              "transactionTypeName",
            ]}
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
                  onRefresh={() => FetchData()}
                />
              }
              data={listSearchData}
              useFlatList={true}
              disableRightSwipe={true}
              rightOpenValue={-72}
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
        height={320}
        animationType="fade"
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
          draggableIcon: { backgroundColor: "#000" },
        }}
      >
        <View>
          <Title style={[Styles.paddingHorizontal16]}>{bankName}</Title>
          <ScrollView style={{ marginBottom: 64 }}>
            <List.Item title="Bank Name" description={bankName} />
            <List.Item title="Bank Account No " description={bankAccountNo} />
            <List.Item title="Card Type Name " description={cardType} />
            <List.Item title="Opening Balance " description={openingBalance} />
            <List.Item title="Remarks " description={remarks} />
            <List.Item title="Display" description={display ? "Yes" : "No"} />
          </ScrollView>
        </View>
      </RBSheet>
    </View>
  );
};

export default GMyBankScreen;
