import { useEffect, useState } from "react";
import { ActivityIndicator,Pressable,Text, View, LogBox, RefreshControl, SafeAreaView } from "react-native";
import { FAB, List, Snackbar } from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import Provider from "../../../api/Provider";
import Header from "../../../components/Header";
import { RenderHiddenItems } from "../../../components/ListActions";
import NoItems from "../../../components/NoItems";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import { APIConverter } from "../../../utils/apiconverter";
import Search from "../../../components/Search";
import { Icon } from "react-native-elements";

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);



const ActivityRolesScreen = ({ navigation }) => {
  //#region Variables
  const [isLoading, setIsLoading] = useState(true);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);
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
        group_refno: "all",
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.GroupFromRefNo, params)
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
    navigation.navigate("AddActivityRolesScreen", {
      type: "add",
      fetchData: FetchData,
    });
  };

  const EditCallback = (data, rowMap) => {
    // rowMap[data.item.key].closeRow();
    navigation.navigate("AddActivityRolesScreen", {
      type: "edit",
      fetchData: FetchData,
      data: {
        id: data.item.id,
        activityRoleName: data.item.activityRoleName,
        display: data.item.display,
      },
    });
  };
  //#endregion

  const RenderItems = (data, rowMap) => {
    console.warn('userdata00000----->', data);
    return (
      <Pressable
        style={[
          Styles.backgroundColor,
          Styles.paddingHorizontal16,
          Styles.bordergray,
          {
            borderRadius: 10,
            paddingVertical: 7,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#d3d3d3',
            elevation: 2,
            marginHorizontal: 15,
            marginTop: 10,
            shadowColor: theme.colors.textDark,
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.03,
            shadowRadius: 1,
          },
        ]}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 50,
            height: 50,
            backgroundColor: '#f5f5f5',
            borderRadius: 50,
          }}>
          <Icon
            name="person"
            size={22}
            type="ionicon"
            color={theme.colors.primary}
          />
        </View>
        <View
          style={{
            width: '80%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderColor: '#d5d5d5',
            marginHorizontal: 15,
          }}>
          <View>
            <Text
              style={[
                Styles.fontSize16,
                {
                  fontWeight: '500',
                  color: '#000',
                },
              ]}>
              {data.item.activityRoleName}
            </Text>
            <Text
              style={[
                Styles.textSecondaryColor,
                Styles.fontSize12,
                Styles.marginTop2,
              ]}
              selectable={true}>
              Display: {data.item.display ? 'Yes' : 'No'}
            </Text>
          </View>
          <Pressable
            onPress={() => EditCallback(data, rowMap)}
            style={{borderBottomWidth: 1}}>
            <Icon
              name="pencil-outline"
              type="ionicon"
              size={18}
              color={theme.colors.primary}
            />
          </Pressable>
        </View>
      </Pressable>
    );
  };
  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Activity Roles" />
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
            filterFunction={['activityRoleName', 'display']}
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
              renderItem={(data,rowMap) => RenderItems(data,rowMap)}
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
    </View>
    </SafeAreaView>
  );
};

export default ActivityRolesScreen;
