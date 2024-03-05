import React, {useRef, useState} from 'react';
import {View, Text, Share, SafeAreaView} from 'react-native';
import {Button} from 'react-native-paper';
import {WebView} from 'react-native-webview';
import RNFS from 'react-native-fs';

const MyPDFViewer = ({route}) => {
  const webViewRef = useRef(null);
  const onMessage = event => {
    const message = event.nativeEvent.data;
    // Assuming that the message is a string representing the zoom level
    const zoomLevel = parseFloat(message);

    // You can use the zoomLevel value to update the WebView's zoom level
    if (!isNaN(zoomLevel) && webViewRef.current) {
      webViewRef.current.setZoomLevel(zoomLevel);
    }
  };

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <WebView
        source={{uri: route.params.uri}}
        style={{flex: 1, width: '120%'}}
        scalesPageToFit={true}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
    </SafeAreaView>
  );
};

export default MyPDFViewer;

// return (
//   <View style={{flex: 1}}>
//     <Text style={{fontSize: 20}}>hggfty</Text>
//     {route.params.uri && (
//       <PDFView
//         fadeInDuration={250.0}
//         // style={[Styles.flex1, Styles.width100per]}
//         resource={route.params.uri}
//         onLoadComplete={(numberOfPages, filePath) => {
//           console.log(`Number of pages: ${numberOfPages}`);
//         }}
//         onPageChanged={(page, numberOfPages) => {
//           console.log(`Current page: ${page}`);
//         }}
//       />
//     )}
//     {/* <PDFViewer pdfFilePath={route.params.uri} /> */}
//   </View>
// );
