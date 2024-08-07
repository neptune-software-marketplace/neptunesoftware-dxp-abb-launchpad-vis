const appType = SelectAppType.getSelectedKey();
if (appType === "application") {
    visDialog.open("WEBIDE", "AppList");
    appDialog_dialogApp_odialog_header_oPageArtifactTitle.setText("App Designer");
    appDialog_dialogApp_odialog_header_oPageArtifactSubTitle.setText(
        "Available applications in the system"
    );
    return;
}
if (appType === "adaptive") {
    visDialog.open("Adaptive", "List");
    appDialog_dialogApp_odialog_header_oPageArtifactTitle.setText("Adaptive Designer");
    appDialog_dialogApp_odialog_header_oPageArtifactSubTitle.setText(
        "Available adaptive applications in the system"
    );
    return;
}
