const User = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "my_secret_key";

// 회원가입
const join = async (qObj, callback) => {
    try {
        const { name, email, password } = qObj;
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });
        console.log("save 완료전");

        await newUser.save();
        callback(null, { message: "회원가입이 완료되었습니다!", result: true });
        console.log("save 완료후");
    } catch (error) {
        if (error.code === 11000) {
            callback({ status: 400, message: "이미 사용 중인 이메일입니다.", result: false });
        } else {
            callback(error);
        }
    }
};

// 로그인
const login = async (qObj, res, callback) => {
    try {
        const { email, password } = qObj;
        const user = await User.findOne({ email });
        console.log("user ==> ", user);
        if (!user) {
            return callback(null, { status: 401, message: "가입되지 않은 이메일입니다.", result: false });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return callback(null, { status: 401, message: "비밀번호가 일치하지 않습니다.", result: false });
        }

        // JWT 생성
        const token = jwt.sign(
            { email: user.email, id: user._id, name: user.name },
            SECRET,
            { expiresIn: '1h' }
        );

        // 쿠키 저장
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,   
            sameSite: 'lax', 
            path: '/', 
            maxAge: 3600000
        });

        callback(null, { name: user.name, email: user.email, result: true });
    } catch (error) {
        callback(error);
    }
};

/**
 * 로그아웃
 * @param {String} userId - 로그아웃할 사용자의 고유 ID (또는 email)
 * @param {Function} callback - 컨트롤러로 결과를 넘겨줄 콜백 함수
 */
const logout = async (qObj, res, callback) => {
    try {
        // DB에 유저의 마지막 활동 이력이나 로그아웃 시간 기록
        // (스키마에 필드 생성 후 활성화하여 로그용 남길지 고민중)
        /*
        await User.findByIdAndUpdate(
            userId, 
            { $set: { lastLogoutAt: new Date() } },
            { returnDocument: 'after' }
        );
        */
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/"
        });

        // 성공 결과를 콜백으로 반환
        callback(null, { result: true, message: '서비스 로그아웃 성공' });

    } catch (error) {
        console.error('[Service Error] 로그아웃 중 예외 발생:', error);
        callback(error);
    }
};

// 내 정보 가져오기
const getMe = async (req, res, qObj, callback) => {
    console.log("getMe qObj =", qObj);
    if (qObj.user) {
        callback(null, { user: qObj.user, result: true });
    } else {
        callback(null, { status: 401, message: "인증되지 않은 사용자입니다.", result: false });
    }
};

// 유저 정보찾기
const findUser = async (req, res, qObj, callback) => {
    if (qObj.user) {
        callback(null, { user: qObj.user, result: true });
    } else {
        callback(null, { status: 401, message: "인증되지 않은 사용자입니다.", result: false });
    }
};

module.exports = { join, login, logout, getMe };