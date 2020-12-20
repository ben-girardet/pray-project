kill $(lsof -t -i:3000)
npx nodemon build/server/src/server.js
