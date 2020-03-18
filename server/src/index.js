const http = require("http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const socket = require("socket.io");

const PORT = 3000;
const app = express();
app.server = http.createServer(app);

app.use(morgan("dev"));

app.use(cors({exposedHeaders:"*"}));

app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.set("root",__dirname);

app.use((req,res)=>{
    res.send("HELLOOOOOO!!")
})

const io = socket(app.server);

io.on("connection", (socket) =>{
    console.log("CONNECTION ESTABLISHED")
})



app.server.listen(process.env.PORT || PORT, () => {
    console.log(`App is Running on port ${app.server.address().port}`);
})

export default app;
