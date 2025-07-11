const express=require("express");
const mongoose=require("mongoose")
const cors=require("cors");
const dotenv=require("dotenv");
const app=express();
dotenv.config();
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("Database Connected Succesfully"))
.catch(()=>console.log("Database Not Connected "))
const user=require("./routes/user.route");
const women=require("./routes/women.route")
app.use("/user",user);
app.use("/women",women)
app.listen(process.env.PORT,()=>console.log(`server connected on the followinmg port ${process.env.PORT}`))

