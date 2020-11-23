#!/usr/bin/env bash
echo "Start to publish..."
git add .
date=$(date '+%Y-%m-%d %H:%M:%S → ')
user=`git config user.name`
email=`git config user.email`
msg=" | msg → $1"
str="$date$user:$email$msg"
commit="git commit -am '"$str"'"
eval $commit
git pull origin master
git push origin master
echo "Success"