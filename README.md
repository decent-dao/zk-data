# Lumen-ZK-Data
This app was created based of the nym + heyAnon applications.

### Packages

#### Backend
This backend is running a query to Flipside, formatting data to Merkle, writing to postgres DB. 

#### Frontend
The frontend is a api + test-suite which tests the backend to assure it returns data to initiate proofs.
Testing is required to generate actual proofs and assure proper anon-sets.

### Installation
#### Backend
> Always use `nvm use node` before running any commands to ensure you are using the correct node version.

```
npm i
```

#### Frontend
> There is a dependency issue, run the following command

```
npm i --legacy-peer-deps
```

### Local Development

#### Backend
Generate the prisma file  + Build and run the Database Docker image. Note, adding the `-d` will run the docker container in the background.

```
npm run prepare
npm run start
```

Run query. Please do research for query's cost actual money...

```
npm run runQuery   
```
#### Frontend
Run the test suite. If you get an error with prima, you may need to regenerate the file.
```
npm run test   
```