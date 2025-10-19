// essentially, this file loads up supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); 
// loading env variables, instantiating supabase

const supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);
// created supabaseClient above based on anonkey and URL from web console


const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabaseClient, supabaseAdmin };


