import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/boiler", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
}).then(() => console.log("MongoDB is Connected!"))
  .catch(err => console.log(err));