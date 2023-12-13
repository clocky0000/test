const { pool } = require('../../config/db.js');
const secret = require('../../config/secret.js');
const { logger } = require('../../config/winston.js');
const { alertmove } = require('../../util/alertmove.js');

exports.readReply = async (req, res) => {
  const { page, index } = req.query;
  const pageNum = Number(page);
  const readSql = `SELECT
  reply._id, reply.content, usernickname, linkedPosting, DATE_FORMAT(reply.date, '%Y-%m-%d') AS date
                    FROM reply
                    JOIN board
                    ON board._id = reply.linkedPosting
                    JOIN user
                    ON reply.author = user._id
                    WHERE linkedPosting = ${index}
                    ORDER BY reply._id DESC
                    LIMIT ${pageNum * 5},5`;
  const cntSql = `SELECT * FROM reply WHERE linkedPosting = ${index}`;
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    const [cnt] = await conn.query(cntSql);
    const lastPage = Math.ceil(cnt.length / 5);
    await conn.commit();
    if (lastPage < pageNum) {
      res.send('false');
    } else {
      const [replyList] = await conn.query(readSql);
      res.render('reply/replyList.html', { replyList });
    }
  } catch (err) {
    await conn.rollback();
    logger.error(`readReply Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.createReply = async (req, res) => {
  const { linkedPosting, replyContent } = req.body;
  const { user } = req.session;
  let author = null;
  author = user._id;
  const createSql = `INSERT INTO reply 
                    (content, author, linkedPosting, date)
                    VALUES
                    ('${replyContent}', '${author}', '${linkedPosting}', current_date())`;
  const readSql = `SELECT
                    reply._id, reply.content, usernickname, linkedPosting, DATE_FORMAT(reply.date, '%Y-%m-%d') AS date
                    FROM reply
                    JOIN board
                    ON board._id = reply.linkedPosting
                    JOIN user
                    ON reply.author = user._id
                    WHERE linkedPosting = ${linkedPosting}
                    ORDER BY reply._id DESC
                    LIMIT 5`;
  const countSql = `SELECT COUNT(*) AS replyCnt FROM reply WHERE linkedPosting = '${linkedPosting}'`;
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    await conn.query(createSql);
    const [replyList] = await conn.query(readSql);
    const [replyCnt] = await conn.query(countSql);
    const cnt = replyCnt[0].replyCnt;
    await conn.commit();
    res.render('reply/replyList.html', { replyList, cnt });
  } catch (err) {
    await conn.rollback();
    logger.error(`createReply Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.editGetReply = (req, res) => {
  res.send(true);
};

exports.editPostReply = async (req, res) => {
  const { replyId, editContent } = req.body;
  const conn = await pool.getConnection(async (conn) => conn);

  const updateSql = `UPDATE reply 
                      SET content = '${editContent}'
                      WHERE _id = '${replyId}'`;
  const readSql = ` SELECT
                    reply._id, reply.content, usernickname, linkedPosting, DATE_FORMAT(reply.date, '%Y-%m-%d') AS date
                    FROM reply
                    JOIN board
                    ON board._id = reply.linkedPosting
                    JOIN user
                    ON reply.author = user._id
                    WHERE reply._id = ${replyId}
                    `;
  try {
    await conn.beginTransaction();
    await conn.query(updateSql);
    const [result] = await conn.query(readSql);
    await conn.commit();
    res.render('reply/replyEdit.html', { reply: result[0] });
  } catch (err) {
    await conn.rollback();
    logger.error(`editPostReply Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.delReply = async (req, res) => {
  const { replyId } = req.body;
  const conn = await pool.getConnection(async (conn) => conn);
  const delSql = `DELETE FROM reply WHERE _id = ${replyId}`;

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
  const { reply } = req.query;
  const conn = await pool.getConnection(async (conn) => conn);
  const sql = `SELECT author FROM reply WHERE _id = '${reply}'`;
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