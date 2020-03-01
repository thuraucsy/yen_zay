#!/usr/bin/env bash

set -e

git status
git branch

git config user.email "${GITHUB_EMAIL}"
git config user.name "${GITHUB_USERNAME}"
git add build/v1/month/ build/v1/year/
git commit -m "[skip travis] travis ci မှတစ်ဆင့် build လုပ်၍ရလာသော build/ အောက်ရှိ month/ year/ ကို အလိုလျောက် master branch ဆီ တစ်ရက်တစ်ခါ commit လုပ်ပေးခြင်း"

git push "https://tanintharyi:${GITHUB_TOKEN}@${GITHUB_REFERENCE}" HEAD:master