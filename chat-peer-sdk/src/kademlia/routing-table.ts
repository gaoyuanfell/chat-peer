import { Bucket } from "./bucket";
import { Contact } from "./contact";
import { Id } from "./id";
import { LookupList } from "./lookup-list";

type BucketRecursion = {
  parent: BucketTree | null;
  bucket: Bucket;
  allowSplit: boolean;
  nth: number;
  bit: boolean;
};

type BucketTree = {
  right: BucketTree | Bucket;
  left: BucketTree | Bucket;
};

export class RoutingTable {
  _bucketSize: number;
  _root: Bucket | BucketTree;
  id: Id;

  constructor(localId: Id, bucketSize: number) {
    this._bucketSize = bucketSize;
    this._root = new Bucket(bucketSize);
    this.id = localId;
  }

  store(contact: Contact) {
    if (contact.id.equal(this.id)) return null;
    let res = this._findBucket(contact);
    if (res.bucket.store(contact)) return null;

    this._splitAndStore(contact, res);
    return null;
  }

  storeSome(contacts: Contact[]) {
    for (let i = 0; i < contacts.length; ++i) {
      this.store(contacts[i]);
    }
  }

  remove(contact: Contact) {
    let res = this._findBucket(contact);
    res.bucket.remove(contact);
  }

  private _splitAndStore(contact: Contact, opt: BucketRecursion) {
    let node = {
      left: new Bucket(this._bucketSize),
      right: new Bucket(this._bucketSize),
    };
    opt.bucket.split(opt.nth, node.left, node.right);
    if (opt.parent === null) this._root = node;
    else if (opt.parent.left === opt.bucket) opt.parent.left = node;
    else opt.parent.right = node;
    let bucket = opt.bit ? node.right : node.left;
    return bucket.store(contact);
  }

  private _findBucket(contact: Contact): BucketRecursion {
    let parent: BucketTree | Bucket | null = null;
    let node: BucketTree | Bucket = this._root;
    let allowSplit = 1;
    let i = 0;
    let bit;
    for (; i < Id.BIT_SIZE; ++i) {
      bit = contact.id.at(i);
      allowSplit &= +(bit === this.id.at(i));
      if (node instanceof Bucket) {
        break;
      }
      parent = node;
      node = bit ? (node as BucketTree).right : (node as BucketTree).left;
    }
    return {
      parent: parent,
      bucket: node as Bucket,
      allowSplit: !!allowSplit,
      nth: i,
      bit: bit as boolean,
    };
  }

  private _find(
    id: Id,
    rank: number,
    node: BucketTree | Bucket,
    count: number,
    list: LookupList
  ) {
    if (node instanceof Bucket) {
      list.insertMany(node.obtain());
      return;
    }
    const findIn = (main: BucketTree | Bucket, other: BucketTree | Bucket) => {
      this._find(id, rank + 1, main, count, list);
      if (list.length < count) this._find(id, rank + 1, other, count, list);
    };
    if (id.at(rank)) {
      findIn(node.right, node.left);
    } else {
      findIn(node.left, node.right);
    }
  }

  find(id: Id, count: number = this._bucketSize) {
    let list = new LookupList(id, count);
    this._find(id, 0, this._root, count, list);
    return list.getContacts();
  }

  toString(indent: number = 0) {
    return nodeToString(this._root, "", indent);
  }
}

function nodeToString(
  node: BucketTree | Bucket,
  prefix: string,
  indent: number
) {
  var res = "";
  if (node instanceof Bucket) {
    res += new Array(indent).join(" ") + node.toString() + "\n";
  } else {
    res += new Array(indent).join(" ") + "+ " + prefix + "0:\n";
    res += nodeToString(node.left, prefix + "0", indent + 4);
    res += new Array(indent).join(" ") + "+ " + prefix + "1:\n";
    res += nodeToString(node.right, prefix + "1", indent + 4);
  }
  return res;
}
