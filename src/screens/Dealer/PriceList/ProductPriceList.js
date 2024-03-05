import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  View,
  RefreshControl,
  LogBox,
  ScrollView,
  Platform,
  Dimensions,
  SafeAreaView,
  // Share,
} from 'react-native';
import {
  FAB,
  List,
  Searchbar,
  Snackbar,
  Title,
  Button,
} from 'react-native-paper';
import {SwipeListView} from 'react-native-swipe-list-view';
import RBSheet from 'react-native-raw-bottom-sheet';
import RNFS, {moveFile} from 'react-native-fs';
import Provider from '../../../api/Provider';
import Header from '../../../components/Header';
import NoItems from '../../../components/NoItems';
import {theme} from '../../../theme/apptheme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../../../../assets/hotel-design.jpg';
import PrintH from '../../../../assets/print-design-h.png';
import PrintF from '../../../../assets/print-design-f.png';

import {RenderHiddenItems} from '../../../components/ListActions';
import {Styles} from '../../../styles/styles';
import {APIConverter} from '../../../utils/apiconverter';
import LabelInput from '../../Marketing/EmployeeActivity/common/LabelInput';
import HDivider from '../../Marketing/EmployeeActivity/common/HDivider';
import Search from '../../../components/Search';
import * as Print from 'react-native-print';
import {request, PERMISSIONS} from 'react-native-permissions';
// import {PDFDocument, rgb} from '@types/react-native-pdf-lib';
//import FullScreenLoader from "../../../components/FullScreenLoader";
// import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import axios from 'axios';
import Share from 'react-native-share';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
let userID = 0,
  groupID = 0,
  companyID = 0,
  branchID = 0;

