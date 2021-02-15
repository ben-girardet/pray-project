cd ../
cordova create sunago.cordova app.sunago Sunago
cd sunago.cordova
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-statusbar
cordova plugin add @havesource/cordova-plugin-push
cordova plugin add cordova-open-native-settings --save
cordova platform add browser
cordova platform add ios
cp ../_cordova/build.sh build.sh
cp -R ../_cordova/resources resources
cordova-res ios
sed -i'.orig' -e 's+<widget+<widget ios-CFBundleVersion="1.0.0" android-versionCode="1000000"+g' config.xml
rm config.xml.orig
sed -i'.orig' -e 's+</platform>+</platform>\n  <preference name="Orientation" value="portrait" />\n  <preference name="target-device" value="handset" />\n  <config-file parent="NSCameraUsageDescription" platform="ios" target="*-Info.plist">\n  <string>We access your camera to take pictures.</string>\n  </config-file>+g' config.xml
rm config.xml.orig
cp -R www _www
# The replace below fixes the margin at the bottom of the screen on IOS
# It comes from: https://github.com/apache/cordova-ios/issues/905#issuecomment-660484332
sed -i'.orig' -e 's+wkWebView.UIDelegate = self.uiDelegate+#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 110000\n    if (@available(iOS 11.0, *)) {\n        [wkWebView.scrollView setContentInsetAdjustmentBehavior:UIScrollViewContentInsetAdjustmentNever];\n    }\n    #endif+g' platforms/ios/CordovaLib/Classes/Private/Plugins/CDVWebViewEngine/CDVWebViewEngine.m
rm platforms/ios/CordovaLib/Classes/Private/Plugins/CDVWebViewEngine/CDVWebViewEngine.m.orig
