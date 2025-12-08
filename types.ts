export interface Planet {
    pl_name: string;
    hostname: string;
    discoverymethod: string;
    disc_year: string;
    pl_orbper: number; // Orbital Period [days]
    pl_orbsmax: number; // Orbit Semi-Major Axis [au]
    pl_rade: number; // Planet Radius [Earth Radius]
    pl_bmasse: number; // Planet Mass [Earth Mass]
    pl_eqt: number; // Equilibrium Temperature [K]
    st_teff: number; // Stellar Effective Temperature [K]
    st_rad: number; // Stellar Radius [Solar Radius]
    st_mass: number; // Stellar Mass [Solar mass]
    sy_dist: number; // Distance [pc]
    sy_vmag: number; // V Magnitude
    ra: string;
    dec: string;
    pl_refname: string; // Reference link containing HTML
}

export enum GeminiStatus {
    IDLE = 'idle',
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error'
}

export interface SearchResult {
    content: string;
    urls: { title: string; url: string }[];
}