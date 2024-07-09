modelArtifactRelations.setData({
    usingData: xhr.responseJSON.using,
    artifactsData: xhr.responseJSON.artifactTree,
    // whereUsedData: xhr.responseJSON.whereUsed,
});
Table.setBusy(false);
