const appData = modelData.getData();
appData.mode = "create";
stencilVisibility(true);
modelData.refresh();
App.to(Design);

setTimeout(async function () {
    await render();
    addGraphEvents();
    centerContent();
}, 200);