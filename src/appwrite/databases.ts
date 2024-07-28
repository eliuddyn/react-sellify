/* eslint-disable @typescript-eslint/no-explicit-any */
import { databases } from "./config";
import { ID, Models } from "appwrite";

const db: any = {};

const databaseID = import.meta.env.VITE_DATABASE_ID as string

type CollectionType = {
    dbId: string
    id: string
    name: string
}

const collections: CollectionType[] = [
    {
        dbId: databaseID,
        id: import.meta.env.VITE_COLLECTION_ID_CATEGORIES,
        name: "categories",
    },
    {
        dbId: databaseID,
        id: import.meta.env.VITE_COLLECTION_ID_PRODUCTS,
        name: "products",
    },
    {
        dbId: databaseID,
        id: import.meta.env.VITE_COLLECTION_ID_CUSTOMERS,
        name: "customers",
    },
    {
        dbId: databaseID,
        id: import.meta.env.VITE_COLLECTION_ID_CART_ITEMS,
        name: "cartItems",
    },
    {
        dbId: databaseID,
        id: import.meta.env.VITE_COLLECTION_ID_ORDERS,
        name: "orders",
    },
];

collections.forEach((collection) => {
    db[collection.name] = {
        create: (payload: Omit<Models.Document, keyof Models.Document>, permissions: string[] | undefined, id = ID.unique()) =>
            databases.createDocument(
                collection.dbId,
                collection.id,
                id,
                payload,
                permissions
            ),
        update: (id: string, payload: Partial<Omit<Models.Document, keyof Models.Document>> | undefined, permissions: string[] | undefined) =>
            databases.updateDocument(
                collection.dbId,
                collection.id,
                id,
                payload,
                permissions
            ),
        delete: (id: string) => databases.deleteDocument(collection.dbId, collection.id, id),
        list: (queries = []) => databases.listDocuments(collection.dbId, collection.id, queries),
        get: (id: string) => databases.getDocument(collection.dbId, collection.id, id),
    };
});

export default db;