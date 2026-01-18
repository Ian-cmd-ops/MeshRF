declare module '*/meshrf.js' {
  export interface LinkParameters {
    frequency_mhz: number;
    tx_height_m: number;
    rx_height_m: number;
    polarization: number;
    step_size_m: number;
    N_0: number;
    epsilon: number;
    sigma: number;
    climate: number;
  }

  export interface VectorFloat {
    size(): number;
    get(i: number): number;
    delete(): void;
  }

  export interface VectorUint8 {
    size(): number;
    get(i: number): number;
    delete(): void;
  }

  export interface MeshRFModule {
    HEAPF32: Float32Array;
    HEAPU8: Uint8Array;
    _malloc(size: number): number;
    _free(ptr: number): void;
    
    // Bindings
    calculate_itm(profile_ptr: number, count: number, params: LinkParameters): VectorFloat;
    calculate_viewshed(elev_ptr: number, width: number, height: number, tx_x: number, tx_y: number, tx_h: number, max_dist: number): VectorUint8;
    
    LinkParameters: any;
    VectorFloat: any;
    VectorUint8: any;
  }

  const createMeshRF: () => Promise<MeshRFModule>;
  export default createMeshRF;
}
