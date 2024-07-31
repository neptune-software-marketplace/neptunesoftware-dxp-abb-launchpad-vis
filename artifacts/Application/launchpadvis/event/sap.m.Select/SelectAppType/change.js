const id = NodeID.getText();
const node = graph.getCellById(id);
const appType = SelectAppType.getSelectedKey();

if (appType === "adaptive") {
    node.attr("icon/xlinkHref",`/public/images/platform/bare/${Init.systemTheme}/adaptive-app-designer.svg`);
} else {
    node.attr("icon/xlinkHref",`/public/images/platform/bare/${Init.systemTheme}/app-designer.svg`);
}

node.attr("text/text", null);
node.attr("metadata/name", null);
node.attr("metadata/appType", null);
node.attr("metadata/artifactID", null);
modelSelectedNode.getData().name = null;
modelSelectedNode.refresh();

