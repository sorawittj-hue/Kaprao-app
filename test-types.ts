import { supabase } from './src/lib/supabase'

async function _test() {
    const { data } = await supabase.from('profiles').select('*')
    if (data) {
        console.log(data[0].display_name)
    }
}
