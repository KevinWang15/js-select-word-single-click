document.addEventListener('mouseup', (e) => {
    const selection = window.getSelection();
    if (!selection.isCollapsed) {
        console.info("[skipping] Selection detected");
        return;
    }

    const word = getWordAt(selection.focusNode.textContent, selection.focusOffset);
    if (!word) {
        console.info("[skipping] Nothing selected");
        return;
    }

    const range = selection.getRangeAt(0);

    const elementOfSelectedWord = range.startContainer.splitText(range.startOffset - word.offset),
        elementAfterSelectedWord = elementOfSelectedWord.splitText(word.word.length);

    const decoratedElementOfSelectedWord = document.createElement('span');
    decoratedElementOfSelectedWord.appendChild(document.createTextNode(elementOfSelectedWord.textContent));
    elementOfSelectedWord.parentNode.insertBefore(decoratedElementOfSelectedWord, elementAfterSelectedWord);
    elementOfSelectedWord.parentNode.removeChild(elementOfSelectedWord);

    const clientRect = decoratedElementOfSelectedWord.getBoundingClientRect();

    if (!isMousePosCoveredInClientRect(e, clientRect)) {
        console.info("[skipping] Mouse pos is not covered in client rect");
        return;
    }

    drawRedRect(clientRect);

    console.log(`${word.word}`);

    setTimeout(() => {
        // restore
        decoratedElementOfSelectedWord.previousSibling.textContent = decoratedElementOfSelectedWord.previousSibling.textContent + decoratedElementOfSelectedWord.innerText + decoratedElementOfSelectedWord.nextSibling.textContent;
        decoratedElementOfSelectedWord.parentNode.removeChild(decoratedElementOfSelectedWord.nextSibling);
        decoratedElementOfSelectedWord.parentNode.removeChild(decoratedElementOfSelectedWord);
    }, 100);
})


function getWordAt(content, offset) {
    const matchLeft = content.substr(0, offset).match(/(\w+)$/);
    const left = matchLeft ? matchLeft[1] : "";

    const matchRight = content.substr(offset).match(/^(\w+)/);
    const right = matchRight ? matchRight[1] : "";

    if (!left && !right) {
        return null;
    }

    return {word: left + right, offset: left.length};
}

function isMousePosCoveredInClientRect(event, clientRect) {
    return (
        event.clientY >= clientRect.y &&
        event.clientY <= clientRect.y + clientRect.height &&
        event.clientX >= clientRect.x &&
        event.clientX <= clientRect.x + clientRect.width
    );
}

function drawRedRect(clientRect) { // this is to simulate a popup
    const div = document.createElement('div');
    Object.assign(div.style, {
        display: "block",
        position: "absolute",
        left: (clientRect.left + window.scrollX) + "px",
        top: (clientRect.top + window.scrollY) + "px",
        width: clientRect.width + "px",
        height: clientRect.height + "px",
        border: "1px solid red"
    });

    document.body.appendChild(div);
    setTimeout(() => {
        document.body.removeChild(div);
    }, 1000)
}