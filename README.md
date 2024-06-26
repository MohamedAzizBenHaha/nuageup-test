# Kubernetes Web Application Deployment
This repository contains the necessary files and instructions to deploy a scalable web application on a Kubernetes cluster. The application utilizes a basic "Hello World" app built with Node.js and incorporates various Kubernetes features for high availability, security, and efficient resource usage.

## Application Components
1. **Dockerfile**: Defines the steps to build the Node.js application image.
2. **nuageup-chart** : Defines the steps to deploy the Node.js application in the cluster. It contains the following file:
   - **Deployment YAML**: Describes the Kubernetes deployment configuration, including resource requests/limits, liveness/readiness probes, and replica count.
   - **Service YAML**: Creates a Kubernetes Service of type LoadBalancer to expose the application externally.
   - **Ingress YAML**: Configures an Ingress controller and defines an Ingress resource for external access through a specific hostname.
   - **HPA YAML**: Sets up Horizontal Pod Autoscaler to scale the number of pods based on CPU or memory usage.
   - **NetworkPolicy YAML**: Implements a NetworkPolicy to restrict traffic to the application pods, enhancing security.

## Additional Notes:
The application utilizes self-healing mechanisms of Kubernetes. If a pod is manually deleted, Kubernetes will automatically create a new one to maintain the desired replica count.

For detailed information about each component and its configuration, refer to the respective YAML files and the Kubernetes documentation.

⚠️**Disclaimer: This example provides a basic framework for deploying a web application on Kubernetes. Adapt the configurations and scripts as needed to suit your specific application and environment requirements.**

## Prerequisites
1. Working Vagrant + VirtualBox setup
2. 16 Gig + RAM workstation as the Vms use 4 vCPUS and 12+ GB RAM

## setup Kubernetes cluster
use the repository https://github.com/MohamedAzizBenHaha/Vagrantfile-and-Scripts-to-Automate-Kubernetes-Setup-using-Kubeadm.git for cluster setup.

## Install Java 17
```shell
sudo apt install openjdk-17-jdk -y
```
Refer to this link for documentation full: https://www.cherryservers.com/blog/how-to-install-java-on-ubuntu

## Install Docker (all nodes)
```shell
sudo apt install -y docker.io
```
```shell
sudo systemctl start docker
```
```shell
sudo systemctl enable docker
```
Refer to this link for documentation full: https://docs.docker.com/engine/install/ubuntu/

## Install Helm
```shell
curl -O https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
```
```shell
bash ./get-helm-3
```
Refer to this link for documentation full: https://helm.sh/docs/intro/install/

## Install MetalLB
```shell
kubectl get configmap kube-proxy -n kube-system -o yaml | sed -e "s/strictARP: false/strictARP: true/" | kubectl apply -f - -n kube-system
```
```shell
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.14.5/config/manifests/metallb-native.yaml
```

Refer to this link for documentation full: https://metallb.universe.tf/installation/

## Deploy using CI/CD pipeline
### Install Jenkins
```shell
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
```
```shell
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
```
```shell
sudo apt-get update
```
```shell
sudo apt-get install jenkins
```
Refer to this link for documentation full: https://www.jenkins.io/doc/book/installing/linux/

### Unlock Jenkins
- When you first access a new Jenkins instance, you are asked to unlock it using an automatically-generated password.

- Browse to http://http://10.0.0.10:8080 and wait until the Unlock Jenkins page appears.

- The following command will print the password at console.On the Unlock Jenkins page, paste this password into the Administrator password field and click Continue.

```shell
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```
After unlocking Jenkins, the Customize Jenkins page appears. Here you can install any number of useful plugins as part of your initial setup.

For now we will chosse install suggested plugins - to install the recommended set of plugins, which are based on most common use cases. You can install (or remove) additional Jenkins plugins at a later point in time via the Manage Jenkins -> Plugins page in Jenkins.

### Configure dockerhub-credentials in Jenkins

1. In your Jenkins instance, navigate to "Manage Jenkins" -> "Manage Credentials"

2. Click on "System Credentials" -> "Global credentials (unrestricted)"

3. Select "Username with password" as the credential type

4. In the "ID" field enter **dockerhub-credentials**

5. In the "Username" field enter **mohamedazizbenhaha** and check the "Treat username as secret" box

6. In the "Password" field enter **dckr_pat_hsvgCVi4B4P8fY5kjoCvsVJfjl8**

