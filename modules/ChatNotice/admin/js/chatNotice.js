$(()=>{
    const socket = io('/admin:ChatNotice');
    function sendChatTo(){
        var data = {
            playeridFrom:$("#playeridFrom").val(),
            playeridTo:$("#playeridTo").val(),
            chat:$("#chat").val(),
        }
        socket.emit('sendChatTo', data);
    }
    $("#sendChat").click(sendChatTo)
    $("#chat").keypress(function (e) {
        if(e.which == 13){
            sendChatTo();
        }
    })
})