const { pool } = require('../../config/db.js');
const secret = require('../../config/secret.js');
const { logger } = require('../../config/winston.js');
const { alertmove } = require('../../util/alertmove.js');

exports.readRereply = async (req, res) => {
  const { index } = req.query;
  const readSql = `SELECT
  rereply._id, rereply.content, usernickname, linkedReply, DATE_FORMAT(rereply.date, '%Y-%m-%d') AS date
                    FROM rereply
                    JOIN reply
                    ON reply._id = rereply.linkedReply
                    JOIN user
                    ON rereply.author = user._id
                    ORDER BY rereply._id DESC
                    LIMIT 5`;
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    const [rereplyList] = await conn.query(readSql);
    await conn.commit();
    res.render('rereply/rereplyList.html', { rereplyList });
} catch (err) {
  await conn.rollback();
  logger.error(`readReply Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.createRereply = async (req, res) => {
  const { linkedReply, rereplyContent } = req.body;
  const { user } = req.session;
  let author = null;
  author = user._id;
  const createSql = `INSERT INTO rereply 
                    (content, author, linkedReply, date)
                    VALUES
                    ('${rereplyContent}', '${author}', '${linkedReply}', current_date())`;
  const readSql = `SELECT
                    rereply._id, rereply.content, usernickname, linkedReply, DATE_FORMAT(rereply.date, '%Y-%m-%d') AS date
                    FROM rereply
                    JOIN reply
                    ON reply._id = rereply.linkedReply
                    JOIN user
                    ON rereply.author = user._id
                    WHERE linkedReply = ${linkedReply}
                    ORDER BY rereply._id DESC
                    LIMIT 5`;
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    await conn.query(createSql);
    const [rereplyList] = await conn.query(readSql);
    await conn.commit();
    res.render('rereply/rereplyList.html', { rereplyList });
  } catch (err) {
    await conn.rollback();
    logger.error(`createReply Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.editGetRereply = (req, res) => {
  res.send(true);
};

exports.editPostRereply = async (req, res) => {
  const { rereplyId, editContent } = req.body;
  const conn = await pool.getConnection(async (conn) => conn);

  const updateSql = `UPDATE rereply 
                      SET content = '${editContent}'
                      WHERE _id = '${rereplyId}'`;
  const readSql = ` SELECT
                    rereply._id, rereply.content, usernickname, linkedReply, DATE_FORMAT(rereply.date, '%Y-%m-%d') AS date
                    FROM rereply
                    JOIN reply
                    ON reply._id = rereply.linkedReply
                    JOIN user
                    ON rereply.author = user._id
                    WHERE rereply._id = ${rereplyId}
                    `;
  try {
    await conn.beginTransaction();
    await conn.query(updateSql);
    const [result] = await conn.query(readSql);
    await conn.commit();
    res.render('rereply/rereplyEdit.html', { rereply: result[0] });
  } catch (err) {
    await conn.rollback();
    logger.error(`editPostReply Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.delRereply = async (req, res) => {
  const { rereplyId } = req.body;
  const conn = await pool.getConnection(async (conn) => conn);
  const delSql = `DELETE FROM rereply WHERE _id = ${rereplyId}`;

  try {
    await conn.beginTransaction();
    await conn.query(delSql);
    await conn.commit();
    res.send(true);
  } catch (err) {
    await conn.rollback();
    logger.error(`delReply Query error\n: ${JSON.stringify(err)}`);
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
  const { rereply } = req.query;
  const conn = await pool.getConnection(async (conn) => conn);
  const sql = `SELECT author FROM rereply WHERE _id = '${rereply}'`;
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