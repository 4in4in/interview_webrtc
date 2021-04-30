const socket = io('/', {resource: '/new_interview/socket.io'});
const remoteVideo = document.getElementById('remote-video');
// const localVideo = document.getElementById('local-video');
var myPeer = null;
const peers = {};
var localStream = null;
var remoteStream = null;
var constraints = { video: true, audio: true };
var dataConnection = null;

function init() {
  myPeer = new Peer(undefined, {
    host: '/',
    port: '6972'
  });

  myPeer.on('call', call => { /// выполняется у второго подключившегося
    call.answer(localStream);
    console.log('answer call')
    call.on('stream', userVideoStream => {
      remoteStream = userVideoStream;
      setVideo(remoteVideo, remoteStream);
    });
  });

  myPeer.on('open', id => {
    console.log('peer open');
    socket.emit('join-room', ROOM_ID, id);
    console.log('my peer id: ', id);
  });

  myPeer.on('connection', connection => { /// выполняется у второго
    console.log('on connection event');
    dataConnection = connection;
    setupDataConnection(dataConnection);
  });

  socket.on('user-connected', userId => { /// выполняется у первого подключившегося, когда подключился второй
    console.log('user connected');
    connectToNewUser(userId, localStream);
  });
}

function startCall() {
  if(localStream === null) {
    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      localStream = stream;
      // setVideo(localVideo, localStream);
      init();
    });
  }
}

function stopCall() {
  localStream.getTracks().forEach(track => {
    track.stop();
  });
  localStream = /*localVideo.srcObject =*/ null;
  remoteStream = remoteVideo.srcObject = null;
  myPeer.destroy();
  dataConnection.close();
  dataConnection = null;
}

socket.on('user-disconnected', userId => {
  if (peers[userId]) {
    console.log('disconnected');
    peers[userId].close();
    stopCall();
    dataConnection.close();
    dataConnection = null;
  }
});

function connectToNewUser(userId, stream) { // выполняется у первого подключившегося
  const call = myPeer.call(userId, stream);
  call.on('stream', userVideoStream => {
    remoteStream = userVideoStream;
    setVideo(remoteVideo, remoteStream);
    console.log('call set remote video')
  });
  call.on('close', () => {
    console.log('call close event');
  });

  peers[userId] = call;

  dataConnection = myPeer.connect(userId);
  setupDataConnection(dataConnection);
}

function sendText() {
  if(dataConnection!== null) {
    dataConnection.send(getMessageText()); /* отправка сообщения */
  }
}

function setVideo(videoObject, stream) {
  videoObject.srcObject = stream;
  videoObject.addEventListener('loadedmetadata', () => {
    videoObject.play();
  });
}

function setupDataConnection(dataConnection) {
  dataConnection.on('data', data => { /* обработка получения сообщения */
    setMessageText(data);
  });
}