#!/usr/bin/env bash
cd ./chat
npm i --production
pm2 delete chat
pm2 start ./index.js --name chat