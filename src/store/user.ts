/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand'
import { Models } from 'appwrite'
import { devtools, persist } from 'zustand/middleware'
import { Customer, MunicipalDistrict, Municipality, Neighborhood } from '@/types/myTypes';

type UserState = {
    userSession: Models.Session | object | null;
    setUserSession: (newUserSession: Models.Session | Models.User<Models.Preferences> | null) => void;

    customerInSession: Customer | null;
    setCustomerInSession: (newCustomer: Customer | null) => void;

    customerCartItemsInSession: Models.Document[] | any;
    setCustomerCartItemsInSession: (newCustomerCartItems: Models.Document | null, action: string) => void;

    allTheMunicipalities: Municipality[],
    setAllTheMunicipalities: (newMunicipalities: Municipality[]) => void;

    allTheMunicipalDistricts: MunicipalDistrict[],
    setAllTheMunicipalDistricts: (newMunicipalDistricts: MunicipalDistrict[]) => void;

    allTheNeighborhoods: Neighborhood[],
    setAllTheNeighborhoods: (newNeighborhoods: Neighborhood[]) => void;
}

const useSellifyStore = create<UserState>()(

    devtools(
        persist(
            (set) => ({
                userSession: null,
                setUserSession: (newUserSession: Models.Session | Models.User<Models.Preferences> | null) => set(
                    { userSession: newUserSession }
                ),

                customerInSession: null,
                setCustomerInSession: (newCustomer: Customer | null) => set({ customerInSession: newCustomer }),

                customerCartItemsInSession: null,
                setCustomerCartItemsInSession: (newCustomerCartItems: Models.Document | any, action: string) => {

                    if (action === 'login') {
                        set(({ customerCartItemsInSession: newCustomerCartItems }))
                    }

                    if (action === 'add a product') {
                        set((state) => ({
                            customerCartItemsInSession: [...state.customerCartItemsInSession, newCustomerCartItems]
                        }))
                    }

                    if (action === 'logout') {
                        set(({ customerCartItemsInSession: null }))
                    }
                },

                allTheMunicipalities: [],
                setAllTheMunicipalities: (newMunicipalities: Municipality[]) => set(
                    { allTheMunicipalities: newMunicipalities }
                ),

                allTheMunicipalDistricts: [],
                setAllTheMunicipalDistricts: (newMunicipalDistricts: MunicipalDistrict[]) => set(
                    { allTheMunicipalDistricts: newMunicipalDistricts }
                ),

                allTheNeighborhoods: [],
                setAllTheNeighborhoods: (newNeighborhoods: Neighborhood[]) => set(
                    { allTheNeighborhoods: newNeighborhoods }
                ),
            }),

            { name: "sellify_zustand_user_Store" }
        )
    )
)

export default useSellifyStore;
