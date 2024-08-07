const id = NodeID.getText();
const node = graph.getCellById(id);
const appType = SelectAppType.getSelectedKey();
let icon;

if (appType === "adaptive") {
    icon = `/public/images/platform/bare/${Init.systemTheme}/adaptive-app-designer.svg`;
    node.attr("icon/xlinkHref",icon);
} else if (appType === "webapp") {
    icon = `/public/images/platform/bare/${Init.systemTheme}/app-editor.svg`;
    node.attr("icon/xlinkHref",icon);
} else {
    icon = `/public/images/platform/bare/${Init.systemTheme}/app-designer.svg`;
    node.attr("icon/xlinkHref",icon);
}

node.attr("title/text", null);
node.attr("metadata/name", null);
node.attr("metadata/appType", appType);
node.attr("metadata/artifactID", null);
modelSelectedNode.getData().name = null;
modelSelectedNode.getData().icon = icon;
modelSelectedNode.refresh();

