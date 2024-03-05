import { View, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import React from "react";
import { Styles } from "../../../styles/styles";
import { TextInput, Button } from "react-native-paper";
import { Table, TableWrapper, Row, Col } from "react-native-table-component";
import { theme } from "../../../theme/apptheme";

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

const PriceTable = ({ data, setData, validateData, loading }) => {
  const updateProduct = (i, name, value) => {
    if (value === ".") return;
    setData((prev) => {
      let temp = JSON.parse(JSON.stringify(prev.table));
      temp[i][name] = value;
      return { ...prev, table: temp };
    });
  };
  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1, Styles.backgroundColor]}>
      <View style={[Styles.flex1, Styles.padding16]}>
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
                  data={["Sr. No", "Product Name", "Rate"]}
                  widthArr={[50, 300, 100]}
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
                      width={50}
                      data={[...data?.map((_, index) => index + 1)]}
                    />
                    <Col
                      height={80}
                      textStyle={styles.text}
                      width={300}
                      data={[
                        ...data?.map((obj) =>
                          obj?.product_name.replace("&nbsp;", " ")
                        ),
                      ]}
                    />
                    <Col
                      height={80}
                      textStyle={styles.text}
                      width={100}
                      data={[
                        ...data.map((obj, index) => (
                          <View key={index} style={{ padding: 10 }}>
                            <TextInput
                              disabled={loading}
                              mode="outlined"
                              onChangeText={(e) =>
                                updateProduct(
                                  index,
                                  "rate",
                                  (e.match(/\./g) || []).length > 1
                                    ? e.replace(/\./g, (match, offset) =>
                                        offset === e.indexOf(".") ? match : ""
                                      )
                                    : e.replace(/[^0-9.]+/g, "")
                                )
                              }
                              value={obj.rate}
                              key={index}
                              keyboardType="numeric"
                            />
                          </View>
                        )),
                      ]}
                    />
                  </TableWrapper>
                </Table>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
        {data.length > 0 && (
          <Button
            mode="contained"
            style={{ marginTop: 15 }}
            onPress={validateData}
            loading={loading}
            disabled={loading}
          >
            Submit
          </Button>
        )}
      </View>
    </View>
    </SafeAreaView>
  );
};

export default PriceTable;
