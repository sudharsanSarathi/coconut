// Supabase MPC Integration with Cursor
import { createClient } from '@supabase/supabase-js';

// Your Supabase project URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to fetch transactions from Supabase
async function fetchTransactions() {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

// Function to add a new transaction
async function addTransaction(transaction) {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert([transaction]);
            
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding transaction:', error);
        return null;
    }
}

// Function to authenticate user
async function signIn(email, password) {
    try {
        const { user, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Error signing in:', error);
        return null;
    }
}

// Function to register a new user
async function signUp(email, password) {
    try {
        const { user, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Error signing up:', error);
        return null;
    }
}

// Function to get the current user
function getCurrentUser() {
    return supabase.auth.getUser();
}

// Function to sign out
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error signing out:', error);
        return false;
    }
}

// Export the functions to use in other files
export {
    supabase,
    fetchTransactions,
    addTransaction,
    signIn,
    signUp,
    getCurrentUser,
    signOut
};