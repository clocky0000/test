const { pool } = require('../../config/db.js');
const { logger } = require("../../config/winston.js");
const secret = require("../../config/secret.js");
const { alertmove } = require('../../util/alertmove.js');

exports.join = (req, res) => {
  const { user } = req.session;
  if (user !== undefined) {
    res.send(alertmove('/', '로그인된 상태입니다.'));
  } else {
    res.render('user/join.html');
  }
};

exports.joincheck = async (req, res) => {
  const { body } = req;
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    const sql = `INSERT INTO user
                (userid, userpw, usernickname)
                values
                ("${body.userid}", "${body.userpw}", "${body.usernickname}")`;
                
    await conn.query(sql);

    await conn.commit();

  } catch (err) {
    await conn.rollback();
    logger.error(`joincheck Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
  res.send(
    alertmove(
      `/user/welcome?username=${body.usernickname}`, 
      '회원가입이 완료되었습니다.'
    )
  );
};

exports.login = (req, res) => {
  const { user } = req.session;
  if (user !== undefined) {
    res.send(alertmove('/', '로그인된 상태입니다.'));
  } else {
    res.render('user/login.html');
  }
};

exports.logincheck = async (req, res) => {
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    const { userid, userpw } = req.body;
    const sql = `SELECT * FROM user WHERE userid = "${userid}" AND userpw = "${userpw}"`;
    let [result] = await conn.query(sql);
    await conn.commit();
    if (result.length !== 0) {
      if (result[0].isActive === 1) {
        if (result[0].level === 3) {
          req.session.user = result[0];
          res.redirect('/');
        }

      } else {
        res.send(alertmove('/user/login', '사용이 정지된 계정입니다.'));
      }
    } else {
      res.send(alertmove('/user/login', '존재하지 않는 계정입니다.'));
    }
  } catch (err) {
    await conn.rollback();
    logger.error(`logincheck Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};

exports.logout = (req, res) => {
  const { user } = req.session;
  if (user == undefined) {
    res.send(alertmove('/user/login', '로그인이 필요한 서비스입니다.'));
  } else {
    req.session.destroy(() => {
      req.session;
    });
    res.send(alertmove('/', '로그아웃이 완료되었습니다.'));
  }
};

exports.profile = async (req, res) => {
  const { user } = req.session;
  if (user == undefined) {
    res.send(alertmove('/user/login', '로그인이 필요한 서비스입니다.'));
  } else {
    const conn = await pool.getConnection(async (conn) => conn);
    try {
      await conn.beginTransaction();
      const sql = `SELECT * FROM user WHERE userid = "${user.userid}"`;
      const result = await conn.query(sql);

      await conn.commit();
      res.render('user/profile', { user });

    } catch (err) {
        await conn.rollback();
        logger.error(`profile Query error\n: ${JSON.stringify(err)}`);
    } finally {
      conn.release();
    }
  }
};

exports.profilecheck = async (req, res) => {
  const { body } = req;
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    const sql = `UPDATE user SET userpw = '${body.userpw}',
                usernickname = '${body.usernickname}'
                WHERE userid = '${body.userid}'`;

    const sql3 = `SELECT * FROM user WHERE userid = "${body.userid}"`;
    
    await conn.query(sql);
    const result = await conn.query(sql3);
    req.session.user = result[0][0];
    await conn.commit();
    
  } catch (err) {
    await conn.rollback();
    logger.error(`profilecheck Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
  res.send(alertmove('/user/profile', '회원정보수정이 완료되었습니다. '));
};

exports.quit = async (req, res) => {
  const { user } = req.session;
  if (user == undefined) {
    res.send(alertmove('/user/login', '로그인이 필요한 서비스입니다.'));
  } else {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const sql = `DELETE FROM user WHERE userid = "${user.userid}"`;
      await conn.query(sql);
      await conn.commit();
    } catch (err) {
        await conn.rollback();
        logger.error(`quit Query error\n: ${JSON.stringify(err)}`);
    } finally {
      conn.release();
    }
    res.send(alertmove('/user/logout', '회원탈퇴가 완료되었습니다.'));
  }
};

exports.welcome = (req, res) => {
  const { username } = req.query;
  if (username == undefined) {
    res.send(alertmove('/', '회원가입 환영페이지 입니다.'));
  } else {
    res.render('user/welcome.html', { username });
  }
};

exports.idCheck = async (req, res) => {
  const reqJson = req.body;
  const conn = await pool.getConnection(async (conn) => conn);
  try {
    await conn.beginTransaction();
    const sql = `SELECT * FROM user WHERE userid = '${reqJson.userid}'`;
    const [result] = await conn.query(sql);
    await conn.commit();
    if (result.length == 0) {
      res.send('true');
    } else {
      res.send('false');
    }
  } catch (err) {
    await conn.rollback();
    logger.error(`idCheck Query error\n: ${JSON.stringify(err)}`);
  } finally {
    conn.release();
  }
};
