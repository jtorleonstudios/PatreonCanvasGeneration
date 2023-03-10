<img align="center" src="https://gitlab.com/scs_torleon/hub-awesome-dungeon/-/raw/main/assets/BH_JTL_Header2.png"/>

# Github action: Patreon Canvas Generation

# π¦ Getting Started

Require NodeJS >=v18.7.0.  This project uses NPM for dependencies and project management ([*Getting Started*](https://docs.npmjs.com/getting-started))

Folder structure
```
π/. 
|
βββ πDIST
β   βββ compiled js
β   
βββ πOUT
β   βββ output generation
β
βββ πSRC
β   βββ typscript source
β
βββ package.json
```

## π¦ Install NodeJS, get this repository, and run the npm install command

```
$ npm install
```

## π§¨ Build src to dist (**compile TS to JS**)

```
$ npm run build
```


## π Run the task

Create .env file and put set the `PATREON_TOKEN` before run task. 

execute .js
```
$ npm run task
```
execute .ts
```
$ npm run task
```

## Canvas result

![Canvas result](https://github.com/jtorleonstudios/PatreonCanvasGeneration/blob/main/out/image.png?raw=true)

### MIT License 

Copyright (c) 2023 JTorLeon Studios

