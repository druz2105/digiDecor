#!/bin/sh
echo "Connecting to MongoDB..."
mongosh <<EOF
use admin
db.auth("druz2105", "qwerty2105")
use digiDecor
db.createUser({user: "druz2105", pwd: "qwerty2105", roles: [{role: "dbOwner", db: "digiDecor"}]})
EOF
echo "User created successfully."