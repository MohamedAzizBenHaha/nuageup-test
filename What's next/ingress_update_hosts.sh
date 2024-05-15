#!/bin/bash

EXTERNAL_IP=$(kubectl get ingress nuageup-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "$EXTERNAL_IP test.nuageup.com" | sudo tee -a /etc/hosts