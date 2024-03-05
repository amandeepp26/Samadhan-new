import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Styles } from "../../../../../styles/styles";
import LabelInput from "../../../../Marketing/EmployeeActivity/common/LabelInput";
import HDivider from "../../../../Marketing/EmployeeActivity/common/HDivider";
import { Button, FAB, Portal } from "react-native-paper";
import LabourRequest from "./LabourRequestModal";
import Provider from "../../../../../api/Provider";

let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_CompanyAdmin_UserRefno = 0;
function removeTags(str) {
  if (str === null || str === "") return false;
  else str = str.toString();

  // Regular expression to identify HTML tags in
  // the input string. Replacing the identified
  // HTML tag with a null string.
  return str.replace(/(<([^>]+)>)/gi, "");
}
const Card = ({ data, navigation, setMr, setOpen, setActionType }) => {
  console.log(data);
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
      <LabelInput label={"Project Name"} value={data.project_name} />
      <HDivider />
      <LabelInput
        label={"Contact Person & Number"}
        value={`${data.contact_person} & ${data.contact_mobile_no}`}
      />
      <HDivider />

      <LabelInput label={"Request By"} value={data.request_person_name} />
      <HDivider />
      <LabelInput
        label={"Request Status"}
        value={removeTags(data.message_button[0])}
      />
      <HDivider />
      {data.action_button.includes("Update") && (
        <Button
          mode="contained"
          onPress={() => {
            setMr(data.cont_pro_lab_req_refno);
            setOpen(true);
            setActionType("Edit");
          }}
          style={{ marginTop: 8, width: "80%", alignSelf: "center" }}
        >
          Update
        </Button>
      )}
      {data.action_button.includes("View") && (
        <Button
          onPress={() => {
            setMr(data.cont_pro_lab_req_refno);
            setOpen(true);
            setActionType("View");
          }}
          mode="contained"
          style={{ marginTop: 8, width: "80%", alignSelf: "center" }}
        >
          View
        </Button>
      )}
    </View>
  );
};

const MaterialRequest = ({ index, setIndex, data, unload }) => {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState("Edit");
  const [mr, setMr] = useState(-1);
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
        ? Provider.API_URLS.contractor_QW_projects_labourrequest_approvelist
        : data.project_type === "2"
        ? Provider.API_URLS.contractor_DW_projects_labourrequest_approvelist
        : data.project_type === "4"
        ? Provider.API_URLS.contractor_BOQ_projects_labourrequest_approvelist
        : Provider.API_URLS.contractor_GU_projects_labourrequest_approvelist,
      {
        data: {
          Sess_UserRefno: Sess_UserRefno,
          Sess_company_refno: Sess_company_refno,
          Sess_branch_refno: Sess_branch_refno,
          Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
          cont_project_master_refno: data.cont_project_master_refno,
          ...data,
          pagename: "yetstart",
        },
      }
    ).then((res) => {
      if (res.data.data) {
        setList(res.data.data);
      }
    });
  };

  useEffect(() => {
    if (index === 6) {
      fetchUserData();
    }
  }, [index]);
  console.log(open, "OPEN");
  console.log(index);
  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={{ padding: 16 }}>
      {index === 6 && (
        <Portal>
          <LabourRequest
            open={open}
            setOpen={setOpen}
            data={data}
            Sess_UserRefno={Sess_UserRefno}
            Sess_company_refno={Sess_company_refno}
            Sess_branch_refno={Sess_branch_refno}
            Sess_CompanyAdmin_UserRefno={Sess_CompanyAdmin_UserRefno}
            callback={fetchData}
            mr={mr}
            actionType={actionType}
            setActionType={setActionType}
            setMr={setMr}
          />
        </Portal>
      )}

      <ScrollView>
        {list.map((obj, index) => {
          return (
            <Card
              data={obj}
              key={index}
              setMr={setMr}
              setActionType={setActionType}
              setOpen={setOpen}
            />
          );
        })}
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

export default MaterialRequest;
