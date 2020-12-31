FROM mongo:latest
ENV USERNAME admin
ENV PASSWORD 1234
ENV AUTHDB admin
ENV DB mydb
ENV HOST localhost
ENV PORT 27017
ENV SSL false
CMD mongodump --db "$DB" -o /home/pbk/"$(date +%Y-%m-%d-%k%M%S)" "mongodb://$USERNAME:$PASSWORD@$HOST:$PORT/?authSource=$AUTHDB&ssl=$SSL"
