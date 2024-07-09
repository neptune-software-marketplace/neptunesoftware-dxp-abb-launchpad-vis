const appData = modelData.getData();
appData.mode = "create";
appData.createData.title = "Construct your launchpad";
stencilVisibility(true);
modelData.refresh();
App.to(Design);

setTimeout(async function () {
    await render();
    addGraphEvents();
    centerContent();
}, 200);