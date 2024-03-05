import { View, Text, StyleSheet, Alert, BackHandler,ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { Styles } from "../../../styles/styles";
import { useIsFocused } from "@react-navigation/native";
import Provider from "../../../api/Provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LabelInput from "../../Marketing/EmployeeActivity/common/LabelInput";
import { Checkbox, TextInput, Button, Snackbar } from "react-native-paper";
import { theme } from "../../../theme/apptheme";
import { Table, TableWrapper, Row, Col } from "react-native-table-component";
import ApproveModal from "./components/ApproveModal";
import GenerateBOQ from "./components/GenerateBOQ";

let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_group_refno = 0;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: { height: 80, backgroundColor: theme.colors.primary },
  subheader: { height: 30, backgroundColor: "white" },
  text: { textAlign: "center", fontWeight: "400" },
  headertext: { textAlign: "center", fontWeight: "800", color: "white" },
  dataWrapper: { marginTop: -1 },
  row: { height: 50, backgroundColor: "white" },
});

const Preview = ({ navigation, route }) => {
  const [boq, setBoq] = useState(false);
  const [modal, setModal] = useState(false);
  const [state, setState] = useState({ ProductDetails: [] });
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [units, setUnits] = useState([]);
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState("");
  const [text, setText] = useState("");
  const getUserData = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      Sess_UserRefno = JSON.parse(userData).UserID;
      Sess_branch_refno = JSON.parse(userData).Sess_branch_refno;
      Sess_company_refno = JSON.parse(userData).Sess_company_refno;
      Sess_group_refno = JSON.parse(userData).Sess_group_refno;
      await fetchBudget();
      await fetchState();
      await fetchUnits();
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      async () => {
        if (isFocused) {
          await AsyncStorage.setItem(
            "budget-index",
            String(route.params.index)
          );
        } else {
          await AsyncStorage.removeItem("budget-index");
        }
        navigation.goBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  const cancelBudget = () => {
    Alert.alert("Are you sure?", "Do you want to cancel this budget", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => {
          Provider.createDFArchitect(
            Provider.API_URLS.architect_budget_cancel,
            {
              data: {
                Sess_UserRefno,
                Sess_company_refno,
                Sess_branch_refno,
                budget_refno: route.params.data.budget_refno,
              },
            }
          ).then(async (res) => {
            await AsyncStorage.setItem("budget-index", "1");
            navigation.navigate("Budget&BOQ's", { index: 1 });
          });
        },
      },
    ]);
  };

  const cancelBoq = () => {
    Alert.alert("Are you sure?", "Do you want to cancel the generated BOQ", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => {
          Provider.createDFArchitect(Provider.API_URLS.architect_boq_cancel, {
            data: {
              Sess_UserRefno,
              budget_refno: route.params.data.budget_refno,
            },
          }).then(async (res) => {
            await AsyncStorage.setItem("budget-index", "3");
            navigation.navigate("Budget&BOQ's", { index: 3 });
          });
        },
      },
    ]);
  };

  const fetchUnits = () => {
    Provider.createDFArchitect(
      Provider.API_URLS.architect_get_unitofsales_budgetform,
      { data: { Sess_UserRefno } }
    ).then((res) => {
      setUnits(res.data.data);
    });
  };
  const fetchState = () => {
    Provider.createDFCommon(Provider.API_URLS.GetStateDetails)
      .then((res) => {
        if (res.data.data) setStates(res.data.data);
      })
      .catch((error) => console.log(error));
  };
  const fetchDistricts = (state_refno) => {
    Provider.createDFCommon(Provider.API_URLS.GetDistrictDetailsByStateRefno, {
      data: {
        Sess_UserRefno,
        state_refno,
      },
    })
      .then((res) => {
        if (res.data.data) setDistricts(res.data.data);
      })
      .catch((error) => console.log(error));
  };

  const fetchBudget = () => {
    console.log('fetchBudget');
    let params = {
      data: {
        Sess_UserRefno,
        Sess_company_refno,
        Sess_branch_refno,
        Sess_group_refno,
        budget_refno: route.params.data.budget_refno,
      }
    }
    console.log('params:**********', params, "*======================*");

    Provider.createDFArchitect(
      Provider.API_URLS.architect_budget_budgetrefnocheck,
      params
    ).then((res) => {
      console.log('resp===========:', res.data, "=======================");
      setState(res.data.data[0]);
      fetchDistricts(res.data.data[0].state_refno);
    });
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) getUserData();
  }, [isFocused]);

  const sendBudgetToClient = () => {
    Alert.alert("Are you sure?", "Do you want to cancel the generated BOQ", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => {
          Provider.createDFArchitect(
            Provider.API_URLS.architect_budget_sendtoclient,
            {
              data: {
                Sess_UserRefno,
                Sess_company_refno,
                Sess_branch_refno,
                budget_refno: route.params.data.budget_refno,
              },
            }
          )
            .then(async (res) => {
              await AsyncStorage.setItem("budget-index", "2");
              setColor(theme.colors.success);
              setText("Budget Sent to Client");
              setOpen(true);
              navigation.navigate("Budget&BOQ's", { index: 2 });
            })
            .catch((error) => {
              console.log(error);
            });
        },
      },
    ]);
  };
  return (
    <ScrollView
      style={[Styles.padding16, Styles.flex1, { backgroundColor: "white" }]}
    >
      <ApproveModal
        open={modal}
        setOpen={setModal}
        callback={async () => {
          await AsyncStorage.setItem("budget-index", "3");
          navigation.navigate("Budget&BOQ's", { index: 3 });
        }}
        budget_refno={route.params.data.budget_refno}
      />
      <GenerateBOQ
        open={boq}
        setOpen={setBoq}
        callback={async () => {
          await AsyncStorage.setItem("budget-index", "3");
          navigation.navigate("Budget&BOQ's", { index: 3 });
        }}
        budget_refno={route.params.data.budget_refno}
      />
      <View style={[Styles.flex1, Styles.marginBottom12]}>
        <Text
          style={[
            Styles.fontSize20,
            Styles.fontBold,
            Styles.marginBottom4,
            Styles.primaryColor,
            { marginBottom: "3%" },
          ]}
        >
          Project Details
        </Text>
        <LabelInput label="Project Name" value={state.project_name} />

        <LabelInput label="Contact Person" value={state.contact_person} />
        <LabelInput
          label="Client Contact Number"
          value={state.contact_mobile_no}
        />
        <LabelInput label="Project Description" value={state.project_desc} />
        <LabelInput label="Project Address" value={state.project_address} />
        <LabelInput
          label="State"
          value={
            states?.find((item) => item.state_refno === state.state_refno)
              ?.state_name
          }
        />
        <LabelInput
          label="City"
          value={
            districts?.find(
              (item) => item.district_refno === state.district_refno
            )?.district_name
          }
        />
        <Text
          style={[
            Styles.fontSize20,
            Styles.fontBold,
            Styles.marginBottom4,
            Styles.primaryColor,
            { marginBottom: "3%" },
          ]}
        >
          Budget Preparation Type
        </Text>
        <LabelInput
          label="Unit of Sales"
          value={
            units?.find(
              (item) =>
                String(item.quot_unit_type_refno) ===
                String(state.quot_unit_type_refno)
            )?.quot_unit_type_name
          }
        />
        <Checkbox.Item
          label={"Material Inclusive"}
          color={theme.colors.primary}
          // position="leading"

          labelStyle={{ textAlign: "left" }}
          status={state.quot_type_refno === "1" ? "checked" : "unchecked"}
        />
        <Text
          style={[
            Styles.fontSize20,
            Styles.fontBold,
            Styles.marginBottom4,
            Styles.primaryColor,
            { marginBottom: "3%" },
          ]}
        >
          Product Details
        </Text>
        <View style={styles.container}>
          <ScrollView horizontal={true}>
            <View>
              <Table
                borderStyle={{
                  borderWidth: 1,
                  borderColor: "#C1C0B9",
                }}
              >
                <Row
                  data={[
                    "Product Name",
                    "Unit",
                    "Quantity",
                    "Rate",
                    "Amount",
                    "Remarks",
                    "Image Pattern Show",
                  ]}
                  widthArr={[150, 100, 100, 100, 100, 140, 120]}
                  style={styles.header}
                  textStyle={styles.headertext}
                />
              </Table>
              <ScrollView style={styles.dataWrapper}>
                <Table
                  borderStyle={{
                    borderWidth: 1,
                    borderColor: "#C1C0B9",
                  }}
                >
                  <TableWrapper style={{ flexDirection: "row" }}>
                    <Col
                      height={80}
                      textStyle={styles.text}
                      width={150}
                      data={[
                        ...state.ProductDetails?.map((obj) => obj.product_name),
                      ]}
                    />
                    <Col
                      height={80}
                      textStyle={styles.text}
                      width={100}
                      data={[
                        ...state.ProductDetails?.map((obj) => obj.unit_name),
                      ]}
                    />
                    <Col
                      height={80}
                      textStyle={styles.text}
                      width={100}
                      data={[
                        ...state.ProductDetails?.map((obj, index) => (
                          <View key={index} style={{ padding: 10 }}>
                            <TextInput
                              disabled={true}
                              mode="outlined"
                              value={obj.qty}
                              key={index}
                              keyboardType="numeric"
                            />
                          </View>
                        )),
                      ]}
                      mode="outlined"
                    />

                    <Col
                      height={80}
                      textStyle={styles.text}
                      width={100}
                      data={[
                        ...state.ProductDetails?.map((obj, index) => (
                          <View key={index} style={{ padding: 10 }}>
                            <TextInput
                              disabled={true}
                              mode="outlined"
                              value={obj.rate}
                              key={index}
                              keyboardType="numeric"
                            />
                          </View>
                        )),
                      ]}
                    />
                    <Col
                      height={80}
                      textStyle={styles.text}
                      width={100}
                      data={[
                        ...state.ProductDetails?.map((obj, index) => (
                          <View key={index} style={{ padding: 10 }}>
                            <TextInput
                              mode="outlined"
                              value={obj.amount}
                              disabled={true}
                              key={index}
                              keyboardType="numeric"
                            />
                          </View>
                        )),
                      ]}
                    />
                    <Col
                      height={80}
                      textStyle={styles.text}
                      width={140}
                      data={[
                        ...state.ProductDetails?.map((obj, index) => (
                          <View key={index} style={{ padding: 10 }}>
                            <TextInput
                              disabled={true}
                              value={obj.remarks}
                              key={index}
                            />
                          </View>
                        )),
                      ]}
                    />
                    <Col
                      height={80}
                      textStyle={styles.text}
                      width={120}
                      data={[
                        ...state.ProductDetails?.map((obj, index) => (
                          <View key={index} style={{ padding: 10 }}></View>
                        )),
                      ]}
                    />
                  </TableWrapper>
                </Table>
              </ScrollView>
              <Table
                borderStyle={{
                  borderWidth: 1,
                  borderColor: "#C1C0B9",
                }}
              >
                <Row
                  data={[
                    "Sub Total",
                    state.ProductDetails.reduce(
                      (a, obj) => a + Number(obj.amount),
                      0
                    ),
                  ]}
                  widthArr={[450, 360]}
                  style={styles.row}
                  textStyle={{ paddingHorizontal: 25 }}
                />
              </Table>
            </View>
          </ScrollView>
        </View>
        <Text
          style={[
            Styles.fontSize20,
            Styles.fontBold,
            Styles.marginBottom4,
            Styles.primaryColor,
            { marginBottom: "3%" },
          ]}
        >
          Terms & Conditions
        </Text>
        {/* <WebView
          originWhitelist={"*"}
          source={{ html: state.terms_condition }}
        /> */}
        <View style={{ marginVertical: 24 }}>
          {route.params?.data?.action_button?.includes(
            "Send Budget to Client"
          ) && (
              <Button onPress={sendBudgetToClient} mode="contained">
                Send Budget to Client
              </Button>
            )}

          {route.params.data.client_approve_status_name === "Pending" && (
            <Text
              style={{
                textAlign: "center",
                marginVertical: 9,
                color: "red",
                fontSize: 20,
              }}
            >
              Waiting for Client Approval
            </Text>
          )}
          {route.params.data?.action_button?.includes(
            "Finally Approve & Take Project"
          ) && route.params.data.client_approve_status_name === "Approved" ? (
            <Button onPress={() => setModal(true)} mode="contained">
              Finally Approve & Take Project
            </Button>
          ) : (
            <></>
          )}
          {route.params.data.client_approve_status_name === "Rejected" && (
            <Text
              style={{
                textAlign: "center",
                marginVertical: 9,
                color: "red",
                fontSize: 20,
              }}
            >
              Client Rejected Budget
            </Text>
          )}

          {route.params?.data.action_button?.includes("Cancel Budget") ||
            route.params?.data.budget_action_button?.includes("Cancel Budget") ? (
            <Button
              style={{ marginVertical: "5%" }}
              onPress={cancelBudget}
              mode="contained"
            >
              Cancel Budget
            </Button>
          ) : (
            <></>
          )}
          {route.params.data.boq_action_button?.includes("Generate BOQ") && (
            <Button
              style={{ marginTop: 15 }}
              onPress={() => setBoq(true)}
              mode="contained"
            >
              Generate BOQ
            </Button>
          )}
          {route.params.data.boq_action_button?.includes(
            "Cancel Generated BOQ's"
          ) && (
              <Button
                onPress={cancelBoq}
                style={{ marginTop: 15 }}
                mode="contained"
              >
                Cancel Generated BOQ's
              </Button>
            )}
        </View>
      </View>
      <Snackbar
        visible={open}
        onDismiss={() => setOpen(false)}
        duration={3000}
        style={{ backgroundColor: color }}
      >
        {text}
      </Snackbar>
    </ScrollView>
  );
};

export default Preview;
