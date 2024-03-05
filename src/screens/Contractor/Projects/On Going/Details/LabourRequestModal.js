import { View, Text, StyleSheet, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Modal,
  Portal,
  RadioButton,
  Title,
} from "react-native-paper";

import { Row, Table, TableWrapper } from "react-native-table-component";

import Provider from "../../../../../api/Provider";
import { theme } from "../../../../../theme/apptheme";
import { Styles } from "../../../../../styles/styles";
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
  row: { backgroundColor: "white", minHeight: 50 },
});
const LabourRequest = ({
  open,
  setOpen,
  data,
  Sess_UserRefno,
  Sess_company_refno,
  Sess_branch_refno,
  Sess_CompanyAdmin_UserRefno,
  callback,
  mr,
  setActionType,
  actionType,
  setMr,
}) => {
  const [state, setState] = useState([]);
  const [selected, setSelected] = useState([]);
  const fetchLabourList = () => {
    let params = {
      data: {
        Sess_UserRefno: Sess_UserRefno,
        Sess_company_refno: Sess_company_refno,
        Sess_branch_refno: Sess_branch_refno,
        Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
        cont_project_master_refno: data.cont_project_master_refno,
        ...data,

        ...(mr > -1
          ? { cont_pro_lab_req_refno: mr, actiontype: actionType }
          : {}),
      }
    };
    let url = data.project_type === "3"
      ? Provider.API_URLS.contractor_QW_projects_labourrequest_popup_edit
      : data.project_type === "2"
        ? Provider.API_URLS.contractor_DW_projects_labourrequest_popup_edit
        : data.project_type === "4"
          ? Provider.API_URLS.contractor_BOQ_projects_labourrequest_popup_edit
          : Provider.API_URLS.contractor_GU_projects_labourrequest_popup_edit;

    console.log('url:***********', url, "*=====================*");
    console.log('params:**********', params, "*======================*");

    Provider.createDFContractor(url, params)
      .then((res) => {
        console.log('resp===========:', res.data.data, "=======================");
        if (res.data.data) {
          setState(res.data.data);
          if (res.data.data.checked_employee_user_refnos) {
            setSelected(res.data.data.checked_employee_user_refnos);
        } else {
          setSelected(
            res.data.data.employeedata.map((emp) => emp.employee_user_refno)
          );
          }
        }
      });
  };
  useEffect(() => {
    if (open) {
      fetchLabourList();
    }
  }, [open]);

  const submit = () => {
    let approved = {};
    state.employeedata.map((obj) => {
      if (selected.includes(obj.employee_user_refno)) {
        approved[obj.employee_user_refno] = "1";
      } else {
        approved[obj.employee_user_refno] = "0";
      }
    });
    console.log(approved);
    Provider.createDFContractor(
      data.project_type === "3"
        ? Provider.API_URLS.contractor_QW_projects_labourrequest_popup_update
        : data.project_type === "2"
          ? Provider.API_URLS.contractor_DW_projects_labourrequest_popup_update
          : data.project_type === "4"
            ? Provider.API_URLS.contractor_BOQ_projects_labourrequest_popup_update
            : Provider.API_URLS.contractor_GU_projects_labourrequest_popup_update,
      {
        data: {
          Sess_UserRefno: Sess_UserRefno,
          Sess_company_refno: Sess_company_refno,
          Sess_branch_refno: Sess_branch_refno,
          Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
          cont_project_master_refno: data.cont_project_master_refno,
          ...data,
          employee_user_refno: selected.filter((item) => item !== "none"),
          approve_status: approved,
          ...(mr > -1 ? { cont_pro_lab_req_refno: mr } : {}),
        },
      }
    ).then((res) => {
      console.log(res.data);

      setOpen(false);
      callback();
    });
  };

  return (
    <Portal>
      <Modal
        visible={open}
        onDismiss={() => {
          setState({});
          setSelected([]);
          setOpen(false);
          setMr(-1);
        }}
        contentContainerStyle={{
          backgroundColor: "white",
          padding: 16,
          width: "90%",
          alignSelf: "center",
          height: 500,
          justifyContent: "flex-start",
        }}
      >
        <Title>Select Labour List</Title>

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
                  "S.No",
                  "Labour Name/ Code",
                  "Designation",
                  "Branch",
                  "Action",
                ]}
                widthArr={[
                  70,
                  200,
                  200,
                  150,
                  actionType === "View" ? 200 : 250,
                ]}
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
                  {state.employeedata?.map((obj, index) => {
                    return (
                      <Row
                        key={index}
                        style={styles.row}
                        textStyle={styles.text}
                        data={[
                          index + 1,
                          obj.employee_name + " / " + obj.common_employee_code,
                          obj.designation_name,
                          obj.branch_name,
                          actionType === "View" ? (
                            obj.action_button
                          ) : (
                            <RadioButton.Group
                              onValueChange={(value) => {
                                setSelected((item) => {
                                  item[index] = value;
                                  item = item.filter((item) => item !== null);
                                  return item;
                                });
                              }}
                              value={selected[index]}
                            >
                              <RadioButton.Item
                                position="leading"
                                style={[Styles.paddingVertical2]}
                                labelStyle={[
                                  Styles.textLeft,
                                  Styles.paddingStart4,
                                ]}
                                label={"Approve"}
                                value={obj.employee_user_refno}
                              />
                              <RadioButton.Item
                                position="leading"
                                style={[Styles.paddingVertical2]}
                                labelStyle={[
                                  Styles.textLeft,
                                  Styles.paddingStart4,
                                ]}
                                label="Reject"
                                value={"none"}
                              />
                            </RadioButton.Group>
                          ),
                        ]}
                        widthArr={[
                          70,
                          200,
                          200,
                          150,
                          actionType === "View" ? 200 : 250,
                        ]}
                      />
                    );
                  })}
                </TableWrapper>
              </Table>
            </ScrollView>
          </View>
        </ScrollView>
        {actionType !== "View" && (
          <Button
            disabled={state?.employeedata?.length === 0}
            onPress={submit}
            mode="contained"
            style={{ width: "80%", marginTop: 8, alignSelf: "center" }}
          >
            Submit
          </Button>
        )}
      </Modal>
    </Portal>
  );
};

export default LabourRequest;
