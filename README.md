# Atm-Backend

## Deploy the contract (dev environment)
- install nodejs. See [nvm](https://github.com/creationix/nvm)
- `> npm i -g npm install -g ethereumjs-testrpc`
- Run a local testnet with specific config 
`> testrpc  --debug --account="0xe739110e10b8e71b300687bb89fe1da667e6d6d775c59244994b2c6a4bd0cf04,100000000000000000000000000000000000000" -u 0`
- `> npm i -g truffle`
- `cd ./solidity && truffle migrate`

## Run the app

- clone the repository
- `> cd app`
- `> meteor npm install`
- `> meteor --settings ./config/development.settings.json`

The application should be running in `http://localhost:3000`

### API Check Health

`http://localhost:3000/api/v1/healthcheck`
