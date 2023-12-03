#!/bin/bash

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <scenario> <server>"
  echo "ie: $0 cas https://host.docker.internal:8443/cas"
  exit 1
fi

node --unhandled-rejections=strict ./scenarios/$1/script.js $2 || exit 1