# !/bin/bash

# PRODUCTION (fazasi)
git reset --hard
git checkout master
git pull origin master

docker compose up -d