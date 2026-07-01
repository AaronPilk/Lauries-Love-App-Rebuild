import React, { FunctionComponent } from 'react';

// icons
import { IconLogo } from 'assets/icons-auto/components';

type AppLogoProps = {
  w?: string | number;
  h?: string | number;
};

const AppLogo: FunctionComponent<AppLogoProps> = ({ w = '175', h = '175' }) => {
  const width = Number(w);
  const height = Number(h);
  return <IconLogo width={width} height={height} />;
};

export default AppLogo;
