import { View, Text, StyleSheet, ScrollView } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Provider from "../../../api/Provider";
import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useState } from "react";
import { theme } from "../../../theme/apptheme";
import { Table, TableWrapper, Row } from "react-native-table-component";
import { Styles } from "../../../styles/styles";
import { Button, Card, Dialog, Snackbar, Switch } from "react-native-paper";
import SendBOQ from "./components/SendBOQ";

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
let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_CompanyAdmin_UserRefno = 0;
let Sess_group_refno = 0;
const BOQ = ({ route, navigation }) => {
  const [data, setData] = useState({});
  const [openSwitch, setOpenSwitch] = useState(false);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const unload = (msg, color = theme.colors.success) => {
    setSnackbarText(msg);
    setSnackbarColor(color);
    setSnackbarVisible(true);
    fetchBOQ();
  };
  const [boqsend_refno, setBoqsend_refno] = useState("");
  const [boqIndex, setBoqIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");
  const [snackbarColor, setSnackbarColor] = React.useState(
    theme.colors.success
  );
  const isFocused = useIsFocused();
  const fetchUser = async () => {
    const data = JSON.parse(await AsyncStorage.getItem("user"));
    Sess_UserRefno = data.UserID;
    Sess_CompanyAdmin_UserRefno = data.Sess_CompanyAdmin_UserRefno;
    Sess_company_refno = data.Sess_company_refno;
    Sess_group_refno = data.Sess_group_refno;
    Sess_branch_refno = data.Sess_branch_refno;
    fetchBOQ();
  };
  const fetchBOQ = () => {
    Provider.createDFArchitect(Provider.API_URLS.architect_boq_view, {
      data: {
        Sess_UserRefno,
        budget_refno: route.params.data.budget_refno,
      },
    }).then((res) => {
      setData(res.data.data);
    });
  };

  const accept_and_send = async () => {
    const params = {
      data: {
        Sess_UserRefno,
        budget_refno: route.params.data.budget_refno,
        boqsend_refno,
      },
    };

    const data = await Provider.acceptAndSendBoq(params, () => {});
    if (data?.data?.status === "Success") {
      setSnackbarText(data?.data?.message);
      setSnackbarVisible(true);
      setSnackbarColor(theme.colors.success);
      navigation.goBack();
    } else {
      setSnackbarVisible(true);
      setSnackbarText(data?.data?.message);
      setSnackbarColor(theme.colors.error);
    }
  };

  useEffect(() => {
    if (isFocused) fetchUser();
  }, [isFocused]);

  return (
    <>
      {data.boq_details && (
        <SendBOQ
          unload={unload}
          open={open}
          setOpen={setOpen}
          Sess_CompanyAdmin_UserRefno={Sess_CompanyAdmin_UserRefno}
          Sess_UserRefno={Sess_UserRefno}
          Sess_branch_refno={Sess_branch_refno}
          Sess_company_refno={Sess_company_refno}
          budget_refno={data?.budget_details?.budget_refno}
          boq_no={data?.boq_details[boqIndex]?.boq_no}
          service_refno={data?.boq_details?.[boqIndex].service_refno}
          Sess_group_refno={Sess_group_refno}
        />
      )}
      <ScrollView style={{ backgroundColor: "white" }}>
        <View style={{ flex: 1, padding: 16 }}>
          <Text
            style={[
              Styles.fontSize20,
              Styles.fontBold,
              Styles.marginBottom4,
              Styles.primaryColor,
              { marginBottom: "3%" },
            ]}
          >
            Budget Details
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
                      "Budget No",
                      "Project Name",
                      "Client Person & Contact",
                      "Budget Unit",
                      "BOQ Type",
                    ]}
                    widthArr={[60, 140, 200, 100, 100]}
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
                    <TableWrapper>
                      <Row
                        style={styles.row}
                        textStyle={styles.text}
                        data={[
                          data?.budget_details?.budget_refno,
                          data?.budget_details?.project_name,
                          `${data?.budget_details?.contact_person} & ${data?.budget_details?.contact_mobile_no}`,
                          data?.budget_details?.quot_unit_type_name,
                          data?.budget_details?.boqtype_name,
                        ]}
                        widthArr={[60, 140, 200, 100, 100]}
                      />
                    </TableWrapper>
                  </Table>
                </ScrollView>
              </View>
            </ScrollView>
          </View>
          <Text
            style={[
              Styles.fontSize20,
              Styles.fontBold,
              Styles.marginBottom4,
              Styles.primaryColor,
              { marginVertical: "5%" },
            ]}
          >
            BOQ Details
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
                      "",
                      "S.No",
                      "BOQ No",
                      "Service Name",
                      "Product Name",
                      "BOQ Sent Status",
                      "Action",
                    ]}
                    widthArr={[100, 60, 80, 200, 300, 150, 150]}
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
                    <TableWrapper>
                      {data?.boq_details?.map((obj, i) => {
                        return (
                          <Row
                            key={i}
                            style={styles.row}
                            textStyle={styles.text}
                            data={[
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    color:
                                      openSwitch && index === i
                                        ? "green"
                                        : "red",
                                  }}
                                >
                                  {openSwitch && index === i ? "OPEN" : "CLOSE"}
                                </Text>
                                <Switch
                                  value={openSwitch && index === i}
                                  onChange={(e) => {
                                    if (!openSwitch) {
                                      setOpenSwitch(true);
                                      setIndex(i);
                                    } else {
                                      if (index !== i) {
                                        setIndex(i);
                                      } else {
                                        setOpenSwitch(!openSwitch);
                                      }
                                    }
                                  }}
                                  color="green"
                                />
                              </View>,
                              i,
                              obj?.boq_no,
                              obj?.service_name,
                              obj?.product_name.join("\n"),
                              obj?.boq_status_name,
                              obj?.boq_action_button.includes("Edit BOQ") ? (
                                <Button
                                  style={{ width: "80%", alignSelf: "center" }}
                                  mode="contained"
                                  onPress={() => {
                                    setBoqIndex(i);
                                    setOpen(true);
                                  }}
                                >
                                  <Text style={{ fontSize: 15 }}>
                                    Edits BOQ
                                  </Text>
                                </Button>
                              ) : (
                                <Button
                                  style={{ width: "80%", alignSelf: "center" }}
                                  mode="contained"
                                  onPress={() => {
                                    setBoqIndex(i);
                                    setOpen(true);
                                  }}
                                >
                                  <Text style={{ fontSize: 15 }}>Send BOQ</Text>
                                </Button>
                              ),
                            ]}
                            widthArr={[100, 60, 80, 200, 300, 150, 150]}
                          />
                        );
                      })}
                    </TableWrapper>
                  </Table>
                </ScrollView>
              </View>
            </ScrollView>
          </View>
          {openSwitch && data?.boq_details[index] && (
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
                        "Contractor Name",
                        "My Budget Amount",
                        "Contractor Budget Amount",
                        "Contractor Accept Status",
                        "Client Accept Status",
                        "Action",
                      ]}
                      widthArr={[200, 200, 250, 250, 300, 250]}
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
                      <TableWrapper>
                        {data?.boq_details[index]?.contractor_data?.map(
                          (obj, index) => {
                            return (
                              <Row
                                key={index}
                                style={styles.row}
                                textStyle={styles.text}
                                data={[
                                  obj?.company_name,
                                  obj?.MyBudgeAmount,
                                  obj?.contractor_quoted_amount,
                                  obj?.cont_accept_status,
                                  obj?.client_approve_status,
                                  obj?.contractor_grid_action_button[0] ===
                                  "Accept & Send to Client Approval" ? (
                                    <Button
                                      style={{
                                        width: "80%",
                                        alignSelf: "center",
                                      }}
                                      mode="contained"
                                      onPress={() => {
                                        setBoqsend_refno(obj?.boqsend_refno);
                                        setVisible(true);
                                      }}
                                    >
                                      <Text style={{ fontSize: 15 }}>
                                        Accept & Send to Client Approval
                                      </Text>
                                    </Button>
                                  ) : (
                                    obj?.contractor_grid_action_button[0]
                                  ),
                                ]}
                                widthArr={[200, 200, 250, 250, 300, 250]}
                              />
                            );
                          }
                        )}
                      </TableWrapper>
                    </Table>
                  </ScrollView>
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: snackbarColor }}
      >
        {snackbarText}
      </Snackbar>
      <Dialog
        visible={visible}
        onDismiss={() => setVisible(false)}
        style={[Styles.borderRadius8]}
      >
        <Dialog.Title style={[Styles.fontSize16, Styles.textCenter]}>
          Confirm to Accept?
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
          <Card.Content style={[Styles.marginTop16]}>
            <Button mode="contained" onPress={accept_and_send}>
              Ok
            </Button>
          </Card.Content>
          <Card.Content style={[Styles.marginTop16]}>
            <Button mode="contained" onPress={() => setVisible(false)}>
              Cancel
            </Button>
          </Card.Content>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default BOQ;
