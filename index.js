const fs = require('fs')
const apigClientFactory = require('aws-api-gateway-client').default
const axios = require('axios')
const googleCalendarSecretKey = process.env.GOOGLE_CALENDAR_SECRETKEY

function getMyanmarNameDay (enDayName) {
  const translatedArr = [
    {
      en: 'Full Moon Day of Kasong',
      mm: 'ကဆုန်လပြည့်နေ့'
    },
    {
      en: 'Kayin New Year Day',
      mm: 'ကရင်နှစ်သစ်ကူးနေ့'
    },
    {
      en: 'Christmas Day',
      mm: 'ခရစ်စမတ်နေ့'
    },
    {
      en: 'Full Moon Day of Tazaungmone',
      mm: 'တန်ဆောင်မုန်းလပြည့်နေ့'
    },
    {
      en: 'Full Moon Day of Tabaung',
      mm: 'တပေါင်းလပြည့်နေ့'
    },
    {
      en: "Armed Forces' Day",
      mm: 'တပ်မတော်နေ့'
    },
    {
      en: "Peasants' Day",
      mm: 'တောင်သူလယ်သမားနေ့'
    },
    {
      en: 'Diwali/Deepavali',
      mm: 'ဒီပါဝရီနေ့ (ဒီဝါလီ)'
    },
    {
      en: 'New Year Holiday',
      mm: 'နှစ်သစ်ကူးနေ့'
    },
    {
      en: 'Union Day',
      mm: 'ပြည်ထောင်စုနေ့'
    },
    {
      en: 'Independence Day',
      mm: 'လွတ်လပ်ရေးနေ့'
    },
    {
      en: 'Full Moon Day of Waso (Beginning of Buddhist Lent)',
      mm: 'ဝါဆိုလပြည့်နေ့ (ဝါဝင်)'
    },
    {
      en: 'Maha Thingyan (Water Festival)',
      mm: 'သင်္ကြန်နေ့'
    },
    {
      en: 'Full Moon Day of Thadingyut',
      mm: 'သီတင်းကျွတ်လပြည့်နေ့ (ဝါထွက်)'
    },
    {
      en: 'Eid al-Adha',
      mm: 'အစ်နေ့'
    },
    {
      en: 'Labor Day / May Day',
      mm: 'အလုပ်သမားနေ့'
    },
    {
      en: "Martyrs' Day",
      mm: 'အာဇာနည်နေ့'
    }
  ]
  const foundArr = translatedArr.filter(x => enDayName.toLowerCase().indexOf(x.en.toLowerCase()) > -1)
  let mmDayName = enDayName
  if (foundArr.length > 0) {
    mmDayName = foundArr[0].mm
  } else {
    console.log('getMyanmarNameDay day not found!', enDayName)
  }
  return mmDayName
}

