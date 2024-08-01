const nodeID = NodeID.getText();
const node = graph.getCellById(nodeID);
const nodeName = this.getValue();
// const nodeName = InputName.getValue();

node.attr("metadata/name", nodeName);
node.attr("title/text", nodeName); // node.attr("text/text", nodeName);
// Functions.setCellSize(node, nodeName);setSize
Functions.setSize(null,null,node);