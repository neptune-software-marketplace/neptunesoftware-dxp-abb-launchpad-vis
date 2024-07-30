// @ts-nocheck
namespace CustomComponent {
    export async function getModules() {
        const modules = await Promise.all([
            import('https://cdn.jsdelivr.net/npm/@antv/x6-plugin-keyboard/+esm'),
            import('https://cdn.jsdelivr.net/npm/@antv/hierarchy/+esm'),
            import('https://cdn.jsdelivr.net/npm/@antv/x6-plugin-selection/+esm'),
            import('https://cdn.jsdelivr.net/npm/@antv/x6-plugin-snapline/+esm')
        ]);
        return {
            Keyboard: modules[0].Keyboard,
            Hierarchy: modules[1],
            Selection: modules[2].Selection,
            Snapline: modules[3].Snapline
        };
    }
}