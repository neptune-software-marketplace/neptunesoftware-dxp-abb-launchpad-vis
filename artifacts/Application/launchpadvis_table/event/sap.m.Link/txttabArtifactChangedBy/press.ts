if (sap?.n?.Planet9?.showUserInfo) {
    sap.n.Planet9.showUserInfo(this.getText(), this);
}
// @ts-ignore
if (typeof nwd !== "undefined" && nwd?.Planet9?.showUserInfo) {
    // @ts-ignore
    nwd.Planet9.showUserInfo(this.getText(), this);
}
//@ts-ignore
if (typeof scriptEditor !== "undefined" && scriptEditor?.ajax?.getUserInfo) {
    //@ts-ignore
    scriptEditor.ajax.getUserInfo(this.getText(), this);
}
