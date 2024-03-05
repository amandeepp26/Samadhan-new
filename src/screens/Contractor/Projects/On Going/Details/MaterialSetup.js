import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import Provider from "../../../../../api/Provider";
import { useState } from "react";
import { Row, Table, TableWrapper } from "react-native-table-component";
import { theme } from "../../../../../theme/apptheme";
import { Button, FAB, Portal } from "react-native-paper";
import AddProduct from "./AddProduct";
import { Styles } from "../../../../../styles/styles";
import LabelInput from "../../../../Marketing/EmployeeActivity/common/LabelInput";
import HDivider from "../../../../Marketing/EmployeeActivity/common/HDivider";
let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_CompanyAdmin_UserRefno = 0;
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
const MaterialSetup = ({ index, setIndex, data, unload }) => {
  const [state, setState] = useState([]);
  const fetchUserData = async () => {
    const user = JSON.parse(await AsyncStorage.getItem("user"));
    Sess_UserRefno = user.UserID;
    Sess_company_refno = user.Sess_company_refno;
    Sess_branch_refno = user.Sess_branch_refno;
    Sess_CompanyAdmin_UserRefno = user.Sess_CompanyAdmin_UserRefno;
    fetchData();
  };

  const fetchData = () => {
    Provider.createDFContractor(
      data.project_type === "3"
        ? Provider.API_URLS.contractor_QW_projects_materialsetupdata_edit
        : data.project_type === "2"
        ? Provider.API_URLS.contractor_DW_projects_materialsetupdata_edit
        : data.project_type === "4"
        ? Provider.API_URLS.contractor_BOQ_projects_materialsetupdata_edit
        : Provider.API_URLS.contractor_GU_projects_materialsetupdata_edit,
      {
        data: {
          Sess_UserRefno: Sess_UserRefno,
          Sess_company_refno: Sess_company_refno,
          Sess_branch_refno: Sess_branch_refno,
          Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
          ...data,
        },
      }
    ).then((res) => {
      console.log(res.data);
      if (res.data.data) {
        setState(res.data.data);
      }
    });
  };
  console.log(state);
  const submit = () => {
    console.log(
      JSON.stringify(
        {
          data: {
            Sess_UserRefno: Sess_UserRefno,
            Sess_company_refno: Sess_company_refno,
            Sess_branch_refno: Sess_branch_refno,
            Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
            cont_project_refno: data.cont_project_master_refno,
            ...data,
            estimation_refno: data.estimation_enquiry_refno,
            product_refno: state.map((obj) => obj.product_refno),
            brand_refno: state.map((obj) => obj.brand_refno),
            rate: state.map((obj) => obj.rate),
          },
        },
        null,
        2
      )
    );
    Provider.createDFContractor(
      data.project_type === "3"
        ? Provider.API_URLS.contractor_QW_projects_materialsetupdata_update
        : data.project_type === "2"
        ? Provider.API_URLS.contractor_DW_projects_materialsetupdata_update
        : data.project_type === "4"
        ? Provider.API_URLS.contractor_BOQ_projects_materialsetupdata_update
        : Provider.API_URLS.contractor_GU_projects_materialsetupdata_update,
      {
        data: {
          Sess_UserRefno: Sess_UserRefno,
          Sess_company_refno: Sess_company_refno,
          Sess_branch_refno: Sess_branch_refno,
          Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
          cont_project_refno: data.cont_project_master_refno,
          ...data,
          estimation_refno: data.estimation_enquiry_refno,
          product_refno: state.map((obj) => obj.product_refno),
          brand_refno: state.map((obj) => obj.brand_refno),
          rate: state.map((obj) => obj.rate),
        },
      }
    ).then((res) => {
      console.log(res.data);
      if (res.data.code === 200) {
        unload("Material Setup Updated");
      }
    });
  };
  useEffect(() => {
    if (index === 2) {
      fetchUserData();
    }
  }, [index]);
  console.log(data);
  const [open, setOpen] = useState(false);
  console.log(open);
  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      {(data.project_type === "3" || data.project_type === "4") && (
        <AddProduct
          open={open}
          type={data.project_type === "4" ? "BOQ" : "QW"}
          setOpen={setOpen}
          Sess_UserRefno={Sess_UserRefno}
          setState={setState}
        />
      )}
      {(data.project_type === "3" || data.project_type === "4") && (
        <Portal>
          {!open && index === 2 && (
            <FAB
              style={[
                Styles.margin16,
                Styles.primaryBgColor,
                { position: "absolute", right: 0, bottom: 100 },
              ]}
              icon="plus"
              onPress={() => setOpen(true)}
            />
          )}
        </Portal>
      )}
      <View style={{ padding: 16, flex: 1 }}>
        <ScrollView>
          {state.map((obj,index) => {
            return (
              <View
                style={[
                  {
                    backgroundColor: "#eee",
                    borderRadius: 8,
                    elevation: 5,
                  },
                  Styles.padding16,
                  Styles.marginVertical8,
                ]}
              >
                <LabelInput label="Product Name" value={obj.product_name} />
                <HDivider />
                <LabelInput label="Brand Name" value={obj.brand_name} />
                <HDivider />
                {(data.project_type === "3" || data.project_type === "4") && (
                  <Button
                    style={{
                      width: "60%",
                      alignSelf: "center",
                    }}
                    mode="contained"
                    onPress={() =>
                      setState((state) => {
                        return state.filter((_, i) => i !== index);
                      })
                    }
                  >
                    Remove
                  </Button>
                )}
              </View>
            );
          })}
        </ScrollView>
        <Button
          mode="contained"
          onPress={submit}
          style={{ width: "60%", marginTop: 30, alignSelf: "center" }}
        >
          Update
        </Button>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default MaterialSetup;
