const nodeID = NodeID.getText();
const node = graph.getCellById(nodeID);
const nodeTitle = this.getValue();

node.attr("metadata/title", nodeTitle);