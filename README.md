Make sure to adjust the content root of your project in PyCharm by ight-clicking on django's root folder in PyCharm 
(ie. the one that contains manage.py and go to Mark Directory As > Sources Root. That will enable import paths to be
recognized correctly by PyCharm.

if docker container cannot connect to DB or you get error similar to this with yarn:
error An unexpected error occurred: "https://registry.yarnpkg.com/recharts/-/recharts-2.1.0.tgz: connect EHOSTUNREACH 104.16.18.35:443
do following steps:
    press Ctrl+C in docker_dev folder to stop containers
    in docker_dev type: ./down.sh and press enter
    type: docker network prune and click Y when asked
    start containers again with ./up.sh (in docker_dev folder)

Default user name and password: admin/Renon303


