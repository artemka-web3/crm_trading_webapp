echo "Switching to branch master"
git checkout master
echo "Building app..."
npm run build
echo "deploying files to server"
scp -r build/* artemkaweb3@134.0.118.29:/var/www/134.0.118.29
echo "Done!"