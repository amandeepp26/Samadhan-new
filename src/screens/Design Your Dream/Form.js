import { View, Text, ScrollView, useWindowDimensions, SafeAreaView } from "react-native";
import { Button, TextInput, HelperText, Snackbar, IconButton, Subheading } from "react-native-paper";
import React, { useState, useEffect, useRef } from "react";
import { Styles } from "../../styles/styles";
import Dropdown from "../../components/Dropdown";
import Provider from "../../api/Provider";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../../theme/apptheme";
import { PaperSelect } from "react-native-paper-select";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import Header from "../../components/Header";
let userID = null;

const DesignyourdreamForm = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const [state, setState] = useState({
    service_refno: [],
    propertycategory_refno: "",
    lengthfoot: "",
    lengthinches: "",
    widthheightfoot: "",
    widthheightinches: "",
    contact_name: "",
    contact_mobile_no: "",
    property_address: "",
    state_refno: "",
    district_refno: "",
    pincode: "",
    totalarea: "",
  });

  const [total, setTotal] = useState("");
  const [invalidTotal, setInvalidTotal] = useState(false);
  const [states, setStates] = useState([]);
  const [district, setDistrict] = useState([]);
  const refs = {
    category: useRef(),
    address: useRef(),
    lengthfeet: useRef(),
    lengthinches: useRef(),
    widhtfeet: useRef(),
    widthinches: useRef(),
    contact_name: useRef(),
    contact_no: useRef(),
    totalarea: useRef(),
  };
  const [errors, setErrors] = useState({
    service_refno: false,
    propertycategory_refno: false,
    lengthfoot: false,
    lengthinches: false,
    widthheightfoot: false,
    widthheightinches: false,
    contact_name: false,
    contact_mobile_no: false,
    property_address: false,
    state_refno: false,
    district_refno: false,
    pincode: false,
    totalarea: false,
  });

  const layout = useWindowDimensions();

  const renderTabBar = (props) => <TabBar {...props} indicatorStyle={{ backgroundColor: "#FFF89A" }}
    style={[Styles.borderTopRadius4, { backgroundColor: theme.colors.primary }]} activeColor={"#F5CB44"} inactiveColor={"#F4F4F4"} />;

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "length", title: "Length / Width" },
    { key: "total", title: "Total Area" },
  ]);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("");
  const [lengthInches, setLengthInches] = useState([]);
  const [lengthFeet, setLengthFeet] = useState([]);

  const [widthInches, setWidthInches] = useState([]);
  const [widthFeet, setWidthFeet] = useState([]);

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [changed, setChanged] = useState(false);
  const GetUserID = async () => {
    const data = await AsyncStorage.getItem("user");
    if (data) {
      userID = JSON.parse(data).UserID;
      fetchLength();
      fetchWidth();
      fetchServices();
      fetchCategories();
      fetchState();
    }
  };
  const fetchDistricts = (state_refno) => {
    Provider.createDFCommon(
      Provider.API_URLS.GetDistrictDetailsByStateRefno,
      {
        data: {
          Sess_UserRefno: userID,
          state_refno: states.find((item) => item.state_name === state_refno)
            .state_refno,
        },
      }
    )
      .then((res) => {
        if (res.data.data) setDistrict(res.data.data);
      })
      .catch((error) => console.log(error));
  };

  const onChange = (text, name) => {
    setState((state) => ({ ...state, [name]: text }));
    setErrors((state) => ({ ...state, [name]: false }));
  };
  const fetchState = () => {
    Provider.createDFCommon(Provider.API_URLS.GetStateDetails)
      .then((res) => {
        if (res.data.data) setStates(res.data.data);
      })
      .catch((error) => console.log(error));
  };

  const onSubmit = () => {
    let errors = false;

    if (
      state.service_refno.length < 1 &&
      route.params.workgiven.group_refno !== 9
    ) {
      errors = true;
      setErrors((state) => ({ ...state, service_refno: true }));
    }
    if (state.propertycategory_refno === "") {
      errors = true;
      setErrors((state) => ({ ...state, propertycategory_refno: true }));
    }
    if (state.property_address === "") {
      errors = true;
      setErrors((state) => ({ ...state, property_address: true }));
    }
    // if (state.lengthfoot === "") {
    //   errors = true;
    //   setErrors((state) => ({ ...state, lengthfoot: true }));
    // }

    if (total === "") {
      errors = true;
      setInvalidTotal(true);
    }

    if (state.contact_name === "") {
      errors = true;
      setErrors((state) => ({ ...state, contact_name: true }));
    }
    if (
      state.contact_mobile_no === "" ||
      state.contact_mobile_no.length !== 10
    ) {
      errors = true;
      setErrors((state) => ({ ...state, contact_mobile_no: true }));
    }
    if (state.state_refno === "") {
      errors = true;
      setErrors((state) => ({ ...state, state_refno: true }));
    }
    if (state.district_refno === "") {
      errors = true;
      setErrors((state) => ({ ...state, district_refno: true }));
    }
    if (state.pincode === "") {
      errors = true;
      setErrors((state) => ({ ...state, pincode: true }));
    }
    if (!errors) {
      const params = {
        data: {
          Sess_UserRefno: userID,
          group_refno: route.params.workgiven.group_refno,
          ...state,
          propertytype_refno: route.params.selectedProperty.propertytype_refno,
          totalfoot: total,
          ...(route.params.workgiven.group_refno !== 9
            ? { service_refno: state.service_refno.map((obj) => obj._id) }
            : {}),
          propertycategory_refno: categories.find(
            (item) =>
              item.propertycategory_name === state.propertycategory_refno
          ).propertycategory_refno,
          state_refno: states.find(
            (item) => item.state_name === state.state_refno
          ).state_refno,
          district_refno: district.find(
            (item) => item.district_name === state.district_refno
          ).district_refno,
          pincode: state.pincode,
        },
      };

      Provider.createDFCommon(
        Provider.API_URLS.designyourdream_enquiry_create,
        params
      )
        .then((res) => {
          if (res.data.data) {
            setState({
              service_refno: [],
              propertycategory_refno: "",
              lengthfoot: "",
              lengthinches: "",
              widthheightfoot: "",
              widthheightinches: "",

              contact_name: "",
              contact_mobile_no: "",
              property_address: "",
            });
            setTotal("");
            setSnackbarText("Form Submitted Successfully");
            setSnackbarColor(theme.colors.greenBorder);
            setSnackbarVisible(true);
            navigation.navigate("HomeScreen");
          } else {
            throw res;
          }
        })
        .catch((error) => {
          console.log(error);
          setSnackbarText("Something Went Wrong...");
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
        });
    } else {
      setSnackbarText("Please fill all the fields");
      setSnackbarColor(theme.colors.error);
      setSnackbarVisible(true);
    }
  };
  useEffect(() => {
    if (
      state.lengthfoot !== "" &&
      state.widthheightfoot !== "" &&
      changed
    ) {
      Provider.createDFCommon(Provider.API_URLS.getsqftcalculation, {
        data: {
          Sess_UserRefno: userID,
          lengthfoot: state.lengthfoot,
          lengthinches: state.lengthinches,
          widthheightfoot: state.widthheightfoot,
          widthheightinches: state.widthheightinches,
        },
      })
        .then((res) => {
          if (res?.data?.data) setTotal(res.data.data[0].totalfoot);
          setChanged(false);
        })
        .catch((error) => console.log(error));
    }
  }, [state, setTotal, userID]);

  useEffect(() => {
    if (isFocused) {
      GetUserID();
    }
  }, [isFocused]);
  const fetchCategories = () => {
    const params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.getpropertycategoryname_designyourdream_enquiryform,
      params
    )
      .then((res) => {
        setCategories(res.data.data);
      })
      .catch((error) => console.log(error));
  };

  const fetchServices = () => {
    const params = {
      data: {
        Sess_UserRefno: userID,
      },
    };

    Provider.createDFCommon(
      Provider.API_URLS.getservicename_designyourdream_enquiryform,
      params
    )
      .then((res) => {
        setServices(res.data.data);
      })
      .catch((error) => console.log(error));
  };

  const fetchLength = () => {

    let lengthFT = [];
    for (let i = 1; i <= 500; i++) {
      lengthFT.push({
        lengthfoot: i
      });
    }
    setLengthFeet(lengthFT);

    Provider.createDFAdmin(Provider.API_URLS.getlengthinches)
      .then((res) => {
        setLengthInches(res.data.data);
      })
      .catch((error) => console.log(error));
  };

  const fetchWidth = () => {

    let widthFT = [];
    for (let i = 1; i <= 500; i++) {
      widthFT.push({
        widthheightfoot: i
      });
    }
    setWidthFeet(widthFT);
    Provider.createDFAdmin(Provider.API_URLS.getwidthheightinches)
      .then((res) => {
        setWidthInches(res.data.data);
      })
      .catch((error) => console.log(error));
  };

  const CreateNumberDropdown = (startCount, endCount) => {
    let arrNumbers = [];
    for (var i = startCount; i <= endCount; i++) {
      arrNumbers.push(i.toString());
    }
    return arrNumbers;
  };

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "length":
        return (
          <View style={[Styles.height250, Styles.border1, Styles.borderBottomRadius4]}>
            <View style={[Styles.flexAlignSelfStart]}>
              <IconButton icon="gesture-swipe-left" color={theme.colors.textfield} size={22} />
            </View>
            <View style={Styles.paddingHorizontal16}>
              <Subheading>Length</Subheading>

              <View style={[Styles.flexRow, Styles.flexAlignCenter]}>
                <View style={[Styles.paddingStart0, Styles.paddingEnd8, Styles.flex5]}>

                  <Dropdown label="Feet" reference={refs.lengthfeet} isError={errors.lengthfoot} data={lengthFeet.map((item) => item.lengthfoot)}
                    onSelected={(e) => {
                      setChanged(true);
                      onChange(e, "lengthfoot");
                      onChange("", "totalarea");
                    }}
                    selectedItem={state.lengthfoot} />
                </View>
                <View style={[Styles.paddingStart8, Styles.paddingEnd0, Styles.flex5]}>
                  <Dropdown label="Inches" reference={refs.lengthinches} isError={errors.lengthinches}
                    data={lengthInches.map((item) => item.lengthinches)}
                    onSelected={(e) => {
                      setChanged(true);
                      onChange(e, "lengthinches");
                      onChange("", "totalarea");
                    }}
                    selectedItem={state.lengthinches} />
                </View>
              </View>
              <Subheading style={[Styles.marginTop32]}>Width / Height</Subheading>
              <View style={[Styles.flexRow, Styles.flexAlignCenter, Styles.marginBottom32]}>
                <View style={[Styles.paddingStart0, Styles.paddingEnd8, Styles.flex5]}>

                  <Dropdown label="Feet" reference={refs.widhtfeet} isError={errors.widthheightfoot}
                    data={widthFeet.map((item) => item.widthheightfoot)}
                    onSelected={(e) => {
                      setChanged(true);
                      onChange(e, "widthheightfoot");
                      onChange("", "totalarea");
                    }} selectedItem={state.widthheightfoot} />
                </View>
                <View style={[Styles.paddingStart8, Styles.paddingEnd0, Styles.flex5]}>

                  <Dropdown label="Inches" reference={refs.widthinches} isError={errors.widthheightinches}
                    data={widthInches.map((item) => item.widthheightinches)}
                    onSelected={(e) => {
                      setChanged(true);
                      onChange(e, "widthheightinches");
                      onChange("", "totalarea");
                    }}
                    selectedItem={state.widthheightinches} />
                </View>
              </View>
            </View>
          </View>
        );
      case "total":
        return (
          <View style={[Styles.height250, Styles.border1, Styles.borderBottomRadius4]}>
            <View style={[Styles.flexAlignSelfEnd]}>
              <IconButton icon="gesture-swipe-right" color={theme.colors.textfield} size={22} />
            </View>
            <View style={Styles.paddingHorizontal16}>
              <Subheading style={[Styles.marginTop16]}>Add Total Area (Sq.Ft)</Subheading>
              <View style={[Styles.flexRow, Styles.flexAlignCenter, Styles.marginBottom32]}>
                <TextInput mode="outlined" keyboardType="number-pad" label="Total Sq.Ft" maxLength={10}
                  value={state.totalarea}
                  returnKeyType="done" dense
                  onChangeText={(e) => {
                    setChanged(true);
                    setState((state) => ({ ...state, ["lengthfoot"]: "" }));
                    setState((state) => ({ ...state, ["lengthinches"]: "" }));
                    setState((state) => ({ ...state, ["widthheightfoot"]: "" }));
                    setState((state) => ({ ...state, ["widthheightinches"]: "" }));
                    onChange(e, "totalarea");
                    setTotal(e);
                  }}
                  style={[Styles.width50per, { backgroundColor: "white" }]} />
              </View>
            </View>
          </View>
        );

      default:
        return <View />;
    }
  };

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1, Styles.backgroundColor]}>
      <Header navigation={navigation} title='Property Details' />
      <ScrollView style={[Styles.flex1]} keyboardShouldPersistTaps="handled">
        <View style={[Styles.padding16]}>
          <TextInput
            mode="outlined"
            label="Property Type"
            disabled={true}
            value={route.params.selectedProperty.propertytype_name}
            returnKeyType="next"
            style={{ backgroundColor: "white" }}
          />

          <TextInput
            mode="outlined"
            label="Work Given To"
            disabled={true}
            value={route.params.workgiven.group_name}
            returnKeyType="next"
            style={[Styles.marginTop16,{ backgroundColor: "white" }]}
          />
          {/* <MultiSelect /> */}
          {route.params.workgiven.group_refno !== 9 && (
            <PaperSelect
              multiEnable={true}
              label="Services"
              textInputMode="flat"
              underlineColor={
                errors.service_refno ? theme.colors.error : "black"
              }
              errorStyle={{ color: theme.colors.error }}
              value={state.service_refno?.map((item) => item.value).join(",")}
              arrayList={services?.map((obj) => {
                return { _id: obj.service_refno, value: obj.service_name };
              })}
              selectAllEnable={false}
              selectedItem={state.service_refno}
              selectedArrayList={state.service_refno}
              hideSearchBox={true}
              errorText={errors.service_refno ? "Please Select a service" : ""}
              onSelection={(e) => {
                onChange(e.selectedList, "service_refno");
              }}
            />
          )}

          <View style={[Styles.marginTop16]}>
          <Dropdown
            data={categories?.map((item) => {
              return item.propertycategory_name;
            })}
            selectedItem={state.propertycategory_refno}
            value={state.propertycategory_refno}
            isError={errors.propertycategory_refno}
            reference={refs.category}
            label="Property Category"
            onSelected={(e) => onChange(e, "propertycategory_refno")}
          />
          <HelperText type="error" visible={errors.propertycategory_refno}>
            Please Select a property category
          </HelperText>
          </View>
          

          {/* <View style={[Styles.width100per, Styles.flexRow]}>
            <View style={[Styles.width50per]}>
              <Dropdown
                label="Length (in feet)"
                reference={refs.lengthfeet}
                data={lengthFeet.map((item) => item.lengthfoot)}
                selectedItem={state.lengthfoot}
                isError={errors.lengthfoot}
                onSelected={(e) => {
                  setChanged(true);
                  onChange(e, "lengthfoot");
                }}
              />
              <HelperText type="error" visible={errors.lengthfoot}>
                Please Select a length{" "}
              </HelperText>
            </View>
            <View style={[Styles.width50per]}>
              <Dropdown
                label="Length (in inches)"
                reference={refs.lengthinches}
                isError={errors.lengthinches}
                selectedItem={state.lengthinches}
                onSelected={(e) => {
                  setChanged(true);
                  onChange(e, "lengthinches");
                }}
                data={lengthInches.map((item) => item.lengthinches)}
              />
              <HelperText type="error" visible={errors.lengthinches}>
                Please Select a length{" "}
              </HelperText>
            </View>
          </View>

          <View style={[Styles.width100per, Styles.flexRow]}>
            <View style={[Styles.width50per]}>
              <Dropdown
                label="Width/Height (in feet)"
                reference={refs.widhtfeet}
                isError={errors.widthheightfoot}
                selectedItem={state.widthheightfoot}
                onSelected={(e) => {
                  setChanged(true);
                  onChange(e, "widthheightfoot");
                }}
                data={widthFeet.map((item) => item.widthheightfoot)}
              />
              <HelperText type="error" visible={errors.widthheightfoot}>
                Please Select a width
              </HelperText>
            </View>
            <View style={[Styles.width50per]}>
              <Dropdown
                label="Width/height (in inches)"
                reference={refs.widthinches}
                selectedItem={state.widthheightinches}
                isError={errors.widthheightinches}
                onSelected={(e) => {
                  setChanged(true);
                  onChange(e, "widthheightinches");
                }}
                data={widthInches.map((item) => item.widthheightinches)}
              />
              <HelperText type="error" visible={errors.widthheightinches}>
                Please Select a width
              </HelperText>
            </View>
          </View> */}
          <View style={[Styles.height325]}>
            <TabView renderTabBar={renderTabBar} navigationState={{ index, routes }} renderScene={renderScene} onIndexChange={setIndex} initialLayout={{ width: layout.width }} />
          </View>

          <TextInput
            mode="outlined"
            label="Total (Sq.ft)"
            disabled={true}
            returnKeyType="next"
            isError={invalidTotal}
            value={total}
            ref={refs.totalfoot}
            helper
            onSubmitEditing={() => refs.contact_name.current.focus()}
            style={{ backgroundColor: "white" }}
          />
          <HelperText type="error" visible={invalidTotal}>
            Please select valid length/width OR enter area
          </HelperText>

          <TextInput
            mode="outlined"
            label="Contact Name"
            returnKeyType="next"
            isError={errors.contact_mobile_no}
            style={[{ backgroundColor: "white" }]}
            ref={refs.contact_name}
            value={state.contact_name}
            error={errors.contact_name}
            onChangeText={(e) => onChange(e, "contact_name")}
            onSubmitEditing={() => refs.contact_no.current.focus()}
          />
          <HelperText type="error" visible={errors.contact_name}>
            Please enter the contact name
          </HelperText>
          <TextInput
            mode="outlined"
            ref={refs.contact_no}
            label="Contact Number"
            maxLength={10}
            keyboardType="phone-pad"
            error={errors.contact_mobile_no}
            returnKeyType="next"
            value={state.contact_mobile_no}
            onChangeText={(e) => {
              if (e.length < 11) onChange(e, "contact_mobile_no");
            }}
            style={{ backgroundColor: "white" }}
          />
          <HelperText type="error" visible={errors.contact_mobile_no}>
            Please enter the contact number
          </HelperText>
          <TextInput
            mode="outlined"
            label="Property Address"
            multiline={true}
            value={state.property_address}
            error={errors.property_address}
            onChangeText={(e) => onChange(e, "property_address")}
            reference={refs.address}
            returnKeyType="next"
            style={{ backgroundColor: "white" }}
          />
          <HelperText type="error" visible={errors.property_address}>
            Please enter address
          </HelperText>
          <Dropdown
            data={states?.map((item) => {
              return item.state_name;
            })}
            selectedItem={state.state_refno}
            value={state.state_refno}
            isError={errors.state_refno}
            label="State"
            onSelected={(e) => {
              onChange(e, "state_refno");
              fetchDistricts(e);
              setState((state) => ({
                ...state,
                district_refno: "",
              }));
            }}
          />
          <HelperText type="error" visible={errors.state_refno}>
            Please Select a state
          </HelperText>
          <Dropdown
            data={district?.map((item) => {
              return item.district_name;
            })}
            selectedItem={state.district_refno}
            value={state.district_refno}
            isError={errors.district_refno}
            label="District"
            onSelected={(e) => {
              onChange(e, "district_refno");
            }}
          />
          <HelperText type="error" visible={errors.district_refno}>
            Please Select a district
          </HelperText>
          <TextInput
            mode="outlined"
            label="Pincode"
            maxLength={6}
            keyboardType="number-pad"
            multiline={false}
            value={state.pincode}
            error={errors.pincode}
            onChangeText={(e) => onChange(e, "pincode")}
            reference={refs.address}
            returnKeyType="next"
            style={{ backgroundColor: "white" }}
          />
          <HelperText type="error" visible={errors.pincode}>
            Please enter a pincode
          </HelperText>
          <Button
            mode="contained"
            onPress={onSubmit}
            style={[Styles.width100per, { alignSelf: "center", marginTop: 20 }]}
          >
            Submit
          </Button>
        </View>
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: snackbarColor }}
      >
        {snackbarText}
      </Snackbar>
    </View>
    </SafeAreaView>
  );
};

export default DesignyourdreamForm;
