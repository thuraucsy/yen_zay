# Yen Zay API
[SBI page](https://kumiai.remit.co.jp/exchange/) ကို ၇ မိနစ် ၁ ခါသွားကြည့်ထားပြီး အပြောင်းအလဲရှိတာနဲ့ gh-pages မှာ update လုပ်ပေးပြီး json အနေနဲ့ပြန်သုံးနိုင်တဲ့ api ဖြစ်ပါတယ်

## api အသုံးပြုနည်း

ယနေ့ယန်းစျေး /day/today.json  
https://thuraucsy.github.io/yen_zay/v1/day/today.json

လအလိုက်ယန်းစျေး /month/{yyyymm}.json   
https://thuraucsy.github.io/yen_zay/v1/month/202005.json 

နှစ်အလိုက်ယန်းစျေး /year/{yyyy}.json  
https://thuraucsy.github.io/yen_zay/v1/year/2020.json

ပျမ်းမျှအတွက်က /month, /year နောက်မှာ average ထည့်ခေါ်ရုံပါပဲ  
https://thuraucsy.github.io/yen_zay/v1/month/average/202005.json  
https://thuraucsy.github.io/yen_zay/v1/year/average/2020.json

မြန်မာ-ဂျပန် ပိတ်ရက်ပြက္ခဒိန် /calendar.json  
https://thuraucsy.github.io/yen_zay/v1/calendar.json

## JSON ပုံစံ
ပုံစံနှစ်မျိုးအနေနဲ့တွေ့နိုင်ပါတယ်

ပုံစံ ၁။ 2020/07/29 14:10 မတိုင်ခင်အထိပုံစံ
```
{
    "YearMonth": "2020/07",
    "USDRatePerDollar": "106.29",
    "MMKRatePerYen": "12.841152",
    "DayTime": "29 14:10"
},
```

ပုံစံ ၂။ 2020/07/29 14:20 နောက်ပိုင်းကစပြီး
```
{
    "YearMonth": "2020/07",
    "USDRatePerDollar": "106.292517",
    "CashPickupMMKRatePerYen": "12.835045",
    "MMKRatePerYen": "12.841152",
    "CashPickupDateTime": "2020/07/29 14:00",
    "DayTime": "29 14:20"
},
```
ပုံစံ ၂ ကို ပုံစံ ၁ နဲ့ယှဥ်ရင် 
- CashPickupMMKRatePerYen (Cash Pickup မြန်မာကျပ်စျေး)နဲ့ 
- CashPickupDateTime (အဲ့ဒီ Cash Pickup မြန်မာကျပ်စျေးရဲ့အချိန်) ပါလာပါတယ်။ 

ဒါပေမယ့် တစ်ခုသတိပြုသင့်တာကတော့ Cash Pickup စျေးကို သွားယူပေးတဲ့အချိန် error တတ်ခဲ့မယ်ဆိုရင် ပုံစံ ၁ အနေနဲ့ပဲ return ပြန်ပေးမှာဖြစ်ပါတယ်။

## gh-pages update လုပ်ပေးတဲ့အချိန်
ယနေ့ယန်းစျေးတွေကိုတော့ [SBI page](https://kumiai.remit.co.jp/exchange/) က update လုပ်တာနဲ့ ၇ မိနစ်အတွင်း 
[today.json](https://thuraucsy.github.io/yen_zay/v1/day/today.json) မှာ update ဖြစ်ပါလိမ့်မယ်။

မနေ့ကယန်းစျေးတွေကိုတော့ /month, /year api ကနေ ခေါ်သုံးနိုင်ပြီး မနေ့ကယန်းစျေးအထိပဲ ပါပါလိမ့်မယ်။ 
ဒီနေ့ယန်းစျေးမပါတဲ့အတွက် တစ်ရက်တစ်ခါပဲ update လုပ်ပေးဖို့လိုပြီး ဂျပန်အချိန် ည ၂၄ နာရီကျော်လောက်မှာ လုပ်ပေးလေ့ရှိပါတယ်။
