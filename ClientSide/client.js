const socket = io();
let roomid;
let player1=false;
function creategame(){
    socket.emit('createroom');
    player1=true;
}

function joingame(){
    roomid = document.getElementById("roomid").value;
    socket.emit('joinroom', {roomid: roomid});
}

socket.on("newgame", (data)=>{
    roomid=data.roomid;
    document.getElementById('home').style.display= 'none';
    document.getElementById('game').style.display= "block";
    let copyButton = document.createElement('button');
    copyButton.style.display = 'block';
    copyButton.classList.add('btn','btn-primary','py-2', 'my-2')
    copyButton.innerText = 'Copy Code';
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(roomid).then(function() {
            console.log('Async: Copying to clipboard was successful!');
        }, function(err) {
            console.error('Async: Could not copy text: ', err);
        });
    });
    document.getElementById('waiting').innerHTML = `Waiting for opponent, please share code ${roomid} to join`;
    document.getElementById('waiting').appendChild(copyButton);

})

socket.on('playersconnected', ()=>{
    document.getElementById('home').style.display= 'none';
    document.getElementById('waiting').style.display='none';
    document.getElementById('gamearea').style.display='block';
})

function sendChoice(rpsValue){
    const choiceEvent= player1 ? "p1Choice" : "p2Choice";
    socket.emit(choiceEvent,{
        rpsValue: rpsValue,
        roomid: roomid
    });
    let playerChoiceButton = document.createElement('button');
    playerChoiceButton.style.display = 'block';
    playerChoiceButton.innerText = rpsValue;
    document.getElementById('player1Choice').innerHTML = "";
    document.getElementById('player1Choice').appendChild(playerChoiceButton);
}

socket.on('p1Choice', (data)=>{
    if(!player1){
        document.getElementById('opponentstate').innerHTML="Opponent has made the choice";
        let opponentButton = document.createElement('button');
        opponentButton.id = 'opponentButton';
        opponentButton.style.display = 'none';
        opponentButton.innerText = data.rpsValue;
        document.getElementById('player2choice').appendChild(opponentButton);
    }
})
socket.on('p2Choice', (data)=>{
    if(player1){
        document.getElementById('opponentstate').innerHTML="Opponent has made the choice";
        let opponentButton = document.createElement('button');
        opponentButton.id = 'opponentButton';
        opponentButton.style.display = 'none';
        opponentButton.innerText = data.rpsValue;
        document.getElementById('player2choice').appendChild(opponentButton);
    }
})

socket.on("result",(data)=>{
    let winnerText = '';
    if(data.winner != 'd') {
        if(data.winner == 'p1' && player1) {
            winnerText = 'You win';
        } else if(data.winner == 'p1') {
            winnerText = 'You lose';
        } else if(data.winner == 'p2' && !player1) {
            winnerText = 'You win';
        } else if(data.winner == 'p2') {
            winnerText = 'You lose';
        }
    }
    else {
        winnerText = `It's a draw`;
    }
    document.getElementById('opponentstate').style.display = 'none';
    document.getElementById('opponentButton').style.display = 'block';
    document.getElementById('winner').innerHTML = winnerText;
});