const { pool } = require('../../config/db.js');
const secret = require('../../config/secret.js')
const { logger } = require('../../config/winston.js');
const { alertmove } = require('../../util/alertmove.js');

exports.listGetMid = async (req, res) => {
  const { user } = req.session;
  const page = Number(req.query.page);
  if (page < 1) {
    res.send(alertmove('/infoboard/list?page=1', '접근할 수 없는 페이지 입니다.'));
  } else {
    const conn = await pool.getConnection(async (conn) => conn);
    try {
      await conn.beginTransaction();
      const [cnt] = await conn.query('SELECT COUNT(*) as cnt from infoboard');
      const lastPage = Math.ceil(cnt[0].cnt / 10);
      if (page > lastPage) {
        res.send(
          alertmove(
            `/infoboard/list?page=${lastPage}`,
            '게시물이 없는 페이지 입니다. 마지막 페이지로 이동합니다.'
          )
        );
      } else {
        const sql = `SELECT infoboard._id, subject, date, hit, usernickname 
                  FROM infoboard
                  JOIN user
                  ON infoboard.author = user._id
                  ORDER BY _id DESC
                  LIMIT ${(page - 1) * 10},10 `;
        const [result] = await conn.query(sql);

        result.forEach((v, i) => {
          const dateYear = v.date.getFullYear();
          const dateMonth = v.date.getMonth();
          const dateDay = v.date.getDate();
          result[i].date = `${dateYear}-${dateMonth}-${dateDay}`;
        });
        const pageCal = Math.ceil(page / 5);
        await conn.commit();
        if (user !== undefined) {
          res.render('infoboard/list.html', { result, pageCal, page, user });
        } else {
          res.render('infoboard/list.html', { result, pageCal, page });
        }
      }
    } catch (err) {
      await conn.rollback();
      logger.error(`listGetMid Query error\n: ${JSON.stringify(err)}`);
    } finally {
      conn.release();
    }
  }
};

exports.writeGetMid = (req, res) => {
  const { user } = req.session;
  res.render('infoboard/write.html', { user });
};

exports.writePostMid = async (req, res) => {
  const { subject, content } = req.body;
  if (subject === '') {
    res.send(alertmove('/infoboard/write', '제목을 입력해주세요.'));
  } else {
    const author = req.session.user._id;
    const conn = await pool.getConnection(async (conn) => conn);
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        `INSERT INTO infoboard(subject,author,content,date) values('${subject}','${author}','${content}',curdate());`
      );
      await conn.commit();
      res.send(
        alertmove(
          `/infoboard/view?index=${result.insertId}&page=1`,
          '글 작성이 완료 되었습니다.'
        )
      );
    } catch (err) {
      await conn.rollback();
      logger.error(`writePostMid Query error\n: ${JSON.stringify(err)}`);
    } finally {
      conn.release();
    }
  }
};

