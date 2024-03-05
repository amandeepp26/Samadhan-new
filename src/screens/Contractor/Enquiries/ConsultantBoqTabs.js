import { useEffect, useRef, useState } from "react";
import {
  Image,
  ActivityIndicator,
  View,
  RefreshControl,
  LogBox,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import {
  List,
  Title,
  Dialog,
  Portal,
  Button,
  Text,
  Card,
} from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import RBSheet from "react-native-raw-bottom-sheet";
import Provider from "../../../api/Provider";

import NoItems from "../../../components/NoItems";
import { theme } from "../../../theme/apptheme";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Styles } from "../../../styles/styles";
import Search from "../../../components/Search";
import { useNavigation } from "@react-navigation/native";

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

let userID = 0;
let Sess_CompanyAdmin_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;

const ConsultantBoqTabs = ({
  set,
  listData2,
  listSearchData2,
  type,
  fetch,
  unload,
}) => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [current, setCurrent] = useState({});
  const refRBSheet = useRef();
  //#endregion
  const { navigate } = useNavigation();
  //#region Functions

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      Sess_CompanyAdmin_UserRefno =
        JSON.parse(userData).Sess_CompanyAdmin_UserRefno;
      Sess_branch_refno = JSON.parse(userData).Sess_branch_refno;
      Sess_company_refno = JSON.parse(userData).Sess_company_refno;
      FetchData();
    }
  };

  const showDialog = () => {
    refRBSheet.current.close();
    setVisible(true);
  };

  const hideDialog = () => setVisible(false);

  const FetchData = () => {
    setListData(listData2);
    setListSearchData(listSearchData2);
    setIsLoading(false);
  };

  useEffect(() => {
    GetUserID();
  }, []);

  const RenderItems = (data) => {
    return (
      <View
        style={[
          Styles.backgroundColor,
          Styles.paddingStart16,
          Styles.flexJustifyCenter,
          {
            height: 150,
            borderWidth: 1.3,
            marginBottom: 10,
            borderRadius: 8,
            borderColor: theme.colors.primary,
          },
        ]}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "grey" }}>
              BOQ No. :
            </Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "grey" }}>
              Architect & Consultant :
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "grey" }}>
              {data.item?.boq_no}
            </Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "grey" }}>
              {data.item?.architect_company_name}
            </Text>
          </View>
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Button
            mode="outlined"
            onPress={() => {
              refRBSheet.current.open();
              setCurrent(data.item);
              console.log(data.item);
            }}
            style={{
              width: "80%",
              borderColor: theme.colors.primary,
              borderWidth: 1.2,
            }}
          >
            View Actions
          </Button>
        </View>
      </View>
    );
  };

  const submit = () => {
    hideDialog();
    set(true);
    console.log(text);

    const params = {
      data: {
        Sess_UserRefno: userID,
        Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
        estimation_enquiry_refno: current.estimation_enquiry_refno,
        accept_status: text == "Accept" ? "1" : "2",
        alter_labours_cost: current.alter_labours_cost,
      },
    };

    if (text === "Reject") {
      const params = {
        data: {
          Sess_UserRefno: userID,
          boqsend_refno: current?.boqsend_refno,
        },
      };
      Provider.rejectContractorBoq(params, null)
        .then((response) => {
          console.log(response);
          if (response.message) {
            unload(response.message);
            fetch();
          }
        })
        .catch((e) => {
          set(false);
          unload("Failed");
        });
      set(false);
    }
    if (text === "Accept") navigate("ContractorBoqEdit", { params });
    set(false);
  };
  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      {/* <Header navigation={navigation} title="My Employee List" /> */}
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
            filterFunction={["boq_no", "architect_company_name"]}
          />
          {listSearchData?.length > 0 ? (
            <View style={{ padding: 10 }}>
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
              />
            </View>
          ) : (
            <NoItems
              icon="format-list-bulleted"
              text="No records found for your query"
            />
          )}
        </View>
      ) : (
        <NoItems icon="format-list-bulleted" text="No records found." />
      )}
      <View style={{ height: 80 }}></View>

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
          <Title style={[Styles.paddingHorizontal16]}>Boq Detail</Title>
          <ScrollView style={{ marginBottom: 64 }}>
            <List.Item
              title="Architect & Consultant Detail"
              description={current.architect_company_name}
            />
            <List.Item title="BOQ No." description={current.boq_no} />
            <List.Item
              title="Budget Ref No."
              description={current.budget_refno}
            />
            <Card.Content style={[Styles.marginTop16]}>
              <Text
                style={[
                  type === "rejected" ? stylesm.button1 : stylesm.button,
                  {
                    color: "white",
                    textAlign: "center",
                    fontWeight: "bold",
                  },
                ]}
              >
                {current?.message_button}
              </Text>
            </Card.Content>
            {/* {current?.message_button[0] && (
            )} */}
            {type == "new" ? (
              <>
                <Card.Content style={[Styles.marginTop16]}>
                  <Button
                    mode="contained"
                    onPress={() => {
                      // showDialog();
                      // setText("Accept");
                      const params = {
                        Sess_UserRefno: Sess_UserRefno,
                        boqsend_refno: current?.boqsend_refno,
                      };
                      navigate("ContractorBoqEdit", { params });
                    }}
                    style={[stylesm.button]}
                  >
                    View & Accept
                  </Button>
                </Card.Content>
                <Card.Content style={[Styles.marginTop16]}>
                  <Button
                    mode="contained"
                    onPress={() => {
                      showDialog();
                      setText("Reject");
                    }}
                    style={stylesm.button1}
                  >
                    Reject
                  </Button>
                </Card.Content>
              </>
            ) : (
              current?.action_button?.map((item, idx) => (
                <Card.Content style={[Styles.marginTop16]} key={idx}>
                  <Button
                    mode="contained"
                    onPress={() => {
                      if (item === "Finally Take Project") {
                        const params = {
                          data: {
                            Sess_UserRefno: userID,
                            boqsend_refno: current?.boqsend_refno,
                            Sess_company_refno: Sess_company_refno,
                            Sess_branch_refno: Sess_branch_refno,
                            Sess_CompanyAdmin_UserRefno:
                              Sess_CompanyAdmin_UserRefno,
                          },
                        };

                        return Provider.createDFContractor(
                          Provider.API_URLS
                            .contractor_boq_finallytakeproject_update,
                          params
                        )
                          .then((res) => {
                            if (res.data.data) {
                              fetch();
                              unload("Project Taken");
                            }
                          })
                          .catch((error) => {
                            unload("Something Went Wrong");
                          });
                      }

                      if (item === "View") {
                        const params = {
                          data: {
                            Sess_UserRefno: userID,
                            boqsend_refno: current?.boqsend_refno,
                          },
                        };
                        console.log(params, "View");
                        navigate("ContractorBoqEdit", { params, type: "View" });
                        return;
                      }
                      showDialog();

                      setText(item);
                    }}
                    style={
                      item == "Finally Take Project"
                        ? stylesm.button
                        : stylesm.button1
                    }
                  >
                    {item}
                  </Button>
                </Card.Content>
              ))
            )}
            <View style={{ height: 20 }}></View>
          </ScrollView>
        </View>
      </RBSheet>

      <Portal>
        <Dialog
          visible={visible}
          onDismiss={hideDialog}
          style={[Styles.borderRadius8]}
        >
          <Dialog.Title style={[Styles.fontSize16, Styles.textCenter]}>
            Confirm to {text}?
          </Dialog.Title>
          <Dialog.Content>
            <View
              style={[
                Styles.flexRow,
                Styles.flexJustifyCenter,
                Styles.flexAlignCenter,
                Styles.marginTop16,
              ]}
            ></View>
            <View></View>
            <Card.Content style={[Styles.marginTop16]}>
              <Button mode="contained" onPress={submit}>
                Ok
              </Button>
            </Card.Content>
            <Card.Content style={[Styles.marginTop16]}>
              <Button mode="contained" onPress={hideDialog}>
                Cancel
              </Button>
            </Card.Content>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
    </SafeAreaView>
  );
};
const stylesm = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "green",
  },
  button1: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "red",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
  modalIndex: {
    zIndex: 999999999999999999,
  },
  input: {
    margin: 15,
    height: 40,

    borderColor: "grey",
    borderWidth: 1,
  },
});
export default ConsultantBoqTabs;
