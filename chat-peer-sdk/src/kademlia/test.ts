import { RoutingTable } from "./routing-table";
import { Contact } from "./contact";
import { Id } from "./id";

let localId = Id.fromKey("225856");
const BUCKET_SIZE = 3;
let table = new RoutingTable(localId, BUCKET_SIZE);

console.time("1");
for (let index = 0; index < 1000; index++) {
  let contact = new Contact(Id.fromKey(index.toString()));
  table.store(contact);
}
console.timeEnd("1");

// let id = Id.fromKey(`${10000000}`);

console.info(localId.toString());
console.time("2");
let cs = table.find(localId, 10);
console.timeEnd("2");
console.info(cs.map((c) => c.toString() + ":" + c.id._key).join("\n"));

console.info("\n");

// for (let index = 0; index < cs.length; index++) {
//   const contact = cs[index];
//   let table2 = new RoutingTable(contact.id, BUCKET_SIZE);
//   for (let i = 100; i < 220; i++) {
//     let contact = new Contact(Id.fromKey(i.toString()));
//     table2.store(contact);
//   }

//   let css = table2.find(id, BUCKET_SIZE);

//   for (let index = 0; index < css.length; index++) {
//     const element = css[index];
//     if (element.id.equal(id)) {
//     } else {
//       let table3 = new RoutingTable(element.id, BUCKET_SIZE);
//       for (let i = 100; i < 220; i++) {
//         let contact = new Contact(Id.fromKey(i.toString()));
//         table3.store(contact);
//       }
//       let csss = table3.find(id, BUCKET_SIZE);
//       console.info(csss.filter((c) => c.id.equal(id)));
//       console.info(csss.map((c) => c.toString()).join("\n"));
//       console.info("\n");
//     }
//   }

//   //   console.info(css.filter((c) => c.id.equal(id)));
//   //   console.info(css.map((c) => c.toString()).join("\n"));
//   //   console.info("\n");
// }

/**
 * 
 * 
 * 135debd4837026bf06c7bfc5d1e0c6a31611af1d
12f0de3dc76e067d21ed85125716e02e9f1e69f0
114d4eefde1dae3983e7a79f04c72feb9a3a7efd

 *  1352246e33277e9d3c9090a434fa72cfa6536ae2
    12c6fc06c99a462375eeb3f43dfd832b08ca9e17
    17ba0791499db908433b80f37c5fbc89b870084b
 */

// const BUCKET_SIZE = 3;

// function gTable(idkey: string, index: number, count: number) {
//   let id = Id.fromKey(idkey);
//   let table = new RoutingTable(id, BUCKET_SIZE);
//   for (let i = index; i < index + count; i++) {
//     let contact = new Contact(Id.fromKey(i.toString()));
//     table.store(contact);
//   }

//   return {
//     table,
//     id,
//   };
// }

// let id = Id.fromKey("150");

// let user1 = gTable("-1", 0, 3);
// let user2 = gTable("2", 3, 6);
// let user3 = gTable("5", 6, 9);
// let user4 = gTable("8", 9, 12);

// user1.table.toString();
// user2.table.toString();
// user3.table.toString();
// user4.table.toString();
// 638232
// 372354

// console.info(Id.fromKey("638232")._uint);
// console.info(Id.fromKey("372354")._uint);
// console.info(Id.fromKey("423914")._uint);
