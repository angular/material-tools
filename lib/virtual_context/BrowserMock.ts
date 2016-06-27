
/** Basic noop function to be used for the several mock objects */
let noop = () => {};

/** Simple Browser Document Mock */
export class BrowserDocument {

  head = new BrowserElement();
  addEventListener = noop;
  contains = noop;
  querySelector = noop;

  createElement = () => new BrowserElement();

  createTextNode = data => {
    let node = new BrowserTextNode();
    node.data = data;
    return node;
  }
}

/** Minimal Browser Node Object */
export class BrowserNode {
  pathname =  '';
  children: BrowserNode[] = [];

  appendChild = child => {
    this.children.push(child);
  };

  insertBefore = this.appendChild;
}

/** Browser Text Node Object */
export class BrowserTextNode extends BrowserNode {
  data = '';
}

/** Minimal Browser HTML Element */
export class BrowserElement extends BrowserNode {
  getAttribute: () => '';
  setAttribute = noop;
  firstElementChild = {};
}

/** Window Variable / Globals of the Browser */
export class BrowserWindow {

  addEventListener = noop;
  document = new BrowserDocument();
  Node = BrowserNode;
  location = {};
  console = console;

  // Apply the Browser Window to the browser window / globals, because the window will be our
  // root, which will be sometimes called within the `window` property.
  window = this;
}