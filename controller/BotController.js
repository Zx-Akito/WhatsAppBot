const { Controller } = require("pepesan");
const redis = require("../utils/redisConnect");
const { getDAy, getWaktu } = require("../utils/helpers");

const { EXP_REDIS } = process.env || 3600

module.exports = class BotController extends Controller {
    async introduction(request) {
      let waktu = await getWaktu();
      let day  = await getDAy();
      let nama = request.name;
      let messageSender = await redis.get(`number:${request.number}`);
      if (!messageSender) {
        await redis.set(`number:${request.number}`, request.number,{EX: EXP_REDIS});
        // if saturday and sunday
        if (day === "Sabtu" || day === "Minggu") {
          return this.reply(
            [
              `Halo, ${waktu} ${nama}! Ada yang bisa saya bantu?`,
              "Rifki akan menghubungi anda secepatnya.",
            ]
          )
        }
        return this.reply(
          [
            `Halo, ${waktu} ${nama}! Ada yang bisa saya bantu?`,
            "Rifki akan menghubungi anda secepatnya.",
          ]
        )
      }
      if (messageSender === request.number) {
        return false
      }
    }
}