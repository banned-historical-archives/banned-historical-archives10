const fs = require('fs-extra');
const { join } = require('path');

const whitelist = ['张春桥','江青','王洪文','姚文元','毛远新', '毛泽东'];
function includes(str, arr) {
  str = str.replace(/松江青[浦年]/g, '').replace(/[浙镇吴隆黄]江青/g, '');
  for (const i of arr) {
      if (str.indexOf(i) >= 0) {
          console.log('#', i)
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
        const content = JSON.parse((
          await fs.readFile(join(__dirname, `./json/${year}/${month}/${i}`))
        ).toString());
        if (includes(content.title, [...whitelist, '毛主席']) || content.authors.reduce((m,k) => {
          return m || whitelist.includes(k)
        }, false)) {
          console.log(content.title)
          await fs.copyFile(
            join(__dirname, `./json/${year}/${month}/${i}`),
            join(__dirname, `./selected/${year}/${month}/${i}`),
          );
        }
      }
    }
  }
})();
