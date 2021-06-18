import User from "../models/User";

//인증처리
let auth = (req, res, next) => {

    let token = req.cookies.x_auth;
    //인증 처리를 하는 곳
    //클라이언트 쿠키에서 토큰을 가져온다.
    //토큰을 복호화한 후 유저를 찾는다.
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        //유저가 없다면
        if(!user) return res.json({ isAuth: false, error: true });
        //유저가 있다면
        req.token = token;
        req.user = user;
        //미들웨어에서 다음으로 넘어갈 수 있도록 next()
        next();
    })

    //유저가 있으면 인증 Okay

    //유저가 없으면 인증 No!

}

export default auth;