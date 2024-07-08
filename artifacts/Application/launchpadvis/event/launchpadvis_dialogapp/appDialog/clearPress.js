const id = NodeID.getText();
const node = graph.getCellById(id);
node.attr("text/text", null);
node.attr("metadata/name", null);
modelSelectedNode.getData().name = null;
modelSelectedNode.refresh();
appDialog.close();
