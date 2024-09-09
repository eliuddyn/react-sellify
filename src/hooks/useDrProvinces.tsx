/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ProvincesAndSectors from "../lib/provincias-sectores";
import { useEffect, useState } from "react";

type Province = {
    zone: string,
    province: string,
    municipality: string,
    municipalDistrict: string,
    neighborhood: string
}

const useDrProvinces = () => {

    // let theEnvURL: string = ''

    // if (process.env.NODE_ENV === 'development') {
    //     theEnvURL = 'http://localhost:3000'
    // }

    // if (process.env.NODE_ENV === 'production') {
    //     theEnvURL = 'https://next-fast-hospital.vercel.app'
    // }

    const [allTheProvinces, setAllTheProvinces] = useState<any>([]);

    // async function getProvinces() {
    //     const response = await fetch(`${theEnvURL}/api/provinces`)
    //     const provinces = await response.json();
    //     return provinces;
    // }

    const loadProvinces = async () => {
        // const provinces = await getProvinces()
        const provinces = ProvincesAndSectors

        const provsToDB: Array<any> = [];

        let provs: Array<any> = [];
        let allProvinces: Array<any> = [];
        let municipalities: Array<any> = [];
        let allMunicipalities: Array<any> = [];
        let municipalDistricts: Array<any> = [];
        let allMunicipalDistricts: Array<any> = [];
        let neighborhoods: Array<any> = [];
        let allNeighborhoods: Array<any> = [];

        /* Getting All Separated */
        provinces.forEach((myProv: Province) => {

            provs.push(myProv.province)
            municipalities.push(myProv.municipality)
            municipalDistricts.push(myProv.municipalDistrict)
            neighborhoods.push(myProv.neighborhood)
        })

        allProvinces = [...new Set(provs)]
        allMunicipalities = [...new Set(municipalities)]
        allMunicipalDistricts = [...new Set(municipalDistricts)]
        allNeighborhoods = [...new Set(neighborhoods)]
        /* Getting All Separated */

        let gg: Array<any> = [];
        let vv: Array<any> = [];
        let yy: Array<any> = [];
        let kk: Array<any> = [];

        allProvinces.forEach(singleProv => {

            let myProv = {

                name: '',
                zone: '',
                municipalities: [
                    {
                        municipalityName: '',
                        municipalDistricts: [
                            {
                                municipalDistrictName: '',
                                neighborhoods: []
                            }
                        ]
                    }
                ]
            }

            gg = provinces.filter((prvnc: any) => prvnc.province === singleProv);

            allMunicipalities.forEach(allM => {

                vv = gg.filter(gg1 => gg1.municipality === allM);

                if (vv.length > 0) {

                    myProv.zone = vv[0].zone;
                    myProv.name = singleProv;

                    if (myProv.municipalities.find(mun => mun.municipalityName === allM) === undefined) {

                        const ll = {
                            municipalityName: allM,
                            municipalDistricts: []
                        }

                        myProv.municipalities.push(ll)
                    }

                    allMunicipalDistricts.forEach(allMD => {

                        yy = vv.filter(vv1 => vv1.municipalDistrict === allMD);

                        if (yy.length > 0) {

                            if (myProv.municipalities?.find(mun => mun.municipalDistricts?.find(munD => munD.municipalDistrictName === allMD)) === undefined) {

                                const qf = {
                                    municipalDistrictName: allMD,
                                    neighborhoods: []
                                }

                                myProv.municipalities.find(mun => mun.municipalityName === allM && mun.municipalDistricts.find(munD => munD.municipalDistrictName === allMD, mun.municipalDistricts.push(qf)))
                            }

                            allNeighborhoods.forEach(singleNBH => {

                                kk = yy.filter(yy1 => yy1.neighborhood === singleNBH);

                                if (kk.length > 0) {
                                    kk?.forEach(myKk => {

                                        myProv.municipalities?.forEach(myMunic => {

                                            myMunic.municipalDistricts?.forEach((myMunicDist: any) => {

                                                if (myKk?.province === singleProv &&
                                                    myKk?.municipality === myMunic?.municipalityName &&
                                                    myKk?.municipalDistrict === myMunicDist?.municipalDistrictName) {

                                                    const nighborhoodToAdd = {
                                                        neighborhoodName: myKk?.neighborhood
                                                    }

                                                    myMunicDist.neighborhoods.push(nighborhoodToAdd);
                                                    myMunicDist.neighborhoods.sort();
                                                }
                                            });
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });

            if (myProv.municipalities[0].municipalityName === '') {
                myProv.municipalities.shift();
            }

            provsToDB.push(myProv)
        });

        setAllTheProvinces(provsToDB);
    }

    useEffect(() => {
        loadProvinces();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { allTheProvinces, loadProvinces }
}

export default useDrProvinces


