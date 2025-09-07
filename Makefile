run: 
	cd vesa-webapp && go build && ./vesainvest &
	cd landing && npm run dev &
	cd vesa-rice-dapp/frontend && npm run dev &

