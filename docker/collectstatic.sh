#!/bin/bash

rm -rf $VIRTUAL_ENV/share/vpsrequest/static/reactbundle/* ; \
vpsreq-manage collectstatic --noinput ; \
rm -rf $VIRTUAL_ENV/share/vpsrequest/static/admin
