import * as d3 from 'd3';
import { Planet } from '../types';

export const loadPlanetsData = async (): Promise<Planet[]> => {
    try {
        const data = await d3.csv('data/tess_confirmed_planets.csv');
        
        return data.map((d: any) => {
            const parseFloatSafe = (val: any) => {
                if (val === null || val === undefined || val === '') return 0;
                const num = parseFloat(val);
                return isNaN(num) ? 0 : num;
            };

            return {
                pl_name: d.pl_name || '',
                hostname: d.hostname || '',
                discoverymethod: d.discoverymethod || '',
                disc_year: d.disc_year || '',
                pl_orbper: parseFloatSafe(d.pl_orbper),
                pl_orbsmax: parseFloatSafe(d.pl_orbsmax),
                pl_rade: parseFloatSafe(d.pl_rade),
                pl_bmasse: parseFloatSafe(d.pl_bmasse),
                pl_eqt: parseFloatSafe(d.pl_eqt),
                st_teff: parseFloatSafe(d.st_teff),
                st_rad: parseFloatSafe(d.st_rad),
                st_mass: parseFloatSafe(d.st_mass),
                sy_dist: parseFloatSafe(d.sy_dist),
                sy_vmag: parseFloatSafe(d.sy_vmag),
                ra: d.ra || '',
                dec: d.dec || '',
                pl_refname: d.pl_refname || ''
            };
        });
    } catch (error) {
        console.error("Error loading planet data:", error);
        return [];
    }
};

export const parseCSV = (): Planet[] => {
    console.warn("parseCSV is deprecated. Use loadPlanetsData instead.");
    return [];
};