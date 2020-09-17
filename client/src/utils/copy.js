const fallbackCopyTextToClipboard = (text) => {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'Successfully copied to the clipboard' : 'Something went wrong';
        alert(msg);
    } catch (err) {
        alert('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
}

const copyTextToClipboard = (text) => {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        alert('Successfully copied to the clipboard');
    }, function(err) {
        alert('Async: Could not copy text: ', err);
    });
}

module.exports = { copyTextToClipboard };