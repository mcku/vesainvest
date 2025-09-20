run: 
	cd vesa-webapp && go build && ./vesainvest &
	cd vesa-rice-dapp/frontend && npm run dev &

