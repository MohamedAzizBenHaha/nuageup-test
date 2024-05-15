pipeline {
    agent any
    
    stages {

        stage('Clone repository') {
            steps {
      			checkout([$class: 'GitSCM', branches: [[name: '*/main']],
			    extensions: [],
			    userRemoteConfigs: [[url: 'https://github.com/MohamedAzizBenHaha/nuageup.git']]])
            }
        }

        stage('setup MetalLB') {
            steps {
                sh'sudo kubectl apply -f pool.yaml'
                sh'sudo kubectl apply -f l2advertisement.yaml'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'sudo chmod 777 /var/run/docker.sock'
                sh 'docker build -t mohamedazizbenhaha/nuageup:latest .'
            }
        }


        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh 'echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin'
                    sh 'docker push mohamedazizbenhaha/nuageup:latest'
                }
            }
        }

        stage('install metrics server') {
            steps {
                sh'sudo kubectl apply -f metrics-server.yaml'
                sleep(15) 
            }
        }

        stage('install nuageup helm chart') {
            steps {
                sh('sudo helm install nuageup nuageup-chart/')
                sleep(60) 
            }
        }

        stage('update hosts') {
            steps {
                sh 'sudo chmod +x service_update_hosts.sh'
                sh 'sudo sh update_hosts.sh'
            }
        }

        }

        post {
            always {
                cleanWs()
            }
        }

    
    }


