const mysql      = require('mysql');
const fs = require('fs-extra');
const Moment = require('moment');
const { join } = require('path');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123',
  port: 3300,
  database : 'rmrb'
});

connection.connect();

const m = new Map();
(async () => {
  const range = [
    [1946, 5],
    [2003, 12],
  ];
  // const range = [[1971,1], [1971,2]];
  // const range = [[1946,5], [1946,12]];

  for (let year = range[0][0]; year <= range[1][0]; ++year) {
    console.log(year);
    for (
      let month = year === range[0][0] ? range[0][1] : 1;
      month <= 12;
      ++month
    ) {
      const time_a = Moment(year + '-' + ensure2dig(month) + '-01');
      let month_b = month < 12 ? month + 1 : 1;
      let year_b = month < 12 ? year : year + 1;
      const time_b = Moment(year_b + '-' + ensure2dig(month_b) + '-01');
      const time_a_int = time_a.unix();
      const time_b_int = time_b.unix();
      const tmp = await new Promise((resolve) =>
        connection.query(
          'select t.tid, t.author, t.subject, t.postdate, x.content from pw_threads as t left join pw_tmsgs as x on t.tid = x.tid where postdate >= ' +
            time_a_int +
            ' and postdate <= ' +
            time_b_int +
            ' order by postdate asc',
          function (error, results, fields) {
            if (error) console.error(error);
            resolve(results);
          },
        ),
      );
      if (!tmp || !tmp.length) break;
      // res.push(...tmp);

      for (const i of tmp) {
        const pdate = i.postdate;
        const d1 = Moment(pdate * 1000).format('YYYY-MM-DD');
        const d = Moment(pdate * 1000).format('YYYY-MM');

        const idx = m.get(d) || 0;
        await fs.writeFile(
          join(
            __dirname,
            `./json/${d.split('-')[0]}年${d.split('-')[1]}月/${idx}.md`,
          ),
          `### ${i.subject}
${i.author}
${d1}
${i.content}
`,
        );
        m.set(d, (m.get(d) || 0) + 1);
      }
    }
  }
  connection.end();
})();

function ensure2dig(n) {
    return n > 9 ? n : `0${n}`;
}