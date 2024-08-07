const id = NodeID.getText();
const node = graph.getCellById(id);
const appType = SelectAppType.getSelectedKey();

if (appType === "adaptive") {
    node.attr("icon/xlinkHref",`/public/images/platform/bare/${Init.systemTheme}/adaptive-app-designer.svg`);
} else if (appType === "webapp") {
    node.attr("icon/xlinkHref",`/public/images/platform/bare/${Init.systemTheme}/app-editor.svg`);
} else {
    node.attr("icon/xlinkHref",`/public/images/platform/bare/${Init.systemTheme}/app-designer.svg`);
}

node.attr("title/text", null);
node.attr("metadata/name", null);
node.attr("metadata/appType", appType);
node.attr("metadata/artifactID", null);
modelSelectedNode.getData().name = null;
modelSelectedNode.refresh();

