import { useEffect, useState } from "react";
import { ActivityIndicator, View, LogBox, RefreshControl, SafeAreaView } from "react-native";
import { Button, FAB, List, Snackbar, Subheading } from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import Provider from "../../../api/Provider";
import Header from "../../../components/Header";
import { RenderHiddenItems } from "../../../components/ListActions";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import NoItems from "../../../components/NoItems";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APIConverter } from "../../../utils/apiconverter";
import Search from "../../../components/Search";

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);
let companyAdminID = 0;
let dealerID = 0;

const DealerBrandMasterScreen = ({ route, navigation }) => {
  //#region Variables
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShow, setShouldShow] = useState(true);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);
  //#endregion

  //#region Functions

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      const parsedUserData = JSON.parse(userData);
      companyAdminID = parsedUserData.Sess_CompanyAdmin_UserRefno;
      dealerID = parsedUserData.UserID;
      if (parsedUserData.Sess_if_create_brand == 1) {
        setShouldShow(true);
        FetchData();
      } else {
        setShouldShow(false);
      }
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
      data: {
        Sess_UserRefno: dealerID,
        Sess_CompanyAdmin_UserRefno: companyAdminID,
        brand_master_refno: "all",
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.DealerBrandMasterRefNoCheck,
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
          title={data.item.brandName}
          titleStyle={{ fontSize: 18 }}
          description={"Display: " + (data.item.display ? "Yes" : "No")}
          left={() => (
            <Icon
              style={{ marginVertical: 12, marginRight: 12 }}
              size={30}
              color={theme.colors.textSecondary}
              name="account-group"
            />
          )}
        />
      </View>
    );
  };

  const AddCallback = () => {
    navigation.navigate("AddDealerBrandMasterScreen", {
      type: "add",
      fetchData: FetchData,
    });
  };

  const EditCallback = (data, rowMap) => {
    rowMap[data.item.key].closeRow();
    navigation.navigate("AddDealerBrandMasterScreen", {
      type: "edit",
      fetchData: FetchData,
      data: {
        id: data.item.id,
        brandName: data.item.brandName,
        display: data.item.display,
      },
    });
  };
  //#endregion

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Brand" />
      {isLoading ? (
        <View
          style={[
            Styles.flex1,
            Styles.flexJustifyCenter,
            Styles.flexAlignCenter,
          ]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : !shouldShow ? (
        <View
          style={[
            Styles.flex1,
            Styles.flexAlignCenter,
            Styles.flexJustifyCenter,
            Styles.flexColumn,
            Styles.backgroundColor,
          ]}>
          <MaterialIcon name="error" color={theme.colors.error} size={48} />
          <Subheading
            style={[
              Styles.textSecondaryColor,
              Styles.paddingTop8,
              Styles.textCenter,
              {padding: 32},
            ]}>
            Would like to create brand and product? Please activate this option
          </Subheading>
          <Button
            mode="contained"
            onPress={() => {
              route.params.activeIndex = 10;
              navigation.navigate('UserProfile', {from: 'brand'});
            }}>
            Activate
          </Button>
        </View>
      ) : listData.length > 0 ? (
        <View style={[Styles.flex1, Styles.flexColumn, Styles.backgroundColor]}>
          <Search
            data={listData}
            setData={setListSearchData}
            filterFunction={['brandName', 'display']}
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
              renderItem={data => RenderItems(data)}
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
      {!shouldShow ? null : (
        <FAB
          style={[
            Styles.margin16,
            Styles.primaryBgColor,
            {position: 'absolute', borderRadius: 50, right: 16, bottom: 16},
          ]}
          icon="plus"
          color="white"
          onPress={AddCallback}
        />
      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: snackbarColor}}>
        {snackbarText}
      </Snackbar>
    </View>
    </SafeAreaView>
  );
};

export default DealerBrandMasterScreen;
