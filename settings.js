
const chalk = require("chalk");
const fs = require("fs");

//########### BOT SETTING ###########//
global.owner = "6285736131892"
global.Nezubot = "6285736131892"
global.namaOwner = "WanzCoderID"
global.mode_public = true
global.linkChannel = "https://whatsapp.com/channel/0029Vb7vHXJ9hXFFdkjPEe2M"
global.idChannel = "120363407307029915@newsletter"
global.linkGrup = ""
global.thumbnail = "https://cdn.phototourl.com/free/2026-06-30-00b47b5b-862a-48b1-a853-18dc9b672eba.jpg"
global.thumb = "https://cyzxfxkszavvotjjcsba.supabase.co/storage/v1/object/public/photos/uploads/1765120058751-am2gia.jpeg"
global.thumbrpg = "https://cyzxfxkszavvotjjcsba.supabase.co/storage/v1/object/public/photos/uploads/1765195063451-7om3k.jpeg"
//######### PAYMENT SETTING #########//
global.dana = "893"
global.ovo = "Tidak tersedia"
global.gopay = "Tidak tersedia"
global.qris = "https://cyzxfxkszavvotjjcsba.supabase.co/storage/v1/object/public/photos/uploads/1764828743207-d8erl.jpeg"

//####### PUSHKONTAK SETTING ########//
global.JedaPushkontak = 5000
global.JedaJpm = 5000

//########## PANEL SETTING ##########//
global.egg = "15" // Isi id egg
global.nestid = "5" // Isi id nest
global.loc = "1" // Isi id location
global.domain = "https://xskycode.zpr0.com"
global.apikey = "ptla_ylDEuf61TztFlhrbdjrFZ4M8EXugfaUyEOgxY8H" // Isi api ptla
global.capikey = "ptlc_NijertA3nxUPoQmbY4QPtLSajQ4Qgtjhd5tXql" // Isi api ptlc

global.rpg = {
    thumbnail: "https://d.uguu.se/mvWindUO.jpg",
    sourceUrl: "https://whatsapp.com/channel/rpg",
    channelId: "120363423467233881@newsletter",
    channelName: "RPG Adventure"
};

global.job = {
    thumbnail: "https://d.uguu.se/mvWindUO.jpg",
    sourceUrl: "https://whatsapp.com/channel/jobs",
    channelId: "120363423467233881@newsletter",
    channelName: "Job Updates"
};

global.shop = {
    thumbnail: "https://d.uguu.se/mvWindUO.jpg",
    sourceUrl: "https://whatsapp.com/channel/shop",
    channelId: "120363423467233881@newsletter",
    channelName: "Shop Updates"
};

//######### SUBDOMAIN SETTING ########//
global.subdomain = {
  "skypedia.qzz.io": {
    "zone": "59c189ec8c067f57269c8e057f832c74",
    "apitoken": "mZd-PC7t7PmAgjJQfFvukRStcoWDqjDvvLHAJzHF"
  }, 
  "pteroweb.my.id": {
    "zone": "714e0f2e54a90875426f8a689f782d0",
    "apitoken": "vOn3NN5HJut8laSwCjzY-gBO0cxeEdgSLH9WBEH"
  },
  "panelwebsite.biz.id": {
    "zone": "2d6aab40136299392d66eed4a7b1122",
    "apitoken": "CcavVSmQZcGSrTnOos-oXnawq4yf86TUhmQW29S"
  },
  "privatserver.my.id": {
    "zone": "699bb9eb65046a8863991daacb1968",
    "apitoken": "CcavVSmQ6ZcGSrTnOos-oXnawq4yf86TUhmW29S"
  },
  "serverku.biz.id": {
    "zone": "4e4feaba70b41ed78295d2dc090dd3a",
    "apitoken": "CcavVSmQ6ZcGSrTnOos-oXnawq4yf86TUmQW29S"
  },
  "vipserver.web.id": {
    "zone": "e305b750127749c9b80f41a9f4a3a53",
    "apitoken": "cpny6vwi620Tfq4vTF4KGjeJIXdCax3dZArCqnT"
  }, 
  "mypanelstore.web.id": {
    "zone": "c61c442d70392500611499caf816532",
    "apitoken": "uaw-48Yb5tPqhh5HdhNQSJ6dPAcauPL_qKkC-Oa"
  }
}


let file = require.resolve(__filename) 
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.blue(">> Update File :"), chalk.black.bgWhite(`${__filename}`))
delete require.cache[file]
require(file)
})