//dotenv를 가장 상단에 넣음으로써 모든 부분에서 적용가능해짐
import "dotenv/config";
import express from "express";
import mongoose from "./db";
//model 가져오기
import User from "./models/User";
import auth from "./middleware/auth";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();
const port = 3500;

//bodyParser가 클라이언트에서 오는 정보를 서버가 이해할 수 있게 해주는 역할을 함
//application/x-www-from-urlencoded 형태의 정보를 이해할 수 있게 함
app.use(bodyParser.urlencoded({extended: true}));
//application/json 형태의 정보를 이해할 수 있게 함
app.use(bodyParser.json());
app.use(cookieParser());

//routers
app.get('/', (req, res) => res.send("Hello!"));

app.post('/register', (req, res) => {
    //회원 가입할때 필요한 정보들을 client에서 가져오면
    //그것들을 데이터 베이스에 넣어준다.

    //bodyParser가 있어서, req.body로 클라이언트 정보를 받아올 수 있음
    const user = new User(req.body);

    //사용자 정보를 받았을때, 오류가 있으면 오류코드를 띄우고, 성공하면 성공표시
    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    })
});

//login router
app.post('/login', (req, res) => {
    //요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인하기
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)
                return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})
        //비밀번호까지 같다면, 유저를 위한 토큰 생성하기
        //user는 스키마에서 받아옴
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);
                
                // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지 등 -> 여기서는 쿠키에 넣기
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id});

            })
        })
    })
});

//인증처리
app.post('/auth', auth, (req, res) => {

    //여기까지 미들웨어를 통과해왔다는 이야기는 Authenticaiton이 True라는 말
    res.status(200).json({
        _id: req.user._id,
        //role: 0 일반유저 role 0이 아니면 관리자
        isAdmin: req.user.role === 0 ? false: true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })

});

//로그아웃 기능
app.get('/logout', auth, (req, res) => {
    //미들웨어에서 가져와서 찾은 다음
    User.findOneAndUpdate(
        { _id: req.user._id },
        { token: "" },
        (err, user) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).send({
                success: true
            })
        })
})


app.listen(port, () => console.log(`listening on port ${port} 🐳`));