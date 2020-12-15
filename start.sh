#!/usr/bin/env bash
cd ./chat
npm i --production
npm i -g pm2
pm2 delete chat
pm2 start ./index.js --name chat