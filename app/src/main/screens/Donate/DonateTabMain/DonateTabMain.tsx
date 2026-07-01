import React, { FunctionComponent } from 'react';
import { ScrollView, View } from 'react-native';

// styles
import styles from './DonateTabMain.styles';
import BackgroundDonate from '../components/BackgroundDonate/BackgroundDonate';
import HeaderBlock from '../components/Header/HeaderBlock';
import DonateTabs from '../components/DonateTabs/DonateTabs';
import { useRoute } from '@react-navigation/native';
import { DonateRouteProps } from 'presentation/ui/organism';
import JoinTheFight from '../components/JoinTheFightBanner/JoinTheFightBanner';


const DonateTabMain: FunctionComponent = () => {

  const route = useRoute<DonateRouteProps<'donate-tab'>>();
  const historyOpen = route.params?.showHistory;


  return (
    <BackgroundDonate>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.profile}>
            <HeaderBlock
              historyOpen={historyOpen}
            />
            <JoinTheFight />
            <DonateTabs />
          </View>
      </ScrollView>
    </BackgroundDonate>
  );
};

export default DonateTabMain;
