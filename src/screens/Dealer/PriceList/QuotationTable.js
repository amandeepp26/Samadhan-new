import { View, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import React from "react";
import { Styles } from "../../../styles/styles";
import { TextInput, Button, Portal } from "react-native-paper";
import { Table, TableWrapper, Row, Col } from "react-native-table-component";
import { theme } from "../../../theme/apptheme";
import { useState } from "react";
import ProductModal from "./components/ProductModal";

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

const QuotationTable = ({
  data,
  setData,
  brands,
  fetchProducts,
  validateData,
  loading,
}) => {
  const [open, setOpen] = useState(false);
  const updateProduct = (i, name, value) => {
    if (value === ".") return;

    setData((prev) => {
      let temp = JSON.parse(JSON.stringify(prev.table));
      temp[i][name] = value;
      temp[i]["amount"] =
        temp[i]["quantity"] !== "" && temp[i]["rate"] !== ""
          ? (
              temp[i]["quantity"] *
              temp[i]["rate"] *
              (1 - temp[i]["discount_perc"] / 100)
            ).toFixed(2)
          : "";

      return { ...prev, table: temp };
    });
  };
  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1, Styles.backgroundColor]}>
      <Portal>
        <ProductModal
          table={data}
          setTable={setData}
          open={open}
          setOpen={setOpen}
          brands={brands}
          fetchProducts={fetchProducts}
        />
      </Portal>

      <View style={[Styles.flex1, Styles.padding16]}>
        <Button
          mode="contained"
          onPress={() => setOpen(true)}
          disabled={loading}
        >
          Add product
        </Button>
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
                    "Qty",
                    "Rate",
                    "per",
                    "Discount (%)",
                    "Amount",
                    "Action",
                  ]}
                  widthArr={[250, 100, 100, 50, 90, 120, 120]}
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
                      width={250}
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
                                  "quantity",
                                  e.replace(/\D/g, "")
                                )
                              }
                              value={obj.quantity}
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
                    <Col
                      height={80}
                      textStyle={styles.text}
                      width={50}
                      data={[...data?.map((obj) => obj?.unit_name)]}
                    />
                    <Col
                      height={80}
                      textStyle={styles.text}
                      width={90}
                      data={[...data?.map((obj) => obj?.discount_perc)]}
                    />
                    <Col
                      height={80}
                      textStyle={styles.text}
                      width={120}
                      data={[...data?.map((obj) => obj?.amount)]}
                    />
                    <Col
                      height={80}
                      textStyle={styles.text}
                      width={120}
                      data={[
                        ...data.map((_, index) => (
                          <View key={index} style={{ padding: 10 }}>
                            <Button
                              disabled={loading}
                              mode="contained"
                              onPress={() => {
                                setData((prev) => {
                                  let temp = JSON.parse(JSON.stringify(prev));
                                  temp = temp.table.filter(
                                    (_, i) => index !== i
                                  );
                                  return {
                                    ...prev,
                                    table: temp,
                                  };
                                });
                              }}
                            >
                              Remove
                            </Button>
                          </View>
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
                    data
                      .reduce(
                        (a, obj) => a + Number(obj?.amount ? obj.amount : 0),
                        0
                      )
                      .toFixed(2),
                    "",
                  ]}
                  widthArr={[590, 120, 120]}
                  style={styles.row}
                  textStyle={{ paddingHorizontal: 25, textAlign: "right" }}
                />
                <Row
                  data={[
                    "CGST",
                    (
                      data.reduce(
                        (a, obj) => a + Number(obj?.amount ? obj.amount : 0),
                        0
                      ) * 0.09
                    ).toFixed(2),
                    "",
                  ]}
                  widthArr={[590, 120, 120]}
                  style={styles.row}
                  textStyle={{ paddingHorizontal: 25, textAlign: "right" }}
                />
                <Row
                  data={[
                    "SGST",
                    (
                      data.reduce(
                        (a, obj) => a + Number(obj?.amount ? obj.amount : 0),
                        0
                      ) * 0.09
                    ).toFixed(2),
                    "",
                  ]}
                  widthArr={[590, 120, 120]}
                  style={styles.row}
                  textStyle={{ paddingHorizontal: 25, textAlign: "right" }}
                />
                <Row
                  data={[
                    "Total",
                    (
                      data.reduce(
                        (a, obj) => a + Number(obj?.amount ? obj.amount : 0),
                        0
                      ) +
                      data.reduce(
                        (a, obj) => a + Number(obj?.amount ? obj.amount : 0),
                        0
                      ) *
                        0.09 *
                        2
                    ).toFixed(3),
                    "",
                  ]}
                  widthArr={[590, 120, 120]}
                  style={styles.row}
                  textStyle={{ paddingHorizontal: 25, textAlign: "right" }}
                />
              </Table>
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

export default QuotationTable;
