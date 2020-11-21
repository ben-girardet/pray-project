# Build the docker image
docker build -t prayprojectapi .
docker save prayprojectapi > ~/SRV/web/prayprojectapi.tar

# Settings for the container in Synology
# Activer le redemerage auto
# Port:           5300 > 3000
# TODO: Confirm          
# Volume:         docker/pray-project-uploads > /home/pray-project/server/uploads
# Liens:          pray-mongo > praymongo
# Liens:          redis > redis
# Variable env:   MONGOHOST > praymongo
# Variable env:   REDIS_HOST > redis

# "ARG" => SEED=1