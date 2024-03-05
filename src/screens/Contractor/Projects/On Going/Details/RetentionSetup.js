import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import FormInput from "../../../../Marketing/EmployeeActivity/common/Input";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Provider from "../../../../../api/Provider";
import { useEffect } from "react";
import { Button } from "react-native-paper";
let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_CompanyAdmin_UserRefno = 0;
const RetentionSetup = ({ index, setIndex, data, unload }) => {
  const [state, setState] = useState({});
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
        ? Provider.API_URLS.contractor_QW_projects_retentionsetupdata_edit
        : data.project_type === "2"
        ? Provider.API_URLS.contractor_DW_projects_retentionsetupdata_edit
        : data.project_type === "4"
        ? Provider.API_URLS.contractor_BOQ_projects_retentionsetupdata_edit
        : Provider.API_URLS.contractor_GU_projects_retentionsetupdata_edit,
      {
        data: {
          Sess_UserRefno: Sess_UserRefno,
          Sess_company_refno: Sess_company_refno,
          Sess_branch_refno: Sess_branch_refno,
          Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
          cont_project_master_refno: data.cont_project_master_refno,
          ...data,
        },
      }
    ).then((res) => {
      if (res.data.data) {
        setState(res.data.data[0]);
      }
    });
  };
  const submit = () => {
    Provider.createDFContractor(
      data.project_type === "3"
        ? Provider.API_URLS.contractor_QW_projects_retentionsetupdata_update
        : data.project_type === "2"
        ? Provider.API_URLS.contractor_DW_projects_retentionsetupdata_update
        : data.project_type === "4"
        ? Provider.API_URLS.contractor_BOQ_projects_retentionsetupdata_update
        : Provider.API_URLS.contractor_GU_projects_retentionsetupdata_update,
      {
        data: {
          Sess_UserRefno: Sess_UserRefno,
          Sess_company_refno: Sess_company_refno,
          Sess_branch_refno: Sess_branch_refno,
          Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
          cont_project_master_refno: data.cont_project_master_refno,
          ...data,
          ...state,
        },
      }
    ).then((res) => {
      console.log(res.data);
      if (res.data.code === 200) {
        unload("Retention Setup Updated");
      }
    });
  };
  useEffect(() => {
    if (index === 3) {
      fetchUserData();
      console.log(state);
    }
  }, [index]);
  return (

    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={{ padding: 16 }}>
      <FormInput
        label="Retention Period (In Months)"
        value={state.retention_period}
        onChangeText={(text) =>
          setState((state) => ({ ...state, retention_period: text }))
        }
        keyboardType={"numeric"}
      />
      <FormInput
        label="Retention Percentage"
        value={state.retention_perc}
        onChangeText={(text) =>
          setState((state) => ({ ...state, retention_perc: text }))
        }
        keyboardType={"numeric"}
      />
      <FormInput
        label="TDS Percentage"
        value={state.tds_perc}
        onChangeText={(text) =>
          setState((state) => ({ ...state, tds_perc: text }))
        }
        keyboardType={"numeric"}
      />
      <Button
        mode="contained"
        onPress={submit}
        style={{ width: "60%", marginTop: 30, alignSelf: "center" }}
      >
        Update
      </Button>
    </View>
    </SafeAreaView>
  );
};

export default RetentionSetup;
