$(()=>{
    const socket = io('/admin:ChatNotice');
    $("#sendChat").click(()=>{
        var data = {
            playeridFrom:$("#playeridFrom").val(),
            playeridTo:$("#playeridTo").val(),
            chat:$("#chat").val(),
        }
        socket.emit('sendChatTo', data);
    })
})