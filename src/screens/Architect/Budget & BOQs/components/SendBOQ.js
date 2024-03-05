import { View, Text, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Modal,
  Portal,
  TextInput,
} from "react-native-paper";
import { Styles } from "../../../../styles/styles";
import { theme } from "../../../../theme/apptheme";
import Provider from "../../../../api/Provider";

const SendBOQ = ({
  open,
  unload,
  setOpen,
  Sess_UserRefno,
  Sess_company_refno,
  Sess_branch_refno,
  Sess_group_refno,
  Sess_CompanyAdmin_UserRefno,
  budget_refno,
  boq_no,
  service_refno,
}) => {
  const [contractor, setContractor] = useState([]);
  const [state, setState] = useState({
    contractor_user_refno: [],
    remarks: "",
  });

  const fetchContractors = () => {
    console.log({
      data: {
        Sess_UserRefno,
        budget_refno,
        boq_no,
        service_refno: service_refno,
      },
    });
    Provider.createDFArchitect(
      Provider.API_URLS.getcontractorlist_architect_boq_popup_sendform,
      {
        data: {
          Sess_UserRefno,
          budget_refno,
          boq_no,
          service_refno: service_refno,
        },
      }
    ).then((res) => {
      setContractor(res.data.data);
    });
  };

  const sendBOQ = () => {
    Provider.createDFArchitect(Provider.API_URLS.architect_boq_send, {
      data: {
        Sess_UserRefno,
        Sess_company_refno,
        Sess_branch_refno,
        Sess_CompanyAdmin_UserRefno,
        budget_refno,
        boq_no,
        ...state,
      },
    }).then((res) => {
      console.log(res.data);
      unload("BOQ sent Successfully");
      setOpen(false);
    });
  };

  useEffect(() => {
    if (open) {
      fetchContractors();
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
        }}
      >
        <Text style={[Styles.fontSize20, Styles.fontBold, Styles.primaryColor]}>
          Send BOQ
        </Text>
        <Text>Contractor List</Text>
        <ScrollView style={{ marginBottom: 10 }}>
          <Checkbox.Item
            label="Check All"
            color={theme.colors.primary}
            position="leading"
            labelStyle={{ textAlign: "left", paddingLeft: 8 }}
            status={
              state.contractor_user_refno.length === contractor.length
                ? "checked"
                : "unchecked"
            }
            onPress={() => {
              if (state.contractor_user_refno.length < contractor.length) {
                setState((state) => {
                  return {
                    ...state,
                    contractor_user_refno: contractor.map(
                      (obj) => obj.contractor_user_refno
                    ),
                  };
                });
              } else {
                setState((state) => ({ ...state, contractor_user_refno: [] }));
              }
            }}
          />
          {contractor.map((obj) => (
            <Checkbox.Item
              key={obj.contractor_company_name}
              label={obj.contractor_company_name}
              color={theme.colors.primary}
              position="leading"
              labelStyle={{ textAlign: "left", paddingLeft: 8 }}
              status={
                state.contractor_user_refno.includes(obj.contractor_user_refno)
                  ? "checked"
                  : "unchecked"
              }
              onPress={() => {
                if (
                  state.contractor_user_refno.includes(
                    obj.contractor_user_refno
                  )
                ) {
                  setState((state) => {
                    return {
                      ...state,
                      contractor_user_refno: state.contractor_user_refno.filter(
                        (item) => item !== obj.contractor_user_refno
                      ),
                    };
                  });
                } else {
                  setState((state) => ({
                    ...state,
                    contractor_user_refno: [
                      ...state.contractor_user_refno,
                      obj.contractor_user_refno,
                    ],
                  }));
                }
              }}
            />
          ))}
          {/* fixed */}
          <TextInput
            onChangeText={(text) =>
              setState((state) => ({ ...state, remarks: text }))
            }
            value={state.remarks}
            label="Remarks/Notes"
            multiline={true}
            numberOfLines={3}
          />
          <Button
            onPress={sendBOQ}
            disabled={state.contractor_user_refno.length === 0}
            mode="contained"
            style={{ marginTop: 10 }}
          >
            Submit
          </Button>
          {/* fixed */}
        </ScrollView>
      </Modal>
    </Portal>
  );
};

export default SendBOQ;