exports.viewGetMid = async (req, res) => {
  const { user } = req.session;
  const { index, page } = req.query;
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    await conn.query(`UPDATE infoboard SET hit=hit+1 WHERE _id=${index}`);
    const sql = `SELECT 
              infoboard._id, subject, DATE_FORMAT(date,'%Y-%m-%d') AS date, hit, content, usernickname
              FROM infoboard
              JOIN user 
              ON infoboard.author=user._id 
              WHERE infoboard._id='${index}'`;
    const [result] = await conn.query(sql);

    const moreinfoSql = `SELECT
                      moreinfo._id, moreinfo.content, usernickname, linkedPosting, DATE_FORMAT(moreinfo.date, '%Y-%m-%d') AS date
                      FROM moreinfo
                      JOIN infoboard
                      ON infoboard._id = moreinfo.linkedPosting
                      JOIN user
                      ON moreinfo.author = user._id
                      WHERE linkedPosting = ${index}
                      ORDER BY moreinfo._id DESC
                      LIMIT 5`;

    const [moreinfoList] = await conn.query(moreinfoSql);
    const moreinfoCntSql = `SELECT COUNT(*) AS moreinfoCnt FROM moreinfo WHERE linkedPosting = '${index}'`;
    const [moreinfoCnt] = await conn.query(moreinfoCntSql);
    await conn.commit();
    res.render('infoboard/view.html', {
      result: result[0],
      page,
      user,
      moreinfoList,
      moreinfoCnt: moreinfoCnt[0],
    });
  } catch (err) {
    await conn.rollback();
    logger.error(`viewGetMid Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.editGetMid = async (req, res) => {
  const { user } = req.session;
  const { index, page } = req.query;
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `SELECT subject,content FROM infoboard WHERE _id='${index}' `
    );
    await conn.commit();
    res.render('infoboard/edit.html', {
      result: result[0],
      index,
      page,
      user,
    });
  } catch (err) {
    await conn.rollback();
    logger.error(`editGetMid Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.editPostMid = async (req, res) => {
  const { subject, content } = req.body;
  const { index, page } = req.query;
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    const sql = `UPDATE infoboard SET content='${content}',subject='${subject}' WHERE _id='${index}'`;
    await conn.query(sql);
    await conn.commit();
    res.send(
      alertmove(
        `/infoboard/view?index=${index}&page=${[page]}`,
        '글 수정이 완료 되었습니다.'
      )
    );
  } catch (err) {
    await conn.rollback();
    logger.error(`editPostMid Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.deleteGetMid = async (req, res) => {
  const { index, page } = req.query;
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM infoboard WHERE _id='${index}'`);
    await conn.commit();
    res.send(alertmove(`/infoboard/list?page=${page}`, '게시글이 삭제되었습니다.'));
  } catch (err) {
    await conn.rollback();
    logger.error(`deleteGetMid Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.infoboardLoginCheck = (req, res, next) => {
  const { user } = req.session;
  if (user === undefined) {
    res.send(alertmove('/user/login', '로그인이 필요한 서비스 입니다.'));
  } else {
    next();
  }
};

exports.infoboardUserCheck = async (req, res, next) => {
  const { user } = req.session;
  const { index, page } = req.query;
  const conn = await pool.getConnection(async (conn) => conn);
  const sql = `SELECT author FROM infoboard WHERE _id=${index}`;
  const [result] = await conn.query(sql);
  if (user !== undefined) {
    next();
  } else if (user._id !== result[0].author) {
    res.send(
      alertmove(
        `/infoboard/view?index=${index}&page=${page}`,
        '본인이 작성한 글만 수정/삭제가 가능합니다.'
      )
    );
  } else if (user._id === result[0].author) {
    next();
  }
};

exports.search = async (req, res) => {   // 구현안됨 코드 수정필요
  const { user } = req.session;
  const page = Number(req.query.page) || 1;
  const searchTerm = req.query.q;

const searchButton = document.querySelector('.search-button');
const searchInput = document.querySelector('.search-bar');

searchButton.addEventListener('click', (event) => {
  event.preventDefault(); 
  const searchTerm = searchInput.value;

  fetch(`/infoboard/search?q=${searchTerm}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}); 

  const offset = (page - 1) * 10;
  const conn = await pool.getConnection();

  try {
    const queryString = `SELECT infoboard._id, subject, date, hit, usernickname 
                         FROM infoboard
                         JOIN user
                         ON infoboard.author = user._id
                         WHERE subject LIKE ?
                         ORDER BY infoboard._id DESC
                         LIMIT ${(page - 1) * 10},10`;
                
    const searchValue = `%${searchTerm}%`;

    const [result] = await conn.query(queryString, [searchValue]);

    const [countResult] = await conn.query('SELECT COUNT(*) as cnt FROM infoboard WHERE subject LIKE ?', [searchValue]);

    const totalCount = countResult[0].cnt;
    const lastPage = Math.ceil(totalCount / 10);

    result.forEach((v, i) => {
      const dateYear = v.date.getFullYear();
      const dateMonth = v.date.getMonth() + 1;
      const dateDay = v.date.getDate();
      result[i].date = `${dateYear}-${dateMonth}-${dateDay}`;
    });

    const pageCal = Math.ceil(page / 5);
    const dataToSend = { result, pageCal, page, user };

    if (!user) { 
      delete dataToSend.user;
    };

    res.render('infoboard/searchlist.html', dataToSend);

  } catch (err) {
    logger.error(`search Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};