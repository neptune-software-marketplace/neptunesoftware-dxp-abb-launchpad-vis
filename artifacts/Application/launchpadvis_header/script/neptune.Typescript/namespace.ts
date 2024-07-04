namespace CustomComponent {
    export function setPageNumberUnit(value: string) {
        artifactHeader.setNumber(value);
    }
    export function getDomRef() {
       return oPageArtifactHeader.getDomRef();
    }
}