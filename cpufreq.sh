/usr/bin/lscpu | grep "CPU MHz" | awk '{split($0,a," ");print a[3] " MHz"}' 
