cd ../
cordova create sunago.cordova app.sunago Sunago
cd sunago.cordova
cordova plugin add cordova-plugin-splashscreen
cordova platform add browser
cordova platform add ios
cp ../_cordova/version.json version.json
cp ../_cordova/build.sh build.sh
cp -R ../_cordova/resources resources
cordova-res ios
# sed -i'.orig' -e 's+<platform name="ios">+<icon src="res/icon.png" />\n    <platform name="ios">" />+g' config.xml
# rm config.xml.orig
# sed -i'.orig' -e 's+<platform name="ios">+<platform name="ios">\n        <splash src="res/screen/ios/Default@2x~universal~anyany.png" />+g' config.xml
# rm config.xml.orig
cp -R www _www
# The replace below fixes the margin at the bottom of the screen on IOS
# It comes from: https://github.com/apache/cordova-ios/issues/905#issuecomment-660484332
# --- Unfortunately the sed command below doesn't work ---
sed -i'.orig' -e 's+WKWebView* wkWebView = [[WKWebView alloc] initWithFrame:self.engineWebView.frame configuration:configuration];+WKWebView* wkWebView = [[WKWebView alloc] initWithFrame:self.engineWebView.frame configuration:configuration];\n    // add begin\n    #if __IPHONE_OS_VERSION_MAX_ALLOWED >= 110000\n    if (@available(iOS 11.0, *)) {\n        [wkWebView.scrollView setContentInsetAdjustmentBehavior:UIScrollViewContentInsetAdjustmentNever];\n    }\n    #endif\n    // add end+g' platforms/ios/CordovaLib/Classes/Private/Plugins/CDVWebViewEngine/CDVWebViewEngine.m
rm platforms/ios/CordovaLib/Classes/Private/Plugins/CDVWebViewEngine/CDVWebViewEngine.m.orig

# rm -rf www
# rm config.xml
# ln -s "../$AURELIA_FOLDER_NAME/cordova/config.xml" config.xml
# ln -s "../$AURELIA_FOLDER_NAME/cordova/www" www
# cp "../$AURELIA_FOLDER_NAME/cordova/build-icons.sh" build-icons.sh
# cp "../$AURELIA_FOLDER_NAME/cordova/runios.sh" runios.sh
# cp "../$AURELIA_FOLDER_NAME/cordova/runbrowser.sh" runbrowser.sh
# sh build-icons.sh
# cordova run browser


# Create a build file build.sh
# rm build.sh
# echo "cd ../
# au cordova --env prod
# cd ../
# cd \"$FOLDER_NAME\"
# sh runios.sh
# " > build.sh
