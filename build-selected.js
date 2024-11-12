const fs = require('fs-extra');
const { join } = require('path');

const keywords = ['张春桥','江青','王洪文','姚文元','毛远新', '毛泽东', '毛主席', '四人帮', '左倾','右倾', '极左', '极右', '资产阶级', '修正主义', '剥削', '奴隶', '文革','文化大革命', '叶剑英', '北决扬', '鲁礼安', '无政府'];
const keywords_special = [
  {year_start: 1958, year_end: 1981, keyword: '邓小平'},
  {year_start: 1958, year_end: 1981, keyword: '刘少奇'},
  {year_start: 1958, year_end: 1961, keyword: '彭德怀'},
  {year_start: 1950, year_end: 1981, keyword: '戚本禹'},

  {year_start: 1966, year_end: 1983, keyword: '揭发'},
  {year_start: 1966, year_end: 1978, keyword: '彭真'},
  {year_start: 1966, year_end: 1978, keyword: '华国锋'},
  {year_start: 1966, year_end: 1978, keyword: '汪东兴'},
  {year_start: 1966, year_end: 1978, content_keyword: '邓榕'},
  {year_start: 1966, year_end: 1978, content_keyword: '邓朴方'},
  {year_start: 1958, year_end: 1981, content_keyword: '邓小平'},


];

function normalize(str) {
  str = str.replace(/松江青[浦年]/g, '').replace(/[浙镇吴隆黄]江青/g, '');
  return str;
}
function includes(str, arr) {
  for (const i of arr) {
      if (str.indexOf(i) >= 0) {
          return true;
      }
  }
  return false;
}

(async () => {
  const range = [
    [1946, 5],
    [2003, 12],
  ];
  // const range = [[1971,1], [1971,2]];
  // const range = [[1946,5], [1946,12]];

  await fs.ensureDir(join(__dirname, './selected'));
  let total = 0;
  for (let year = range[0][0]; year <= range[1][0]; ++year) {
    console.log(year);
    await fs.ensureDir(join(__dirname, './selected/' + year));
    for (
      let month = year === range[0][0] ? range[0][1] : 1;
      month <= 12;
      ++month
    ) {
      await fs.ensureDir(join(__dirname, './selected/' + year + '/' + month));

      for (const i of await fs.readdir(
        join(__dirname, `./json/${year}/${month}`),
      )) {
        const raw = (await fs.readFile(join(__dirname, `./json/${year}/${month}/${i}`))).toString();
        const json = JSON.parse(raw);
        const normalized_title = normalize(json.title);
        const normalized_content = normalize(raw);
        if (
          includes(normalized_title, keywords) ||
          includes(json.authors.join(','), keywords) ||
          keywords_special.reduce((m, k) => {
            return m || (
              k.year_start <= json.dates[0].year && k.year_end >= json.dates[0].year && (
                k.keyword ? (
                  normalized_title.indexOf(k.keyword) >= 0 ||
                  json.authors.reduce((m,a) => {
                    return m || a == k.keyword
                  }, false)
                ) : normalized_content.indexOf(k.content_keyword) >= 0
              )
            )
          }, false)
        ) {
          // console.log(json.title)
          ++total;
          await fs.copyFile(
            join(__dirname, `./json/${year}/${month}/${i}`),
            join(__dirname, `./selected/${year}/${month}/${i}`),
          );
        }
      }
    }
  }
  console.log(total)
})();
