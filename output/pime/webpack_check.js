const { exit } = require("process");
const service = require("./index");
const textReducer = service.textReducer;
const response = service.response;

if (!service) { 
    console.error("service not found");
    exit(1);
}

if (!textReducer) { 
    console.error("textReducer not found");
    exit(1);
}

if (!response) { 
    console.error("response not found");
    exit(1);
}