⚠️**Disclaimer: These credentials are for testing purpuses and will no longer beb available in 30 days. Expiration date : 15/06/2024.**

### Create the pipeline
1. Click on "New Item" in the Jenkins dashboard.

2. In the "name" field enter **k8s-nuageup**

3. Select "Pipeline" as the job type and click "OK".

4. In the "General" section, choose "GitHub project" and enter the project url : **https://github.com/MohamedAzizBenHaha/nuageup-test.git**

5. In the "Pipeline" section
  - choose **Pipeline script from SCM** from the "Definition" drop list
  - choose **Git** from the "SCM" drop list
  - In the "Repository URL" field enter **https://github.com/MohamedAzizBenHaha/nuageup-test.git**
  - In the "Branch Specifier" field enter ***/main**

6. Run the pipeline. 

Once run,this pipeline will automatically build the Docker image, push it to Docker Hub, and deploy the application to the Kubernetes cluster. Once the deployment is complete, proceed to the testing procedure.

## Testing Procedure

### Deployment
```shell
kubectl get deployment nuageup-deployment
```
```shell
kubectl get pods -l app=nuageup -o wide
```
write down one of the pods' **IP** as we will need it later

### Service
```shell
kubectl get svc nuageup-service
```
write down the service **CLUSTER-IP** and **EXTERNAL-IP** as we will need it later

### Horizontal Pod Autoscaler
```shell
kubectl get hpa nuageup-hpa
```
To verify if the HPA is working, apply load to the application. This can be done through **Load Testing** tools like K6 or JMeter to simulate user traffic and increase load on the application.

### Network Policy
1. Create a friend Pod by running the **friend-pod.yaml (https://github.com/MohamedAzizBenHaha/nuageup-test/blob/main/test/friend-pod.yaml)** using the following command
```shell
kubectl apply -f friend-pod.yaml 
```
2. Execute a shell in the **friend pod**
```shell
kubectl exec -it friend-pod -- /bin/sh
```
3. From within the pod's shell, try to connect to the nuageup application
```shell
wget -qO- http://<nuageup-service-cluster-ip-from-service-step>
```
```shell
wget -qO- http://<nuageup-service-external-ip-from-service-step>
```
4. Repeat the same process, but this time with an **any-pod.yaml (https://github.com/MohamedAzizBenHaha/nuageup-test/blob/main/test/any-pod.yaml)**

**This time, the connection should fail, or timeout, as the network policy is blocking access. Only pods with the designated label "role: friend" are allowed to communicate with the nuageup application pods.**

## Troubleshooting
Refer to the Jenkins logs for any errors during the build or deployment process.

Use kubectl commands to check the status of pods, deployments, and services within your Kubernetes cluster.

If for any reason the HPA is not showing the resource utilisation in the "TARGETS" section, you can solve the problem as follow

- Open the metric-server deployment in the editor by using the following command
```shell
kubectl -n kube-system edit deployment metric-server
```
- Add **"- --kubelet-insecure-tls"** to the container args list in the spec section as follow
```shell
    spec:
      containers:
      - args:
        - --cert-dir=/tmp
        - --secure-port=443
        - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
        - --kubelet-use-node-status-port
        - --metric-resolution=15s
        - --kubelet-insecure-tls
```
## Ingress for External Access (Not Tested Yet)
The provided files at https://github.com/MohamedAzizBenHaha/nuageup-test/tree/main/What's%20next contain configurations for an ingress controller and a service modified to work with the ingress.

### Copy the Files
Copy the ingress.yaml file and the service-ingress.yaml file from the provided URL to the nuageup-chart folder.

 - Place ingress.yaml in the nuageup-chart folder directly.
   
 - Replace the contents of the existing service.yaml file within nuageup-chart with the content of **service-ingress.yaml**.

### Update Hosts File
Update your hosts file to point a domain name to your Kubernetes cluster's IP address. Replace the contents of the existing update_hosts.sh file with the content of **ingress_update_hosts.sh**. 
.
### Uninstall and Redeploy
- Uninstall the current Helm chart
```shell
helm uninstall nuageup
```
- Run the pipeline.
   
⚠️ **Important Note: This ingress configuration hasn't been tested yet. After redeploying, verify that the application becomes accessible through the domain name you configured in the hosts file (test.nuageup.com) and test its functionality.**
