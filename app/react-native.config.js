module.exports = {
  dependencies: {
    // --- Payment modules excluded from the iOS build (temporary) ---
    // Stripe's iOS SDK doesn't compile under Xcode 26 ("enumeration redeclared
    // with different underlying type"), and payments aren't needed to test the
    // UI. Setting ios: null skips their CocoaPods so the app compiles. The JS
    // packages stay installed (Metro still resolves imports); only the Donate
    // checkout flow would be inactive. Re-enable these when wiring up payments.
    '@stripe/stripe-react-native': { platforms: { ios: null } },
    'react-native-apple-payment': { platforms: { ios: null } },
    'react-native-gpay-api': { platforms: { ios: null } },
  },
};
