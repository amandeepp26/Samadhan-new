import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import Provider from "../../../../../api/Provider";
import { useEffect } from "react";

import { Row, Table, TableWrapper } from "react-native-table-component";
import { theme } from "../../../../../theme/apptheme";
import CreateSCCards from "../../../../../components/SCCards";
import LabelInput from "../../../../Marketing/EmployeeActivity/common/LabelInput";
import { useRef } from "react";
import RBSheet from "react-native-raw-bottom-sheet";
import { Title } from "react-native-paper";
import { Styles } from "../../../../../styles/styles";
import HDivider from "../../../../Marketing/EmployeeActivity/common/HDivider";

let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_CompanyAdmin_UserRefno = 0;

const Card = ({ data, type }) => {
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
      {type === "3" && (
        <>
          <LabelInput label={"Project Name"} value={data.project_name} />
          <HDivider />
          <LabelInput
            label="Client Details"
            value={`${data?.customerdata?.["Client Name"] || "NONE"} - ${data?.customerdata?.["Client Mobile No"] || "NONE"
              }`}
          />
          <HDivider />
          <LabelInput label="Quotation No" value={data.cont_quot_no} />
          <HDivider />
          <LabelInput label="Quotation Unit" value={data.quot_unit_type_name} />
          <HDivider />
          <LabelInput
            label="Materials"
            value={data.material_status == "1" ? "Yes" : "No"}
          />
        </>
      )}
      {type === "4" && (
        <>
          <LabelInput label={"Project Name"} value={data.project_name} />
          <HDivider />
          <LabelInput
            label="Architect Details"
            value={`${data?.architectdata?.["Architect Name"] || "NONE"} - ${data?.architectdata?.["Architect Mobile No"] || "NONE"
              }`}
          />
          <HDivider />
          <LabelInput
            label="Budget/BOQ No"
            value={`${data.budget_no} / ${data.boq_no}`}
          />
          <HDivider />
          <LabelInput label="Quotation Unit" value={data.quot_unit_type_name} />
          <HDivider />
          <LabelInput
            label="Materials"
            value={data.material_status === "1" ? "Yes" : "No"}
          />
        </>
      )}
    </View>
  );
};
const ClientEstimation = ({ index, setIndex, data }) => {
  const [state, setState] = useState({});
  const fetchUserData = async () => {
    const user = JSON.parse(await AsyncStorage.getItem("user"));
    Sess_UserRefno = user.UserID;
    Sess_company_refno = user.Sess_company_refno;
    Sess_branch_refno = user.Sess_branch_refno;
    Sess_CompanyAdmin_UserRefno = user.Sess_CompanyAdmin_UserRefno;
    fetchData();
  };
  const refRBSheet = useRef();

  const fetchData = () => {
    let params = {
      data: {
        Sess_UserRefno: Sess_UserRefno,
        Sess_company_refno: Sess_company_refno,
        Sess_branch_refno: Sess_branch_refno,
        Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
        cont_project_master_refno: data.cont_project_master_refno,
        ...data,
        pagename: "yetstart",
      }
    };
    let url = data.project_type === "3"
      ? Provider.API_URLS.contractor_QW_projects_clientdata
      : data.project_type === "2"
        ? Provider.API_URLS.contractor_DW_projects_clientdata
        : data.project_type === "4"
          ? Provider.API_URLS.contractor_BOQ_projects_clientdata
          : Provider.API_URLS.contractor_GU_projects_clientdata;


    // console.log('url:***********', url, "*=====================*");
    // console.log('params:**********', params, "*======================*");

    Provider.createDFContractor(url, params)
      .then((res) => {
        console.log('resp===========:', res.data.data, "=======================");
        if (res.data.data) {
          setState(res.data.data);
        }
      });
  };

  useEffect(() => {
    if (index === 0) {
      fetchUserData();
    }
  }, [index]);

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={{ padding: 16 }}>
      {data.project_type === "2" || data.project_type === "1" ? (
        <>
          <RBSheet
            ref={refRBSheet}
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
                {"Estimation & Product Details"}
              </Title>
              {state.productdata ? (
                Object.keys(state?.productdata).map((obj, index) => {
                  return (
                    <LabelInput label={obj} value={state.productdata[obj]} />
                  );
                })
              ) : (
                <Text></Text>
              )}
            </ScrollView>
          </RBSheet>
          <CreateSCCards
            cardClick={() => refRBSheet.current.open()}
            image={state.design_image_url}
            title={
              <LabelInput
                white
                label="Client Details"
                value={` ${state?.customerdata?.["Client Name"] || "NONE"} - ${state?.customerdata?.["Client Mobile No"] || "NONE"
                  }`}
              />
            }
          />
        </>
      ) : (
        <Card data={state} type={data.project_type} />
      )}
    </View>
    </SafeAreaView>
  );
};

export default ClientEstimation;
