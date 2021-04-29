const divTextArea = document.getElementById('text-area-container');

setupTextField();

function setupTextField() {
    divTextArea.addEventListener('keydown', insertTabulation);
    divTextArea.addEventListener('keyup', formatAndSendText);
    divTextArea.addEventListener('change', formatAndSendText);
  }
  
function insertTabulation(event) {
    if (event.key == 'Tab') {
        event.preventDefault();
        var doc = divTextArea.ownerDocument.defaultView;
        var sel = doc.getSelection();
        var range = sel.getRangeAt(0);

        var tabNode = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
        range.insertNode(tabNode);

        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode); 
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

function formatAndSendText() {
    var possibleTags = ['BR', '#text'];
    var recievedTag = divTextArea.lastChild.nodeName;
    if (possibleTags.includes(recievedTag)) {
        document.execCommand('formatBlock', false, 'div'); /// устарела, надо заменить
    }
    getCurrentNode().setAttribute('style', 'color: #006600');
    getCurrentNode().setAttribute('align', 'left');
    sendText();
}

function getCurrentNode() {
    var node = document.getSelection().anchorNode;
    return (node.nodeType == 3 ? node.parentNode : node);
 }
        
function invertTextJustify() {
    divs = divTextArea.getElementsByTagName('div');
    for (var i = 0; i < divs.length; i++) {
        if (!divs[i].hasAttribute('align') || divs[i].getAttribute('align') === 'left') {
        divs[i].setAttribute('align', 'right');
        divs[i].setAttribute('style', 'color: #990000');
        // divs[i].setAttribute('contenteditable', 'false');
        }
        else if (divs[i].getAttribute('align') === 'right') {
        divs[i].setAttribute('align', 'left');
        divs[i].setAttribute('style', 'color: #006600');
        // divs[i].setAttribute('contenteditable', 'true');
        }
    }
}

function getMessageText() {
    return divTextArea.innerHTML;
}

function setMessageText(message) {
    divTextArea.innerHTML = message/* + '<br>'*/;
    if (divTextArea.lastChild.nodeName !== 'BR') {
        divTextArea.innerHTML += '<br>';
    }
    invertTextJustify();
}