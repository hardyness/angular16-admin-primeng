import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kbmmasterapp.cianjur',
  appName: 'cmssouvenirwebadmin',
  webDir: 'dist/cmssouvenirwebadmin',
  server: {
    androidScheme: 'https'
  }
};

export default config;
