rm -rf www/*
cp -R ../client/dist/* www
cp resources/app-cordova.css www/app-cordova.css
cp resources/app-cordova.js www/app-cordova.js
sed -i'.orig' -e 's+</body>+<script src="app-cordova.js"></script><script src="cordova.js"></script></body>+g' www/index.html
rm www/index.html.orig
sed -i'.orig' -e 's+<html>+<html class="cordova">+g' www/index.html
rm www/index.html.orig
sed -i'.orig' -e 's+</head>+<link rel="stylesheet" type="text/css" href="app-cordova.css"></head>+g' www/index.html
rm www/index.html.orig

# read -r VERSION<../_cordova/version.json
VERSION=`cat ../_cordova/version.json`
echo "$VERSION"
MAJOR=$(jq '.major' <<< "$VERSION")
MINOR=$(jq '.minor' <<< "$VERSION")
PATCH=$(jq '.patch' <<< "$VERSION")
BUILD=$(jq '.build' <<< "$VERSION")

echo "Major: $MAJOR"
echo "Minor: $MINOR"
echo "Path: $PATCH"
echo "Build: $BUILD"

NEWBUILD=$(($BUILD + 1))
echo "New build: $NEWBUILD"

# TODO: ensure that no value (MAJOR, MINOR, PATH OR BUILD) is larger
# than 99. Ideally the script should update the previous value when larger
# than 99
# BUILD value can go up to 999

echo "### Important ###"
echo "Make sur that no version number is larger than 99 !"

NEWVERSION=$(jq '.build += 1' <<< "$VERSION") && \
echo "${NEWVERSION}" > ../_cordova/version.json

VERSIONSTRING="$MAJOR.$MINOR.$PATCH"
IOSBDLVERSION="$NEWBUILD"
FULLVERSIONSTRING="$MAJOR.$MINOR.$PATCH.$NEWBUILD"
ANDROIDVERSION="$(($MAJOR*1000000+$MINOR*100000+$PATCH*1000+$NEWBUILD))"

echo "VERSIONSTRING: $VERSIONSTRING";
echo "IOSBDLVERSION: $IOSBDLVERSION";
echo "ANDROIDVERSION: $ANDROIDVERSION";

searchVS='(version=")([0-9.]*)(")'
replaceVS="\1${VERSIONSTRING}\3"
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i "" -E "s/${searchVS}/${replaceVS}/g" "config.xml"
else
  sed -i -E "s/${searchVS}/${replaceVS}/g" "config.xml"
fi

searchIOS='(ios-CFBundleVersion=")([0-9.]*)(")'
replaceIOS="\1${IOSBDLVERSION}\3"
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i "" -E "s/${searchIOS}/${replaceIOS}/g" "config.xml"
else
  sed -i -E "s/${searchIOS}/${replaceIOS}/g" "config.xml"
fi

searchAND='(android-versionCode=")([0-9.]*)(")'
replaceAND="\1${ANDROIDVERSION}\3"
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i "" -E "s/${searchAND}/${replaceAND}/g" "config.xml"
else
  sed -i -E "s/${searchAND}/${replaceAND}/g" "config.xml"
fi

MAINFILENAME=$(find "www" -name "main.*.js")
echo "$MAINFILENAME $FULLVERSIONSTRING"
#searchAPP='<div class=\\"welcome__version\\">v([0-9.]*)</div>'
searchAPP='VERSIONNB'
replaceAPP="${FULLVERSIONSTRING}"
sed -i'.orig' -e "s+${searchAPP}+${replaceAPP}+g" "$MAINFILENAME"
rm "$MAINFILENAME.orig"
