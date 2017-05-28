REM Windows Run Script (Use Make on Linux)
MKDIR uteach
START  mongod --port 27017 --dbpath=./uteach --smallfiles
START node app.js