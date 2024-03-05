import { View, Text, ScrollView, SafeAreaView } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import Provider from "../../../../../api/Provider";
import { useState } from "react";
import FormInput from "../../../../Marketing/EmployeeActivity/common/Input";
import { Button } from "react-native-paper";
let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_CompanyAdmin_UserRefno = 0;
const ProjectLocation = ({ index, setIndex, data, unload }) => {
  const [state, setState] = useState({});
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const fetchState = () => {
    return Provider.createDFCommon(Provider.API_URLS.GetStateDetails)
      .then((res) => {
        if (res.data.data) {
          setStates(res.data.data);
          return res.data.data;
        }
      })
      .catch((error) => console.log(error));
  };
  const fetchDistricts = (state_refno) => {
    return Provider.createDFCommon(
      Provider.API_URLS.GetDistrictDetailsByStateRefno,
      {
        data: {
          Sess_UserRefno,
          state_refno,
        },
      }
    )
      .then((res) => {
        if (res.data.data) {
          setDistricts(res.data.data);
          return res.data.data;
        }
      })
      .catch((error) => console.log(error));
  };
  const fetchUserData = async () => {
    const user = JSON.parse(await AsyncStorage.getItem("user"));
    Sess_UserRefno = user.UserID;
    Sess_company_refno = user.Sess_company_refno;
    Sess_branch_refno = user.Sess_branch_refno;
    Sess_CompanyAdmin_UserRefno = user.Sess_CompanyAdmin_UserRefno;
    await fetchState();
    await fetchData();
  };
  const fetchData = () => {
    Provider.createDFContractor(
      data.project_type === "3"
        ? Provider.API_URLS.contractor_QW_projects_locationdata_edit
        : data.project_type === "2"
        ? Provider.API_URLS.contractor_DW_projects_locationdata_edit
        : data.project_type === "4"
        ? Provider.API_URLS.contractor_BOQ_projects_locationdata_edit
        : Provider.API_URLS.contractor_GU_projects_locationdata_edit,
      {
        data: {
          Sess_UserRefno: Sess_UserRefno,
          Sess_company_refno: Sess_company_refno,
          Sess_branch_refno: Sess_branch_refno,
          Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
          ...data,
        },
      }
    )
      .then(async (res) => {
        const region = await fetchState();

        if (Array.isArray(res.data.data)) {
          if (res.data.data[0]) {
            const cities = await fetchDistricts(res.data.data[0]?.state_refno);

            await setState({
              ...res.data.data[0],
              state_refno:
                region.find(
                  (item) => item.state_refno === res.data.data[0].state_refno
                )?.state_name || "",
              district_refno:
                cities.find(
                  (item) =>
                    item.district_refno === res.data.data[0].district_refno
                )?.district_name || "",
            });
          }
        } else {
          if (res.data.data) {
            const cities = await fetchDistricts(res.data.data.state_refno);
            await setState({
              ...res.data.data,
              state_refno:
                region.find(
                  (item) => item.state_refno === res.data.data.state_refno
                )?.state_name || "",
              district_refno:
                cities.find(
                  (item) => item.district_refno === res.data.data.district_refno
                )?.district_name || "",
            });
          }
        }
      })
      .catch((error) => console.log(error));
  };

  const submit = () => {
    Provider.createDFContractor(
      data.project_type === "3"
        ? Provider.API_URLS.contractor_QW_projects_locationdata_update
        : data.project_type === "2"
        ? Provider.API_URLS.contractor_DW_projects_locationdata_update
        : data.project_type === "4"
        ? Provider.API_URLS.contractor_BOQ_projects_locationdata_update
        : Provider.API_URLS.contractor_GU_projects_locationdata_update,
      {
        data: {
          Sess_UserRefno: Sess_UserRefno,
          Sess_company_refno: Sess_company_refno,
          Sess_branch_refno: Sess_branch_refno,
          Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
          ...data,
          ...state,
          state_refno:
            states.find((item) => item.state_name === state.state_refno)
              ?.state_refno || 0,
          district_refno:
            districts.find(
              (item) => item.district_name === state.district_refno
            )?.district_refno || 0,
        },
      }
    ).then((res) => {
      console.log(res.data);
      if (res.data.data.Updated === 1) {
        unload("Location Updated");
      }
    });
  };
  useEffect(() => {
    if (index === 1) {
      fetchUserData();
    }
  }, [index]);
  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <ScrollView>
      <View style={{ padding: 16 }}>
        <FormInput
          label="Project Name"
          value={state.project_name}
          onChangeText={(text) =>
            setState((state) => ({ ...state, project_name: text }))
          }
        />
        <FormInput
          label="Contact Person"
          value={state.contact_person}
          keyboardType={"numeric"}
          onChangeText={(text) =>
            setState((state) => ({ ...state, contact_person: text }))
          }
        />
        <FormInput
          label="Contact Number"
          value={state.contact_mobile_no}
          phone
          keyboardType={"phone-pad"}
          onChangeText={(text) => {
            setState((state) => ({ ...state, contact_mobile_no: text }));
          }}
        />
        <FormInput
          label="Project Description"
          type="textarea"
          onChangeText={(text) =>
            setState((state) => ({ ...state, project_desc: text }))
          }
          value={state.project_desc}
        />
        <FormInput
          label="Project Site Address"
          type="textarea"
          value={state.project_address}
          onChangeText={(text) =>
            setState((state) => ({ ...state, project_address: text }))
          }
        />
        <FormInput
          label="State"
          type="dropdown"
          data={[...states.map((obj) => obj.state_name)]}
          value={state.state_refno}
          onChangeText={(text) => {
            fetchDistricts(
              states.find((item) => item.state_name === text).state_refno
            );
            setState((state) => ({
              ...state,
              state_refno: text,
              district_refno: "",
            }));
          }}
        />
        <FormInput
          label="City"
          type="dropdown"
          data={districts.map((obj) => obj.district_name)}
          value={state.district_refno}
          onChangeText={(text) =>
            setState((state) => ({ ...state, district_refno: text }))
          }
        />
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

export default ProjectLocation;
