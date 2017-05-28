REM Windows Run Script (Use Make on Linux)
ECHO hello world
MKDIR uteach
START  mongod --port 27017 --dbpath=./uteach --smallfiles
START node app.js