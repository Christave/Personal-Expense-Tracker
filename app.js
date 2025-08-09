document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const transactionForm = document.getElementById('transactionForm');
    const transactionList = document.getElementById('transactionList');
    const balanceElement = document.getElementById('balance');
    const incomeElement = document.getElementById('income');
    const expenseElement = document.getElementById('expense');
    const themeToggle = document.getElementById('themeToggle');
    const filterButtons = {
        all: document.getElementById('showAll'),
        income: document.getElementById('showIncome'),
        expense: document.getElementById('showExpense')
    };

    // State
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let currentFilter = 'all';

    // Initialize the app
    init();

    // Event Listeners
    transactionForm.addEventListener('submit', addTransaction);
    filterButtons.all.addEventListener('click', () => updateFilter('all'));
    filterButtons.income.addEventListener('click', () => updateFilter('income'));
    filterButtons.expense.addEventListener('click', () => updateFilter('expense'));
    themeToggle.addEventListener('click', toggleTheme);
    transactionList.addEventListener('click', handleTransactionClick);

    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    // Main Functions
    function init() {
        updateTransactions();
        updateBalance();
    }

    function addTransaction(e) {
        e.preventDefault();

        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.querySelector('input[name="transactionType"]:checked').value;

        if (!description || isNaN(amount)) {
            showMessage('Please enter valid description and amount', 'error');
            return;
        }

        const transaction = {
            id: generateID(),
            description,
            amount: parseFloat(amount.toFixed(2)),
            type
        };

        transactions.push(transaction);
        if (saveTransactions()) {
            updateTransactions();
            updateBalance();
            transactionForm.reset();
            showMessage('Transaction added successfully!');
        }
    }

    function handleTransactionClick(e) {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            deleteTransaction(id);
        }
    }

    function deleteTransaction(id) {
        // Ensure consistent type comparison
        id = typeof id === 'string' ? parseInt(id) : id;
        
        const initialLength = transactions.length;
        transactions = transactions.filter(transaction => {
            const transactionId = typeof transaction.id === 'string' ? parseInt(transaction.id) : transaction.id;
            return transactionId !== id;
        });

        if (transactions.length < initialLength && saveTransactions()) {
            updateTransactions();
            updateBalance();
            showMessage('Transaction deleted successfully!');
        } else {
            showMessage('Failed to delete transaction', 'error');
        }
    }

    function updateTransactions() {
        // Clear existing transactions
        while (transactionList.firstChild) {
            transactionList.removeChild(transactionList.firstChild);
        }

        // Filter transactions based on current filter
        const filteredTransactions = currentFilter === 'all'
            ? [...transactions]
            : transactions.filter(t => t.type === currentFilter);

        // Display message if no transactions
        if (filteredTransactions.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'no-transactions';
            emptyMessage.textContent = 'No transactions found';
            transactionList.appendChild(emptyMessage);
            return;
        }

        // Add filtered transactions to the list
        filteredTransactions.forEach(transaction => {
            const sign = transaction.type === 'income' ? '+' : '-';
            const item = document.createElement('li');
            item.className = `transaction-item ${transaction.type}`;
            item.innerHTML = `
                <div class="transaction-details">
                    <p class="transaction-description">${transaction.description}</p>
                </div>
                <div class="transaction-amount">
                    ${sign}FCFA ${Math.abs(transaction.amount).toFixed(2)}
                </div>
                <button class="delete-btn" data-id="${transaction.id}">×</button>
            `;
            transactionList.appendChild(item);
        });
    }

    function updateBalance() {
        const amounts = transactions.map(t => t.type === 'income' ? t.amount : -t.amount);
        const balance = amounts.reduce((acc, val) => acc + val, 0).toFixed(2);
        const income = amounts.filter(a => a > 0).reduce((acc, val) => acc + val, 0).toFixed(2);
        const expense = Math.abs(amounts.filter(a => a < 0).reduce((acc, val) => acc + val, 0)).toFixed(2);

        balanceElement.textContent = `FCFA ${balance}`;
        incomeElement.textContent = `FCFA ${income}`;
        expenseElement.textContent = `FCFA ${expense}`;

        // Animate balance change
        balanceElement.style.color = balance >= 0 ? 'var(--income-color)' : 'var(--expense-color)';
    }

    function updateFilter(filter) {
        currentFilter = filter;
        // Update active button
        Object.values(filterButtons).forEach(btn => btn.classList.remove('active'));
        filterButtons[filter].classList.add('active');
        updateTransactions();
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    }

    // Helper Functions
    function saveTransactions() {
        try {
            localStorage.setItem('transactions', JSON.stringify(transactions));
            return true;
        } catch (e) {
            console.error('Failed to save transactions:', e);
            return false;
        }
    }

    function showMessage(text, type = 'success') {
        const message = document.createElement('div');
        message.textContent = text;
        message.className = `message ${type}`;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 300);
        }, 2000);
    }

    function generateID() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }
});