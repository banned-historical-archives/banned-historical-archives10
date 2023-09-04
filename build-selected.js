const fs = require('fs-extra');
const { join } = require('path');

const whitelist = ['张春桥','江青','王洪文','姚文元','毛远新','王海容'];
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
        const content = (
          await fs.readFile(join(__dirname, `./json/${year}/${month}/${i}`))
        ).toString();
        let found = false;
        for (let j of whitelist) {
          if (content.indexOf(j) >= 0) {
            found = true;
            break;
          }
        }
        if (found) {
          console.log(JSON.parse(content).title)
          await fs.copyFile(
            join(__dirname, `./json/${year}/${month}/${i}`),
            join(__dirname, `./selected/${year}/${month}/${i}`),
          );
        }
      }
    }
  }
})();