const CardComponent = ({
  data,
  fetchData,
  setSnackbarColor,
  setSnackbarText,
  setSnackbarVisible,
  navigation,
}) => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isButtonDisabled2, setIsButtonDisabled2] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [html, sethtml] = useState('');

  // const downloadFile = async e => {
  //   try {
  //     const {jobId, promise} = RNFS.downloadFile({
  //       fromUrl: e,
  //       toFile: `${RNFS.DocumentDirectoryPath}/downloadedPDF.pdf`,
  //       begin: res => {
  //         console.log('Download has begun with jobId:', jobId);
  //       },
  //       progress: res => {
  //         const progress = (res.bytesWritten / res.contentLength) * 100;
  //         setDownloadProgress(progress);
  //       },
  //     });

  //     await promise; // Wait for the download to complete
  //     console.log('Download completed!');
  //     setIsButtonDisabled2(false);
  //     onShare();
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };

  const convertUrlToPdf = async url => {
    try {
      // Fetch HTML content from the web URL
      const response = await axios.get(url);
      const htmlContent = response.data;

      // Define options for PDF generation
      const options = {
        html: htmlContent,
        fileName: 'webToPdf',
        directory: 'Documents',
      };

      // Generate the PDF
      const pdfFile = await RNHTMLtoPDF.convert(options);

      console.log('PDF generated successfully:', pdfFile);

      // Read the PDF file as base64
      const base64Pdf = await RNFS.readFile(pdfFile.filePath, 'base64');

      // Share or use the base64 content as needed
      setIsButtonDisabled2(false);

      onShare(base64Pdf, htmlContent);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const onShare = async (base64Pdf, html) => {
    try {
      const options = {
        type: 'application/pdf',
        url: `data:application/pdf;base64,${base64Pdf}`,
        fileName: 'Product-Price',
        // message: base64Pdf,
        title: 'Share PDF',
      };
      await Share.open(options);
    } catch (e) {
      console.error('Error during sharing:', e.message);
    }
  };

  const getfile = async e => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        sendpricelist_refno: data.sendpricelist_refno,
      },
    };
    console.log('pdf params:**********', params, "*======================*");
    Provider.createDFDealer(Provider.API_URLS.pricelist_htmlfile_access_url, params).then(async response => {
      console.log('res--->', response.data.data);
      const {url} = response.data.data.url;
      if (e == 'Preview') {
        navigation.navigate('MyPDFViewer', {uri: response.data.data.url});
      } else {
        // downloadFile(response.data.data.url);
        convertUrlToPdf(response.data.data.url);
      }
      setIsButtonDisabled(false);
    });

    // const pdfDoc = await PDFDocument.create();
    // const page = pdfDoc.addPage([500, 800]);
    // const {height} = page.getSize();
    // const {data: pdfData} = await RNFS.downloadFile({
    //   fromUrl: url,
    //   toFile: `${RNFS.DocumentDirectoryPath}/temp.pdf`,
    // }).promise;
    // const pdfImage = await pdfDoc.embedPng(pdfData, {width: 500});

    // page.drawText('Generated PDF from Web Page', {
    //   x: 50,
    //   y: height - 50,
    //   color: rgb(0, 0, 0),
    // });

    // page.drawImage(pdfImage, {
    //   x: 50,
    //   y: height - 200,
    //   width: 400,
    //   height: 150,
    // });

    // // Save the generated PDF
    // const pdfBytes = await pdfDoc.save();
    // const pdfPath = `${RNFS.DocumentDirectoryPath}/generated.pdf`;
    // await RNFS.writeFile(pdfPath, pdfBytes, 'base64');
    // setPdfUri(`file://${pdfPath}`);
  };

  // const getfile = async (type = 'send') => {
  //   if (
  //     data.attachment_pdf_url == null ||
  //     data.attachment_pdf_url == undefined ||
  //     data.attachment_pdf_url == ''
  //   ) {
  //     setSnackbarColor(theme.colors.error);
  //     setSnackbarText('No File Found');
  //     setSnackbarVisible(true);
  //     if (type == 'preview') {
  //       setIsButtonDisabled(false);
  //     } else {
  //       setIsButtonDisabled2(false);
  //     }
  //   } else {
  //     const pdfUri = data.attachment_pdf_url;
  //     if (type == 'preview') {
  //       try {
  //         // await Print.printAsync({
  //         //   uri: pdfUri,
  //         //   printerUrl: selectedPrinter?.url, // iOS only
  //         // });
  //         navigation.navigate('MyPDFViewer', {uri: pdfUri});
  //       } catch (error) {
  //         setSnackbarColor(theme.colors.error);
  //         setSnackbarText('Error while previewing file');
  //         setSnackbarVisible(true);
  //       } finally {
  //         setIsButtonDisabled(false);
  //       }
  //     } else {
  //       try {
  //         const {uri: localUri} = RNFS.downloadFile(
  //           pdfUri,
  //           RNFS.DocumentDirectoryPath +
  //             data.client_contact_name +
  //             '_' +
  //             data.brandName +
  //             '.pdf',
  //         );
  //         Provider.createDFDealer(
  //           Provider.API_URLS.pricelist_htmlfile_access_url,
  //           {
  //             data: {
  //               Sess_UserRefno: userID,
  //               sendpricelist_refno: data.sendpricelist_refno,
  //             },
  //           },
  //         ).then(async response => {
  //           if (
  //             response.data &&
  //             response.data.data &&
  //             response.data.data.Updated == 1
  //           ) {
  //             fetchData();
  //             if (Platform.OS === 'ios') {
  //               await Share.share(
  //                 {
  //                   title: 'Samadhan',
  //                   url: localUri,
  //                   message: 'Samadhan Price List',
  //                 },
  //                 {
  //                   dialogTitle: 'Samadhan Price List',
  //                   excludedActivityTypes: [],
  //                 },
  //               )
  //                 .then(({action, activityType}) => {
  //                   if (action === Share.sharedAction)
  //                     console.log('Share was successful');
  //                   else console.log('Share was dismissed');
  //                 })
  //                 .catch(err => {
  //                   setSnackbarColor(theme.colors.error);
  //                   setSnackbarText('Error while Sharing file');
  //                   setSnackbarVisible(true);
  //                 });
  //             } else {
  //               await Share.share(
  //                 {
  //                   title: 'Samadhan',
  //                   url: localUri,
  //                   message: 'Samadhan Price List',
  //                 },
  //                 {
  //                   dialogTitle: 'Samadhan Price List',
  //                   excludedActivityTypes: [],
  //                 },
  //               );
  //             }
  //           } else {
  //             console.log(error.message);
  //             setSnackbarColor(theme.colors.error);
  //             setSnackbarText('Error while downloading file');
  //             setSnackbarVisible(true);
  //           }
  //         });
  //       } catch (error) {
  //         console.log(error.message);
  //         setSnackbarColor(theme.colors.error);
  //         setSnackbarText('Error while downloading file');
  //         setSnackbarVisible(true);
  //       } finally {
  //         setIsButtonDisabled2(false);
  //       }
  //     }
  //   }
  // };
  return (
    <View
      style={[
        {
          backgroundColor: '#eee',
          borderRadius: 8,
          elevation: 5,
        },
        Styles.paddingHorizontal8,
        Styles.paddingVertical12,
      ]}>
      <LabelInput
        label="Client Name"
        value={`${data.client_contact_name} - ${data.client_contact_number}`}
        lg
      />
      <HDivider />
      <LabelInput label="Brand Name" value={data.brandName} />
      <HDivider />
      <View style={[Styles.flexRow, Styles.flexSpaceBetween]}>
        <LabelInput label="Sent Date" value={data.send_date} />
        <LabelInput
          label="Sent Status"
          value={data.send_status == '0' ? 'Pending' : 'Sent'}
        />
      </View>
      <HDivider />
      <View style={{flexDirection: 'row'}}>
        <View style={{flex: 1, marginRight: 10}}>
          <Button
            mode="outlined"
            disabled={isButtonDisabled}
            loading={isButtonDisabled}
            labelStyle={[Styles.fontSize10]}
            onPress={() => {
              setIsButtonDisabled(true);
              getfile('Preview');
            }}
            style={{
              borderWidth: 2,
              borderRadius: 4,
              borderColor: theme.colors.greenBorder,
            }}>
            Preview
          </Button>
        </View>
        <View style={{flex: 1}}>
          <Button
            mode="outlined"
            labelStyle={[Styles.fontSize10]}
            disabled={isButtonDisabled2}
            loading={isButtonDisabled2}
            onPress={() => {
              setIsButtonDisabled2(true);
              getfile();
            }}
            style={{
              borderWidth: 2,
              borderRadius: 4,
              borderColor: theme.colors.greenBorder,
            }}>
            Send Price List
          </Button>
        </View>
      </View>
    </View>
  );
};

