#!/bin/bash

IMAGE="ipanema:5000/vps-request"
VENV=/data/vps-request
WORKDIR=$HOME/my_work/srce/git.vps-request/vps-request/
SHELL="/bin/bash"

test -z $1 && IMG="$IMAGE" || IMG="$1"
test -z $2 && SH="$SHELL" || SH="$2"

docker run --net vrdel-net --ip 172.18.0.10 --privileged --rm --name vps-request -ti \
	-p 80:80 -p 443:443 -p 3306:3306 -p 8000:8000 \
-e ZDOTDIR=/mnt \
-v $HOME:/mnt/ \
-v /etc/localtime:/etc/localtime:ro \
--hostname docker-debian \
--log-driver json-file --log-opt max-size=10m \
-v /dev/log/:/dev/log \
-v $WORKDIR/vpsrequest/frontend:/home/user/frontend \
-v $WORKDIR/docker/safety.sh:/home/user/safety.sh \
-v $WORKDIR/docker/collectstatic.sh:/home/user/collectstatic.sh \
-v $WORKDIR/docker/restarthttpd.sh:/home/user/restarthttpd.sh \
-v $WORKDIR/docker/syncsite.sh:/home/user/syncsite.sh \
-v $WORKDIR/docker/pysitepkg:/home/user/pysitepkg \
-v $WORKDIR/vpsrequest/:$VENV/lib64/python3.5/site-packages/vpsrequest \
-v $WORKDIR/vpsrequest/:$VENV/lib64/python3.7/site-packages/vpsrequest \
-v $WORKDIR/vpsrequest/static:$VENV/share/vpsrequest/static \
-v $WORKDIR/apache/vpsrequest.example.com.conf:/etc/apache2/sites-available/vpsrequest.example.com.conf \
-v $WORKDIR/bin/vpsreq-db:$VENV/bin/vpsreq-db \
-v $WORKDIR/bin/vpsreq-manage:$VENV/bin/vpsreq-manage \
-v $WORKDIR/bin/vpsreq-genseckey:$VENV/bin/vpsreq-genseckey \
-v $WORKDIR/etc/:$VENV/etc/vpsrequest/ \
$IMG \
$SH
