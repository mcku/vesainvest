window.addEventListener('DOMContentLoaded', (event) => {
    const connectButton = document.getElementById('connectWallet');
    const addressInput = document.getElementById('address');
    const requestTypeSelect = document.getElementById('request_type');

    if (connectButton) {
        connectButton.addEventListener('click', async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const account = accounts[0];
                    addressInput.value = account;
                    requestTypeSelect.value = 'selfwallet';
                    addressInput.readOnly = true;
                } catch (error) {
                    console.error('Error connecting to MetaMask', error);
                }
            } else {
                alert('MetaMask is not installed. Please install it to use this feature.');
            }
        });
    }

    if (requestTypeSelect) {
        requestTypeSelect.addEventListener('change', (event) => {
            if (event.target.value === 'selfwallet') {
                if (window.ethereum && window.ethereum.selectedAddress) {
                    addressInput.value = window.ethereum.selectedAddress;
                    addressInput.readOnly = true;
                } else {
                    alert('Please connect your wallet first.');
                    requestTypeSelect.value = 'addr'; // Revert to a different option
                    addressInput.readOnly = false;
                }
            } else {
                addressInput.readOnly = false;
                addressInput.value = '';
            }
        });
    }
});