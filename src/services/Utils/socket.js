const {Server}=require("socket.io");

let io;
const initSocket=(httpserver)=>{
    io= new Server(httpserver,{
        cors:{
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials:true
        },
        transports: ["polling", "websocket"]
    })
    io.on("connection",(socket)=>{
        console.log(" Socket connected successfully, Socket ID:", socket.id)
        console.log("📍 Query params:", socket.handshake.query);
        console.log(" Auth data:", socket.handshake.auth);

        // If client provided userId in auth or query, auto-join that room
        const userIdFromAuth = socket.handshake?.auth?.userId || socket.handshake?.query?.userId;
        if (userIdFromAuth) {
            socket.join(userIdFromAuth);
            console.log(` Auto-joined user room ${userIdFromAuth} for socket ${socket.id}`);
            console.log(` Total users in room ${userIdFromAuth}:`, io.sockets.adapter.rooms.get(userIdFromAuth)?.size);
        }

        socket.on("join_room",(userId)=>{
            socket.join(userId)
            console.log(` User ${userId} joined room. Socket ID: ${socket.id}`);
            console.log(` Total users in room ${userId}:`, io.sockets.adapter.rooms.get(userId)?.size);
        })

        socket.on("disconnect",()=>{
            console.log(" Socket disconnected:", socket.id)
        })
    })
    return io;
}

const getIo=()=>{
    if(!io){
        throw new Error("socket is not initilized")
    }
    return io;
};

module.exports={initSocket,getIo}