#!/bin/bash

if [ -d ./secrets/ssl ]; then
	echo "The SSL certificate already exists."
	exit 0
else
	echo "Creating SSL certificate and key..."

	mkdir -p ./secrets/ssl
	chmod 777 ./secrets/ssl

	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout ./secrets/ssl/certificate.key -out ./secrets/ssl/certificate.crt \
		 -subj "/C=TH/ST=Bangkok/L=Bangkok/O=42/OU=42/CN=localhost"

	echo "SSL certificate created."
fi
