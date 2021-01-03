rm -rf www/*
cp -R ../client/dist/* www
cp resources/cordova.css www/cordova.css
sed -i'.orig' -e 's+</body>+<script src="cordova.js"></script></body>+g' www/index.html
rm www/index.html.orig
sed -i'.orig' -e 's+<body>+<body class="cordova">+g' www/index.html
rm www/index.html.orig
sed -i'.orig' -e 's+</head>+<link rel="stylesheet" type="text/css" href="cordova.css"></head>+g' www/index.html
rm www/index.html.orig
