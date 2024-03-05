import React, {useEffect, useId, useRef} from 'react';
import FormData from 'form-data';
import {Image, Platform, SafeAreaView, ScrollView, View} from 'react-native';
import {
  Card,
  Checkbox,
  HelperText,
  Snackbar,
  TextInput,
  Button,
} from 'react-native-paper';
import Provider from '../../../../api/Provider';
import Dropdown from '../../../../components/Dropdown';
import {Styles} from '../../../../styles/styles';
import {theme} from '../../../../theme/apptheme';
import {communication} from '../../../../utils/communication';
import * as ImagePicker from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import {AWSImagePath} from '../../../../utils/paths';
import {APIConverter} from '../../../../utils/apiconverter';
import DFButton from '../../../../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonComponent from '../../../../components/Button';
import Header from '../../../../components/Header';

let userID = 0,
  groupID = 0;
const AddDesignTypeScreen = ({route, navigation}) => {
  //#region Variables
  const [activityFullData, setActivityFullData] = React.useState([]);
  const [activityID, setActivityID] = React.useState('');

  const [servicesFullData, setServicesFullData] = React.useState([]);
  const [servicesData, setServicesData] = React.useState([]);
  const [serviceName, setServiceName] = React.useState(
    route.params.type === 'edit' ? route.params.data.serviceName : '',
  );
  const [errorSN, setSNError] = React.useState(false);
  const servicesDDRef = useRef({});

  const [categoriesFullData, setCategoriesFullData] = React.useState([]);
  const [categoriesData, setCategoriesData] = React.useState([]);
  const [categoriesName, setCategoriesName] = React.useState(
    route.params.type === 'edit' ? route.params.data.categoryName : '',
  );
  const [errorCN, setCNError] = React.useState(false);
  const categoriesDDRef = useRef({});

  const [productsFullData, setProductsFullData] = React.useState([]);
  const [productsData, setProductsData] = React.useState([]);
  const [productsName, setProductsName] = React.useState(
    route.params.type === 'edit'
      ? route.params.data.productName === null
        ? ''
        : route.params.data.productName
      : '',
  );
  const [errorPN, setPNError] = React.useState(false);
  const productsDDRef = useRef({});

  const [DTFullData, setDTFullData] = React.useState([]);
  const [DTData, setDTData] = React.useState([]);
  const [DTName, setDTName] = React.useState(
    route.params.type === 'edit'
      ? route.params.data.productName === null
        ? ''
        : route.params.data.productName
      : '',
  );
  const [errorDT, setDTError] = React.useState(false);
  const DTDDRef = useRef({});

  const [displayName, setDisplayName] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [name, setName] = React.useState(
    route.params.type === 'edit' ? route.params.data.designTypeName : '',
  );

  const [checked, setChecked] = React.useState(
    route.params.type === 'edit' ? route.params.data.display : true,
  );
  const [designImage, setDesignImage] = React.useState(
    route.params.type === 'edit' ? route.params.data.designImage : '',
  );

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState('');
  const [image, setImage] = React.useState(
    route.params.type === 'edit'
      ? route.params.data.designImage
      : AWSImagePath + 'placeholder-image.png',
  );
  const [filePath, setFilePath] = React.useState(
    route.params.type === 'edit' ? {name: route.params.data.designImage} : null,
  );
  const [errorDI, setDIError] = React.useState(false);

  const [isImageReplaced, setIsImageReplaced] = React.useState(false);
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);

  const [specification, setSpecification] = React.useState(
    route.params.type === 'edit' ? route.params.data.specification : '',
  );
  const [errorSpec, setErrorSpec] = React.useState(false);
  //#endregion

  //#region Functions

  const FetchActvityRoles = () => {
    Provider.createDFAdmin(Provider.API_URLS.ActivityRolesDesignType)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setActivityFullData(response.data.data);
            if (route.params.type !== 'edit') {
              servicesDDRef.current.reset();
              setName('');
              setServiceName('');
              setProductsName('');
              setCategoriesName('');
              setCategoriesData([]);
              setServicesData([]);
              setDTData([]);
              setProductsData([]);
              setImage(AWSImagePath + 'placeholder-image.png');
              setFilePath(null);
            }
            setActivityID(response.data.data[0].id);
            FetchServicesFromActivity(response.data.data[0].id);
            FetchDesignTypeNames();
          }
        }
      })
      .catch(e => {});
  };

  const FetchDesignTypeNames = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
      },
    };
    Provider.createDFAdmin(
      Provider.API_URLS.getproductdesigntypename_designtypeform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setDTFullData(response.data.data);

            const designType = response.data.data.map(
              data => data.designtype_name,
            );
            setDTData(designType);

            if (route.params.type === 'edit') {
              setDTName(
                response.data.data.find(el => {
                  return (
                    el.designtype_name_refno ===
                    route.params.data.designtype_name_refno
                  );
                }).designtype_name,
              );
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchServicesFromActivity = actID => {
    let params = {
      data: {
        Sess_UserRefno: '2',
        group_refno: actID,
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.ServiceNameDesignType, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setServicesFullData(response.data.data);
            if (route.params.type === 'edit') {
              FetchCategoriesFromServices(
                route.params.data.serviceName,
                response.data.data,
                actID,
              );
            }
            const services = response.data.data.map(data => data.serviceName);
            setServicesData(services);
          }
        }
      })
      .catch(e => {});
  };

  const FetchCategoriesFromServices = (
    selectedItem,
    servicesDataParam,
    actID,
  ) => {
    let params = {
      data: {
        Sess_UserRefno: '2',
        group_refno: actID ? actID : activityID,
        service_refno: servicesDataParam
          ? servicesDataParam.find(el => {
              return el.serviceName === selectedItem;
            }).id
          : servicesFullData.find(el => {
              return el.serviceName === selectedItem;
            }).id,
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.CategoryNameDesignType, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setCategoriesFullData(response.data.data);
            if (route.params.type === 'edit') {
              FetchProductsFromCategory(
                route.params.data.categoryName,
                response.data.data,
                actID,
              );
            }
            const categories = response.data.data.map(
              data => data.categoryName,
            );
            setCategoriesData(categories);
          }
        }
      })
      .catch(e => {});
  };

  const FetchProductsFromCategory = (
    selectedItem,
    categoriesDataParam,
    actID,
  ) => {
    let params = {
      data: {
        Sess_UserRefno: '2',
        group_refno: actID ? actID : activityID,
        category_refno: categoriesDataParam
          ? categoriesDataParam.find(el => {
              return el.categoryName === selectedItem;
            }).id
          : categoriesFullData.find(el => {
              return el.categoryName === selectedItem;
            }).id,
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.ProductNameDesignType, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setProductsFullData(response.data.data);
            const products = response.data.data.map(data => data.productName);
            setProductsData(products);
          }
        }
      })
      .catch(e => {});
  };

  useEffect(() => {
    GetUserID();
  }, []);

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      groupID = JSON.parse(userData).Sess_group_refno;

      let isEdit = route.params.type === 'edit' ? true : false;
      FetchActvityRoles();
    }
  };

  const onServiceNameSelected = selectedItem => {
    setServiceName(selectedItem);
    categoriesDDRef.current.reset();
    setCategoriesData([]);
    setProductsData([]);
    setCategoriesName('');
    setProductsName('');
    setSNError(false);
    FetchCategoriesFromServices(selectedItem);
  };

  const onCategoriesNameSelected = selectedItem => {
    setCategoriesName(selectedItem);
    productsDDRef.current.reset();
    setCNError(false);
    setProductsData([]);
    setProductsName('');
    FetchProductsFromCategory(selectedItem);
  };

  const onProductsNameSelected = selectedItem => {
    setProductsName(selectedItem);
    setPNError(false);
  };

  const onDTNameSelected = selectedItem => {
    let DT = DTFullData.find(el => {
      return el.designtype_name === selectedItem;
    }).designtype_name_refno;

    if (DT === 'ADDNEW') {
      setDisplayName(true);
    } else {
      setDisplayName(false);
    }

    setDTName(selectedItem);
    setDTError(false);
  };

  const onNameChanged = text => {
    setName(text);
    setError(false);
  };

  const onSpecificationChanged = text => {
    setSpecification(text);
    setErrorSpec(false);
  };

  const chooseFile = async () => {
    let result = await ImagePicker.launchImageLibrary({
      // mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.didCancel) {
      setDIError(false);
      const arrExt = result.assets[0].uri.split('.');
      const unique_id = uuid.v4();
      setDesignImage(
        AWSImagePath + unique_id + '.' + arrExt[arrExt.length - 1],
      );
      setImage(result.assets[0].uri);
      setFilePath(result.assets[0]);
      if (route.params.type === 'edit') {
        setIsImageReplaced(true);
      }
    }
  };

  const InsertData = () => {
    const datas = new FormData();
    const params = {
      Sess_UserRefno: userID,
      group_refno: activityID,
      service_refno: servicesFullData.find(el => {
        return el.serviceName === serviceName;
      }).id,
      category_refno: categoriesFullData.find(el => {
        return el.categoryName === categoriesName;
      }).id,
      product_refno: productsFullData.find(el => {
        return el.productName === productsName;
      }).id,
      designtype_name_refno: DTFullData.find(el => {
        return el.designtype_name === DTName;
      }).designtype_name_refno,

      designtype_name: name,
      designtype_specification: specification.trim(),
      view_status: checked ? '1' : '0',
    };

    datas.append('data', JSON.stringify(params));
    datas.append('designtype_image', {
      name: 'appimage1212.jpg',
      type: filePath.type + '/*',
      uri:
        Platform.OS === 'android'
          ? filePath.uri
          : filePath.uri.replace('file://', ''),
    });
    Provider.createDFAdminWithHeader(Provider.API_URLS.DesignTypeCreate, datas)
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
    const datas = new FormData();
    const params = {
      Sess_UserRefno: userID,
      designtype_refno: route.params.data.id,
      designtype_name: name,
      group_refno: activityID,
      service_refno: servicesFullData.find(el => {
        return el.serviceName === serviceName;
      }).id,
      category_refno: categoriesFullData.find(el => {
        return el.categoryName === categoriesName;
      }).id,
      product_refno: productsFullData.find(el => {
        return el.productName === productsName;
      }).id,
      designtype_name_refno: DTFullData.find(el => {
        return el.designtype_name === DTName;
      }).designtype_name_refno,
      designtype_specification: specification.trim(),
      view_status: checked ? 1 : 0,
    };
    datas.append('data', JSON.stringify(params));
    datas.append(
      'designtype_image',
      isImageReplaced
        ? {
            name: 'appimage1212.jpg',
            type: filePath.type + '/*',
            uri:
              Platform.OS === 'android'
                ? filePath.uri
                : filePath.uri.replace('file://', ''),
          }
        : null,
    );
    Provider.createDFAdminWithHeader(Provider.API_URLS.DesignTypeUpdate, datas)
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

    const objServices = servicesFullData.find(el => {
      return el.serviceName && el.serviceName === serviceName;
    });
    if (serviceName.length === 0 || !objServices) {
      setSNError(true);
      isValid = false;
    }
    const objCategories = categoriesFullData.find(el => {
      return el.categoryName && el.categoryName === categoriesName;
    });
    if (categoriesName.length === 0 || !objCategories) {
      setCNError(true);
      isValid = false;
    }
    const objProducts = productsFullData.find(el => {
      return el.productName && el.productName === productsName;
    });
    if (productsName.length === 0 || !objProducts) {
      setPNError(true);
      isValid = false;
    }

    const objDT = DTFullData.find(el => {
      return el.designtype_name && el.designtype_name === DTName;
    });
    if (DTName.length === 0 || !objDT) {
      setDTError(true);
      isValid = false;
    }

    if (displayName) {
      if (name == '' || name.trim() == '') {
        setError(true);
        isValid = false;
      }
    }

    if (filePath === null) {
      setDIError(true);
      isValid = false;
    }

    if (designImage === null) {
      setDIError(true);
      isValid = false;
    }
    if (specification.trim() == '') {
      setErrorSpec(true);
      isValid = false;
    }

    if (isValid) {
      setIsButtonLoading(true);
      if (route.params.type === 'edit') {
        UpdateData();
      } else {
        InsertData();
      }
      //uploadFile();
    } else {
      setSnackbarText('Please fill all mandatory fields');
      setSnackbarVisible(true);
    }
  };
  //#endregion

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header title='Add Design Type' navigation={navigation} />
      <ScrollView
        style={[Styles.flex1, Styles.backgroundColor, {marginBottom: 64}]}
        keyboardShouldPersistTaps="handled">
        <View style={[Styles.padding16]}>
          <Dropdown
            label="Service Name"
            data={servicesData}
            onSelected={onServiceNameSelected}
            isError={errorSN}
            selectedItem={serviceName}
            reference={servicesDDRef}
          />
          <HelperText type="error" visible={errorSN}>
            {communication.InvalidServiceName}
          </HelperText>
          <Dropdown
            label="Category Name"
            data={categoriesData}
            onSelected={onCategoriesNameSelected}
            isError={errorCN}
            selectedItem={categoriesName}
            reference={categoriesDDRef}
          />
          <HelperText type="error" visible={errorCN}>
            {communication.InvalidCategoryName}
          </HelperText>
          <Dropdown
            label="Product Name"
            data={productsData}
            onSelected={onProductsNameSelected}
            isError={errorPN}
            selectedItem={productsName}
            reference={productsDDRef}
          />
          <HelperText type="error" visible={errorPN}>
            {communication.InvalidProductName}
          </HelperText>
          <Dropdown
            label="Design Type Name"
            data={DTData}
            onSelected={onDTNameSelected}
            isError={errorDT}
            selectedItem={DTName}
            reference={DTDDRef}
          />
          <HelperText type="error" visible={errorDT}>
            Select a valid Design Type
          </HelperText>
          {displayName && (
            <>
              <TextInput
                mode="outlined"
                label="Design Type Name"
                value={name}
                returnKeyType="done"
                onChangeText={onNameChanged}
                style={{backgroundColor: 'white'}}
                error={error}
              />
              <HelperText type="error" visible={error}>
                {communication.InvalidDesignTypeName}
              </HelperText>
            </>
          )}

          <TextInput
            mode="outlined"
            multiline={true}
            label="Specification"
            value={specification}
            returnKeyType="done"
            onChangeText={onSpecificationChanged}
            style={{backgroundColor: 'white'}}
            error={errorSpec}
          />
          <HelperText type="error" visible={errorSpec}>
            Please enter specification
          </HelperText>

          <View
            style={[Styles.flexRow, Styles.flexAlignEnd, Styles.marginTop16]}>
            <Image
              source={{uri: image}}
              style={[Styles.width104, Styles.height96, Styles.border1]}
            />
            <Button mode="text" onPress={chooseFile}>
              {filePath !== null ? 'Replace' : 'Choose Image'}
            </Button>
          </View>
          <HelperText type="error" visible={errorDI}>
            {communication.InvalidDesignImage}
          </HelperText>
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
          <ButtonComponent
            mode="contained"
            onPress={ValidateData}
            text="SAVE"
            loader={isButtonLoading}
          />
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

export default AddDesignTypeScreen;
