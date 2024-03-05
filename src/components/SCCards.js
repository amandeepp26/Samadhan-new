import {Button, Card, Subheading, Title} from 'react-native-paper';
import {Styles} from '../styles/styles';
import { Image, Pressable } from 'react-native';

const CreateSCCards = ({
  image,
  title,
  id,
  subttitle,
  data,
  cardImageClick,
  cardClick,
  titleLeft,
  buttonData,
}) => {
  return (
    <Pressable onPress={() => {
        cardClick && cardClick(title, id, data);
        cardImageClick && cardImageClick(image, data);
      }}
     style={[Styles.BottomShadow,{borderRadius:10,backgroundColor:'white', 
    flexDirection:'column',borderColor:'#d3d3d3'}]}>
      <Image resizeMode='cover' style={{width:'100%',height:170,borderTopLeftRadius:12,borderTopRightRadius:12}} source={{
        uri: image
      }} />
         <Title
            numberOfLines={1}
            style={[
              Styles.marginVertical8,
              Styles.fontSize14,
              Styles.fontBold,
              Styles.marginHorizontal8
            ]}>
            {title}
          </Title>
    </Pressable>
    // <Card
    //   style={[
    //     Styles.marginTop16,
    //     Styles.borderRadius8,
    //     Styles.OverFlow,
    //     Styles.padding0,
    //   ]}
    //   onPress={() => {
    //     cardClick && cardClick(title, id, data);
    //     cardImageClick && cardImageClick(image, data);
    //   }}>
    //   <Card style={[Styles.positionRelative]} evalution={10}>
    //     <Card.Cover source={{uri: image}} style={[Styles.height250]} />
    //     <Card.Content
    //       style={[
    //         Styles.positionAbsolute,
    //         {
    //           backgroundColor: 'rgba(15, 15, 15,0.7)',
    //           bottom: buttonData ? 52 : 0,
    //         },
    //         Styles.width100per,
    //         Styles.height80,
    //         ...(titleLeft
    //           ? [
    //               Styles.flexRow,
    //               Styles.flexAlignCenter,
    //               {justifyContent: 'space-between'},
    //             ]
    //           : []),
    //       ]}>
    //       <Title
    //         numberOfLines={1}
    //         style={[
    //           Styles.paddingTop12,
    //           Styles.fontSize14,
    //           Styles.textColorWhite,
    //         ]}>
    //         {title}
    //       </Title>
    //       {titleLeft && (
    //         <Title
    //           numberOfLines={1}
    //           style={[
    //             Styles.paddingTop12,
    //             Styles.fontSize14,
    //             Styles.textColorWhite,
    //           ]}>
    //           {titleLeft}
    //         </Title>
    //       )}
    //       {subttitle != null && (
    //         <>
    //           <Subheading
    //             style={[
    //               Styles.paddingBottom12,
    //               Styles.fontSize12,
    //               Styles.textColorWhite,
    //             ]}>
    //             ({subttitle})
    //           </Subheading>
    //         </>
    //       )}
    //     </Card.Content>
    //     {buttonData && (
    //       <Card.Actions>
    //         <Button
    //           disabled={buttonData.disabled ? buttonData.disabled : false}
    //           onPress={buttonData.click}>
    //           {buttonData.text}
    //         </Button>
    //       </Card.Actions>
    //     )}
    //   </Card>
    // </Card>
  );
};

export default CreateSCCards;
