# Readme
----------

## Installation 

### 1 - Development on a local serveur

 1. Clone the repository in a folder 
 2.  Go into the folder `cd dashboard-predictable-farm`
 3. Check that you have installed mariadb or run the docker container of mariadb : 
 4. Upload test data to mariadb using the files provided in the project : 
	 5.   db.sql at the address *server/lib/db.sql*
	 6.  dump_dev.sql at the address *server/lib/dump_dev.sql*
	 7. If you are using a docker, be sure to use a volume to save some time.
		 1. Follow the docker installation guide at the address *https://hub.docker.com/_/mariadb/*
		 2. To enter into the docker : `docker exec -it some-mariadb bash`
		 3. To exec a sql file : `mysql -u USER -p PASSWORD  < /PATH/dump_dev.sql `
 5.  Install the server packages
	 1. Go into the server folder  `cd server`
	 2. Install the packages `npm install`
	 3. Run the server `npm start`
 6. You can view the client interface at the next address : "http://localhost:8080/"
