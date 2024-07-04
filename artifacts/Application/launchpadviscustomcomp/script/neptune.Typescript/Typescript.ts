(function () {
    const datamodellerLibrary = document.createElement("script");
    datamodellerLibrary.type = "module";
    datamodellerLibrary.textContent = `
        import { Keyboard } from 'https://cdn.jsdelivr.net/npm/@antv/x6-plugin-keyboard/+esm';            
        import * as Hierarchy from 'https://cdn.jsdelivr.net/npm/@antv/hierarchy/+esm';
        import { Selection } from 'https://cdn.jsdelivr.net/npm/@antv/x6-plugin-selection/+esm';
        import { Snapline } from 'https://cdn.jsdelivr.net/npm/@antv/x6-plugin-snapline/+esm';

        window.Keyboard = Keyboard;
        window.Hierarchy = Hierarchy;        
        window.Selection = Selection;
        window.Snapline = Snapline;
       `;
    document.head.appendChild(datamodellerLibrary);
})();

namespace CustomComponent {
    export function getModules() {
        return new Promise((resolve, reject) => {
            const checkModules = () => {
                //@ts-ignore
                if (
                    typeof window.Keyboard !== "undefined" &&
                    typeof window.Hierarchy !== "undefined"
                ) {
                    console.log({
                        Keyboard: window.Keyboard,
                        Hierarchy: window.Hierarchy,
                        Selection: window.Selection,
                        Snapline: window.Snapline,
                    });
                    resolve({
                        Keyboard: window.Keyboard,
                        Hierarchy: window.Hierarchy,
                        Selection: window.Selection,
                        Snapline: window.Snapline,
                    });
                } else {
                    setTimeout(checkModules, 10);
                }
            };
            checkModules();
        });
    }
}
