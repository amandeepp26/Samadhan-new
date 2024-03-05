import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  LogBox,
  RefreshControl,
  ScrollView,
  Pressable,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import { FAB, List, Snackbar, Title } from "react-native-paper";
import RBSheet from "react-native-raw-bottom-sheet";
import { SwipeListView } from "react-native-swipe-list-view";
import Provider from "../../../api/Provider";
import Header from "../../../components/Header";
import { RenderHiddenItems } from "../../../components/ListActions";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import NoItems from "../../../components/NoItems";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import { APIConverter } from "../../../utils/apiconverter";
import Search from "../../../components/Search";

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

const ProductScreen = ({ navigation }) => {
  //#region Variables
  const [isLoading, setIsLoading] = useState(true);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const [selectedProductName, setSelectedProductName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [activityRoleName, setActivityRoleName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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
        Sess_UserRefno: "2",
        product_refno: "all",
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.ProductFromRefNo, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(
              response.data.data,
              null,
              "master_product"
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
    FetchData();
  }, []);

  const AddCallback = () => {
    navigation.navigate("AddProductScreen", {
      type: "add",
      fetchData: FetchData,
    });
  };

  const EditCallback = (data, rowMap) => {
    // rowMap[data.item.key].closeRow();
    navigation.navigate("AddProductScreen", {
      type: "edit",
      fetchData: FetchData,
      data: {
        id: data.item.productID,
        activityRoleName: data.item.activityRoleName,
        serviceName: data.item.serviceName,
        productName: data.item.productName,
        categoryName: data.item.categoryName,
        display: data.item.display,
        unitId: data.item.unitId,
        hsnsacCode: data.item.hsnsacCode,
      },
    });
  };

    const showPopup = user => {
      setSelectedUser(user);
      setIsPopupVisible(true);
    };

    const hidePopup = () => {
      setIsPopupVisible(false);
      setSelectedUser(null);
    };

  const RenderItems = (data,rowMap) => {
    return (
      <View
        style={[
          Styles.backgroundColor,
          Styles.borderBottom1,
          Styles.paddingStart16,
          Styles.flexJustifyCenter,
          {height: 72},
        ]}>
        <List.Item
          title={data.item.productName}
          titleStyle={{fontSize: 18}}
          description={'Display: ' + (data.item.display ? 'Yes' : 'No')}
          left={() => (
            <Icon
              style={{marginVertical: 5, marginRight: 10}}
              size={20}
              color={theme.colors.primary}
              name="barcode-scan"
            />
          )}
          onPress={() => {
            showPopup(data);
            setSelectedProductName(data.item.productName);
            setActivityRoleName(data.item.activityRoleName);
            setCategoryName(data.item.categoryName);
            setServiceName(data.item.serviceName);
            setProductCode(data.item.productCode);
          }}
          right={() => (
            <View>
            <Pressable
              style={{
                marginLeft: 10,
                marginTop:10,
                borderBottomWidth: 1,
                borderColor: theme.colors.primary,
              }}
              onPress={() => EditCallback(data)}>
              <Icon
                name="pencil-outline"
                type="ionicon"
                color={theme.colors.primary}
                size={18}
              />
            </Pressable>
            </View>
          )}
        />
      </View>
    );
  };
  //#endregion

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Product" />
      {isLoading ? (
        <View
          style={[
            Styles.flex1,
            Styles.flexJustifyCenter,
            Styles.flexAlignCenter,
          ]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : listData.length > 0 ? (
        <View style={[Styles.flex1, Styles.flexColumn, Styles.backgroundColor]}>
          <Search
            data={listData}
            setData={setListSearchData}
            filterFunction={[
              'activityRoleName',
              'categoryName',
              'gstRate',
              'hsnsacCode',
              'productCode',
              'productName',
              'display',
              'serviceName',
              'unitName',
              'unitOfSalesID',
              'unitId',
            ]}
          />
          {listSearchData?.length ? (
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
              disableRightSwipe={true}
              rightOpenValue={-72}
              renderItem={(data, rowMap) => RenderItems(data, rowMap)}
              // renderHiddenItem={(data, rowMap) =>
              //   RenderHiddenItems(data, rowMap, [EditCallback])
              // }
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
          {position: 'absolute', borderRadius: 50, right: 16, bottom: 16},
        ]}
        icon="plus"
        color="white"
        onPress={AddCallback}
      />
      {selectedUser && (
        <View style={styles.popupContainer}>
          <View style={styles.popupContent}>
            <TouchableOpacity style={styles.closeButton} onPress={hidePopup}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Title
              style={[Styles.fontBold, Styles.fontSize18, Styles.textCenter]}>
              {selectedProductName}
            </Title>
            <View style={styles.row}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize14,
                ]}
                selectable={true}>
                Product Code
              </Text>
              <Text
                style={[
                  Styles.fontSize14,
                  {
                    color: theme.colors.primaryLight,
                    width: '55%',
                    textAlign: 'right',
                  },
                ]}
                selectable={true}>
                {productCode}
              </Text>
            </View>
            <View style={styles.row}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize14,
                ]}
                selectable={true}>
                Activity Role Name
              </Text>
              <Text
                style={[
                  Styles.fontSize14,
                  {
                    color: theme.colors.primaryLight,
                    width: '50%',
                    textAlign: 'right',
                  },
                ]}
                selectable={true}>
                {activityRoleName}
              </Text>
            </View>
            <View style={styles.row}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize14,
                ]}
                selectable={true}>
                Service Name
              </Text>
              <Text
                style={[
                  Styles.fontSize14,
                  {
                    color: theme.colors.primaryLight,
                    width: '72%',
                    textAlign: 'right',
                  },
                ]}
                selectable={true}>
                {serviceName}
              </Text>
            </View>

            <View style={styles.row}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize14,
                ]}
                selectable={true}>
                Category Name
              </Text>
              <Text
                style={[
                  Styles.fontSize14,
                  {
                    color: theme.colors.primaryLight,
                    width: '55%',
                    textAlign: 'right',
                  },
                ]}
                selectable={true}>
                {categoryName}
              </Text>
            </View>
          </View>
        </View>
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

export default ProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#d5d5d5',
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
  closeButton: {
    position: 'absolute', // Position the close button absolutely within the container
    top: -32, // Adjust the top distance as needed
    right: 0, // Adjust the right distance as needed
    backgroundColor: 'red', // Background color for the close button
    borderRadius: 20, // Adjust the border radius to make the button circular
    // padding: 2, // Add padding for better touch area
  },
  popupContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '95%',
  },
  popupButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  popupButton: {
    padding: 10,
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: 5,
  },

  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Add elevation for shadow effect
  },
});
