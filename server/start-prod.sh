kill $(lsof -t -i:3000)
# npx nodemon build/server/src/server.js
pm2 start --name api build/server/src/server.js
