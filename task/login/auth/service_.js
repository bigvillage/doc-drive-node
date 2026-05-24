const util = require(`${process.env.HOME}/lib/util`);
const config = util.getPortalConfig();
const { getMongoDbClient } = require("../../../../lib/mongoDB");

/**
 * 쿠키 및 세션 확인
 * @author taegyun
 * @param {*} req
 * @returns {Promise<boolean>} 성공여부
 */
const isAuth = async req => {
  const auth = await _defaultAuth(req);
  if (auth) {
    return true;
  }
};

/**
 * @author taegyun
 * @param {*} req
 * @returns {Promise<boolean>} 성공여부
 */
const _defaultAuth = async req => {
  const cookie = req.headers.cookie;
  if (util.isUndefined(cookie)) {
    return false;
  }

  const resultData = await _hasSession(req);
  //세션을 가지고있는지 확인
  util.msgbox2("isAuth.resultData=> ", resultData);
  //true일시 웹페이지의 _continue 판단
  return resultData;
};

/**
 * mongoDB에 저장된 세션값을 불러온다.( _id 값을 불러옴.)
 * @author taegyun
 * @param {*} req
 * @returns {Promise<boolean>} 성공여부
 */
const _hasSession = async req => {
  let isSessionResult = false; //비교를 위한 변수 선언
  try {
    // MongoDB 데이터베이스 이름
    const dbName = config.db.mongoDB.database;

    // collections 검사
    if (config.db.mongoDB.collections.includes("sessions")) {
      const filter = {
        _id: req.sessionID,
      };

      const resultArray = await getMongoDbClient().db(dbName).collection("sessions").find(filter).toArray();

      if (resultArray.length > 0) {
        isSessionResult = true;
      } else {
        isSessionResult = false;
      }
    } else {
      util.msgbox2("collections에 없는 collection 입니다.");
      return isSessionResult;
    }
  } catch (error) {
    console.error(error);
    console.error(`${new Date().toISOString()} - ${error.message}`);
  }

  return isSessionResult;
};

module.exports = {
  isAuth,
};
