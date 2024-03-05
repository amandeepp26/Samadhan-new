import { View, ScrollView, SafeAreaView } from "react-native";
import {
  HelperText,
  Snackbar,
  Subheading,
  TextInput,
  RadioButton,
  Button,
  Text,
} from "react-native-paper";
import {
  AsyncStorage,
  React,
  useRef,
  Styles,
  theme,
  Dropdown,
  Provider,
  useEffect,
  useState,
  communication,
} from "../../../components/CommonImports";
import QuotationTable from "./QuotationTable";
import PriceTable from "./PriceTable";
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import RBSheet from 'react-native-raw-bottom-sheet';

let userID = 0,
  companyID = 0,
  branchID = 0,
  Sess_designation_refno = 0,
  groupID = 0,
  companyAdminID = 0,
  groupExtra = 0;

const AddProductPriceListScreen = ({ route, navigation }) => {
  const [snackbar, setSnackbar] = useState({
    visible: false,
    text: "",
    color: theme.colors.success,
  });
  useEffect(() => {
    GetUserID();
  }, []);

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      companyID = JSON.parse(userData).Sess_company_refno;
      branchID = JSON.parse(userData).Sess_branch_refno;
      groupID = JSON.parse(userData).Sess_group_refno;
      groupExtra = JSON.parse(userData).Sess_group_refno_extra_1;
      companyAdminID = JSON.parse(userData).Sess_CompanyAdmin_UserRefno;
      Sess_designation_refno = JSON.parse(userData).Sess_designation_refno;
    }
    fetchSelectType();
  };
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type_refno: "",
    client_user_refno: "",
    gst_type_refno: "",
    terms: "",
    table: [],
    brand_refno: "",
  });
  const [errorData, setErrorData] = useState({
    type_refno: false,
    client_user_refno: false,
    gst_type_refno: false,
    brand_refno: false,
  });
  const [fullData, setFullData] = useState({
    type_refno: [],
    client_user_refno: [],
    gst_type_refno: [],
    brand_refno: [],
  });

  //#region RBSheet Variables
  const refRBSheet = useRef();

  const [companyData, setCompanyData] = React.useState([]);
  const [companyName, setCompanyName] = React.useState('');
  const [errorCON, setCONError] = React.useState(false);

  const [otherClients, setOtherClients] = React.useState([]);
  const [selectedData, setSelectedData] = React.useState([]);
  const [selectedClient, setSelectedClient] = React.useState('');
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);

  const [mobilenoData, setMobileNoData] = React.useState([]);
  const [mobileno, setMobileNo] = React.useState('');
  const [errorMN, setMNError] = React.useState(false);
  const [rb_clientType, setRB_ClientType] = React.useState('');
  //#endregion

  const fetchSelectType = () => {
    let params = {
      data: { Sess_UserRefno: userID, Sess_company_refno: companyID },
    };
    Provider.createDFDealer(
      Provider.API_URLS.get_quotationpricetype_sendquotationproductpriceform,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setFullData((prev) => ({
              ...prev,
              type_refno: response.data.data,
            }));
          }
        }
      })
      .catch((e) => { });
  };

  const fetchClientNames = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        Sess_group_refno: groupID,
      },
    };
    Provider.createDFDealer(
      Provider.API_URLS.get_clientname_sendquotationproductpriceform,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setFullData((prev) => ({
              ...prev,
              client_user_refno: response.data.data,
            }));
          }
        }
      })
      .catch((e) => { });
  };

  const fetchGSTType = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
      },
    };
    Provider.createDFDealer(
      Provider.API_URLS.get_gsttype_sendquotationproductpriceform,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setFullData((prev) => ({
              ...prev,
              gst_type_refno: response.data.data,
            }));
          }
        }
      })
      .catch((e) => { });
  };

  const fetchBrands = () => {
    Provider.createDFDealer(
      Provider.API_URLS.get_brandname_sendquotationproductpriceform,
      {
        data: {
          Sess_UserRefno: userID,
          Sess_company_refno: companyID,
          Sess_branch_refno: branchID,
          Sess_group_refno: groupID,
          Sess_CompanyAdmin_UserRefno: companyAdminID,
        },
      }
    )
      .then((res) => {
        if (res.data.data)
          setFullData((prev) => ({
            ...prev,
            brand_refno: res.data.data,
          }));
      })
      .catch((error) => console.log(error));
  };

  const fetchProducts = (brand_refno, setProducts, deletetable) => {
    const params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        Sess_group_refno: groupID,
        Sess_CompanyAdmin_UserRefno: companyAdminID,
        type_refno: formData?.type_refno,
        client_user_refno: formData?.client_user_refno,
        gst_type_refno:
          formData?.gst_type_refno === "" ? "0" : formData?.gst_type_refno,
        brand_refno,
      },
    };

    Provider.createDFDealer(
      Provider.API_URLS
        .get_brand_productpricelist_sendquotationproductpriceform,
      params
    )
      .then((res) => {
        
        if (res.data.data && res.data.data.length > 0)
          setProducts(res.data.data[0]);
        else {
          setSnackbar({
            visible: true,
            text: res.data.message,
            color: theme.colors.error,
          });
          if (deletetable) {
            setFormData((prev) => ({ ...prev, table: [] }));
          }
        }
      })
      .catch((e) => {
        setSnackbar({
          visible: true,
          text: "Something went wrong!",
          color: theme.colors.error,
        });
      });
  };

  const resetForm = () => {
    setFormData((prev) => ({
      ...prev,
      gst_type_refno: "",
      brand_refno: "",
      table: [],
    }));
    setErrorData((prev) => ({
      ...prev,
      gst_type_refno: false,
    }));
  };
  const addToList = () => {
    let params = {
      Sess_UserRefno: userID,
      Sess_company_refno: companyID,
      Sess_branch_refno: branchID,
      type_refno: formData.type_refno,
      client_user_refno: formData.client_user_refno,
      terms_condition: formData.terms,
      gst_type_refno: formData.type_refno === 1 ? formData.gst_type_refno : "0",
      product_refno: {},
      product_name: {},
      rate: {},
    };
    if (formData.type_refno === 1) {
      params.item_code = {};
      params.hsn_sac_code = {};
      params.qty = {};
      params.discount_rate = {};
      params.discount_perc = {};
      params.gst_perc = {};
      params.cgst_perc = {};
      params.sgst_perc = {};
      params.amount = {};
      params.brand_refno = {};
      params.subtotal = formData.table
        .reduce((a, obj) => a + Number(obj?.amount ? obj.amount : 0), 0)
        .toFixed(2);
      params.cgsttotal = (params.subtotal * 0.09).toFixed(2);
      params.sgsttotal = params.cgsttotal;
      params.nettotal = (
        Number(params.subtotal * 0.09 * 2) + Number(params.subtotal)
      ).toString();
    } else {
      params.brand_refno = formData.brand_refno;
    }
    formData.table.map((item, index) => {
      params.product_refno[index + 1] = item.product_refno;
      params.product_name[index + 1] = item.product_name;
      if (formData.type_refno === 1) {
        params.rate[index + 1] = item.rate;
        params.brand_refno[index + 1] = item.brand_refno;
        params.item_code[index + 1] = item.item_code;
        params.hsn_sac_code[index + 1] = item.hsn_sac_code;
        params.qty[index + 1] = item.quantity;
        params.discount_rate[index + 1] = (
          item.quantity * item.rate -
          item.amount
        ).toFixed(2);
        params.discount_perc[index + 1] = item.discount_perc;
        params.gst_perc[index + 1] = String(item.gst_perc);
        params.cgst_perc[index + 1] = item.cgst_perc.toString();
        params.sgst_perc[index + 1] = item.sgst_perc.toString();
        params.amount[index + 1] = item.amount;
      } else {
        params.rate[item.product_refno] = item.rate;
      }
    });
    Provider.createDFDealer(
      formData.type_refno === 1
        ? Provider.API_URLS.sendquotationproductpricelist_create
        : Provider.API_URLS.sendproductpricelist_create,
      { data: params }
    )
      .then((res) => {
        
        if (res.data && res.data.data && res.data.data.Created === 1) {
          route.params.fetchData("add");
          navigation.navigate("ProductPriceList");
        } else {
          setLoading(false);
          setSnackbar({
            visible: true,
            text: res.data.message,
            color: theme.colors.error,
          });
        }
      })
      .catch((e) => {
        setLoading(false);
        setSnackbar({
          visible: true,
          text: "Something went wrong!",
          color: theme.colors.error,
        });
      });
  };
  const validateData = () => {
    setLoading(true);
    for (const element of formData.table) {
      if (
        (formData.type_refno === 1 &&
          (element.amount === "" ||
            element.amount === undefined ||
            element.amount === null)) ||
        (formData.type_refno === 2 && element.rate === "")
      ) {
        setSnackbar({
          visible: true,
          text:
            formData.type_refno === 1
              ? "Please fill all rates & quantities in table."
              : "Please fill all rates in table.",
          color: theme.colors.error,
        });
        setLoading(false);
        return;
      }
    }
    addToList();
  };

  //#region RBSheet Functions
  const onCompanyNameSelected = selectedItem => {
    setCompanyName(selectedItem);
    setCONError(false);
    FetchOtherClients(selectedItem, 'company');
  };

  const onMobileNumberSelected = selectedItem => {
    setMobileNo(selectedItem);
    setMNError(false);
    FetchOtherClients(selectedItem, 'mobile');
  };

  const SearchClient = () => {
    setIsButtonDisabled(true);
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        company_name_s: companyName,
        mobile_no_s: mobileno,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.ClientSearch, params)
      .then(response => {
        setIsButtonDisabled(false);
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setOtherClients(response.data.data);
          }
        } else {
          setOtherClients([]);
        }
      })
      .catch(e => {
        setIsButtonDisabled(false);
        setOtherClients([]);
      });
  };

  const InsertOtherClient = selectedID => {
    const params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        client_user_refno: selectedID,
        search_client_role_refnos: ['8'], // for client TBD
      },
    };
    Provider.createDFCommon(Provider.API_URLS.ClientAdd, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          refRBSheet.current.close();
          if (rb_clientType == '2') {
            FetchMKTClientList();
          } else {
            fetchClientNames();
          }
        } else {
          setSnackbarText(communication.InsertError);
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
        }
      })
      .catch(e => {
        console.log(e);
        setSnackbarText(communication.NetworkError);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
      });
  };

  const FetchOtherClients = (selectedItem, type) => {

    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        company_name: selectedItem,
      },
    };
    if (type === 'company') {
      params.data.company_name = selectedItem;
    } else {
      params.data.mobile_no = selectedItem;
    }
    Provider.createDFCommon(
      type === 'company'
        ? Provider.API_URLS.CompanyNameAutocompleteClientSearch
        : Provider.API_URLS.MobileNoAutocompleteClientSearch,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let clientData = [];
            response.data.data.map((data, i) => {
              clientData.push({
                id: i,
                title:
                  type === 'company'
                    ? data.companyname_Result
                    : data.mobile_no_Result,
              });
            });
            if (type === 'company') {
              setCompanyData(clientData);
            } else {
              setMobileNoData(clientData);
            }

          }
        } else {
          setCompanyData([]);
          setMobileNoData([]);
        }
      })
      .catch(e => {
        setCompanyData([]);
        setMobileNoData([]);
      });
  };
  //#endregion

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <ScrollView
        style={[Styles.flex1, Styles.backgroundColor]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            Styles.paddingHorizontal16,
            Styles.paddingTop16,
            Styles.paddingBottom32,
          ]}
        >
          <View>
            <Subheading style={[Styles.marginBottom12]}>
              Select Type *
            </Subheading>
            <RadioButton.Group
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, type_refno: value }));
                setErrorData((state) => ({ ...state, type_refno: false }));
                fullData.client_user_refno.length === 0 && fetchClientNames();
                value === 1 &&
                  fullData.gst_type_refno.length === 0 &&
                  fetchGSTType();
                fullData.brand_refno.length === 0 && fetchBrands();
                resetForm();
              }}
              value={formData.type_refno}
            >
              <View style={{ flexDirection: "row", width: "100%" }}>
                {fullData.type_refno?.map((item, idx) => (
                  <RadioButton.Item
                    disabled={loading}
                    key={idx}
                    position="leading"
                    style={[Styles.paddingVertical2]}
                    labelStyle={[Styles.textLeft, Styles.paddingStart4]}
                    label={item?.type_name}
                    value={item?.type_refno}
                  />
                ))}
              </View>
            </RadioButton.Group>
            <HelperText type="error" visible={errorData.type_refno}>
              Select type correctly.
            </HelperText>
          </View>
          {formData.type_refno !== "" && formData.type_refno && (
            <View style={{ marginBottom: 15 }}>
              <Dropdown
                label="Client Name *"
                data={fullData.client_user_refno.map(
                  (item) => item.company_name
                )}
                onSelected={(_, index) =>
                  setFormData((prev) => ({
                    ...prev,
                    client_user_refno:
                      fullData.client_user_refno[index].client_user_refno,
                  }))
                }
                isError={errorData.client_user_refno}
                selectedItem={
                  fullData.client_user_refno.find(
                    (item) =>
                      item?.client_user_refno === formData?.client_user_refno
                  )?.company_name
                }
                forceDisable={loading}
              />
              <View
                style={[
                  Styles.flexRow,
                  Styles.marginTop4,
                  { justifyContent: 'space-between' },
                ]}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setCompanyName('');
                    setCONError(false);
                    setMobileNo('');
                    setMNError(false);

                    setOtherClients([]);
                    setIsButtonDisabled(false);

                    setMobileNoData([]);
                    setCompanyData([]);
                    setRB_ClientType('1');
                    refRBSheet.current.open();
                  }}>
                  Search & Add
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    navigation.navigate('AddClientScreen', {
                      type: 'expenses_client',
                      data: {
                        serviceType: '8',
                      },
                      fetchClientList: fetchClientNames,
                    });
                  }}>
                  Create New
                </Button>
              </View>
            </View>
          )}
          {formData.type_refno === 1 && (
            <View style={{ marginBottom: 15 }}>
              <Dropdown
                label="GST Type *"
                data={fullData.gst_type_refno.map((item) => item.gst_type_name)}
                onSelected={(_, index) =>
                  setFormData((prev) => ({
                    ...prev,
                    gst_type_refno:
                      fullData.gst_type_refno[index].gst_type_refno,
                  }))
                }
                isError={errorData.gst_type_refno}
                selectedItem={
                  fullData.gst_type_refno.find(
                    (item) => item?.gst_type_refno === formData?.gst_type_refno
                  )?.gst_type_name
                }
                forceDisable={loading}
              />
            </View>
          )}

          {formData.type_refno !== "" && formData.type_refno && (
            <TextInput
              mode="outlined"
              multiline={true}
              label="Terms & Conditions"
              value={formData.terms}
              returnKeyType="done"
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, terms: text }));
              }}
              style={{ backgroundColor: "white" }}
              disabled={loading}
            />
          )}
          {formData.type_refno === 2 && formData.client_user_refno !== "" && (
            <View style={{ marginBottom: 15, marginTop: 15 }}>
              <Dropdown
                forceDisable={loading}
                label="Brand Name *"
                data={fullData.brand_refno.map(
                  (item) => `${item.brand_name} (${item.category_name})`
                )}
                onSelected={(_, index) => {
                  setFormData((prev) => ({
                    ...prev,
                    brand_refno: fullData.brand_refno[index].brand_refno,
                  }));
                  fetchProducts(
                    fullData.brand_refno[index].brand_refno,
                    (data) => {
                      setFormData((prev) => ({
                        ...prev,
                        table: data?.product_data,
                      }));
                    },
                    true
                  );
                }}
                isError={errorData.brand_refno}
                selectedItem={
                  fullData.brand_refno.find(
                    (item) => item?.brand_refno === formData?.brand_refno
                  )?.brand_name
                }
              />
            </View>
          )}

          {formData.type_refno === 1 &&
            formData.client_user_refno !== "" &&
            formData.gst_type_refno !== "" && (
              <QuotationTable
                data={formData.table}
                setData={setFormData}
                brands={fullData.brand_refno}
                fetchProducts={fetchProducts}
                validateData={validateData}
                loading={loading}
              />
            )}

          {formData.type_refno === 2 &&
            formData.client_user_refno !== "" &&
            formData.brand_refno !== "" && (
              <PriceTable
                data={formData.table}
                setData={setFormData}
                validateData={validateData}
                loading={loading}
              />
            )}
        </View>
      </ScrollView>
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        dragFromTopOnly={true}
        height={640}
        animationType="fade"
        customStyles={{
          wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
          draggableIcon: { backgroundColor: '#000' },
        }}>
        <ScrollView
          style={[Styles.flex1, Styles.backgroundColor]}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled>
          <View
            style={[Styles.flex1, Styles.backgroundColor, Styles.padding16, 
            Styles.bordergreen]}>
            <View style={[Styles.flexColumn, Styles.borderred]}>
              <AutocompleteDropdown
                clearOnFocus={false}
                closeOnBlur={true}
                direction="down"
                suggestionsListContainerStyle={{
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                }}
                inputContainerStyle={{
                  backgroundColor: theme.colors.textLight,
                  borderBottomColor: errorCON
                    ? theme.colors.error
                    : theme.colors.textfield,
                  borderBottomWidth: 1,
                }}
                textInputProps={{
                  placeholder: 'Company Name',
                  value: companyName,
                  placeholderTextColor: errorCON
                    ? theme.colors.error
                    : theme.colors.textSecondary,
                  onChangeText: onCompanyNameSelected,
                }}
                renderItem={item => (
                  <View style={[Styles.paddingVertical16]}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        paddingHorizontal: 16,
                      }}>
                      {item ? item.title : ''}
                    </Text>
                  </View>
                )}
                onClear={() => {
                  setIsButtonDisabled(true);
                  setCompanyName('');
                  setCompanyData([]);
                }}
                onSelectItem={item => {
                  if (item) {
                    setIsButtonDisabled(false);
                    setCompanyName(item.title);
                  }
                }}
                dataSet={companyData}
              />
              <HelperText type="error" visible={errorCON}>
                {communication.InvalidClient}
              </HelperText>
              <AutocompleteDropdown
                clearOnFocus={false}
                closeOnBlur={true}
                direction="down"
                suggestionsListContainerStyle={{
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                }}
                inputContainerStyle={{
                  backgroundColor: theme.colors.textLight,
                  borderBottomColor: errorMN
                    ? theme.colors.error
                    : theme.colors.textfield,
                  borderBottomWidth: 1,
                }}
                textInputProps={{
                  keyboardType: 'number-pad',
                  placeholder: 'Mobile No',
                  value: mobileno,
                  placeholderTextColor: errorMN
                    ? theme.colors.error
                    : theme.colors.textSecondary,
                  onChangeText: onMobileNumberSelected,
                }}
                renderItem={item => (
                  <View style={[Styles.paddingVertical8,Styles.borderyellow]}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        paddingHorizontal: 16,
                      }}>
                      {item ? item.title : ''}
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.textSecondary,
                        paddingHorizontal: 16,
                      }}>
                      {item ? item.contact : ''}
                    </Text>
                  </View>
                )}
                onClear={() => {
                  setIsButtonDisabled(true);
                  setMobileNo('');
                  setMobileNoData([]);
                }}
                onSelectItem={item => {
                  if (item) {
                    setIsButtonDisabled(false);
                    setMobileNo(item.title);
                  }
                }}
                dataSet={mobilenoData}
              />
              <HelperText type="error" visible={errorMN}>
                {communication.InvalidClient}
              </HelperText>
            </View>
            <Button
              mode="contained"
              disabled={isButtonDisabled}
              loading={isButtonDisabled}
              style={[Styles.marginTop32, { zIndex: -1 }]}
              onPress={SearchClient}>
              Search
            </Button>
            <View
              style={[Styles.flexColumn, Styles.border1, Styles.marginTop16]}>
              {otherClients &&
                otherClients.map((v, k) => {
                  return (
                    <View
                      style={[
                        Styles.flexRow,
                        Styles.padding16,
                        Styles.flexAlignCenter,
                        Styles.borderBottom1,
                        { justifyContent: 'space-between' },
                      ]}>
                      <View style={[Styles.flexColumn]}>
                        <Text style={{ color: theme.colors.text }}>
                          {v.Search_company_name}
                        </Text>
                        <Text style={{ color: theme.colors.text }}>
                          {v.Search_mobile_no}
                        </Text>
                      </View>
                      <Button
                        mode="contained"
                        disabled={isButtonDisabled}
                        onPress={() => InsertOtherClient(v.Search_user_refno)}>
                        Add
                      </Button>
                    </View>
                  );
                })}
            </View>
          </View>
        </ScrollView>
      </RBSheet>
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() =>
          setSnackbar((prev) => ({
            ...prev,
            visible: false,
          }))
        }
        duration={3000}
        style={{ backgroundColor: snackbar.color }}
      >
        {snackbar.text}
      </Snackbar>
    </View>
    </SafeAreaView>
  );
};
export default AddProductPriceListScreen;
