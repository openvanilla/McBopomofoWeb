let inputArea = document.createElement("div");
inputArea.innerHTML =
  '<div id="mcbpmf">' +
  '<div name="mcbpmf_composing_buffer" id="mcbpmf_composing_buffer"></div>' +
  '<div name="mcbpmf_candidates" id="mcbpmf_candidates"></div>' +
  '<div name="mcbpmf_debug" id="mcbpmf_debug"></div>' +
  "</div>";
document.body.appendChild(inputArea);

document.addEventListener("focusin", function (e) {
  console.log("focusin!");
  console.log(e);
  document.getElementById("mcbpmf_composing_buffer").innerText =
    e.target.nodeName.toString();
  document.getElementById("mcbpmf_candidates").innerText =
    e.srcElement.nodeName.toString();
});
