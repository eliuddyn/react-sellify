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