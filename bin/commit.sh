#!/usr/bin/env bash

set -e

git branch

GIT_STATUS="$(git status --short)"
echo "$GIT_STATUS"

if [[ $GIT_STATUS != *"build/v1/month/"* ]]; then
	echo "month/ modified မဖြစ်သေးလို့ master ဆီ commit(တစ်ရက်တစ်ခါ) လုပ်စရာမလိုသေး"
	exit
fi

GIT_PREV_COMMIT_MSG="$(git log --oneline -1)"
echo "$GIT_PREV_COMMIT_MSG"

git config user.email "${GITHUB_EMAIL}"
git config user.name "${GITHUB_USERNAME}"
git add build/v1/month/ build/v1/year/ build/v1/calendar.json

GIT_COMMIT_MSG="[skip travis] travis ci မှတစ်ဆင့် build လုပ်၍ရလာသော build/ အောက်ရှိ month/ year/ ကို အလိုလျောက် master branch ဆီ တစ်ရက်တစ်ခါ commit လုပ်ပေးခြင်း"
echo "$GIT_COMMIT_MSG"
if [[ $GIT_PREV_COMMIT_MSG == *"$GIT_COMMIT_MSG" ]]; then
	echo "git history ရှင်းနေစေဖို့ commit အသစ်မဖန်တီးဘဲ အဟောင်းကို replace လုပ်ပစ်ပါမယ်"
	git commit --amend --no-edit
else
	git commit -m "$GIT_COMMIT_MSG"
fi

git push --force "https://tanintharyi:${GITHUB_TOKEN}@${GITHUB_REFERENCE}" HEAD:master