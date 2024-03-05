import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  Image,
  View,
  useWindowDimensions,
  InteractionManager,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StyleSheet,
} from 'react-native';
import {
  Button,
  Card,
  Checkbox,
  DataTable,
  Headline,
  HelperText,
  IconButton,
  Snackbar,
  Subheading,
  Text,
  TextInput,
  Title,
  MD3Colors,
  Chip,
  List,
} from 'react-native-paper';
import RBSheet from 'react-native-raw-bottom-sheet';
import Provider from '../../../api/Provider';
import Dropdown from '../../../components/Dropdown';
import {Styles} from '../../../styles/styles';
import {theme} from '../../../theme/apptheme';
import {communication} from '../../../utils/communication';
import {AWSImagePath} from '../../../utils/paths';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {APIConverter} from '../../../utils/apiconverter';
import ImageViewer from 'react-native-image-zoom-viewer';
import DFButton from '../../../components/Button';
import SMTabView from '../../../components/SMTabView';
import AddMaterialSetupProducts from '../../admin/ServiceCatalogue/AddItems/AddMaterialSetupProducts';
import Header from '../../../components/Header';
import ButtonComponent from '../../../components/Button';

let userID = 0,
  groupID = 0;
const MaterialCalculatorScreen = ({route, navigation}) => {
  const scrollRef = useRef();

  //#region Variables
  const arrProductData = React.useState([]);
  const [activityFullData, setActivityFullData] = React.useState([]);

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
    route.params.type === 'edit' ? route.params.data.productName : '',
  );
  const [errorPN, setPNError] = React.useState(false);
  const productsDDRef = useRef({});

  const [designTypeFullData, setDesignTypeFullData] = React.useState([]);
  const [designTypeData, setDesignTypeData] = React.useState([]);
  const [designType, setDesignType] = React.useState(
    route.params.type === 'edit' ? route.params.data.designTypeName : '',
  );
  const [errorDT, setDTError] = React.useState(false);
  const designTypeDDRef = useRef({});

  const [checked, setChecked] = React.useState(
    route.params.type === 'edit' ? route.params.data.display : true,
  );

  // const [lengthFeet, setLengthFeet] = React.useState(route.params.type === "edit" ? route.params.data.lengthFeet.toString() : "1");
  // const [lengthInches, setLengthInches] = React.useState(route.params.type === "edit" ? route.params.data.lengthInches.toString() : "0");

  // const [widthFeet, setWidthFeet] = React.useState(route.params.type === "edit" ? route.params.data.widthFeet.toString() : "1");
  // const [widthInches, setWidthInches] = React.useState(route.params.type === "edit" ? route.params.data.widthInches.toString() : "0");

  const [totalSqFt, setTotalSqft] = React.useState(
    route.params.type === 'edit'
      ? (
          ((parseInt(route.params.data.lengthFeet.toString()) * 12 +
            parseInt(route.params.data.lengthInches.toString())) *
            (parseInt(route.params.data.widthFeet.toString()) * 12 +
              parseInt(route.params.data.widthInches.toString()))) /
          144
        ).toFixed(4)
      : '1.0000',
  );

  //const [totalArea, setTotalArea] = React.useState("");

  const [errorPL, setPLError] = React.useState(false);

  const [brandsFullData, setBrandsFullData] = React.useState([]);
  const [uniqueBrandsData, setUniqueBrandsData] = React.useState([]);
  const [brandsData, setBrandsData] = React.useState([]);
  const [brandName, setBrandName] = React.useState([]);

  const [errorBN, setBNError] = React.useState(false);

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState('');
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [total, setTotal] = React.useState(0);

  const windowHeight = Dimensions.get('window').height;
  const refRBSheet = useRef();
  const refBrandRBSheet = useRef();
  const [designImage, setDesignImage] = React.useState(
    AWSImagePath + 'placeholder-image.png',
  );
  const [isZoomShow, setIsZoomShow] = React.useState(false);
  const [imageToZoom, setImageToZoom] = React.useState([]);
  const [disableButton, setDisableButton] = React.useState(false);
  const [specification, setSpecification] = React.useState('');
  const [showBrandCategory, setShowBrandCategory] = React.useState(false);
  const [brandCategoryData, setBrandCategoryData] = React.useState([]);
  const [brandCategoryFullData, setBrandCategoryFullData] = React.useState([]);
  const [categoryWiseBrandData, setCategoryWiseBrandData] = useState([]);
  const [categoryWiseBrandFullData, setCategoryWiseBrandFullData] =
    React.useState([]);
  const [selectedBrandCategoryID, setSelectedBrandCategoryID] =
    React.useState('');

  const [showMultiSelectDropDown, setShowMultiSelectDropDown] =
    React.useState(false);
  const [multiBrand, setMultiBrand] = React.useState([]);
  const [brandList, setBrandList] = React.useState([
    {label: 'Brand Name', value: 'Brand Name'},
  ]);

  const [dimention, setDimention] = useState({
    lf: '0',
    li: '0',
    wf: '0',
    wi: '0',
  });

  //#endregion

  //#region Functions

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      groupID = JSON.parse(userData).Sess_group_refno;
      FetchServicesFromActivity();
    }
  };

  useEffect(() => {
    GetUserID();
  }, [categoryWiseBrandData]);

  const onBrandItemSelection = brandID => {
    setCategoryWiseBrandData([]);

    let brandFullData = categoryWiseBrandFullData;
    const index = brandFullData[selectedBrandCategoryID].findIndex(
      element => element.brand_refno == brandID,
    );
    let brandItem = brandFullData[selectedBrandCategoryID][index];

    if (brandItem != null) {
      for (var i = 0; i < brandFullData[selectedBrandCategoryID].length; i++) {
        brandFullData[selectedBrandCategoryID][i].isChecked = false;
      }

      if (brandItem.isChecked) {
        brandFullData[selectedBrandCategoryID][index].isChecked = false;
      } else {
        brandFullData[selectedBrandCategoryID][index].isChecked = true;
      }

      setCategoryWiseBrandFullData(brandFullData);
      setCategoryWiseBrandData(brandFullData[selectedBrandCategoryID]);
      refBrandRBSheet.current.forceUpdate();
      FetchProductPriceOnBrandSelection(brandID);
    }
  };

  const SetCategoryBrand = category => {
    setCategoryWiseBrandData([]);
    let brandData = brandCategoryFullData.filter(
      item => item.categoryNameDisplay == category,
    );
    let categoryID = brandData[0].categoryName.split('#')[0].toString();
    setSelectedBrandCategoryID(categoryID);

    let brandUpdatedJson = [];

    JSON.parse(brandData[0].brandData).map(item => {
      if (categoryWiseBrandFullData.length == 0) {
        brandUpdatedJson.push({
          ...item,
          isChecked: false,
        });
      } else {
        let brandFullData = categoryWiseBrandFullData;

        if (
          brandFullData[categoryID] != null &&
          brandFullData[categoryID] != undefined
        ) {
          const index = brandFullData[categoryID].findIndex(
            element => element.brand_refno == item.brand_refno,
          );
          let brandItem = brandFullData[categoryID][index];

          brandUpdatedJson.push({
            ...item,
            isChecked:
              brandItem.isChecked == null ? false : brandItem.isChecked,
          });
        } else {
          brandUpdatedJson.push({
            ...item,
            isChecked: false,
          });
        }
      }
    });

    let manageCategoryWiseBrand = {},
      x = {};
    if (categoryWiseBrandFullData.length == 0) {
      manageCategoryWiseBrand[categoryID] = brandUpdatedJson;
      setCategoryWiseBrandFullData(manageCategoryWiseBrand);
    } else {
      const objectArray = Object.keys(categoryWiseBrandFullData);

      if (!objectArray.includes(categoryID)) {
        manageCategoryWiseBrand[categoryID] = brandUpdatedJson;
        x = {
          ...categoryWiseBrandFullData,
          ...manageCategoryWiseBrand,
        };
      } else {
        x = {
          ...categoryWiseBrandFullData,
        };
      }

      setCategoryWiseBrandFullData(x);
    }

    setCategoryWiseBrandData(brandUpdatedJson);
    refBrandRBSheet.current.open();
  };

  const FetchServicesFromActivity = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.getservicenamematerialcalculatorform,
      params,
    )
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

  const FetchCategoriesFromServices = serviceName => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        service_refno: servicesFullData.find(el => {
          return el.serviceName === serviceName;
        }).id,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.getcategorynamematerialcalculatorform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setCategoriesFullData(response.data.data);
            const categories = response.data.data.map(
              data => data.categoryName,
            );
            setCategoriesData(categories);
          }
        }
      })
      .catch(e => {});
  };

  const FetchDesignImage = designID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        designtype_refno: designID,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.getdesigntypeimagematerialcalculatorform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setSpecification(response.data.data[0].designtype_specification);
            setDesignImage(response.data.data[0].designImage);
          }
        }
      })
      .catch(e => {});
  };

  const FetchProductsFromCategory = categoryName => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        category_refno: categoriesFullData.find(el => {
          return el.categoryName === categoryName;
        }).id,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.getproductnamematerialcalculatorform,
      params,
    )
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

  const FetchDesignTypeFromProduct = selectedItem => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        product_refno: productsFullData.find(el => {
          return el.productName === selectedItem;
        }).id,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.getproductdesigntypematerialcalculatorform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setDesignTypeFullData(response.data.data);
            const designTypes = response.data.data.map(
              data => data.designTypeName,
            );
            setDesignTypeData(designTypes);
          }
        }
      })
      .catch(e => {});
  };

  const FetchBrandsFromProductIds = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        designtype_refno: designTypeFullData.find(el => {
          return el.designTypeName === designType;
        }).id,
        product_refno: productsFullData.find(el => {
          return el.productName === productsName;
        }).id,
        outputformat: '1',
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.getbrandnamelist_materialcalculatorform,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            const objectArray = Object.entries(response.data.data[0]);

            if (objectArray.length > 0) {
              let brandCategory = [];
              objectArray.map(([key, value]) => {
                brandCategory.push({
                  brandData: [JSON.stringify(value)],
                  categoryName: key,
                  categoryNameDisplay: key.split('#')[1],
                });
              });

              const onlyCatName = brandCategory.map(
                el => el.categoryNameDisplay,
              );
              setShowBrandCategory(true);
              setBrandCategoryData(onlyCatName);
              setBrandCategoryFullData(brandCategory);
            } else {
              setShowBrandCategory(false);
            }

            response.data.data = APIConverter(
              JSON.stringify(response.data.data),
            );
            setBrandsFullData(response.data.data);

            const key = 'brandID';
            const formattedResult = [];
            const uniqueBrands = [
              ...new Map(
                response.data.data.map(item => [item[key], item]),
              ).values(),
            ];

            uniqueBrands.map(item => {
              formattedResult.push({
                brandID: item.brandID,
                brandName: item.brandName,
                categoryName: item.categoryName,
                id: item.id,
                fullBrandName: item.brandName + ' (' + item.categoryName + ')',
              });
            });

            setUniqueBrandsData(formattedResult);
            const formattedData = uniqueBrands.map(
              data => data.brandName + ' (' + data.categoryName + ')',
            );
            const brndLst = [];

            formattedData.map(k => {
              brndLst.push({
                label: k,
                value: k,
              });
            });

            setBrandList(brndLst);
            setBrandsData(formattedData);
          }
        }
      })
      .catch(e => {});
  };

  const FetchProductPriceOnBrandSelection = brandID => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        designtype_refno: designTypeFullData.find(el => {
          return el.designTypeName === designType;
        }).id,
        product_refno: productsFullData.find(el => {
          return el.productName === productsName;
        }).id,
        lengthfoot: dimention.lf,
        lengthinches: dimention.li,
        widthheightfoot: dimention.wf,
        widthheightinches: dimention.wi,
        totalfoot: totalSqFt,
        dealer_brand_refno: brandID,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.getproductrate_by_brandrefno_materialcalculatorform,
      params,
    )
      .then(response => {
        console.log('resp:', response.data.data);
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            const newData = [...arrProductData[0]];
            newData.map(k => {
              const foundProduct = response.data.data.find(
                el => el.productID == k.productID,
              );
              if (foundProduct) {
                k.brandID = foundProduct.brandID;
                k.brandName = foundProduct.brandName;
                k.price = foundProduct.price;
                k.amount = foundProduct.amount;
                k.productUnit = foundProduct.displayUnit;
              }
            });

            const amounts = newData
              .map(data => {
                if (data.amount > 0) {
                  return data.amount;
                } else {
                  return null;
                }
              })
              .filter(data => data !== null);

            if (
              isNaN(amounts.reduce((a, b) => a + parseFloat(b), 0).toFixed(4))
            ) {
              setTotal(0);
            } else {
              setTotal(
                amounts.reduce((a, b) => a + parseFloat(b), 0).toFixed(4),
              );
            }
            arrProductData[1](newData);
          }
        }
      })
      .catch(e => {});
  };

  const FetchProductsFromMaterialSetup = callback => {
    setIsButtonLoading(true);
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        designtype_refno: designTypeFullData.find(el => {
          return el.designTypeName === designType;
        }).id,
        product_refno: productsFullData.find(el => {
          return el.productName === productsName;
        }).id,
        lengthfoot: dimention.lf,
        lengthinches: dimention.li,
        widthheightfoot: dimention.wf,
        widthheightinches: dimention.wi,
        totalfoot: totalSqFt,
      },
    };
    console.log('params:', params);
    Provider.createDFCommon(
      Provider.API_URLS.getviewmaterials_materialcalculatorform,
      params,
    )
      .then(response => {
        console.log('resp:', response.data.data);
        setIsButtonLoading(false);
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            const tempArr = [];
            setTotal(0);
            let totalTemp = 0;

            response.data.data.map(k => {
              tempArr.push({
                productID: k.productID,
                productName: k.productName,
                productUnit: '',
                brandID: 0,
                brandName: '',
                price: 0,
                amount: 0,
                quantity: parseFloat(k.quantity),
                formula: 0,
              });
            });
            arrProductData[1](tempArr);
            autoScroll();
            setBrandsData([]);
            setBrandsFullData([]);
            CalculateSqFt(0, 0, 0, 0, 'ta', totalSqFt);
            FirstCalculationSqFt(totalSqFt, response.data.data);
            FetchBrandsFromProductIds();
          }
        } else {
          setSnackbarText(communication.NoMaterial);
          setSnackbarVisible(true);
        }
      })
      .catch(e => {
        setIsButtonLoading(false);
      });
  };

  const onServiceNameSelected = selectedItem => {
    setServiceName(selectedItem);

    categoriesDDRef.current.reset();
    setCategoriesData([]);
    setProductsData([]);
    setDesignTypeData([]);
    setCategoriesName('');
    setProductsName('');
    setDesignType('');
    setSNError(false);
    FetchCategoriesFromServices(selectedItem);
  };

  const onCategoriesNameSelected = selectedItem => {
    setCategoriesName(selectedItem);

    productsDDRef.current.reset();
    setCNError(false);
    setProductsData([]);
    setDesignTypeData([]);
    setProductsName('');
    setDesignType('');
    FetchProductsFromCategory(selectedItem);
  };

  const onProductsNameSelected = selectedItem => {
    setProductsName(selectedItem);
    setDesignTypeData([]);
    setDesignType('');

    setPNError(false);
    FetchDesignTypeFromProduct(selectedItem);
  };

  const onDesignTypeSelected = selectedItem => {
    setDesignType(selectedItem);
    let id = designTypeFullData.find(el => {
      return el.designTypeName === selectedItem;
    }).id;
    setDTError(false);
    FetchDesignImage(id);
  };

  const GetMaterialDetails = () => {
    let isValid = true;

    if (designType == '') {
      isValid = false;
      setDTError(true);
    }

    if (productsName == '') {
      isValid = false;
      setPNError(true);
    }

    if (totalSqFt == '' && parseFloat(totalSqFt) <= 0) {
      isValid = false;
      setSnackbarText('Please select Length and Width OR enter Total Area');
      setSnackbarVisible(true);
    }

    if (isValid) {
      FetchProductsFromMaterialSetup();
    } else {
      setSnackbarText('Please select all fields');
      setSnackbarVisible(true);
    }
  };

  const OpenProductDialog = () => {
    refRBSheet.current.open();
  };

  const CreateNumberDropdown = (startCount, endCount) => {
    let arrNumbers = [];
    for (var i = startCount; i <= endCount; i++) {
      arrNumbers.push(i.toString());
    }
    return arrNumbers;
  };

  const onTotalSqFtChange = text => {
    setTotalArea(text);
  };

  // const ResetTotalArea = () => {
  //   setTotalArea("");
  // };

  // const ResetLengthWidth = () => {
  //   setWidthFeet("1");
  //   setLengthFeet("1");
  //   setLengthInches("0");
  //   setWidthInches("0");
  // };

  const FirstCalculationSqFt = (totArea, productData) => {
    if (productData.length > 0) {
      let total = 0;
      const arrMaterialProducts = [...productData];
      arrMaterialProducts.map(k => {
        total += parseFloat(k.amount);
      });
      arrProductData[1](arrMaterialProducts);
      if (total > 0) {
        setTotal(parseFloat(total).toFixed(4));
      } else {
        setTotal(0);
      }
    }
  };

  const CalculateSqFt = (lf, li, wf, wi, type, ta, txtChange) => {
    if (type == 'lw') {
      setDimention(state => ({
        lf: lf,
        li: li,
        wf: wf,
        wi: wi,
      }));
      if (lf > 0 && li > -1 && wf > 0 && wi > -1) {
        const inches =
          ((parseInt(lf) * 12 + parseInt(li)) *
            (parseInt(wf) * 12 + parseInt(wi))) /
          144;
        setTotalSqft(parseFloat(inches).toFixed(4));
        if (arrProductData[0].length > 0) {
          let total = 0;
          const arrMaterialProducts = [...arrProductData[0]];
          arrMaterialProducts.map(k => {
            total += parseFloat(k.amount);
          });
          arrProductData[1](arrMaterialProducts);
          setTotal(parseFloat(total).toFixed(4));
        }
      } else {
        setTotalSqft(0);
      }
    } else if (type == 'ta') {
      let val = Math.sqrt(ta);

      setDimention(state => ({
        lf: val.toFixed(2),
        li: 0,
        wf: val.toFixed(2),
        wi: 0,
      }));

      if (ta > 0) {
        setTotalSqft(parseFloat(ta).toFixed(4));
        if (txtChange == true) {
          if (arrProductData[0].length > 0) {
            let total = 0;
            const arrMaterialProducts = [...arrProductData[0]];
            arrMaterialProducts.map(k => {
              if (k.formula) {
                k.quantity = (
                  parseFloat(ta.toString()) / parseFloat(k.formula)
                ).toFixed(4);
                if (k.price) {
                  k.amount = (
                    parseFloat(k.quantity) * parseFloat(k.price)
                  ).toFixed(4);
                } else {
                  k.amount = '0.0000';
                }
                total += parseFloat(k.amount);
              } else {
                k.quantity = '0';
                k.amount = '0.0000';
              }
            });
            arrProductData[1](arrMaterialProducts);
            setTotal(parseFloat(total).toFixed(4));
          }
        }
      }
    } else {
      setTotalSqft(0);
    }
  };

  const handleDropdownChange = (lf, li, wf, wi, type, ta, txtChange) => {
    CalculateSqFt(lf, li, wf, wi, type, ta, txtChange);
  };

  const autoScroll = () => {
    let offset = 100;
    let i = setInterval(() => {
      offset += windowHeight;
      scrollRef.current?.scrollTo({x: 0, y: offset, animated: true});
      clearInterval(i);
    }, 2000);
  };

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 20,
      marginBottom: 22.5,
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexDirection: 'row',
      zIndex: 10,

      marginTop: 150,
      flex: 1,
    },
    containerStyles: {
      minHeight: 50,
      minWidth: 149,
    },
    dropDownStyles: {
      backgroundColor: '#fff',
    },
    labelStyles: {
      color: '#6F8C95',
      fontSize: 14,
      textAlign: 'left',
    },
    itemStyles: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
  });

  //#endregion

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Material Calculator" />
      <ScrollView
        ref={scrollRef}
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
            data={designTypeData}
            onSelected={onDesignTypeSelected}
            isError={errorDT}
            selectedItem={designType}
            reference={designTypeDDRef}
          />
          <HelperText type="error" visible={errorDT}>
            {communication.InvalidDesignTypeName}
          </HelperText>
          <Text style={{color: 'grey'}}>Specification</Text>
          <TextInput
            mode="outlined"
            label="Specification"
            value={specification}
            disabled={true}
            editable={false}
          />
          <View
            style={[Styles.flexRow, Styles.flexAlignEnd, Styles.marginTop16]}>
            <TouchableOpacity
              style={[Styles.height100per, Styles.width100per]}
              onPress={() => {
                setImageToZoom([
                  {
                    url: designImage,
                  },
                ]);
                setIsZoomShow(true);
              }}>
              <Image
                source={{uri: designImage}}
                style={[Styles.border1, Styles.width100per, Styles.height250]}
              />
            </TouchableOpacity>
          </View>

          <View style={[Styles.height325, Styles.marginTop16]}>
            {/* <TabView
              renderTabBar={renderTabBar}
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: layout.width }}

            /> */}

            <SMTabView onChange={handleDropdownChange}></SMTabView>

            {/* <TabView renderTabBar={renderTabBar} navigationState={{ index, routes }} renderScene={renderScene} onIndexChange={setIndex} initialLayout={{ width: layout.width }} /> */}
          </View>
          <TextInput
            mode="outlined"
            label="Total (Sq.Ft.)"
            style={[Styles.marginBottom16]}
            onChangeText={onTotalSqFtChange}
            value={totalSqFt}
            editable={false}
          />
          <ButtonComponent
            mode="contained"
            onPress={GetMaterialDetails}
            text="View Materials"
            loader={isButtonLoading}
          />

          <HelperText type="error" visible={errorPL}>
            {communication.InvalidProductList}
          </HelperText>
          <View>
            {showBrandCategory && (
              <>
                <View
                  style={[
                    Styles.flexRow,
                    Styles.flexWrap,
                    Styles.flexJustifyCenter,
                  ]}>
                  {brandCategoryData.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        Styles.borderRadius8,
                        Styles.homeBox,
                        Styles.flexColumn,
                        Styles.flexJustifyCenter,
                        Styles.flexAlignCenter,
                        Styles.marginHorizontal4,
                        Styles.marginBottom8,
                        {width: 100, height: 72},
                      ]}
                      onPress={() => {
                        SetCategoryBrand(category);
                      }}>
                      <Text
                        style={[
                          Styles.buttonIconLabel,
                          {textTransform: 'uppercase'},
                        ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <HelperText type="error" visible={errorBN}>
              {communication.InvalidBrnadSelected}
            </HelperText>

            {arrProductData[0].map((k, i) => {
              return (
                <Card key={i} elevation={3} style={[Styles.marginTop16]}>
                  <Card.Content>
                    <View
                      style={[
                        Styles.flexRow,
                        Styles.borderBottom1,
                        Styles.marginBottom4,
                        Styles.paddingHorizontal4,
                        Styles.flexAlignStart,
                      ]}>
                      <Subheading
                        style={[
                          Styles.flex2,
                          Styles.textSecondaryColor,
                          Styles.fontBold,
                        ]}>
                        {k.productName}
                      </Subheading>
                      <Subheading
                        style={[
                          Styles.flex1,
                          Styles.primaryColor,
                          Styles.fontBold,
                          {textAlign: 'right'},
                        ]}>
                        {k.brandName === '' ? '' : k.brandName}
                      </Subheading>
                    </View>
                    <View
                      style={[
                        Styles.flexRow,
                        Styles.borderBottom1,
                        Styles.padding4,
                        Styles.flexAlignCenter,
                        Styles.flexSpaceBetween,
                      ]}>
                      <View style={[Styles.width48per]}>
                        <TextInput
                          mode="outlined"
                          dense
                          style={[Styles.flex1]}
                          disabled={true}
                          label="Quantity"
                          value={parseFloat(k.quantity).toFixed(4).toString()}
                        />
                      </View>
                      <View style={[Styles.width48per]}>
                        {k.price > 0 ? (
                          <TextInput
                            mode="outlined"
                            dense
                            style={[Styles.flex1]}
                            disabled={true}
                            label={`Rate / ${k.productUnit}`}
                            value={
                              k.price ? parseFloat(k.price).toFixed(4) : ''
                            }
                          />
                        ) : null}
                      </View>
                    </View>
                    {k.brandName != '' && k.brandName != null ? (
                      <View
                        style={[
                          Styles.flexRow,
                          Styles.padding4,
                          Styles.flexAlignCenter,
                          Styles.flexSpaceBetween,
                        ]}>
                        <View style={[Styles.width100per]}>
                          <TextInput
                            mode="outlined"
                            dense
                            style={[Styles.flex1]}
                            disabled={true}
                            label="Product Amount"
                            value={k.amount}
                          />
                        </View>
                      </View>
                    ) : null}
                  </Card.Content>
                </Card>
              );
            })}
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
        <Card.Content style={[Styles.flexAlignCenter]}>
          <Subheading style={[Styles.fontBold, Styles.primaryColor]}>
            Sub Total: {parseFloat(total).toFixed(4)}
          </Subheading>
        </Card.Content>
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: theme.colors.error}}>
        {snackbarText}
      </Snackbar>
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        dragFromTopOnly={true}
        height={windowHeight - 96}
        animationType="fade"
        customStyles={{wrapper: {backgroundColor: 'rgba(0,0,0,0.5)'}}}>
        <View style={[Styles.flex1]}>
          <ScrollView
            style={[
              Styles.borderred,
              Styles.flex1,
              Styles.backgroundColor,
              {marginBottom: 64},
            ]}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{flexGrow: 1}}>
            <View style={[Styles.borderred, Styles.flex1]}>
              <AddMaterialSetupProducts arrProductData={arrProductData} />
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
            <Button
              mode="contained"
              onPress={() => {
                setBrandsData([]);
                setBrandsFullData([]);
                FetchBrandsFromProductIds();
                if (arrProductData[0].length > 0) {
                  setPLError(false);
                }
                refRBSheet.current.close();
              }}>
              Done
            </Button>
          </View>
        </View>
      </RBSheet>
      <RBSheet
        ref={refBrandRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        dragFromTopOnly={true}
        height={400}
        animationType="fade"
        customStyles={{
          wrapper: {backgroundColor: 'rgba(0,0,0,0.5)'},
          draggableIcon: {backgroundColor: '#000'},
        }}>
        <View style={[Styles.flex1, Styles.marginBottom16]}>
          <ScrollView style={[Styles.marginBottom48]}>
            <List.Section>
              {categoryWiseBrandData.map((item, i) => {
                return (
                  <List.Item
                    key={i}
                    title={item.brand_name}
                    onPress={() => {
                      onBrandItemSelection(item.brand_refno);
                    }}
                    style={[
                      Styles.borderBottom1,
                      Styles.height48,
                      Styles.flexAlignCenter,
                      Styles.flexJustifyCenter,
                    ]}
                    right={props => (
                      <List.Icon
                        {...props}
                        icon="check"
                        color={theme.colors.success}
                        style={{opacity: item.isChecked ? 1 : 0}}
                      />
                    )}>
                    <Text>{item.brand_name}</Text>
                  </List.Item>
                );
              })}
            </List.Section>
          </ScrollView>
          <Button
            mode="contained"
            style={[
              Styles.width104,
              Styles.flexAlignSelfCenter,
              {position: 'absolute', bottom: 0},
            ]}
            onPress={() => {
              refBrandRBSheet.current.close();
            }}>
            DONE
          </Button>
        </View>
      </RBSheet>
      <Modal
        visible={isZoomShow}
        onRequestClose={() => setIsZoomShow(false)}
        transparent={true}>
        <View
          style={[
            Styles.flex1,
            {backgroundColor: 'rgba(0,0,0,0.85)', position: 'relative'},
          ]}>
          <Button
            mode="outlined"
            style={{
              position: 'absolute',
              bottom: 16,
              zIndex: 20,
              right: 16,
              backgroundColor: 'white',
            }}
            onPress={() => setIsZoomShow(false)}>
            Close
          </Button>
          <ImageViewer
            imageUrls={imageToZoom}
            backgroundColor="transparent"
            style={{height: 1920}}
            renderIndicator={() => {}}
          />
        </View>
      </Modal>
    </View>
    </SafeAreaView>
  );
};

export default MaterialCalculatorScreen;
