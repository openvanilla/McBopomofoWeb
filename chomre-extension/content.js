let inputArea = document.createElement("div");
inputArea.innerHTML =
  '<div id="mcbpmf">' +
  '<div name="mcbpmf_composing_buffer" id="mcbpmf_composing_buffer"></div>' +
  '<div name="mcbpmf_candidates" id="mcbpmf_candidates"></div>' +
  '<div name="mcbpmf_debug" id="mcbpmf_debug"></div>' +
  "</div>";
document.body.appendChild(inputArea);
document.getElementById("mcbpmf").hidden = true;

window.currentElement = null;
window.myKeyUp = function (event) {
  console.log("keyup");
  console.log(event);
};

window.myKeydown = function (event) {
  console.log("keydown");
  console.log(event);
  let ce = window.currentElement;
  if (ce.nodeName == "DIV") {
    console.log("selection");
    var sel = window.getSelection();
    console.log(sel);
    document.getElementById("mcbpmf_candidates").innerText =
      sel.focusOffset + "-" + (sel.focusOffset + sel.rangeCount - 1);
    // let s = window.currentElement.innerText;
    // window.currentElement.innerText = s + "a";
  } else {
    document.getElementById("mcbpmf_candidates").innerText =
      ce.selectionStart + "-" + ce.selectionEnd;
    // let s = window.currentElement.value;
    // window.currentElement.value = s + "a";
  }
};

document.addEventListener("focusin", function (e) {
  if (window.currentElement != undefined) {
    window.currentElement.removeEventListener("keyup", myKeyUp);
    window.currentElement.removeEventListener("keydown", myKeydown);
  }
  console.log(e.target);
  let nodeName = e.target.nodeName;
  let newElement;
  if (nodeName === "TEXTAREA") {
    newElement = e.target;
  } else if (nodeName === "DIV") {
    newElement = e.target;
  } else if (nodeName === "INPUT") {
    if (e.target.type === "text") {
      newElement = e.target;
    }
  }

  if (newElement == undefined) {
    window.currentElement = null;
    document.getElementById("mcbpmf").hidden = true;
    return;
  }

  document.getElementById("mcbpmf").hidden = false;
  window.currentElement = newElement;
  window.currentElement.addEventListener("keyup", myKeyUp);
  window.currentElement.addEventListener("keydown", myKeydown);

  document.getElementById("mcbpmf_candidates").innerText =
    e.srcElement.nodeName.toString();
});
