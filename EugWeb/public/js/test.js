$(()=>{
    const socket = io();
    console.log("test.js start")
    socket.on("serverStateChanged", (serverState)=>{
        console.log(serverState);
    })
})