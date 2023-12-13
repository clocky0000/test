const { pool } = require('../../config/db.js');
const secret = require('../../config/secret.js');
const { logger } = require('../../config/winston.js');
const { alertmove } = require('../../util/alertmove.js');

exports.readMoreinfo = async (req, res) => {
  const { page, index } = req.query;
  const pageNum = Number(page);
  const readSql = `SELECT
  moreinfo._id, moreinfo.content, usernickname, linkedPosting, DATE_FORMAT(moreinfo.date, '%Y-%m-%d') AS date
                    FROM moreinfo
                    JOIN infoboard
                    ON infoboard._id = moreinfo.linkedPosting
                    JOIN user
                    ON moreinfo.author = user._id
                    WHERE linkedPosting = ${index}
                    ORDER BY moreinfo._id DESC
                    LIMIT ${pageNum * 5},5`;
  const cntSql = `SELECT * FROM moreinfo WHERE linkedPosting = ${index}`;
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    const [cnt] = await conn.query(cntSql);
    const lastPage = Math.ceil(cnt.length / 5);
    await conn.commit();
    if (lastPage < pageNum) {
      res.send('false');
    } else {
      const [moreinfoList] = await conn.query(readSql);
      res.render('moreinfo/moreinfoList.html', { moreinfoList });
    }
  } catch (err) {
    await conn.rollback();
    logger.error(`readMoreinfo Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.createMoreinfo = async (req, res) => {
  const { linkedPosting, moreinfoContent } = req.body;
  const { user } = req.session;
  let author = null;
  author = user._id;
  const createSql = `INSERT INTO moreinfo 
                    (content, author, linkedPosting, date)
                    VALUES
                    ('${moreinfoContent}', '${author}', '${linkedPosting}', current_date())`;
  const readSql = `SELECT
                    moreinfo._id, moreinfo.content, usernickname, linkedPosting, DATE_FORMAT(moreinfo.date, '%Y-%m-%d') AS date
                    FROM moreinfo
                    JOIN infoboard
                    ON infoboard._id = moreinfo.linkedPosting
                    JOIN user
                    ON moreinfo.author = user._id
                    WHERE linkedPosting = ${linkedPosting}
                    ORDER BY moreinfo._id DESC
                    LIMIT 5`;
  const countSql = `SELECT COUNT(*) AS moreinfoCnt FROM moreinfo WHERE linkedPosting = '${linkedPosting}'`;
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    await conn.query(createSql);
    const [moreinfoList] = await conn.query(readSql);
    const [moreinfoCnt] = await conn.query(countSql);
    const cnt = moreinfoCnt[0].moreinfoCnt;
    await conn.commit();
    res.render('moreinfo/moreinfoList.html', { moreinfoList, cnt });
  } catch (err) {
    await conn.rollback();
    logger.error(`createMoreinfo Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.editGetMoreinfo = (req, res) => {
  res.send(true);
};

exports.editPostMoreinfo = async (req, res) => {
  const { moreinfoId, editContent } = req.body;
  const conn = await pool.getConnection(async (conn) => conn);

  const updateSql = `UPDATE moreinfo
                      SET content = '${editContent}'
                      WHERE _id = '${moreinfoId}'`;
  const readSql = ` SELECT
                    moreinfo._id, moreinfo.content, usernickname, linkedPosting, DATE_FORMAT(moreinfo.date, '%Y-%m-%d') AS date
                    FROM moreinfo
                    JOIN infoboard
                    ON infoboard._id = moreinfo.linkedPosting
                    JOIN user
                    ON moreinfo.author = user._id
                    WHERE moreinfo._id = ${moreinfoId}
                    `;
  try {
    await conn.beginTransaction();
    await conn.query(updateSql);
    const [result] = await conn.query(readSql);
    await conn.commit();
    res.render('moreinfo/moreinfoEdit.html', { moreinfo: result[0] });
  } catch (err) {
    await conn.rollback();
    logger.error(`editPostMoreinfo Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.delMoreinfo = async (req, res) => {
  const { moreinfoId } = req.body;
  const conn = await pool.getConnection(async (conn) => conn);
  const delSql = `DELETE FROM moreinfo WHERE _id = ${moreinfoId}`;

  try {
    await conn.beginTransaction();
    await conn.query(delSql);
    await conn.commit();
    res.send(true);
  } catch (err) {
    await conn.rollback();
    logger.error(`delMoreinfo Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.checkLogin = (req, res, next) => {
  const { user } = req.session;
  if (user === undefined) {
    res.send('error1');
  } else {
    next();
  }
};

exports.userCheck = async (req, res, next) => {
  const { user } = req.session;
  const { moreinfo } = req.query;
  const conn = await pool.getConnection(async (conn) => conn);
  const sql = `SELECT author FROM moreinfo WHERE _id = '${moreinfo}'`;
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(sql);
    await conn.commit();
    if (result[0].author !== user._id) {
      res.send('error2');
    } else {
      next();
    }
  } catch (err) {
    await conn.rollback();
    logger.error(`userCheck Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};