function main () {
  console.log(`main start`)

  const apiLocalFolder = 'build/v1/'

  const config = {
    invokeUrl: process.env.API_GATEWAY_INVOKE_URL,
    region: process.env.API_GATEWAY_REGION,
    accessKey: process.env.API_GATEWAY_ACCESSKEY,
    secretKey: process.env.API_GATEWAY_SECRETKEY
  }
  const apigClient = apigClientFactory.newClient(config)

  apigClient.invokeApi({}, 'today', 'GET', {}, {})
    .then(function (todayResult) {
      console.log('todayResult', todayResult.data)

      const apiFolderObj = {
        dayFolder: `${apiLocalFolder}day/`,
        monthFolder: `${apiLocalFolder}month/`,
        monthAvgFolder: `${apiLocalFolder}month/average/`,
        yearFolder: `${apiLocalFolder}year/`,
        yearAvgFolder: `${apiLocalFolder}year/average/`
      }

      if (!fs.existsSync(apiLocalFolder)) {
        fs.mkdirSync(apiLocalFolder)
      }
      for (const key in apiFolderObj) {
        if (!fs.existsSync(apiFolderObj[key])) {
          fs.mkdirSync(apiFolderObj[key])
        }
      }

      fs.writeFileSync(`${apiFolderObj.dayFolder}today.json`, JSON.stringify(todayResult.data, null, 4))

      /* တကယ်လို့ today json ရလဒ်က တစ်ခုပဲရှိတယ်ဆိုရင် အဲ့နေ့ရဲ့ ပထမဆုံး update ဖြစ်တာမလို့ မနေ့က လနဲ့နှစ်ကို update လုပ်ပေးရန် */
      if (todayResult.data.Items.length === 1) {
        apigClient.invokeApi({}, 'year_month', 'GET', {}, {})
          .then(function (yearMonthResult) {
            const yearMonthResObj = yearMonthResult.data
            console.log('yearMonthResult', JSON.stringify(yearMonthResObj, null, 4))

            if (Object.keys(yearMonthResObj).length > 0) {
              fs.writeFileSync(`${apiFolderObj.yearFolder}${Object.keys(yearMonthResObj)[0].substr(0, 4)}.json`, JSON.stringify(yearMonthResObj, null, 4))

              const yearAvgObj = {}
              for (const yearMonthKey in yearMonthResObj) {
                fs.writeFileSync(`${apiFolderObj.monthFolder}${yearMonthKey}.json`, JSON.stringify(yearMonthResObj[yearMonthKey], null, 4))

                /* တစ်ရက်ချင်းစီရဲ့ပျမ်းမျှတွက်၊ ပထမဆုံး စုစုပေါင်းနဲ့ အကြိမ်ရေအတွက်ကိုအရင်ရှာ */
                if (!yearAvgObj[yearMonthKey]) {
                  yearAvgObj[yearMonthKey] = {
                    Items: {}
                  }
                }
                const yearMonthObj = yearMonthResObj[yearMonthKey]
                for (const index in yearMonthObj.Items) {
                  const dayObj = yearMonthObj.Items[index]

                  const usd = parseFloat(dayObj.USDRatePerDollar)
                  const mmk = parseFloat(dayObj.MMKRatePerYen)
                  const ym = dayObj.YearMonth
                  const dt = dayObj.DayTime
                  const dtArr = dt.split(' ')

                  /* တစ်ရက် Obj ကို ပျမ်းမျှတန်ဖိုးထည့်ရန်တည်ဆောက် */
                  if (!yearAvgObj[yearMonthKey].Items[dtArr[0]]) {
                    yearAvgObj[yearMonthKey].Items[dtArr[0]] = {
                      YearMonth: ym,
                      USDRatePerDollar: 0,
                      MMKRatePerYen: 0,
                      DayTime: `${dtArr[0]} 00:00`,
                      USDRatePerDollarTotal: 0,
                      MMKRatePerYenTotal: 0,
                      Count: 0
                    }
                  }

                  yearAvgObj[yearMonthKey].Items[dtArr[0]].USDRatePerDollarTotal += usd
                  yearAvgObj[yearMonthKey].Items[dtArr[0]].MMKRatePerYenTotal += mmk
                  yearAvgObj[yearMonthKey].Items[dtArr[0]].Count++
                }
              }

              for (const yearMonthKey2 in yearAvgObj) {
                for (const dayKey in yearAvgObj[yearMonthKey2].Items) {
                  const dayObj = yearAvgObj[yearMonthKey2].Items[dayKey]
                  dayObj.USDRatePerDollar = dayObj.USDRatePerDollarTotal / dayObj.Count
                  dayObj.MMKRatePerYen = dayObj.MMKRatePerYenTotal / dayObj.Count
                }
                fs.writeFileSync(`${apiFolderObj.monthAvgFolder}${yearMonthKey2}.json`, JSON.stringify(yearAvgObj[yearMonthKey2], null, 4))
              }
              fs.writeFileSync(`${apiFolderObj.yearAvgFolder}${Object.keys(yearAvgObj)[0].substr(0, 4)}.json`, JSON.stringify(yearAvgObj, null, 4))
            }
          }).catch(function (err) {
            console.log(err)
          })

        /* google calendar api */
        const calendarData = []
        axios.get(`https://www.googleapis.com/calendar/v3/calendars/en.mm%23holiday%40group.v.calendar.google.com/events?key=${googleCalendarSecretKey}`)
          .then(function (response) {
            console.log('googleapis response1')
            const filterData = response.data.items.map(function (x) {
              return {
                summary: getMyanmarNameDay(x.summary),
                startDate: x.start.date,
                endDate: x.end.date,
                status: x.status,
                displayName: "Holidays in Myanmar"
              }
            })
            calendarData.push(...filterData)

            axios.get(`https://www.googleapis.com/calendar/v3/calendars/en.japanese%23holiday%40group.v.calendar.google.com/events?key=${googleCalendarSecretKey}`)
              .then(function (response) {
                console.log('googleapis response2')
                const filterData = response.data.items.map(function (x) {
                  return {
                    summary: x.summary,
                    startDate: x.start.date,
                    endDate: x.end.date,
                    status: x.status,
                    displayName: "Holidays in Japan"
                  }
                })
                calendarData.push(...filterData)
                console.log('calendarData', calendarData)

                fs.writeFileSync(`${apiLocalFolder}calendar.json`, JSON.stringify({ Items: calendarData }, null, 4))
              })
              .catch(function (error) {
                console.log('googleapis error1', error)
              })
          })
          .catch(function (error) {
            console.log('googleapis error2', error)
          })
      }
    }).catch(function (err) {
      console.log(err)
    })
}

main()
