import { Client, Account, Databases } from 'appwrite';

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_ENDPOINT as string)
    .setProject(import.meta.env.VITE_PROJECT_ID as string);


// const superClient = new sdk.Client()
//     .setEndpoint(import.meta.env.VITE_ENDPOINT as string)
//     .setProject(import.meta.env.VITE_PROJECT_ID as string)
//     .setKey(import.meta.env.VITE_APPWRITE_SECRET_KEY as string);

// const users = new sdk.Users(superClient);

const account: Account = new Account(client);
const databases: Databases = new Databases(client);

export { client, account, databases };