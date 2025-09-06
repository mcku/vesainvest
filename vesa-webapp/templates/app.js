document.addEventListener('DOMContentLoaded', () => {
    const connectWalletBtn = document.getElementById('connectWallet');
    const connectedWalletAddressDiv = document.getElementById('connectedWalletAddress');
    const userWalletAddressInput = document.getElementById('userWalletAddress');
    const monitoringForm = document.getElementById('monitoringForm');
    const requestTypeSelect = document.getElementById('request_type');
    const addressInput = document.getElementById('address');
    const tableBody = document.getElementById('monitoringRequestsTableBody');

    let connectedAccount = null;

    // Cüzdan bağlantısını yöneten fonksiyon
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                handleAccountsChanged(accounts);
            } catch (error) {
                console.error("User rejected the request:", error);
                alert("Cüzdan bağlantı isteği reddedildi.");
            }
        } else {
            alert('MetaMask yüklü değil. Lütfen MetaMask eklentisini kurun.');
        }
    };

    // Hesap değiştiğinde arayüzü güncelleyen fonksiyon
    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            console.log('Please connect to MetaMask.');
            connectedAccount = null;
            connectedWalletAddressDiv.textContent = 'Not Connected';
            userWalletAddressInput.value = '';
            connectWalletBtn.textContent = 'Connect Wallet';
        } else {
            connectedAccount = accounts[0];
            connectedWalletAddressDiv.textContent = `Connected: ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(connectedAccount.length - 4)}`;
            userWalletAddressInput.value = connectedAccount;
            connectWalletBtn.textContent = 'Wallet Connected';
            updateAddressField(); // Adres alanını güncelle
        }
    };

    // Sayfa yüklendiğinde mevcut bağlantıyı kontrol et
    const checkConnection = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                handleAccountsChanged(accounts);
            } catch (err) {
                console.error("Could not fetch accounts:", err);
            }
        }
    };

    // "Request Type" değişimine göre adres alanını güncelle
    const updateAddressField = () => {
        if (requestTypeSelect.value === 'selfwallet') {
            if (connectedAccount) {
                addressInput.value = connectedAccount;
                addressInput.readOnly = true;
                addressInput.classList.add('bg-gray-200');
            } else {
                addressInput.value = "Please connect your wallet first.";
                addressInput.readOnly = true;
            }
        } else {
            addressInput.value = '';
            addressInput.readOnly = false;
            addressInput.classList.remove('bg-gray-200');
        }
    };

    // Form gönderimini yönet
    monitoringForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!connectedAccount) {
            alert('Please connect your wallet before submitting a request.');
            return;
        }

        const formData = new FormData(monitoringForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/monitoring', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const newRequest = await response.json();
                // Tabloya yeni satır ekle
                const newRow = tableBody.insertRow(0); // Başa ekle
                newRow.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${newRequest.User.substring(0, 6)}...</td>
                    <td class="px-6 py-4 whitespace-nowrap">${new Date(newRequest.Date).toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${newRequest.RequestType}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${newRequest.Subject.substring(0, 20)}...</td>
                `;
                monitoringForm.reset();
                updateAddressField();
            } else {
                alert('An error occurred while submitting the request.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    });

    // Event listener'ları ata
    connectWalletBtn.addEventListener('click', connectWallet);
    requestTypeSelect.addEventListener('change', updateAddressField);
    window.ethereum?.on('accountsChanged', handleAccountsChanged);

    // Başlangıç kontrolleri
    checkConnection();
    updateAddressField();
});