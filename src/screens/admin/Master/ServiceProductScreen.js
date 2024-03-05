import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  LogBox,
  RefreshControl,
  TouchableOpacity,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  StatusBar,
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

const ServiceProductScreen = ({ navigation }) => {
  //#region Variables
  const [isLoading, setIsLoading] = useState(true);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const [selectedServiceProductName, setSelectedServiceProductName] =
    useState("");
  const [serviceName, setServiceName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [rum, setRUM] = useState("");
  const [ruwm, setRUWM] = useState("");
  const [shortSpec, setShortSpec] = useState("");
  const [spec, setSpec] = useState("");
  const [unitName, setUnitName] = useState("");
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
        service_product_refno: "all",
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.ServiceProductrefNoCheck, params)
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
    FetchData();
  }, []);

  const AddCallback = () => {
    navigation.navigate("AddServiceProductScreen", {
      type: "add",
      fetchData: FetchData,
    });
  };

  const EditCallback = (data, rowMap) => {
    // rowMap[data.item.key].closeRow();
    navigation.navigate("AddServiceProductScreen", {
      type: "edit",
      fetchData: FetchData,
      data: {
        id: data.item.id,
        activityRoleName: data.item.activityRoleName,
        serviceName: data.item.serviceName,
        unitName: data.item.unitName,
        categoryName: data.item.categoryName,
        productName: data.item.productName,
        unit1Name: data.item.selectedUnit,
        unit2Name: data.item.convertedUnit,
        rateWithMaterials: data.item.rateWithMaterials,
        rateWithoutMaterials: data.item.rateWithoutMaterials,
        shortSpecification: data.item.shortSpecification,
        specification: data.item.specification,
        unitId: data.item.unitId,
        display: data.item.display,
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
              size={25}
              color={theme.colors.primary}
              name="bag-checked"
            />
          )}
          onPress={() => {
            showPopup(data);
            setSelectedServiceProductName(data.item.productName);
            setCategoryName(data.item.categoryName);
            setServiceName(data.item.serviceName);
            setRUM(data.item.rateWithMaterials);
            setRUWM(data.item.rateWithoutMaterials);
            setShortSpec(data.item.shortSpecification);
            setSpec(data.item.specification);
            setUnitName(data.item.selectedUnit);
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
      <Header navigation={navigation} title="Service Product" />
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
              'categoryName',
              'convertedUnit',
              'productName',
              'rateWithMaterials',
              'rateWithoutMaterials',
              'selectedUnit',
              'serviceName',
              'shortSpecification',
              'specification',
              'unitId',
              'unitOfSalesID',
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
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: snackbarColor}}>
        {snackbarText}
      </Snackbar>
      {selectedUser && (
        <View style={styles.popupContainer}>
          <View style={styles.popupContent}>
            <TouchableOpacity style={styles.closeButton} onPress={hidePopup}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Title
              style={[Styles.fontBold, Styles.fontSize18, Styles.textCenter]}>
              {selectedServiceProductName}
            </Title>
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

            <View style={styles.row}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize14,
                ]}
                selectable={true}>
                Unit Name
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
                {unitName}
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
                Rate / Unit (with materials)
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
                {rum}
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
                Rate / Unit (without materials)
              </Text>
              <Text
                style={[
                  Styles.fontSize14,
                  {
                    color: theme.colors.primaryLight,
                    width: '40%',
                    textAlign: 'right',
                  },
                ]}
                selectable={true}>
                {ruwm}
              </Text>
            </View>

            <View
              style={[
                styles.row,
                {flexDirection: 'column', alignItems: 'flex-start'},
              ]}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize14,
                ]}
                selectable={true}>
                Short Specification
              </Text>
              <Text
                style={[
                  Styles.fontSize14,
                  {
                    color: theme.colors.primaryLight,
                    width: '100%',
                    textAlign: 'justify',
                    marginTop:5
                  },
                ]}
                selectable={true}>
                {shortSpec === '' ? 'NA' : shortSpec}
              </Text>
            </View>

            <View
              style={[
                styles.row,
                {flexDirection: 'column', alignItems: 'flex-start'},
              ]}>
              <Text
                style={[
                  Styles.textDark,
                  {fontWeight: '500'},
                  Styles.fontSize14,
                ]}
                selectable={true}>
                Specification
              </Text>
              <Text
                style={[
                  Styles.fontSize14,
                  {
                    color: theme.colors.primaryLight,
                    width: '100%',
                    textAlign: 'justify',
                    marginTop:5
                  },
                ]}
                selectable={true}>
                {spec === '' ? 'NA' : spec}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
    </SafeAreaView>
  );
};

export default ServiceProductScreen;

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
