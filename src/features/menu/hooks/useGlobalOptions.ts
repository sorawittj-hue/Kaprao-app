import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { GlobalOption } from '@/types'

/**
 * Fetch global stock options
 */
export async function fetchGlobalOptions(): Promise<GlobalOption[]> {
    const { data, error } = await (supabase as unknown as { from: (table: string) => { select: (columns: string) => Promise<{ data: unknown; error: Error | null }> }})
        .from('global_options')
        .select('*') as { data: Array<{ id: string; name: string; is_available: boolean; updated_at: string }> | null; error: Error | null }

    if (error) throw error

    return (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        isAvailable: item.is_available,
        updatedAt: item.updated_at,
    }))
}

/**
 * Hook to use global options in the frontend
 */
export function useGlobalOptions() {
    return useQuery({
        queryKey: ['global_options'],
        queryFn: fetchGlobalOptions,
        staleTime: 60 * 1000, // 1 minute
    })
}

/**
 * Helper to check if a specific option is available based on global state
 * @param optionId The ID of the option (e.g., 'meat_krob')
 * @param globalOptions List of global options from DB
 */
export function isOptionAvailable(optionId: string, globalOptions: GlobalOption[] = []): boolean {
    // Mapping of UI Option IDs to DB Global Option IDs
    const mapping: Record<string, string> = {
        'meat_krob': 'moo_krob',
        'meat_sap': 'moo_sap',
        'meat_kung': 'kung', // Assuming 'kung' is in DB
        'egg_dao': 'kai_dao',
        'egg_jiao': 'kai_jiao',
        'egg_yiaoma': 'kai_yiao_ma',
    }

    const globalId = mapping[optionId]
    if (!globalId) return true // If not mapped, assume available or controlled elsewhere

    const globalOption = globalOptions.find(opt => opt.id === globalId)
    return globalOption ? globalOption.isAvailable : true
}
