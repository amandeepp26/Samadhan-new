import {View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Subheading} from 'react-native-paper';
import { theme } from '../theme/apptheme';
import { Styles } from '../styles/styles';

const NoItems = ({icon, text}) => {
  return (
    <View
      style={[
        Styles.flex1,
        Styles.flexAlignCenter,
        Styles.flexJustifyCenter,
        Styles.flexColumn,
        Styles.backgroundColor,
        Styles.padding32,
      ]}>
      <Icon name={icon} color={theme.colors.textSecondary} size={48} />
      <Subheading
        style={[
          Styles.textSecondaryColor,
          Styles.paddingTop8,
          Styles.textCenter,
          {padding: 32},
        ]}>
        {text}
      </Subheading>
    </View>
  );
};

export default NoItems;
