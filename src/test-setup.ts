/**
 * Configuración global de las pruebas (angular.json > test > setupFiles).
 *
 * Vitest ejecuta las pruebas en jsdom, una simulación del navegador que no
 * implementa todo. Aquí se completa lo que necesitan los componentes de Ionic.
 * Esto SOLO afecta a las pruebas: en el dispositivo se usan las APIs reales.
 */

// window.matchMedia: lo usa ion-split-pane para decidir cuándo mostrar el menú.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
