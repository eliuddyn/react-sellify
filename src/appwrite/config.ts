import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_ENDPOINT as string)
    .setProject(import.meta.env.VITE_PROJECT_ID as string);

const account: Account = new Account(client);
const databases: Databases = new Databases(client);
const storage: Storage = new Storage(client);

export { client, account, databases, storage };