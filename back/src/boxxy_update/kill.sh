kill $(ps -fad | grep manual_poll.js | grep -v grep | awk '{print $2}')
