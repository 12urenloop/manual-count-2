#!/bin/sh

mv database.sqlite3 "backup-$(date "+%H:%M:%S").sqlite3"
yarn seed db
