import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView } from "react-native";
import React, { useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import Provider from "../../../../../api/Provider";
import { useState } from "react";
import { Button, FAB, Portal, Title } from "react-native-paper";

import { Styles } from "../../../../../styles/styles";
import LabelInput from "../../../../Marketing/EmployeeActivity/common/LabelInput";
import HDivider from "../../../../Marketing/EmployeeActivity/common/HDivider";
import RBSheet from "react-native-raw-bottom-sheet";
let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_CompanyAdmin_UserRefno = 0;

const MaterialSetup = ({ index, setIndex, data, unload, navigation }) => {
  const [state, setState] = useState([]);
  const ref = useRef();
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
        ? Provider.API_URLS.contractor_QW_projects_materialrequest_list
        : data.project_type === "2"
        ? Provider.API_URLS.contractor_DW_projects_materialrequest_list
        : data.project_type === "4"
        ? Provider.API_URLS.contractor_BOQ_projects_materialrequest_list
        : Provider.API_URLS.contractor_GU_projects_materialrequest_list,
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
      console.log(res.data, "res");
      if (res.data.data) {
        setState(res.data.data);
      }
    });
  };
  console.log(state);

  useEffect(() => {
    if (index === 5) {
      fetchUserData();
    }
  }, [index]);
  console.log(data);
  const [open, setOpen] = useState(false);
  console.log(open);
  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ padding: 16, flex: 1 }}>
        <ScrollView>
          {state.map((obj) => {
            console.log(JSON.stringify(obj, null, 2));
            return (
              <>
                <RBSheet
                  ref={ref}
                  closeOnDragDown={true}
                  closeOnPressMask={true}
                  dragFromTopOnly={true}
                  height={420}
                  animationType="fade"
                  customStyles={{
                    wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
                    draggableIcon: { backgroundColor: "#000" },
                  }}
                >
                  <ScrollView contentContainerStyle={{ padding: 16 }}>
                    <Title style={[Styles.paddingHorizontal16]}>
                      {"Supplier Details"}
                    </Title>
                    <LabelInput
                      label="Supplier Name"
                      value={obj.supplierdata[0].company_name}
                    />
                    <LabelInput
                      label="PI No"
                      value={obj.supplierdata[0].pi_no}
                    />
                    <LabelInput
                      label="PI Amount"
                      value={obj.supplierdata[0].pi_amount}
                    />
                    <LabelInput
                      label="PI Supply Status"
                      value={obj.supplierdata[0].pi_supplier_status}
                    />
                    <LabelInput label="Action" value={"Waiting"} />
                  </ScrollView>
                </RBSheet>
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
                  <LabelInput
                    label="Project & Client Contact Details"
                    value={
                      <View>
                        <Text>{obj.projectdata[0].project_name}</Text>
                        <Text>
                          {obj.projectdata[0].contact_person} &{" "}
                          {obj.projectdata[0].contact_mobile_no}
                        </Text>
                      </View>
                    }
                  />
                  <HDivider />
                  <LabelInput
                    label="Request Details"
                    value={
                      <View>
                        <Text>No: {obj.requestdata[0].mr_no}</Text>
                        <Text>Date: {obj.requestdata[0].mr_date} </Text>
                        <Text>Status: {obj.requestdata[0].mr_status} </Text>
                        <Text>Request By: {obj.requestdata[0].requestby} </Text>
                      </View>
                    }
                  />
                  <HDivider />
                  <View
                    style={[Styles.flexRow, { justifyContent: "space-around" }]}
                  >
                    <Button
                      // onPress={() => ref.current.open()}
                      mode="contained"
                      style={{
                        marginTop: 8,
                        width: "80%",
                        alignSelf: "center",
                      }}
                      onPress={() =>
                        navigation.navigate("Add Material Request", {
                          data: data,
                          mr_refno: obj.mr_refno,
                          contractor: true,
                        })
                      }
                    >
                      Edit
                    </Button>
                    {/* <Button
                      mode="contained"
                      style={{
                        marginTop: 8,
                        width: "45%",
                        alignSelf: "center",
                      }}
                    >
                      Edit
                    </Button> */}
                  </View>
                </View>
              </>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default MaterialSetup;
