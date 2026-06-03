require("jest-extended/all");
const { TextDecoder, TextEncoder } = require("util");

// Make TextDecoder and TextEncoder available globally for Node tests
if (typeof global.TextDecoder === "undefined") {
    global.TextDecoder = TextDecoder;
}
if (typeof global.TextEncoder === "undefined") {
    global.TextEncoder = TextEncoder;
}
