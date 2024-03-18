1. Overwrite frontend_config.env with appropriate target from frontend_config_samples.txt
2. Login to https://hub.docker.com/ and check latest tag for ikimio/a2_avatbaselib, make sure to refresh the tag page
    couple of times as docker hub has bug where it shows old tag on top until you refresh few times
3. cd into a2dj_docker/docker_integrated_build
4. Build lib image with: ./build_and_push_lib.sh 1.8 (if last lib was for example 1.7)
5. Monitor build progress for errors until it's finished (usually takes a lot of time)
    if you get error: Temporary failure in name resolution, try:
    sudo nmcli networking off
    sudo nmcli networking on
    docker stop $(docker ps -aq) && sudo systemctl restart NetworkManager docker
    Then restart process with: ./build_and_push_lib.sh 1.8
6. Jupyter password is set in avat_api/settings and it is: Avat303@
7. ./build_and_push.sh ikim-1.4
