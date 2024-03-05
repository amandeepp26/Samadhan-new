import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import { useState } from "react";
import Provider from "../../../../../api/Provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { Button, Checkbox } from "react-native-paper";
let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_CompanyAdmin_UserRefno = 0;
const SupervisorSetup = ({ index, setIndex, data, unload }) => {
  const [state, setState] = useState({});
  const [selected, setSelected] = useState([]);
  const fetchUserData = async () => {
    const user = JSON.parse(await AsyncStorage.getItem("user"));
    Sess_UserRefno = user.UserID;
    Sess_company_refno = user.Sess_company_refno;
    Sess_branch_refno = user.Sess_branch_refno;
    Sess_CompanyAdmin_UserRefno = user.Sess_CompanyAdmin_UserRefno;
    fetchData();
  };
  console.log(data);

  const fetchData = () => {
    Provider.createDFContractor(
      data.project_type === "3"
        ? Provider.API_URLS.contractor_QW_projects_supervisorsetupdata_edit
        : data.project_type === "2"
        ? Provider.API_URLS.contractor_DW_projects_supervisorsetupdata_edit
        : data.project_type === "4"
        ? Provider.API_URLS.contractor_BOQ_projects_supervisorsetupdata_edit
        : Provider.API_URLS.contractor_GU_projects_supervisorsetupdata_edit,
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
      if (res.data.data) {
        console.log(JSON.stringify(res.data.data, null, 2));
        setState(res.data.data);
        setSelected(res.data.data.checked_employee_user_refnos);
      }
    });
  };
  const submit = () => {
    console.log({
      data: {
        Sess_UserRefno: Sess_UserRefno,
        Sess_company_refno: Sess_company_refno,
        Sess_branch_refno: Sess_branch_refno,
        Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
        cont_project_master_refno: data.cont_project_master_refno,
        estimation_enquiry_refno: data.estimation_enquiry_refno,
        employee_user_refnos: selected,
        cont_project_refno: state.cont_project_refno,
      },
    });
    Provider.createDFContractor(
      data.project_type === "3"
        ? Provider.API_URLS.contractor_QW_projects_supervisorsetupdata_update
        : data.project_type === "2"
        ? Provider.API_URLS.contractor_DW_projects_supervisorsetupdata_update
        : data.project_type === "4"
        ? Provider.API_URLS.contractor_BOQ_projects_supervisorsetupdata_update
        : Provider.API_URLS.contractor_GU_projects_supervisorsetupdata_update,
      {
        data: {
          Sess_UserRefno: Sess_UserRefno,
          Sess_company_refno: Sess_company_refno,
          Sess_branch_refno: Sess_branch_refno,
          Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
          cont_project_master_refno: data.cont_project_master_refno,
          estimation_enquiry_refno: data.estimation_enquiry_refno,
          employee_user_refnos: selected,
          ...state,
        },
      }
    ).then((res) => {
      console.log(res.data);
      if (res.data.code === 200) {
        unload("Supervisor Setup Updated");
      }
    });
  };
  useEffect(() => {
    if (index === 4) {
      fetchUserData();
      console.log(state);
    }
  }, [index]);
  console.log(JSON.stringify(state, null, 2));

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={{ padding: 16 }}>
      <Text>Assign Supervisor</Text>
      {state?.supervisor_employeedata?.map((obj, index) => {
        return (
          <Checkbox.Item
            status={
              selected.includes(obj.employee_user_refno)
                ? "checked"
                : "unchecked"
            }
            key={index}
            label={obj.employee_user_name}
            onPress={() => {
              if (selected.includes(obj.employee_user_refno)) {
                setSelected((state) => {
                  return state.filter(
                    (item) => item !== obj.employee_user_refno
                  );
                });
              } else {
                setSelected([...selected, obj.employee_user_refno]);
              }
            }}
          />
        );
      })}
      {state.location_setup !== "1" ? (
        <Text style={{ fontSize: 18, color: "red" }}>
          Please update Project Location
        </Text>
      ) : (
        <></>
      )}
      {state.material_setup !== "1" ? (
        <Text style={{ fontSize: 18, color: "red" }}>
          Please update Material Setup
        </Text>
      ) : (
        <></>
      )}
      {state.retention_setup !== "1" ? (
        <Text style={{ fontSize: 18, color: "red" }}>
          Please update Retention Setup
        </Text>
      ) : (
        <></>
      )}
      {state.location_setup === "1" &&
      state.material_setup === "1" &&
      state.retention_setup === "1" ? (
        <Button
          mode="contained"
          onPress={submit}
          style={{ width: "60%", marginTop: 30, alignSelf: "center" }}
        >
          Update
        </Button>
      ) : null}
    </View>
    </SafeAreaView>
  );
};

export default SupervisorSetup;