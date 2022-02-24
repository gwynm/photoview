#!/usr/bin/ruby

#Run from Automator, after an Album Export action
require 'date'
require 'fileutils'
require 'shellwords'
require 'tmpdir'

def log(t)
  File.open("/tmp/sync_family_frame.log", "a") do |f|
    f.puts "#{Time.now}: #{t}"
  end
end

log "Starting sync_family_frame.rb - 0 is #{ARGV[0]}, 1 is #{ARGV[1]}, 2 is #{ARGV[2]}"

SOURCE_PATH = ARGV[0] #don't forget trailing slash. Passed in by Automator.
exit if SOURCE_PATH.nil? or SOURCE_PATH == ""

DEST_PATH = ARGV[1] 
DEST_PORT = ARGV[2] 

#Resize images down
mogrify_command = %Q(/usr/local/bin/mogrify -geometry 2000x2000 -quality 80 #{Shellwords.escape(SOURCE_PATH)}*.jpeg)
log mogrify_command
system(mogrify_command)

# Rsync it
rsync_command = %Q(/usr/local/bin/rsync --delete -rv --info=progress2 -e 'ssh -p #{DEST_PORT}' #{Shellwords.escape(SOURCE_PATH)} #{DEST_PATH})
log rsync_command
system(rsync_command)

#Photoview will now autoscan on plex

#Remove source
log "rm_rf #{SOURCE_PATH}"
FileUtils.rm_rf SOURCE_PATH if SOURCE_PATH.include?("/Users/gwyn/Pictures/Photos Export")

log "Done"
