// Google Maps Advanced Markers type definitions
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  interface MapsLibrary {
    Map: typeof google.maps.Map;
    LatLngBounds: typeof google.maps.LatLngBounds;
  }

  interface MarkerLibrary {
    AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
    PinElement: typeof google.maps.marker.PinElement;
  }
}

declare namespace google.maps.marker {
  class AdvancedMarkerElement {
    constructor(options?: AdvancedMarkerElementOptions);
    position: google.maps.LatLng | google.maps.LatLngLiteral | null;
    map: google.maps.Map | null;
    content: Node | null;
    title: string;
    zIndex: number | null;
    element: HTMLElement;
    addListener(
      eventName: string,
      handler: (event?: any) => void
    ): google.maps.MapsEventListener;
  }

  interface AdvancedMarkerElementOptions {
    position?: google.maps.LatLng | google.maps.LatLngLiteral | null;
    map?: google.maps.Map | null;
    content?: Node | null;
    title?: string;
    zIndex?: number | null;
    gmpClickable?: boolean;
  }

  class PinElement {
    constructor(options?: PinElementOptions);
    element: HTMLElement;
  }

  interface PinElementOptions {
    background?: string;
    borderColor?: string;
    glyphColor?: string;
    scale?: number;
    glyph?: string | Element;
  }
}

export {};
