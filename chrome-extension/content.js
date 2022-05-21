let inputArea = document.createElement("div");
inputArea.innerHTML =
  '<div id="mcbpmf">' +
  '<div name="mcbpmf_composing_buffer" id="mcbpmf_composing_buffer">【英】</div>' +
  '<div name="mcbpmf_candidates" id="mcbpmf_candidates"></div>' +
  '<div name="mcbpmf_debug" id="mcbpmf_debug"></div>' +
  "</div>";
document.body.appendChild(inputArea);
document.getElementById("mcbpmf").hidden = true;

function loadJs(file) {
  let script = document.createElement("script");
  script.setAttribute("src", chrome.extension.getURL(file));
  document.body.appendChild(script);
}

loadJs("bundle.js");
loadJs("input.js");
