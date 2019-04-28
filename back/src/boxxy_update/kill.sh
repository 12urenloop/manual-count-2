kill $(ps -fade | grep boxxyUpdateLaunch.sh | grep -v grep | awk '{print $2}')
