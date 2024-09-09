
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Json =
    | string
    | number
    | boolean
    | null
    | any
    | { [key: string]: Json | undefined }
    | Json[]

export type Category = {
    id: string
    name: string
    sub_categories: string
    products?: Product | undefined
}

// export type Review = {
//     id: string
//     productId: string
//     comment: string
//     rating: number
//     date: string
// }

export type Product = {
    id: string
    name: string
    description: string
    price: number
    category?: Category
    size?: string
    quantity: number
    sku: string
    weight: number
    weight_unit?: string
    status: string
    image?: string
    reviews?: object[]
    sales?: number
    created_at: string
}

export type UploadPicture = {
    file?: File | null | undefined
    folderInBucketName: string
    userId: string
    userTableName: string
    maxFilesToUpload?: number,
}

//export type Customer = Models.Document & {
export type Customer = {
    id: string
    names: string
    lastnames: string
    gender: string
    email: string
    app_user_ID: string
    stripe_customer_ID: string
}

export type Neighborhood = {
    neighborhoodName: string;
}

export type MunicipalDistrict = {
    municipalDistrictName: string;
    neighborhoods: Neighborhood[];
}

export type Municipality = {
    municipalityName: string;
    municipalDistricts: MunicipalDistrict[];
}

export type Province = {
    name: string;
    zone: string;
    municipalities: Municipality[];
}