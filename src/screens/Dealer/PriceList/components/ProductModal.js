import { View, Text, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { Button, Modal } from "react-native-paper";
import { Styles } from "../../../../styles/styles";
import Dropdown from "../../../../components/Dropdown";
import { Table, TableWrapper, Row, Col } from "react-native-table-component";
import { theme } from "../../../../theme/apptheme";
import { useState } from "react";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: "white",
    alignItems: "center",
  },
  header: { height: 80, backgroundColor: theme.colors.primary },
  subheader: { height: 30, backgroundColor: "white" },
  text: { textAlign: "center", fontWeight: "400" },
  headertext: { textAlign: "center", fontWeight: "800", color: "white" },
  dataWrapper: { marginTop: -1 },
  row: { height: 50, backgroundColor: "white" },
});
const ProductModal = ({
  open,
  setOpen,
  fetchProducts,
  setTable,
  table,
  brands,
}) => {
  const [products, setProducts] = useState({});

  const add = (index) => {
    if (
      !table.find(
        (item) =>
          item.product_refno === products.product_data[index].product_refno &&
          item.brand_refno === products.brand_refno
      )
    ) {
      setTable((prev) => {
        return {
          ...prev,
          table: [
            ...prev.table,
            {
              ...products.product_data[index],
              brand_refno: products.brand_refno,
            },
          ],
        };
      });
    }
    setProducts((prev) => ({
      ...prev,
      product_data: prev.product_data.filter((_, i) => i !== index),
    }));
  };

  return (
    <Modal
      visible={open}
      onDismiss={() => {
        setProducts({});
        setOpen(false);
      }}
      contentContainerStyle={{
        backgroundColor: "white",
        padding: 16,
        width: "90%",
        alignSelf: "center",
        height: 650,
      }}
    >
      <Text
        style={[
          Styles.fontSize20,
          Styles.fontBold,
          Styles.marginBottom4,
          Styles.primaryColor,
          { marginBottom: "3%" },
        ]}
      >
        Product List
      </Text>
      <Dropdown
        label="Brand Name"
        data={brands.map(
          (item) => `${item.brand_name} (${item.category_name})`
        )}
        onSelected={(_, index) => {
          fetchProducts(brands[index].brand_refno, setProducts);
        }}
        style={{ backgroundColor: "white", marginBottom: "3%" }}
      />
      <View style={{ ...styles.container, marginBottom: 10 }}>
        <ScrollView horizontal={true}>
          <View>
            <Table
              borderStyle={{
                borderWidth: 1,
                borderColor: "#C1C0B9",
              }}
            >
              <Row
                data={["Product Name", "Brand Name", "Action"]}
                widthArr={[250, 100, 120]}
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
                    data={
                      products?.product_data
                        ? [
                            ...products?.product_data?.map((obj) =>
                              obj?.product_name.replace("&nbsp;", " ")
                            ),
                          ]
                        : []
                    }
                  />
                  <Col
                    height={80}
                    textStyle={styles.text}
                    width={100}
                    data={
                      products?.product_data
                        ? [
                            ...products?.product_data?.map(
                              () => products?.brand_name
                            ),
                          ]
                        : []
                    }
                  />
                  <Col
                    height={80}
                    textStyle={styles.text}
                    width={120}
                    data={
                      products?.product_data
                        ? [
                            ...products?.product_data?.map((_, index) => (
                              <View key={index} style={{ padding: 10 }}>
                                <Button
                                  mode="contained"
                                  onPress={() => add(index)}
                                >
                                  Add
                                </Button>
                              </View>
                            )),
                          ]
                        : []
                    }
                  />
                </TableWrapper>
              </Table>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
      <Button
        mode="contained"
        onPress={() => {
          setProducts({});
          setOpen(false);
        }}
      >
        close
      </Button>
    </Modal>
  );
};

export default ProductModal;
