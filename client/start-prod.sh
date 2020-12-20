kill $(lsof -t -i:8080)
pm2 start /home/jelastic/ROOT/client/node_modules/http-server/binhttp-server --name client -- /home/jelastic/ROOT/client/build  -p 8080 -d false -i false
# npx http-server build -d 0 -i 0
