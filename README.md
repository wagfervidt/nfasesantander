# Getting Started

Welcome to your new project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`package.json` | project metadata and configuration
`readme.md` | this getting started guide

##Config
  gerar novo dev space tipo cloud cap
  inserir o .netrc com os dados do git hub
  preencher git config (global user name, e outras variáveis)
  fazer o clone da aplicação
  colocar no branch correto (na atual fazer do projeto é o "notafiscal")
  fazer npm install na pasta raiz,
  fazer npm install em cada subpasta app
  fazer npm install na pasta db
  conectar no scp (canto superior esquerdo ou através do comando cf config)
  na pasta raiz fazer o build (cds build --for hana)
  na pasta raiz fazer o deploy (cds deploy --production)

  ele gerará automaticamente o default env json

  Caso queira fazer deploy da aplicação inteira:

  mbt build 
  cf deploy (com o arquivo mtar gerado no mbt build)



## Next Steps

- Open a new terminal and run `cds watch` 
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start adding content, for example, a [db/schema.cds](db/schema.cds).


## Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.
