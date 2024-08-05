/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand'
import { Models } from 'appwrite'
import { devtools, persist } from 'zustand/middleware'
import { Customer } from '@/types/myTypes';

type UserState = {
    userSession: Models.Session | object | null;
    setUserSession: (newUserSession: Models.Session | Models.User<Models.Preferences> | null) => void;

    customerInSession: Customer | null;
    setCustomerInSession: (newCustomer: Customer | null) => void;

    customerCartItemsInSession: Models.Document[] | any;
    setCustomerCartItemsInSession: (newCustomerCartItems: Models.Document | null, action: string) => void;

    mobileMenuOpen: boolean;
    setMobileMenuOpen: (mobileMenuOpenState: boolean) => void;
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

                    // console.log(newCustomerCartItems)
                    // console.log(action)
                    // console.log(typeof newCustomerCartItems)

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

                mobileMenuOpen: false,
                setMobileMenuOpen: (mobileMenuOpenState: boolean) => set({ mobileMenuOpen: mobileMenuOpenState }),
            }),

            { name: "sellify_zustand_user_Store" }
        )
    )
)

export default useSellifyStore;
