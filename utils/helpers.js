const getWaktu = async () => {
    let date = new Date();
    let now = date.getHours();
    let text = "";

    if (now >= 0 && now < 12) {
      return text = "Selamat pagi";
    } else if (now >= 12 && now < 16) {
      return text = "Selamat siang";
    } else if (now >= 16 && now < 18) {
      return text = "Selamat sore";
    } else if (now >= 18 && now < 24) {
      return text = "Selamat malam";
    }
}

  const getDAy = async () => {
    let date = new Date();
    let day = date.getDay();
    let dayList = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return dayList[day];
  }

module.exports = { getWaktu, getDAy }