import { Dimensions, ScrollView, Text, View, StyleSheet, SafeAreaView } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  Snackbar,
  TextInput,
} from "react-native-paper";
import { Styles } from "../../../styles/styles";
import Header from "../../../components/Header";
import { useEffect, useState } from "react";
import { TabBar, TabView } from "react-native-tab-view";
import { theme } from "../../../theme/apptheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Provider from "../../../api/Provider";
import { Col, Row, TableWrapper, Table } from "react-native-table-component";

let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;

const windowWidth = Dimensions.get("window").width;

const ContractorBoqEdit = ({ navigation, route }) => {
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [rates, setRates] = useState([]);
  const [boqData, setBoqData] = useState(null);

  const [text, setText] = useState("");
  const [visible, setVisible] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const unload = (msg) => {
    setIsLoading(false);
    setSnackbarText(msg);
    setSnackbarColor(theme.colors.error);
    setSnackbarVisible(true);
  };

  const submit = async () => {
    try {
      if (text === "Accept") {
        const params = {
          data: {
            Sess_UserRefno,
            boqsend_refno: route?.params?.params?.boqsend_refno,
            budget_detail_refno: boqData?.data[0]?.product_data?.map(
              (i) => i?.budget_detail_refno
            ),
            product_refno: boqData?.data[0]?.product_data?.map(
              (i) => i?.product_refno
            ),
            rate: rates,
          },
        };

        setIsLoading(true);

        setVisible(false);
        const data = await Provider.approveContractorBoq(params, () =>
          setIsLoading(false)
        );
        setVisible(false);
        setSnackbarColor(theme.colors.success);
        setSnackbarText(data?.message);
        console.log(navigation);
        navigation?.navigate("ConsultantBoq", { index: 1 });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      Sess_UserRefno = JSON.parse(userData).UserID;
      Sess_company_refno = JSON.parse(userData).Sess_company_refno;

      Sess_branch_refno = JSON.parse(userData).Sess_branch_refno;
      FetchData();
    }
  };

  const FetchData = async (toPending, text) => {
    let params = {
      data: route?.params?.params,
    };
    console.log(params);
    try {
      const data = await Provider.contractorBoqEdit(
        route.params.type === "View" ? { ...route?.params?.params } : params,
        () => setIsLoading(false)
      );

      setBoqData(data);
      setRates(data?.data[0]?.product_data?.map((i) => i?.rate));
    } catch (e) {
      console.log(e, "error");
      setIsLoading(false);
      setSnackbarText(e.message);
      setSnackbarColor(theme.colors.error);
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
      if (toPending !== undefined) {
        setIndex(toPending);
        setSnackbarText(text);
        setSnackbarColor(theme.colors.success);
        setSnackbarVisible(true);
      }
    }
  };

  useEffect(() => {
    GetUserID();
  }, []);

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1, Styles.backgroundColor]}>
      <Header navigation={navigation} title=" BOQ VIEW & ACCEPT" />
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
      ) : (
        <View style={[Styles.flex1, { padding: 10 }]}>
          <Text
            style={[
              Styles.fontSize20,
              Styles.fontBold,
              Styles.marginBottom4,
              Styles.primaryColor,
              { marginBottom: "3%" },
            ]}
          >
            BOQ Detail
          </Text>
          <Table
            borderStyle={{
              borderWidth: 1,
              borderColor: "#C1C0B9",
            }}
          >
            <Row
              data={["BOQ No.", "Architect & Consultant Details"]}
              widthArr={[100, 300]}
              style={styles.header}
              textStyle={styles.headertext}
            />

            <ScrollView style={styles.dataWrapper}>
              <Table
                borderStyle={{
                  borderWidth: 1,
                  borderColor: "#C1C0B9",
                }}
              >
                <TableWrapper style={{ flexDirection: "row" }}>
                  <Col
                    height={40}
                    textStyle={styles.text}
                    width={100}
                    data={[boqData?.data[0]?.boq_details?.boq_no]}
                  />
                  <Col
                    height={40}
                    textStyle={styles.text}
                    width={300}
                    data={[
                      boqData?.data[0]?.boq_details?.architect_company_name,
                    ]}
                  />
                </TableWrapper>
              </Table>
            </ScrollView>
          </Table>
          <Text
            style={[
              Styles.fontSize20,
              Styles.fontBold,
              Styles.marginBottom4,
              Styles.primaryColor,
              { marginVertical: "3%" },
            ]}
          >
            Product Data
          </Text>
          <ScrollView horizontal={true}>
            <Table
              borderStyle={{
                borderWidth: 1,
                borderColor: "#C1C0B9",
              }}
            >
              <Row
                data={[
                  "Sr No.",
                  "Product Name",
                  "Unit",
                  "Quantity",
                  "Rate",
                  "Amount",
                ]}
                widthArr={[50, 200, 70, 100, 100, 100]}
                style={styles.header}
                textStyle={styles.headertext}
              />

              <ScrollView style={styles.dataWrapper}>
                <Table
                  borderStyle={{
                    borderWidth: 1,
                    borderColor: "#C1C0B9",
                  }}
                >
                  <TableWrapper style={{ flexDirection: "row" }}>
                    <Col
                      height={40}
                      textStyle={styles.text}
                      width={50}
                      data={boqData?.data[0]?.product_data?.map(
                        (i, index) => index + 1
                      )}
                    />
                    <Col
                      height={40}
                      textStyle={styles.text}
                      width={200}
                      data={boqData?.data[0]?.product_data?.map(
                        (i) => i?.product_name
                      )}
                    />
                    <Col
                      height={40}
                      textStyle={styles.text}
                      width={70}
                      data={boqData?.data[0]?.product_data?.map(
                        (i) => i?.unit_name
                      )}
                    />
                    <Col
                      height={40}
                      textStyle={styles.text}
                      width={100}
                      data={boqData?.data[0]?.product_data?.map((i) => i?.qty)}
                    />
                    <Col
                      height={40}
                      textStyle={styles.text}
                      width={100}
                      data={rates?.map((i, index) => (
                        <TextInput
                          value={i}
                          disabled={route.params.type === "View"}
                          returnKeyType="next"
                          onChangeText={(text) => {
                            let test = rates;
                            test[index] = text;
                            setRates([...test]);
                          }}
                          style={{
                            backgroundColor: "white",
                            height: 40,
                          }}
                        />
                      ))}
                    />
                    <Col
                      height={40}
                      textStyle={styles.text}
                      width={100}
                      data={boqData?.data[0]?.product_data?.map(
                        (i, index) => rates[index] * i.qty
                      )}
                    />
                  </TableWrapper>
                </Table>
              </ScrollView>
            </Table>
          </ScrollView>
          {rates?.every((rate) => Number(rate) > 0) &&
            route.params.type !== "View" && (
              <Button
                mode="contained"
                style={[Styles.marginTop16]}
                onPress={() => {
                  console.log(boqData);
                  setVisible(true);
                  setText("Accept");
                }}
              >
                Save & Accept
              </Button>
            )}
        </View>
      )}
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
            <Button mode="contained" onPress={() => setVisible(false)}>
              Cancel
            </Button>
          </Card.Content>
        </Dialog.Content>
      </Dialog>
    </View>
    </SafeAreaView>
  );
};

export default ContractorBoqEdit;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: { height: 40, backgroundColor: theme.colors.primary },
  subheader: { height: 30, backgroundColor: "white" },
  text: { textAlign: "center", fontWeight: "400" },
  headertext: { textAlign: "center", fontWeight: "800", color: "white" },
  dataWrapper: { marginTop: -1 },
  row: { height: 50, backgroundColor: "white" },
});
