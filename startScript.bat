cd client || exit
start cmd /k "npm install && npm start"
echo "Started client app"

cd ../server || exit
start cmd /k "npm install && npm start"
echo "Started server app"

cd ../commit-gpt || exit
start cmd /k "pip install -r requirements.txt && python zabaGpt.py"
echo "Started commit-gpt app"

cd ../merge-gpt || exit
start cmd /k "pip install -r requirements.txt && python WebAppHW.py"
echo "Started merge-gpt app"

cd ..