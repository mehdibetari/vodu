ssh root@212.47.240.213 'cd /usr/local/alloserie; git checkout master; git reset --hard; git pull'
ssh root@212.47.240.213 'cd /usr/local/alloserie; npm install'
ssh root@212.47.240.213 'cd /usr/local/alloserie/src/vodt; npm install'
ssh root@212.47.240.213 'cd /usr/local/alloserie; pm2 restart all'

ssh ec2-user@ec2-3-92-176-196.compute-1.amazonaws.com 'cd /home/ec2-user/vodu; git checkout master; git reset --hard; git pull'
ssh ec2-user@ec2-3-92-176-196.compute-1.amazonaws.com 'cd /home/ec2-user/vodu; npm install'
ssh ec2-user@ec2-3-92-176-196.compute-1.amazonaws.com 'cd /home/ec2-user/vodu/src/vodt; npm install'
ssh ec2-user@ec2-3-92-176-196.compute-1.amazonaws.com 'cd /home/ec2-user/vodu; pm2 restart all'