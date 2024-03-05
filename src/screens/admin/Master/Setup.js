import React, { useEffect, useRef } from "react";
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
} from 'react-native';
import { FAB, List, Searchbar, Snackbar, Title } from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import RBSheet from "react-native-raw-bottom-sheet";
import Provider from "../../../api/Provider";
import Header from "../../../components/Header";
import { RenderHiddenItems } from "../../../components/ListActions";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import NoItems from "../../../components/NoItems";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";

LogBox.ignoreLogs(["Non-serializable values were found in the navigation state"]);

const SetupScreen = ({ navigation }) => {
    //#region Variables
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);
    const listData = React.useState([]);
    const listSearchData = React.useState([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const [snackbarVisible, setSnackbarVisible] = React.useState(false);
    const [snackbarText, setSnackbarText] = React.useState("");
    const [snackbarColor, setSnackbarColor] = React.useState(theme.colors.success);

    const [variableName, setVariableName] = React.useState("");
    const [variableValue, setVariableValue] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [isPopupVisible, setIsPopupVisible] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const refRBSheet = useRef();

    //#endregion

    //#region Functions

    const FetchData = (from) => {
        if (from === "add" || from === "update") {
            setSnackbarText("Item " + (from === "add" ? "added" : "updated") + " successfully");
            setSnackbarColor(theme.colors.success);
            setSnackbarVisible(true);
        }
        let params = {
            data: {
                Sess_UserRefno: "2",
                option_id: "all",
            },
        };
        Provider.createDFAdmin(Provider.API_URLS.setupoptionidcheck, params)
            .then((response) => {
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        const lisData = [...response.data.data];
                        lisData.map((k, i) => {
                            k.key = (parseInt(i) + 1).toString();
                        });
                        listData[1](response.data.data);
                        listSearchData[1](response.data.data);
                    }
                } else {
                    listData[1]([]);

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

    const onChangeSearch = (query) => {
        setSearchQuery(query);
        if (query === "") {
            listSearchData[1](listData[0]);
        } else {
            listSearchData[1](
                listData[0].filter((el) => {
                    return el.state_name.toString().toLowerCase().includes(query.toLowerCase());
                })
            );
        }
    };

      const showPopup = user => {
        setSelectedUser(user);
        setIsPopupVisible(true);
      };

      const hidePopup = () => {
        setIsPopupVisible(false);
        setSelectedUser(null);
      };
    const RenderItems = (data) => {
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
              title={data.item.option_name}
              titleStyle={{fontSize: 17}}
              description={'Value: ' + data.item.option_value}
              left={() => (
                <Icon
                  style={{marginVertical: 5, marginRight: 10}}
                  size={30}
                  color={theme.colors.primary}
                  name="newspaper-variant"
                />
              )}
              onPress={() => {
                showPopup(data);
                setVariableName(data.item.option_name);
                setVariableValue(data.item.option_value);
                setDescription(data.item.option_desc);
              }}
              right={() => (
                <View>
                  <Pressable
                    style={{
                      marginLeft: 10,
                      marginTop: 10,
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

    const EditCallback = (data, rowMap) => {
        // rowMap[data.item.key].closeRow();
        navigation.navigate("AddSetupScreen", {
            type: "edit",
            fetchData: FetchData,
            data: {
                id: data.item.option_id,
                option_name: data.item.option_name,
                option_value: data.item.option_value,
                option_desc: data.item.option_desc,
            },
        });
    };
    //#endregion

    return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
      <View style={[Styles.flex1]}>
        <Header navigation={navigation} title="Setup" />
        {isLoading ? (
          <View
            style={[
              Styles.flex1,
              Styles.flexJustifyCenter,
              Styles.flexAlignCenter,
            ]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : listData[0].length > 0 ? (
          <View
            style={[Styles.flex1, Styles.flexColumn, Styles.backgroundColor]}>
            <Searchbar
              style={[Styles.margin16]}
              placeholder="Search"
              onChangeText={onChangeSearch}
              value={searchQuery}
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
                    FetchData();
                  }}
                />
              }
              data={listSearchData[0]}
              useFlatList={true}
              disableRightSwipe={true}
              rightOpenValue={-72}
              renderItem={data => RenderItems(data)}
              // renderHiddenItem={(data, rowMap) => RenderHiddenItems(data, rowMap, [EditCallback])}
            />
          </View>
        ) : (
          <NoItems
            icon="format-list-bulleted"
            text="No records found. Add records by clicking on plus icon."
          />
        )}

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
                {variableName}
              </Title>

              <View style={styles.row}>
                <Text
                  style={[
                    Styles.textDark,
                    {fontWeight: '500'},
                    Styles.fontSize14,
                  ]}
                  selectable={true}>
                  Value
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
                  {variableValue}
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
                  Description
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
                  {description}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
      </SafeAreaView>
    );
};

export default SetupScreen;

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