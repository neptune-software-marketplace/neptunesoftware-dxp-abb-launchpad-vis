const appData = modelData.getData();
appData.mode = "create";
stencilVisibility(true);
modelData.refresh();
Form.setVisible(false);
App.to(Design);
await render();
addGraphEvents();
centerContent();