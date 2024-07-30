const appData = modelData.getData();
appData.mode = "create";
appData.createData.title = "Construct your launchpad";
Functions.stencilVisibility(true);
modelData.refresh();
App.to(Design);

setTimeout(async function () {
    await Init.render();
    Events.addGraphEvents();
    Functions.centerContent();
}, 200);