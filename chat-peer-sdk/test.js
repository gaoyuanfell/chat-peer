const hash = require("hash.js");
const crypto = require("crypto");
const cryptojs = require("crypto-js");

let msg =
  "eyJleHBpcmF0aW9uIjoiMjAyMC0xMi0xN1QxMDowNTozMy4wMzJaIiwiY29uZGl0aW9ucyI6W1siY29udGVudC1sZW5ndGgtcmFuZ2UiLDAsMTA0ODU3NjBdXX0=";
let key = "hjbFwJOtigWvvYs3nHTj1f00B0LSDv";

let hmac = crypto.createHmac("sha1", key).update(msg);

console.info(hmac.digest("hex")); // 1

let h2 = hash.hmac(hash.sha1, key).update(msg).digest("hex");

console.info(h2); // 2

let h3 = cryptojs.HmacSHA1(msg, key).toString();

console.info(h3); // 2

let a2 = cryptojs.enc.Base64.stringify(cryptojs.enc.Hex.parse(h2));

console.info(a2);

let a1 = cryptojs.enc.Base64.stringify(cryptojs.HmacSHA1(msg, key));
console.info(a1);

let arr = hash.utils.toArray(h2, "hex");
console.info(arr);
let buffer = new ArrayBuffer(arr.length);
let uint = new Uint8Array(buffer);
for (let index = 0; index < arr.length; index++) {
  uint[index] = arr[index];
}

console.info(uint);

function buf2hex(buffer) {
  // buffer is an ArrayBuffer
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
    .join("");
}

console.info(buffer);
console.info(buf2hex(buffer));

// console.info(btoa(JSON.stringify(asd)));

// function a() {
//   //   try {
//   // throw new Error("qweqwe");
//   //   } catch (error) {
//   return Promise.reject("123");
//   //   }
//   //   return Promise.reject("12123");
// }

// async function b() {
//   let as = await a();
//   //   console.info(as);
//   console.info("123");
// }

// b();