const ProductPriceList = ({navigation}) => {
  //#region Variables

  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState('');
  const [snackbarColor, setSnackbarColor] = React.useState(
    theme.colors.success,
  );
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const [companyName, setCompanyName] = React.useState('');
  const [contactPerson, setContactPerson] = React.useState('');
  const [contactMobileNumber, setContactMobileNumber] = React.useState('');
  const [address1, setAddress1] = React.useState('');
  const [stateName, setStateName] = React.useState('');
  const [cityName, setCityName] = React.useState('');
  const [pincode, setPincode] = React.useState('');
  const [gstNumber, setGstNumber] = React.useState('');
  const [pan, setPan] = React.useState('');
  const [serviceProviderRole, setServiceProviderRole] = React.useState('');
  const [buyerCategoryName, setBuyerCategoryName] = React.useState('');
  const [addedBy, setAddedBy] = React.useState(false);
  const [display, setDisplay] = React.useState(false);
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const refRBSheet = useRef();
  //#endregion

  //#region Functions
  const [selectedPrinter, setSelectedPrinter] = React.useState();

  const print = sendpricelist_refno => {
    setIsButtonLoading(true);
    const uri = getPrintData(sendpricelist_refno);
    return uri;
  };

  const selectPrinter = async () => {
    const printer = await Print.selectPrinter(); // iOS only
    setSelectedPrinter(printer);
  };

  //

  useEffect(() => {
    GetUserID();
  }, []);

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      const userDataParsed = JSON.parse(userData);
      userID = userDataParsed.UserID;
      companyID = userDataParsed.Sess_company_refno;
      FetchData();
    }
  };

  const FetchData = from => {
    if (from === 'add' || from === 'update') {
      setSnackbarText(
        'Item ' + (from === 'add' ? 'added' : 'updated') + ' successfully',
      );
      setSnackbarColor(theme.colors.success);
      setSnackbarVisible(true);
    }
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        sendpricelist_refno: 'all',
      },
    };
    Provider.createDFDealer(Provider.API_URLS.sendpricelistrefnocheck, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            const lisData = [...response.data.data];
            lisData.map((k, i) => {
              k.key = (parseInt(i) + 1).toString();
            });
            setListData(response.data.data);
            setListSearchData(response.data.data);
          }
        } else {
          setListData([]);
        }
        setIsLoading(false);
        setRefreshing(false);
      })
      .catch(e => {
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        setRefreshing(false);
      });
  };

  const onChangeSearch = query => {
    setSearchQuery(query);
    if (query === '') {
      listSearchData[1](listData[0]);
    } else {
      listSearchData[1](
        listData[0].filter(el => {
          return el.contactPerson
            .toString()
            .toLowerCase()
            .includes(query.toLowerCase());
        }),
      );
    }
  };

  const SearchClient = () => {
    navigation.navigate('SearchClientScreen', {
      type: 'add',
      fetchData: FetchData,
    });
  };

  const EditCallback = (data, rowMap) => {
    rowMap[data.item.key].closeRow();
    navigation.navigate('AddClientScreen', {
      type: 'edit',
      fetchData: FetchData,
      data: {
        id: data.item.client_user_refno,
        companyName: data.item.companyName,
        contactPerson: data.item.contactPersonName,
        contactMobileNumber: data.item.Mobile,
        address1: data.item.addressLine,
        cityName: data.item.cityName,
        stateName: data.item.stateName,
        pincode: data.item.pincode,
        gstNumber: data.item.gstNumber,
        pan: data.item.pan,
        serviceType: data.item.client_role_refno,
        buyerCategoryName: data.item.buyerCategoryName,
        addedBy: data.item.createbyID == 0 ? true : false,
        display: data.item.display,
        refer_user_refno: data.item.refer_user_refno,
      },
    });
  };

  const RenderItems = data => {
    return (
      <View
        style={[
          Styles.backgroundColor,
          Styles.paddingHorizontal16,
          Styles.flexJustifyCenter,
          Styles.flex1,
          Styles.marginBottom12,
        ]}>
        <CardComponent
          key={data.item.key}
          data={data.item}
          onPrintFile={print}
          setSnackbarColor={setSnackbarColor}
          setSnackbarText={setSnackbarText}
          setSnackbarVisible={setSnackbarVisible}
          selectedPrinter={selectedPrinter}
          fetchData={FetchData}
          loader={isButtonLoading}
          navigation={navigation}
          // Preview={() => {
          //   Preview(data.item);
          // }}
        />
      </View>
    );
  };

  const Preview = data => {
    // navigation.navigate("MeetingPerson", {
    //   headerTitle: data.company_name,
    //   type: "edit",
    //   fetchCustomers: fetchCustomers,
    //   data: data,
    // });
  };

  const AddCallback = () => {
    navigation.navigate('AddProductPriceListScreen', {
      type: 'add',
      fetchData: FetchData,
      onPrintFile: print,
    });
  };
  //#endregion

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Product Price List" />
      {isLoading ? (
        <View
          style={[
            Styles.flex1,
            Styles.flexJustifyCenter,
            Styles.flexAlignCenter,
          ]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : listData.length > 0 ? (
        <View style={[Styles.flex1, Styles.flexColumn, Styles.backgroundColor]}>
          <Search
            data={listData}
            setData={setListSearchData}
            filterFunction={[
              'brandName',
              'client_contact_name',
              'client_contact_number',
            ]}
          />
          {listSearchData?.length > 0 ? (
            <SwipeListView
              previewDuration={1000}
              previewOpenValue={-72}
              previewRowKey="1"
              previewOpenDelay={1000}
              refreshControl={
                <RefreshControl
                  colors={[theme.colors.primary]}
                  refreshing={refreshing}
                  onRefresh={() => {
                    FetchData();
                  }}
                />
              }
              data={listSearchData}
              disableRightSwipe={true}
              rightOpenValue={-72}
              renderItem={data => RenderItems(data)}
            />
          ) : (
            <NoItems
              icon="format-list-bulleted"
              text="No records found for your query"
            />
          )}
        </View>
      ) : (
        <NoItems
          icon="format-list-bulleted"
          text="No records found. Add records by clicking on plus icon."
        />
      )}
      <FAB style={[Styles.fabStyle]} icon="plus" onPress={AddCallback} />
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: snackbarColor}}>
        {snackbarText}
      </Snackbar>
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        dragFromTopOnly={true}
        height={620}
        animationType="fade"
        customStyles={{
          wrapper: {backgroundColor: 'rgba(0,0,0,0.5)'},
          draggableIcon: {backgroundColor: '#000'},
        }}>
        <View>
          <Title style={[Styles.paddingHorizontal16]}>{companyName}</Title>
          <ScrollView style={{marginBottom: 64}}>
            <List.Item title="Contact Person" description={contactPerson} />
            <List.Item
              title="Contact Mobile No"
              description={contactMobileNumber}
            />
            <List.Item title="Address" description={address1} />
            <List.Item title="State Name" description={stateName} />
            <List.Item title="City Name" description={cityName} />
            <List.Item title="Pincode" description={pincode} />
            <List.Item title="GST" description={gstNumber} />
            <List.Item title="PAN" description={pan} />
            <List.Item
              title="Service Provider Role"
              description={serviceProviderRole}
            />
            {buyerCategoryName != '' && (
              <>
                <List.Item
                  title="Buyer Category"
                  description={buyerCategoryName}
                />
              </>
            )}
            <List.Item
              title="Created Or Added"
              description={addedBy == 0 ? 'Add' : 'Create'}
            />
            <List.Item title="Display" description={display ? 'Yes' : 'No'} />
          </ScrollView>
        </View>
      </RBSheet>
    </View>
    </SafeAreaView>
  );
};

export default ProductPriceList;
