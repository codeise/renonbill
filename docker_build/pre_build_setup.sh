#!/bin/sh

# if rsync is not already installed, install it
if ! dpkg-query -W -f='${Status}' rsync 2>/dev/null | grep -c "ok installed" > /dev/null; then
    sudo apt install rsync -y
fi

rsync -a ../../renonbill/* backend/code --exclude docker-proxy --exclude docker_build --exclude docker_dev --exclude docker_prod --exclude docker_win --exclude stuff
cp backend/code/backend/backend/settings_win.py backend/code/backend/backend/settings.py
rsync -a backend/code/backend/backend/* settings/
rsync -a backend/code/backend/backend/* ../../renonbill/docker_win/settings/
cp backend/code/frontend/src/environment_vars_win.js backend/code/frontend/src/environment_vars.js
cp backend/entrypoint.sh backend/code/entrypoint.sh

docker-compose -f frontend_build.yml -p fb up -d --build frontend_build
docker exec -it fb_frontend_build_1 bash -c "cd frontend && yarn install && yarn build"
