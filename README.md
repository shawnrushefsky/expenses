# expenses
A simple web app for tracking expenses. See it [running live](192.81.130.206). 

It is using a self-signed SSL certificate, so it's pretty likely to throw warnings in your browser. Just ignore them ;)

```
git clone https://github.com/shawnrushefsky/expenses.git
cd expenses
sudo sh bootstrap.sh
npm install
cd certs
openssl req -new -x509 -sha256 -days 365 -nodes -out cert.crt -keyout key.key
cd ..
node server
```
