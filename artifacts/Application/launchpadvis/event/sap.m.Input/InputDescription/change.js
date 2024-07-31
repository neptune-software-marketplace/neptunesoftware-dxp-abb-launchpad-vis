const nodeID = NodeID.getText();
const node = graph.getCellById(nodeID);
const nodeDesc = this.getValue();
// const nodeDesc = InputDescription.getValue();

node.attr("metadata/description", nodeDesc);
