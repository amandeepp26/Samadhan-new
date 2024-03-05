import React, {useEffect, useRef} from 'react';
import {ScrollView, View,TextInput, SafeAreaView} from 'react-native';
import {
  Card,
  Checkbox,
  HelperText,
  Snackbar,
  Subheading,
  Text,
} from 'react-native-paper';
import Provider from '../../../../api/Provider';
import Dropdown from '../../../../components/Dropdown';
import {Styles} from '../../../../styles/styles';
import {theme} from '../../../../theme/apptheme';
import {APIConverter} from '../../../../utils/apiconverter';
import {communication} from '../../../../utils/communication';
import DFButton from '../../../../components/Button';
import ButtonComponent from '../../../../components/Button';
import Header from '../../../../components/Header';

const AddCategoryScreen = ({route, navigation}) => {
  //#region Variables

  const [activityFullData, setActivityFullData] = React.useState([]);
  const [activityData, setActivityData] = React.useState([]);
  const [acivityName, setActivityName] = React.useState(
    route.params.type === 'edit' ? route.params.data.activityRoleName : '',
  );
  const [errorAN, setANError] = React.useState(false);

  const [servicesFullData, setServicesFullData] = React.useState([]);
  const [servicesData, setServicesData] = React.useState([]);
  const [serviceName, setServiceName] = React.useState(
    route.params.type === 'edit' ? route.params.data.serviceName : '',
  );
  const [errorSN, setSNError] = React.useState(false);

  const [unitOfSalesData, setUnitOfSalesData] = React.useState([]);
  const [unitOfSalesName, setUnitOfSalesName] = React.useState(
    route.params.type === 'edit' ? route.params.data.unitName : '',
  );
  const [errorUN, setUNError] = React.useState(false);

  const [error, setError] = React.useState(false);
  const [name, setName] = React.useState(
    route.params.type === 'edit' ? route.params.data.categoryName : '',
  );

  const [hsnError, setHSNError] = React.useState(false);
  const [hsn, setHSN] = React.useState(
    route.params.type === 'edit' ? route.params.data.hsnsacCode : '',
  );

  const [gstError, setGSTError] = React.useState(false);
  const [gst, setGST] = React.useState(
    route.params.type === 'edit' ? route.params.data.gstRate.toString() : '',
  );

  const [checked, setChecked] = React.useState(
    route.params.type === 'edit' ? route.params.data.display : true,
  );

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState('');

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);

  const ref_input2 = useRef();
  const ref_input3 = useRef();
  //#endregion

  //#region Functions
  const FetchActvityRoles = () => {
    Provider.createDFAdmin(Provider.API_URLS.ActivityRoleCategory)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setActivityFullData(response.data.data);
            const activities = response.data.data.map(
              data => data.activityRoleName,
            );
            setActivityData(activities);
          }
        }
      })
      .catch(e => {});
  };

  const FetchServices = () => {
    let params = {
      data: {
        Sess_UserRefno: '2',
        service_refno: 'all',
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.ServiceFromRefNo, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setServicesFullData(response.data.data);
            const services = response.data.data.map(data => data.serviceName);
            setServicesData(services);
          }
        }
      })
      .catch(e => {});
  };

  const FetchUnitOfSales = () => {
    let params = {
      data: {
        Sess_UserRefno: '2',
        unit_category_refno: 'all',
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.UnitCategoryFromRefNo, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            let allUnits = '';
            if (route.params.type === 'edit') {
              const arrunitOfSalesNameNew = [];
              route.params.data.unitOfSalesID.map(o => {
                const objTemp = response.data.data.find(el => {
                  return o.trim() === el.id;
                });
                if (objTemp) {
                  arrunitOfSalesNameNew.push(objTemp.id);
                }
              });
              allUnits =
                arrunitOfSalesNameNew.length > 0
                  ? arrunitOfSalesNameNew.join(',')
                  : '';
            }

            const unitofsales = response.data.data.map(o => ({
              ...o,
              isChecked:
                allUnits !== ''
                  ? allUnits.split(',').indexOf(o.id.toString()) !== -1
                  : false,
            }));

            setUnitOfSalesData(unitofsales);
          }
        }
      })
      .catch(e => {});
  };

  useEffect(() => {
    FetchActvityRoles();
    FetchServices();
    FetchUnitOfSales();
  }, []);

  const onActivityNameSelected = selectedItem => {
    setActivityName(selectedItem);
    setANError(false);
  };

  const onServiceNameSelected = selectedItem => {
    setServiceName(selectedItem);
    setSNError(false);
  };

  const onNameChanged = text => {
    setName(text);
    setError(false);
  };

  const onHSNChanged = text => {
    setHSN(text);
    setHSNError(false);
  };

  const onGSTChanged = text => {
    setGST(text);
    setGSTError(false);
  };

  const InsertData = () => {
    let arrUnits = [];
    unitOfSalesData.map(o => {
      if (o.isChecked) {
        arrUnits.push(parseInt(o.id));
      }
    });
    const params = {
      data: {
        Sess_UserRefno: '2',
        category_name: name,
        group_refno: activityFullData.find(el => {
          return el.activityRoleName === acivityName;
        }).id,
        service_refno: servicesFullData.find(el => {
          return el.serviceName === serviceName;
        }).id,
        hsn_sac_code: hsn,
        gst_rate: parseFloat(gst).toFixed(2),
        unit_category_refno: arrUnits,
        view_status: checked ? 1 : 0,
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.CategoryNameCreate, params)
      .then(response => {
        setIsButtonLoading(false);
        if (response.data && response.data.code === 200) {
          route.params.fetchData('add');
          navigation.goBack();
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.InsertError);
          setSnackbarVisible(true);
        }
      })
      .catch(e => {
        console.log(e);
        setIsButtonLoading(false);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const UpdateData = () => {
    let arrUnits = [];
    unitOfSalesData.map(o => {
      if (o.isChecked) {
        arrUnits.push(o.id);
      }
    });
    const params = {
      data: {
        Sess_UserRefno: '2',
        category_refno: route.params.data.id,
        category_name: name,
        group_refno: activityFullData.find(el => {
          return el.activityRoleName === acivityName;
        }).id,
        service_refno: servicesFullData.find(el => {
          return el.serviceName === serviceName;
        }).id,
        hsn_sac_code: hsn,
        gst_rate: parseFloat(gst).toFixed(2),
        unit_category_refno: arrUnits,
        view_status: checked ? 1 : 0,
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.CategoryNameUpdate, params)
      .then(response => {
        setIsButtonLoading(false);
        if (response.data && response.data.code === 200) {
          route.params.fetchData('update');
          navigation.goBack();
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.UpdateError);
          setSnackbarVisible(true);
        }
      })
      .catch(e => {
        console.log(e);
        setIsButtonLoading(false);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const ValidateData = () => {
    let isValid = true;
    if (name.length === 0) {
      setError(true);
      isValid = false;
    }
    const objActivities = activityFullData.find(el => {
      return el.activityRoleName && el.activityRoleName === acivityName;
    });
    if (acivityName.length === 0 || !objActivities) {
      setANError(true);
      isValid = false;
    }
    const objServices = servicesFullData.find(el => {
      return el.serviceName && el.serviceName === serviceName;
    });
    if (serviceName.length === 0 || !objServices) {
      setSNError(true);
      isValid = false;
    }
    if (hsn.length === 0) {
      setHSNError(true);
      isValid = false;
    }
    if (gst.length === 0) {
      setGSTError(true);
      isValid = false;
    }
    const objUnitOfSales = unitOfSalesData.find(el => {
      return el.isChecked;
    });
    if (!objUnitOfSales) {
      setUNError(true);
      isValid = false;
    }
    if (isValid) {
      setIsButtonLoading(true);
      if (route.params.type === 'edit') {
        UpdateData();
      } else {
        InsertData();
      }
    }
  };
  //#endregion

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Add Category" />
      <ScrollView
        style={[Styles.flex1, Styles.backgroundColor, {marginBottom: 64}]}
        keyboardShouldPersistTaps="handled">
        <View style={[Styles.padding16]}>
          <Dropdown
            label="Activity Name"
            data={activityData}
            onSelected={onActivityNameSelected}
            isError={errorAN}
            selectedItem={acivityName}
          />
          <HelperText type="error" visible={errorAN}>
            {communication.InvalidActivityName}
          </HelperText>
          <Dropdown
            label="Service Name"
            data={servicesData}
            onSelected={onServiceNameSelected}
            isError={errorSN}
            selectedItem={serviceName}
          />
          <HelperText type="error" visible={errorSN}>
            {communication.InvalidServiceName}
          </HelperText>
          <TextInput
            underlineColor="transparent"
            placeholderTextColor={theme.colors.textColorDark}
            style={[Styles.textinput, {marginTop: 5, width: '100%'}]}
            dense
            placeholder="Category Name"
            value={name}
            returnKeyType="next"
            onSubmitEditing={() => ref_input2.current.focus()}
            onChangeText={onNameChanged}
            error={error}
          />
          <HelperText type="error" visible={error}>
            {communication.InvalidCategoryName}
          </HelperText>
          <TextInput
            ref={ref_input2}
            underlineColor="transparent"
            placeholderTextColor={theme.colors.textColorDark}
            style={[Styles.textinput, {marginTop: 5, width: '100%'}]}
            dense
            placeholder="HSN / SAC Code"
            value={hsn}
            returnKeyType="next"
            onSubmitEditing={() => ref_input3.current.focus()}
            onChangeText={onHSNChanged}
            error={hsnError}
          />
          <HelperText type="error" visible={hsnError}>
            {communication.InvalidHSNSAC}
          </HelperText>
          <TextInput
            ref={ref_input3}
            underlineColor="transparent"
            placeholderTextColor={theme.colors.textColorDark}
            style={[Styles.textinput, {marginTop: 5,width:'100%'}]}
            dense
            placeholder="GST Rate"
            maxLength={15}
            value={gst}
            returnKeyType="done"
            keyboardType="decimal-pad"
            onChangeText={onGSTChanged}
            error={gstError}
          />
          <HelperText type="error" visible={gstError}>
            {communication.InvalidGSTRate}
          </HelperText>
          <Subheading style={{paddingTop: 24, fontWeight: 'bold'}}>
            Unit of Sales
          </Subheading>
          <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
            {unitOfSalesData.map((k, i) => {
              return (
                <Checkbox.Item
                  key={i}
                  label={k.displayUnit}
                  position="leading"
                  style={{paddingHorizontal: 2}}
                  labelStyle={{textAlign: 'left', paddingLeft: 8}}
                  color={theme.colors.primary}
                  status={k.isChecked ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setUNError(false);
                    let temp = unitOfSalesData.map(u => {
                      if (k.id === u.id) {
                        return {...u, isChecked: !u.isChecked};
                      }
                      return u;
                    });
                    setUnitOfSalesData(temp);
                  }}
                />
              );
            })}
            <HelperText type="error" visible={errorUN}>
              {communication.InvalidUnitName}
            </HelperText>
          </View>
          <View style={{width: 160}}>
            <Checkbox.Item
              label="Display"
              position="leading"
              style={{paddingHorizontal: 2}}
              labelStyle={{textAlign: 'left', paddingLeft: 8}}
              color={theme.colors.primary}
              status={checked ? 'checked' : 'unchecked'}
              onPress={() => {
                setChecked(!checked);
              }}
            />
          </View>
        </View>
      </ScrollView>
      <View
        style={[
          Styles.backgroundColor,
          Styles.width100per,
          Styles.marginTop32,
          Styles.padding16,
          {position: 'absolute', bottom: 0, elevation: 3},
        ]}>
        <Card.Content>
          <Card.Content>
            <ButtonComponent
              mode="contained"
              onPress={ValidateData}
              text="SAVE"
              loader={isButtonLoading}
            />
          </Card.Content>
        </Card.Content>
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: theme.colors.error}}>
        {snackbarText}
      </Snackbar>
    </View>
    </SafeAreaView>
  );
};

export default AddCategoryScreen;
