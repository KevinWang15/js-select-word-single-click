const HighlightClassName = "highlight";
const CommitDiscardButtonsId = "commit-discard-buttons";

const stagingWords = [];

document.addEventListener('mouseup', (e) => {
    if (e.target.className === HighlightClassName) {
        // click highlight again to remove it
        removeHighlight(e.target);
        const idx = stagingWords.indexOf(e.target.textContent);
        if (idx >= 0) {
            stagingWords.splice(idx, 1);
        }
        return;
    }

    if (e.target.tagName !== "BUTTON") {
        // click button to commit / discard
        clearCommitDiscardButtons();
    }

    // click word to add highlight
    const selection = window.getSelection();
    if (!selection.isCollapsed) {
        console.info("[skipping] Selection detected");
        return;
    }
    if (!selection.rangeCount) {
        console.info("[skipping] no range in selection");
        return;
    }

    expandSelectionToWord(selection);

    const selectionRange = selection.getRangeAt(0);
    let selectedWord = selectionRange.startContainer.splitText(selectionRange.startOffset);
    selectedWord.splitText(selectionRange.endOffset)

    const decoratedSelectedWord = document.createElement("span");
    decoratedSelectedWord.innerText = selectedWord.textContent;
    selectedWord.parentElement.insertBefore(decoratedSelectedWord, selectedWord.nextSibling);
    selectedWord.parentElement.removeChild(selectedWord);

    const clientRect = decoratedSelectedWord.getBoundingClientRect();
    if (!isMousePosCoveredInClientRect(e, clientRect)) {
        console.info("[skipping] Mouse pos is not covered in client rect");
        return;
    }

    decoratedSelectedWord.className = HighlightClassName;
    stagingWords.push(decoratedSelectedWord.innerText);
    clearSelection();

    drawCommitDiscardButtons(clientRect);
})


function clearCommitDiscardButtons() {
    const existing = document.getElementById(CommitDiscardButtonsId);
    if (existing) {
        existing.parentElement.removeChild(existing);
    }
}

function removeHighlight(element) {
    element.previousSibling.textContent = element.previousSibling.textContent + element.innerText + element.nextSibling.textContent;
    element.parentNode.removeChild(element.nextSibling);
    element.parentNode.removeChild(element);
}

function drawCommitDiscardButtons(clientRect) {
    clearCommitDiscardButtons();
    const element = document.createElement("div");
    element.id = CommitDiscardButtonsId;

    const commitBtn = document.createElement("button");
    commitBtn.innerText = "commit";

    const discardBtn = document.createElement("button");
    discardBtn.innerText = "discard";

    element.appendChild(commitBtn);
    element.appendChild(discardBtn);

    Object.assign(element.style, {
        display: "block",
        position: "absolute",
        left: (clientRect.left + clientRect.width + window.scrollX + 5) + "px",
        top: (clientRect.top + window.scrollY - 20) + "px",
        width: "200px",
        height: clientRect.height + "px",
    });

    document.body.appendChild(element);

    const clear = () => {
        stagingWords.splice(0);
        for (let element of Array.from(document.getElementsByClassName(HighlightClassName))) {
            removeHighlight(element);
        }
        clearCommitDiscardButtons();
    }

    commitBtn.addEventListener('click', () => {
        alert(stagingWords.join(" "));
        clear();
    })

    discardBtn.addEventListener('click', () => {
        clear();
    })

}

function clearSelection() {
    if (window.getSelection) {
        if (window.getSelection().empty) {
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {
        document.selection.empty();
    }
}

function isMousePosCoveredInClientRect(event, clientRect) {
    return (
        event.clientY >= clientRect.y &&
        event.clientY <= clientRect.y + clientRect.height &&
        event.clientX >= clientRect.x &&
        event.clientX <= clientRect.x + clientRect.width
    );
}

function expandSelectionToWord(selection) {
    selection.modify("move", "forward", "character");
    selection.modify("extend", "backward", "word");
    selection.modify("move", "backward", "character");
    selection.modify("extend", "forward", "word");
}
