'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');

var buttonSend = document.querySelector('#sendButton');

var stompClient = null;
var username = null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}


function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');
}

//----------------------

function click(event){ // button
    chatPage.classList.remove('hidden');
    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onClickButton, onError);
    event.preventDefault();
}

function onClickButton(){ // button
    stompClient.subscribe('/topic/public');
    stompClient.send("/app/chat.componentClicked", {}, JSON.stringify({sender: username, type: 'SYSTEM', content: `${username} has clicked the button`}))
    connectingElement.classList.add('hidden');
}

function clickTextBox(event){ // textbox
    chatPage.classList.remove('hidden');
    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onClickTextBox, onError);
    event.preventDefault();
}

function onClickTextBox(){ // textbox
    stompClient.subscribe('/topic/public');
    stompClient.send("/app/chat.componentClicked", {}, JSON.stringify({sender: username, type: 'SYSTEM', content: `${username} has clicked the textbox`}))
    connectingElement.classList.add('hidden');
}

function checkCheckBox(event){ // checkbox
    chatPage.classList.remove('hidden');
    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onCheckCheckBox, onError);
    event.preventDefault();
}

function onCheckCheckBox(){ // checkbox
    var checkbox = document.getElementById("messageCheckbox");
    var isChecked = checkbox.checked;
    if (isChecked) {
        stompClient.subscribe('/topic/public');
        stompClient.send("/app/chat.componentClicked", {}, JSON.stringify({sender: username, type: 'SYSTEM', content: `${username} has checked the checkbox`}))
        connectingElement.classList.add('hidden');
    }
    else{
        stompClient.subscribe('/topic/public');
        stompClient.send("/app/chat.componentClicked", {}, JSON.stringify({sender: username, type: 'SYSTEM', content: `${username} has unchecked the checkbox`}))
        connectingElement.classList.add('hidden');
    }
}

function changeSelectItem(event){ // select (combobox)
    chatPage.classList.remove('hidden');
    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onChangeSelectItem, onError);
    event.preventDefault();
}

function onChangeSelectItem(){ // select (combobox)
    var select = document.getElementById("messageSelect");
    var selectedItem = select.value;
    stompClient.subscribe('/topic/public');
    stompClient.send("/app/chat.componentClicked", {}, JSON.stringify({sender: username, type: 'SYSTEM', content: `${username} has changed the select item to ${selectedItem}`}))
    connectingElement.classList.add('hidden');
}

function mouseHoverLabel(event){
    chatPage.classList.remove('hidden');
    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onMouseHoverLabel, onError);
    event.preventDefault();
}

function onMouseHoverLabel(){
    stompClient.subscribe('/topic/public');
    stompClient.send("/app/chat.componentClicked", {}, JSON.stringify({sender: username, type: 'SYSTEM', content: `${username} has hovered the mouse over the label`}))
    connectingElement.classList.add('hidden');
}

//-------------------

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else if (message.type === 'SYSTEM') { // mensagens de click
        messageElement.classList.add('component-message'); // daria pra criar outro, customizado no css

    } else { // chat
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)
///-------------
sendButton.addEventListener('click', sendMessage, true)
sendButton.addEventListener('click', click, true)

messageButton.addEventListener('click', click, true)
messageInput.addEventListener('click', clickTextBox, true)
messageCheckbox.addEventListener('change', checkCheckBox, true)
messageSelect.addEventListener('change', changeSelectItem, true)
messageLabel.addEventListener('mouseenter', mouseHoverLabel, true)


