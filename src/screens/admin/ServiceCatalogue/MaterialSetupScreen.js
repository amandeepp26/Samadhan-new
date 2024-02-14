import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  LogBox,
  RefreshControl,
  ScrollView,
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

const MaterialSetupScreen = ({ navigation }) => {
  //#region Variables
  const [isLoading, setIsLoading] = useState(true);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const [selectedDesignTypeName, setSelectedDesignTypeName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [productName, setProductName] = useState("");
  const [subtotal, setSubtotal] = useState("");

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
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.MaterialsSetupList, params)
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
          title={data.item.designTypeName}
          titleStyle={{ fontSize: 18 }}
          description={"Display: " + (data.item.display ? "Yes" : "No")}
          left={() => (
            <Icon
              style={{ marginVertical: 12, marginRight: 12 }}
              size={25}
              color={theme.colors.textSecondary}
              name="brush"
            />
          )}
          onPress={() => {
            refRBSheet.current.open();
            setSelectedDesignTypeName(data.item.designTypeName);
            setServiceName(data.item.serviceName);
            setCategoryName(data.item.categoryName);
            setProductName(data.item.productName);
            setSubtotal(data.item.materialCost);
          }}
          right={() => (
            <Icon
              style={{ marginVertical: 5, marginRight: 12 }}
              size={25}
              color={theme.colors.textSecondary}
              name="eye"
            />
          )}
        />
      </View>
    );
  };

  const AddCallback = () => {
    navigation.navigate("AddMaterialSetupScreen", {
      type: "add",
      fetchData: FetchData,
    });
  };

  const EditCallback = (data, rowMap) => {
    console.log('edit data:', data);
    rowMap[data.item.key].closeRow();
    let params = {
      data: {
        Sess_UserRefno: "2",
        materials_setup_refno: data.item.id,
      },
    };
    console.log('Params::', params);
    Provider.createDFAdmin(Provider.API_URLS.MaterialsSetupRefNoCheck, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          console.log('edit response data::', response.data.data);
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            if (response.data.data[0].productlist_data !== null) {
              response.data.data[0].productlist_data = APIConverter(
                response.data.data[0].productlist_data
              );
            }
            navigation.navigate("AddMaterialSetupScreen", {
              type: "edit",
              fetchData: FetchData,
              data: {
                id: data.item.id,
                serviceName: data.item.serviceName,
                categoryName: data.item.categoryName,
                productName: data.item.productName,
                designTypeName: data.item.designTypeName,
                materialCost: data.item.materialCost,
                lengthfoot: response.data.data[0].lengthfoot,
                lengthinches: response.data.data[0].lengthinches,
                widthheightfoot: response.data.data[0].widthheightfoot,
                widthheightinches: response.data.data[0].widthheightinches,
                totalfoot: response.data.data[0].totalfoot,
                productList: response.data.data[0].productlist_data,
                display: data.item.display,
              },
            });
          }
        }
      })
      .catch((e) => { });
  };
  //#endregion

  return (
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Material Setup" />
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
              "serviceName",
              "categoryName",
              "productName",
              "designTypeName",
              "materialCost",
              "lengthfoot",
              "lengthinches",
              "widthheightfoot",
              "widthheightinches",
              "totalfoot",
              "productList",
              "display",
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
        height={380}
        animationType="fade"
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
          draggableIcon: { backgroundColor: "#000" },
        }}
      >
        <View style={{ paddingBottom: 64 }}>
          <Title style={[Styles.paddingHorizontal16]}>
            {selectedDesignTypeName}
          </Title>
          <ScrollView>
            <List.Item title="Service Name" description={serviceName} />
            <List.Item title="Category Name" description={categoryName} />
            <List.Item title="Product Name" description={productName} />
            <List.Item
              title="Material Cost (per Sq.Ft)"
              description={subtotal}
            />
          </ScrollView>
        </View>
      </RBSheet>
    </View>
  );
};

export default MaterialSetupScreen;
