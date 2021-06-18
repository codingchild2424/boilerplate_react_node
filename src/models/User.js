import mongoose from "mongoose";
import bcrypt, { hash } from "bcrypt";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
//salt가 10자리 -> 이걸 이용해서 비밀번호를 암호화함
const saltRounds = 10;

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        //중간의 space를 없애는 역할
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }

})

//user스키마의 정보를 저장하기 전에 function을 한다는 의미
userSchema.pre('save', (next) => {
    //model 스키마를 가져옴
    let user = this;

    if(user.isModified('password')){
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if(err) return next(err)
            //user.password는 원래 비밀번호
            bcrypt.hash(user.password, salt, (err, hash) => {
                if(err) return next(err)
                    //hash된 비밀번호로 바꾸기
                    user.password = hash
                    next()
            })
        })
    } else {
        //만약 비밀번호를 바꾸는 것이 아니라면, 다음으로 넘어가기
        next();
    }
});

//암호 확인
userSchema.methods.comparePassword = (plainPassword, callback) => {
    //plainPassword 1234567   암호화된 비밀번호 dfk2jljfalk 가 같은지 체크해야 함
    bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
        if(err) return callback(err),
            callback(null, isMatch)
    })
}

//token생성
userSchema.methods.generateToken = (callback) => {

    let user = this;

    //jsonwebtoken을 이용해서 token을 생성하기
    let token = jwt.sign(user._id.toHexString(), 'secretToken');

    //user에 토큰 넣기
    user.token = token;
    user.save( (err, user) => {
        if (err) return callback(err)
        callback(null, user)
    })

}

userSchema.statics.findByToken = (token, callback) => {
    let user = this;

    //토큰을 디코드한다.
    jwt.verify(token, 'secretToken', (err, decoded) => {
        //유저 아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id": decoded, "token": token}, (err, user) => {
            if(err) return callback(err);
            callback(null, user);
        })

    })
}


//userSchema를 mongoose 모델로 만듦
const User = mongoose.model('User', userSchema);

//내보내기
export default User;