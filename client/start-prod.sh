kill $(lsof -t -i:8080)
npx http-server build -d 0 -i 0
