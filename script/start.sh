#sudo apt-get update
#sudo apt-get -y install mysql-server
sudo service mysql restart
sudo mysql < setup_db.sql

nvm install v18.13.0
npm install mysql2


