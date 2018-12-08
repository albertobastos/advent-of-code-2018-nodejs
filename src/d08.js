console.time("d08");
const rl = require("./utils").getInputRL("d08");

function programReadLine(rl) {
  let root;
  rl.on("line", line => {
    let items = line.split(" ").map(str => Number(str));
    root = parseNode(items).node;
  });

  rl.on("close", () => {
    console.log("Answer (part I):", sumMetadata(root));
    console.log("Answer (part II):", nodeValue(root));
    console.timeEnd("d08");
  });
}

function parseNode(items) {
  let childrenCount = items[0];
  let metadataCount = items[1];

  let children = [];
  items = items.slice(2);
  for (let i = 0; i < childrenCount; i++) {
    let tmp = parseNode(items);
    children.push(tmp.node);
    items = tmp.itemsLeft;
  }

  metadata = items.slice(0, metadataCount);
  items = items.slice(metadataCount);

  return {
    node: {
      children: children,
      metadata: metadata
    },
    itemsLeft: items
  };
}

function sumMetadata(node) {
  return (
    node.metadata.reduce((acc, curr) => acc + curr, 0) +
    node.children.reduce((acc, curr) => acc + sumMetadata(curr), 0)
  );
}

function nodeValue(node) {
  if (node.children.length < 1) {
    // node without children, metadata items are literal values
    return sumMetadata(node);
  }

  // node with children, metadata items are references to children nodes
  return node.metadata.reduce(
    (acc, index) =>
      acc +
      (node.children[index - 1] ? nodeValue(node.children[index - 1]) : 0),
    0
  );
}

programReadLine(rl);
