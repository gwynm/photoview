#!/usr/bin/ruby

# Munges Apple's Photos.app export into a sensible folder structure, then syncs it up

require 'date'
require 'fileutils'
require 'shellwords'

SOURCE_PATH = ARGV[0] #don't forget trailing slash
DEST_PATH = ARGV[1] 
DEST_PORT = ARGV[2] 

# List folders, one level
# For each, get month/year - skip if not
# Create dest folder if it doesn't exist
# Move everything in
# Delete source folder
Dir.glob(SOURCE_PATH + '*').select{|d| File.directory? d}.each do |folder|
  next if /^\d\d\d\d$/.match(folder) #already done this one
  maybe_date = folder.split(',').last
  parsed_date = nil
  begin
    parsed_date = Date.parse(maybe_date)
  rescue
    puts "#{maybe_date} is not a date; skipping #{folder}"
  end
  if parsed_date
    dest_folder = SOURCE_PATH + parsed_date.strftime("%Y/%Y-%m")
    puts "#{folder} -> #{dest_folder}"
    FileUtils.mkdir_p dest_folder #might exist
    cmd = %Q(mv #{Shellwords.escape(folder)}/* #{Shellwords.escape(dest_folder)})
    system(cmd)
    FileUtils.rmdir folder
  end
end

# Rsync it
rsync_command = %Q(rsync --delete -rv --info=progress2 -e 'ssh -p #{DEST_PORT}' #{SOURCE_PATH} #{DEST_PATH})
system(rsync_command)
