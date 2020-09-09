const url = "http://localhost:8080";
var stompClient;
let selectedUser;
let newMessages = new Map();

function connectToChat(userName){
    console.log("connecting to chat...");
    let socket = new SockJS(url+'/chat');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame){
        console.log("connected to : "+frame);
        stompClient.subscribe("/topic/messages/"+userName, function (response){
            let data = JSON.parse(response.body);
            if(selectedUser === data.fromLogin){
                render(data.message, data.fromLogin);
            } else{
                newMessages.set(data.fromLogin, data.message);
                $('#userNameAppender_'+data.fromLogin).append('<span id="newMessage_'+data.fromLogin+'" style="color:red;">+1<span>');
            }
            console.log(data);
            
        });
    });
}

function sendMsg(from, text){
    stompClient.send("/app/chat/"+selectedUser,{}, JSON.stringify({
        fromLogin : from,
        message : text
    }));
}

function registration(){
    let userName = document.getElementById("userName").value;
    sessionStorage.setItem("currentUserName", userName);
    $.get(url+"/registration/"+userName, function (response){
        connectToChat(userName);
    }).fail(function (error){
        if(error.status === 400){
            alert("Login is already busy!");
        }
    });
    fetchAll();
}

function selectUser(userName){
    console.log("Selected user is  : "+userName);
    selectedUser = userName;
    let isNew = document.getElementById('newMessage_'+userName) !== null;
    if(isNew){
        let element = document.getElementById('newMessage_'+userName);
        element.parentNode.removeChild(element);
        render(newMessages.get(userName), userName);
    }

    $("#selectedUserId").html("")
    $("#selectedUserId").append('Chat with '+userName);

}

function fetchAll(){
    $.get(url+"/fetchAllUsers", function (response){
        let users = response;
        let usersTemplateHTML = "";
        let currentUserName = sessionStorage.getItem("currentUserName");
        for(let i = 0; i < users.length; i++)
        {
            if(users[i] != currentUserName){
                usersTemplateHTML = usersTemplateHTML +
                                `<li class="clearfix">
                                    <img alt="avatar" height="55px"
                                        src="https://rtfm.co.ua/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png"
                                        width="55px"/>
                                    <div class="about">
                                        <div  id="userNameAppender_${users[i]}" class="name"><a href="#" style="text-decoration:none; color:#fff;" onclick="selectUser('${users[i]}')">${users[i]}</a></div>
                                        <div class="status">
                                            <i class="fa fa-circle offline"></i>
                                        </div>
                                    </div>
                                </li>`;
            }            
        }
        $('#usersList').html(usersTemplateHTML);
    });
}