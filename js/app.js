// Main application file
import { 
    fetchTransactions, 
    addTransaction, 
    signIn, 
    signUp, 
    getCurrentUser, 
    signOut 
} from './supabase.js';

import {
    initializeMPC,
    requestComputation,
    processComputationRequests,
    getComputationResults
} from './mpc.js';

// DOM Elements
const transactionList = document.querySelector('.transaction-list');
const signInForm = document.querySelector('#sign-in-form');
const signUpForm = document.querySelector('#sign-up-form');
const addTransactionForm = document.querySelector('#add-transaction-form');
const mpcSection = document.querySelector('#mpc-section');
const mpcResultsContainer = document.querySelector('#mpc-results');

// Application state
let appState = {
    user: null,
    transactions: [],
    mpcInitialized: false
};

// Check if user is signed in
async function checkAuth() {
    const { data: { user } } = await getCurrentUser();
    appState.user = user;
    
    if (user) {
        document.body.classList.add('authenticated');
        if (!appState.mpcInitialized) {
            appState.mpcInitialized = await initializeMPC(user.id);
        }
        await loadTransactions();
        await checkComputationRequests();
    } else {
        document.body.classList.remove('authenticated');
    }
}

// Load user's transactions
async function loadTransactions() {
    const transactions = await fetchTransactions();
    appState.transactions = transactions;
    renderTransactions();
}

// Render transactions in the UI
function renderTransactions() {
    if (!transactionList) return;
    
    transactionList.innerHTML = '';
    
    if (appState.transactions.length === 0) {
        transactionList.innerHTML = '<div class="no-items">No transactions found</div>';
        return;
    }
    
    appState.transactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const isExpense = transaction.type === 'expense';
        
        item.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-name">${transaction.description}</div>
                <div class="transaction-date">${new Date(transaction.created_at).toLocaleDateString()}</div>
            </div>
            <div class="transaction-amount ${isExpense ? 'negative' : 'positive'}">
                ${isExpense ? '-' : '+'}$${Math.abs(transaction.amount).toFixed(2)}
            </div>
        `;
        
        transactionList.appendChild(item);
    });
}

// Sign in handler
if (signInForm) {
    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = signInForm.querySelector('input[name="email"]').value;
        const password = signInForm.querySelector('input[name="password"]').value;
        
        const user = await signIn(email, password);
        if (user) {
            checkAuth();
            window.location.href = 'index.html'; // Redirect to dashboard
        } else {
            alert('Sign in failed. Please check your credentials.');
        }
    });
}

// Sign up handler
if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = signUpForm.querySelector('input[name="email"]').value;
        const password = signUpForm.querySelector('input[name="password"]').value;
        
        const user = await signUp(email, password);
        if (user) {
            alert('Please check your email to confirm your account.');
        } else {
            alert('Sign up failed. Please try again.');
        }
    });
}

// Add transaction handler
if (addTransactionForm) {
    addTransactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const description = addTransactionForm.querySelector('input[name="description"]').value;
        const amount = parseFloat(addTransactionForm.querySelector('input[name="amount"]').value);
        const type = addTransactionForm.querySelector('select[name="type"]').value;
        
        const transaction = {
            description,
            amount: type === 'expense' ? -amount : amount,
            type
        };
        
        const result = await addTransaction(transaction);
        if (result) {
            addTransactionForm.reset();
            await loadTransactions();
        } else {
            alert('Failed to add transaction. Please try again.');
        }
    });
}

// Check for MPC computation requests
async function checkComputationRequests() {
    if (!appState.user || !appState.mpcInitialized) return;
    
    await processComputationRequests();
    await loadMPCResults();
}

// Load MPC computation results
async function loadMPCResults() {
    if (!mpcResultsContainer) return;
    
    const results = await getComputationResults();
    
    mpcResultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        mpcResultsContainer.innerHTML = '<div class="no-items">No computation results found</div>';
        return;
    }
    
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'mpc-result-item';
        
        item.innerHTML = `
            <div class="result-type">${result.type}</div>
            <div class="result-value">${JSON.stringify(result.result)}</div>
        `;
        
        mpcResultsContainer.appendChild(item);
    });
}

// Init MPC computation form
if (mpcSection) {
    const mpcForm = document.createElement('form');
    mpcForm.id = 'mpc-form';
    
    mpcForm.innerHTML = `
        <h3>Request Secure Computation</h3>
        <div class="form-group">
            <label for="target-user">Target User ID</label>
            <input type="text" id="target-user" name="target_user" required>
        </div>
        <div class="form-group">
            <label for="computation-type">Computation Type</label>
            <select id="computation-type" name="computation_type" required>
                <option value="secure_sum">Secure Sum</option>
                <option value="secure_average">Secure Average</option>
                <option value="secure_comparison">Secure Comparison</option>
            </select>
        </div>
        <div class="form-group">
            <label for="input-data">Input Data (JSON)</label>
            <textarea id="input-data" name="input_data" required></textarea>
        </div>
        <button type="submit">Request Computation</button>
    `;
    
    mpcForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const targetUser = mpcForm.querySelector('#target-user').value;
        const computationType = mpcForm.querySelector('#computation-type').value;
        let inputData;
        
        try {
            inputData = JSON.parse(mpcForm.querySelector('#input-data').value);
        } catch (error) {
            alert('Invalid JSON input. Please check your data format.');
            return;
        }
        
        const result = await requestComputation(targetUser, computationType, inputData);
        if (result) {
            alert('Computation request sent successfully!');
            mpcForm.reset();
        } else {
            alert('Failed to send computation request. Please try again.');
        }
    });
    
    mpcSection.appendChild(mpcForm);
}

// Sign out handler
document.addEventListener('click', async (e) => {
    if (e.target.matches('.sign-out-button')) {
        const success = await signOut();
        if (success) {
            appState.user = null;
            appState.mpcInitialized = false;
            window.location.href = 'signin.html'; // Redirect to sign in page
        }
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Set up a periodic check for new computation requests
    if (appState.user) {
        setInterval(checkComputationRequests, 30000); // Check every 30 seconds
    }
});