const id = LabelID.getText(); // this is the id of the node
const node = graph.getCellById(id);

if (node) {
    node.attr("text/text", InputName.getValue());
} else {
    console.error("Node with ID " + id + " does not exist.");
}
