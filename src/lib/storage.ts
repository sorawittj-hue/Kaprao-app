import { supabase } from './supabase'

/**
 * Upload an image to Supabase Storage
 * @param bucket Bucket name (e.g., 'slips', 'menu-items')
 * @param path File path inside bucket
 * @param file File object
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
    bucket: string,
    path: string,
    file: File
): Promise<string> {
    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            upsert: true,
            cacheControl: '3600',
        })

    if (uploadError) {
        throw uploadError
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
}

/**
 * Handle payment slip upload
 * @param orderId Order ID
 * @param file File object
 */
export async function uploadPaymentSlip(orderId: number, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `slip_${orderId}_${Date.now()}.${fileExt}`
    const filePath = `slips/${fileName}`

    const publicUrl = await uploadImage('orders', filePath, file)

    // Update order with slip URL
    const { error } = await supabase
        .from('orders')
        .update({ payment_slip_url: publicUrl } as never)
        .eq('id', orderId)

    if (error) throw error

    return publicUrl
}
