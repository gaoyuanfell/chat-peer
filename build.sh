#!/usr/bin/env bash
# destDir=./$(pwd)/chat/node_modules/chat-peer-models/build
# mkdir -p $destDir

lerna bootstrap

mkdir -p ./chat/chat-peer-models
cp -rf ./chat-peer-models/build ./chat/chat-peer-models/
cp -rf ./chat-peer-models/package.json ./chat/chat-peer-models/
cd ./chat-peer-server && npm run build
cd ..
cd ./chat-peer-sdk && npm run build
cd ..
cd ./chat-peer-ionic-ng && npm run build
cd ..
sh ./start.sh

pm2 list
pm2 logs