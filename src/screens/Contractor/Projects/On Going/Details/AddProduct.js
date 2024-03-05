import { View, Text, StyleSheet,ScrollView  } from "react-native";
import React from "react";
import { Button, Modal, Portal } from "react-native-paper";
import { useState } from "react";
import { useEffect } from "react";
import Provider from "../../../../../api/Provider";
import FormInput from "../../../../Marketing/EmployeeActivity/common/Input";

import { Row, Table, TableWrapper } from "react-native-table-component";
import { theme } from "../../../../../theme/apptheme";
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
  row: { backgroundColor: "white", height: 50 },
});
const AddProduct = ({ Sess_UserRefno, open, setOpen, setState, type }) => {
  const [data, setData] = useState([]);
  const [services, setServices] = useState([]);
  const [brands, setBrands] = useState([]);
  const [category, setCategory] = useState([]);
  const [payload, setPayload] = useState({
    dealer_service_refno: "",
    dealer_category_refno: "",
    dealer_brand_refno: "",
  });
  const fetchServices = () => {
    Provider.createDFContractor(
      type === "BOQ"
        ? Provider.API_URLS
            .contractor_BOQ_projects_materialsetup_popup_servicename
        : Provider.API_URLS
            .contractor_QW_projects_materialsetup_popup_servicename,
      { data: { Sess_UserRefno } }
    ).then((res) => {
      if (res.data.data) {
        setServices(res.data.data);
      }
    });
  };

  const fetchProducts = (
    dealer_brand_refno,
    dealer_category_refno,
    dealer_service_refno
  ) => {
    Provider.createDFContractor(
      type === "BOQ"
        ? Provider.API_URLS
            .contractor_BOQ_projects_materialsetup_popup_productnamelist
        : Provider.API_URLS
            .contractor_QW_projects_materialsetup_popup_productnamelist,
      {
        data: {
          Sess_UserRefno,
          dealer_brand_refno,
          dealer_category_refno,
          dealer_service_refno,
        },
      }
    ).then((res) => {
      if (res.data.data) {
        setData(res.data.data);
      }
    });
  };

  const fetchCategories = (service_refno) => {
    Provider.createDFContractor(
      type === "BOQ"
        ? Provider.API_URLS
            .contractor_BOQ_projects_materialsetup_popup_categoryname
        : Provider.API_URLS
            .contractor_QW_projects_materialsetup_popup_categoryname,
      {
        data: {
          Sess_UserRefno,
          dealer_service_refno: service_refno,
        },
      }
    ).then((res) => {
      console.log(res.data);
      if (res.data.data) {
        setCategory(res.data.data);
      }
    });
  };
  const fetchBrands = (service_refno) => {
    Provider.createDFContractor(
      type === "BOQ"
        ? Provider.API_URLS
            .contractor_BOQ_projects_materialsetup_popup_brandname
        : Provider.API_URLS
            .contractor_QW_projects_materialsetup_popup_brandname,
      {
        data: {
          Sess_UserRefno,
          dealer_category_refno: service_refno,
        },
      }
    ).then((res) => {
      if (res.data.data) {
        setBrands(res.data.data);
      }
    });
  };
  console.log(data);
  useEffect(() => {
    if (open) {
      fetchServices();
    }
  }, [open]);
  return (
    <Portal>
      <Modal
        visible={open}
        onDismiss={() => setOpen(false)}
        contentContainerStyle={{
          backgroundColor: "white",
          padding: 16,
          width: "90%",
          alignSelf: "center",
          height: 500,
          justifyContent: "flex-start",
        }}
      >
        <ScrollView>
          <Text style={{ fontSize: 18, color: "#45916b", fontWeight: "600" }}>
            Material List for Service Products
          </Text>
          <FormInput
            label="Services"
            type="dropdown"
            data={[...services.map((obj) => obj.service_name)]}
            value={payload.dealer_service_refno}
            onChangeText={(text) => {
              fetchCategories(
                services.find((item) => item.service_name === text)
                  .dealer_service_refno
              );
              setPayload((state) => ({
                ...state,
                dealer_service_refno: text,
                dealer_category_refno: "",
              }));
              setBrands([]);
            }}
          />
          <FormInput
            label="Categories"
            type="dropdown"
            data={[...category.map((obj) => obj.category_name)]}
            value={payload.dealer_category_refno}
            onChangeText={(text) => {
              fetchBrands(
                category.find((item) => item.category_name === text)
                  .dealer_category_refno
              );
              setPayload((state) => ({
                ...state,
                dealer_category_refno: text,
                dealer_brand_refno: "",
              }));
            }}
          />
          <FormInput
            label="Brand"
            type="dropdown"
            data={[...brands.map((obj) => obj.brand_name)]}
            value={payload.dealer_brand_refno}
            onChangeText={(text) => {
              setPayload((state) => ({ ...state, dealer_brand_refno: text }));
              fetchProducts(
                brands.find((item) => item.brand_name === text)
                  .dealer_brand_refno,
                category.find(
                  (item) => item.category_name === payload.dealer_category_refno
                ).dealer_category_refno,
                services.find(
                  (item) => item.service_name === payload.dealer_service_refno
                ).dealer_service_refno
              );
            }}
          />
          <ScrollView horizontal style={{ marginTop: 20 }}>
            <View>
              <Table
                borderStyle={{
                  borderWidth: 1,
                  borderColor: "#C1C0B9",
                }}
              >
                <Row
                  data={["Product Name", "Brand Name", "Action"]}
                  widthArr={[300, 200, 150]}
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
                    {data.map((obj, index) => {
                      return (
                        <Row
                          key={index}
                          style={styles.row}
                          textStyle={styles.text}
                          data={[
                            obj.product_name,
                            obj.brand_name,
                            <Button
                              onPress={() => {
                                setState((state) => {
                                  console.log(state);
                                  if (
                                    state.find(
                                      (item) =>
                                        item.product_refno == obj.product_refno
                                    )
                                  ) {
                                    return state;
                                  } else {
                                  return [...state, obj];
                                  }
                                });
                                setData((data) => {
                                  return data.filter((item, i) => i !== index);
                                });
                              }}
                              style={{ width: "80%", alignSelf: "center" }}
                              mode="contained"
                            >
                              Add
                            </Button>,
                          ]}
                          widthArr={[300, 200, 150]}
                        />
                      );
                    })}
                  </TableWrapper>
                </Table>
              </ScrollView>
            </View>
          </ScrollView>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

export default AddProduct;
