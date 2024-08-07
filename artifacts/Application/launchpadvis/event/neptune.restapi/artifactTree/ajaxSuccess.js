modelArtifactRelations.setData({
    usingData: xhr.responseJSON.using,
    artifactsData: xhr.responseJSON.artifactTree,
});
Table.setBusy(false);
